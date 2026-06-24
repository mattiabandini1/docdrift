import { createHmac, timingSafeEqual } from "crypto";
import { extractDiff } from "@/lib/github/diff";
import { fetchDocContent, type DocFile } from "@/lib/github/docs";
import { openDocPR, type UpdatedFile } from "@/lib/github/pr";
import { findImpactedSections } from "@/lib/embeddings/match";
import { generateDocUpdate, type GenerateParams } from "@/lib/llm/generate";
import { sendDocUpdateEmail, sendLimitReachedEmail } from "@/lib/email/templates";
import { createServiceClient } from "@/lib/supabase/server";
import { PLAN_LIMITS } from "@/lib/plans";
import { validateEnv } from "@/lib/env";

export const runtime = "nodejs";

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const rateLimiter = new Map<string, RateLimitEntry>();
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 10;
const MAX_IMPACTED_SECTIONS_PER_FILE = 2;

/**
 * Applies a simple in-memory rate limit. Returns `true` if the request
 * should be allowed, or `false` if the limit has been exceeded.
 *
 * @param ip - The client IP address.
 * @returns Whether the request is within the rate limit.
 */
function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimiter.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimiter.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }

  if (entry.count >= RATE_LIMIT_MAX) {
    return false;
  }

  entry.count++;
  return true;
}

/**
 * Verifies the GitHub webhook HMAC-SHA256 signature using a timing-safe
 * comparison.
 *
 * @param rawBody - The raw request body as a string.
 * @param signatureHeader - The value of the `x-hub-signature-256` header.
 * @param secret - The webhook secret.
 * @returns `true` if the signature is valid.
 */
function verifySignature(
  rawBody: string,
  signatureHeader: string,
  secret: string
): boolean {
  const computed =
    "sha256=" + createHmac("sha256", secret).update(rawBody, "utf8").digest("hex");

  if (computed.length !== signatureHeader.length) {
    return false;
  }

  return timingSafeEqual(
    Buffer.from(computed, "utf8"),
    Buffer.from(signatureHeader, "utf8")
  );
}

/**
 * Builds a combined diff text from the extracted diff result.
 *
 * @param diff - The diff result from {@link extractDiff}.
 * @returns A single string with summary and all file patches.
 */
function buildDiffText(diff: { summary: string; files: { patch: string | undefined }[] }): string {
  const patches = diff.files
    .map((f) => f.patch ?? "")
    .filter(Boolean)
    .join("\n");
  return diff.summary + "\n" + patches;
}

/**
 * Replaces a section of a document with new generated content.
 * Uses precise index-based replacement to avoid issues with duplicate text.
 *
 * @param docContent - The full original document content.
 * @param sectionContent - The old section content to replace.
 * @param generatedContent - The new generated content.
 * @param startIndex - The zero-based index of the section in the trimmed document.
 * @returns The updated document content.
 */
function replaceSection(
  docContent: string,
  sectionContent: string,
  generatedContent: string,
  startIndex: number
): string {
  const trimmedDoc = docContent.trim();
  const offset = docContent.indexOf(trimmedDoc);
  const sectionStart = offset + startIndex;
  return (
    docContent.slice(0, sectionStart) +
    generatedContent +
    docContent.slice(sectionStart + sectionContent.length)
  );
}

/**
 * POST handler for GitHub App webhook events. Validates the signature,
 * filters for merged PR events, and triggers the documentation update
 * pipeline.
 *
 * @param request - The incoming HTTP request from GitHub.
 * @returns A JSON Response. Always returns HTTP 200 for recognised events
 * (even on error) to prevent GitHub from retrying. Returns 401 for invalid
 * signatures and 429 for rate-limited IPs.
 */
// ARCH: consider background queue when volume grows
export async function POST(request: Request): Promise<Response> {
  validateEnv();

  const ip = request.headers.get("x-forwarded-for") ?? "unknown";

  if (!checkRateLimit(ip)) {
    return Response.json(
      { error: "Rate limited", code: "RATE_LIMITED" },
      { status: 429 }
    );
  }

  // --- Step 1: Verify signature ---
  const webhookSecret = process.env.GITHUB_WEBHOOK_SECRET;

  if (!webhookSecret) {
    return Response.json(
      { error: "Webhook secret not configured", code: "CONFIG_ERROR" },
      { status: 401 }
    );
  }

  const rawBody = await request.text();
  const signatureHeader = request.headers.get("x-hub-signature-256");

  if (!signatureHeader) {
    return Response.json(
      { error: "Missing signature", code: "MISSING_SIGNATURE" },
      { status: 401 }
    );
  }

  if (!verifySignature(rawBody, signatureHeader, webhookSecret)) {
    return Response.json(
      { error: "Invalid signature", code: "INVALID_SIGNATURE" },
      { status: 401 }
    );
  }

  // --- Step 2: Parse and filter ---
  let payload;

  try {
    payload = JSON.parse(rawBody);
  } catch {
    return Response.json(
      { error: "Invalid JSON", code: "INVALID_JSON" },
      { status: 400 }
    );
  }

  const event = request.headers.get("x-github-event");

  if (event !== "pull_request") {
    return Response.json({ status: "skipped", reason: "not_a_pr_event" });
  }

  if (payload.action !== "closed") {
    return Response.json({ status: "skipped", reason: "pr_not_closed" });
  }

  if (!payload.pull_request?.merged) {
    return Response.json({ status: "skipped", reason: "pr_not_merged" });
  }

  // --- Step 3: Load repo from DB ---
  const supabase = createServiceClient();

  const { data: repo, error: repoError } = await supabase
    .from("repos")
    .select("*")
    .eq("github_repo_id", payload.repository.id)
    .single();

  if (repoError || !repo) {
    return Response.json({ status: "skipped", reason: "repo_not_connected" });
  }

  if (!repo.is_active) {
    return Response.json({ status: "skipped", reason: "repo_inactive" });
  }

  // --- Step 4: Check user plan ---
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", repo.user_id)
    .single();

  const plan: keyof typeof PLAN_LIMITS = profile?.plan ?? "free";
  const limits = PLAN_LIMITS[plan];

  // Check 1 — repo limit
  if (isFinite(limits.repos)) {
    const { count: activeRepoCount } = await supabase
      .from("repos")
      .select("*", { count: "exact", head: true })
      .eq("user_id", repo.user_id)
      .eq("is_active", true);

    if (activeRepoCount !== null && activeRepoCount > limits.repos) {
      return Response.json({
        status: "skipped",
        reason: "repo_limit_reached",
      });
    }
  }

  // Check 2 — updates limit (free plan only)
  if (plan === "free" && isFinite(limits.updatesPerMonth)) {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

    const { count } = await supabase
      .from("doc_updates")
      .select("*", { count: "exact", head: true })
      .eq("repo_id", repo.id)
      .eq("status", "generated")
      .gte("created_at", startOfMonth);

    if (count !== null && count >= limits.updatesPerMonth) {
      const repoName = payload.repository.name;

      await sendLimitReachedEmail(profile.email, { repoName }).catch(() => {
        // Silently ignore email failures in rate-limiting path.
      });

      return Response.json({
        status: "skipped",
        reason: "free_plan_limit_reached",
      });
    }
  }

  // --- Step 5: Extract context ---
  const owner: string = payload.repository.owner.login;
  const repoName: string = payload.repository.name;
  const prNumber: number = payload.pull_request.number;
  const prTitle: string = payload.pull_request.title;
  const installationId: number = payload.installation.id;
  const docPaths: string[] = repo.doc_paths ?? ["README.md"];
  const docMode: GenerateParams["docMode"] = repo.doc_mode ?? "internal";

  // --- Step 6: Run the core pipeline ---
  try {
    const diff = await extractDiff(owner, repoName, prNumber, installationId);
    const docFiles: DocFile[] = await fetchDocContent(
      owner,
      repoName,
      docPaths,
      installationId
    );

    const diffText = buildDiffText(diff);
    const updatedFiles: UpdatedFile[] = [];

    for (const docFile of docFiles) {
      const impactedSections = await findImpactedSections(
        diffText,
        docFile.content
      );

      const topSections = impactedSections.slice(
        0,
        MAX_IMPACTED_SECTIONS_PER_FILE
      );

      if (topSections.length === 0) {
        continue;
      }

      let workingContent = docFile.content;
      let fileUpdated = false;

      for (const matchResult of topSections) {
        const generated = await generateDocUpdate({
          diff: diffText,
          currentDoc: matchResult.section.content,
          docPath: docFile.path,
          docMode,
        });

        if (generated === null) {
          continue;
        }

        workingContent = replaceSection(
          workingContent,
          matchResult.section.content,
          generated,
          matchResult.section.startIndex
        );

        fileUpdated = true;
      }

      if (fileUpdated) {
        updatedFiles.push({
          path: docFile.path,
          content: workingContent,
          sha: docFile.sha,
        });
      }
    }

    if (updatedFiles.length === 0) {
      await supabase.from("doc_updates").insert({
        repo_id: repo.id,
        github_pr_number: prNumber,
        github_pr_title: prTitle,
        status: "skipped",
      });

      return Response.json({
        status: "skipped",
        reason: "no_relevant_sections",
      });
    }

    // --- Step 6f: Open documentation PR ---
    const prUrl = await openDocPR({
      owner,
      repo: repoName,
      prNumber,
      prTitle,
      updatedFiles,
      installationId,
    });

    // --- Step 6g: Log to database ---
    await supabase.from("doc_updates").insert({
      repo_id: repo.id,
      github_pr_number: prNumber,
      github_pr_title: prTitle,
      doc_pr_url: prUrl,
      status: "generated",
    });

    // --- Step 6h: Send notification email ---
    if (profile?.email) {
      await sendDocUpdateEmail(profile.email, {
        prNumber,
        prTitle,
        docPrUrl: prUrl,
        repoName,
      }).catch(() => {
        // Silently ignore email failures — the PR was already opened.
      });
    }

    return Response.json({ status: "generated", doc_pr_url: prUrl });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";

    try {
      await supabase.from("doc_updates").insert({
        repo_id: repo.id,
        github_pr_number: prNumber,
        github_pr_title: prTitle,
        status: "error",
        error_message: errorMessage,
      });
    } catch {
      // Silently ignore if logging to DB fails.
    }

    return Response.json({ status: "error", message: errorMessage });
  }
}
