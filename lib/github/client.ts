import { App } from "@octokit/app";
import { Octokit } from "@octokit/rest";
import { RequestError } from "@octokit/request-error";

/**
 * Error thrown when the GitHub API responds with a rate-limited response.
 */
export class RateLimitError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "RateLimitError";
  }
}

let appInstance: App | null = null;

/**
 * Normalizes the GitHub App private key from environment variables.
 * Supports PEM keys with literal `\n` characters and base64-encoded PEM keys.
 *
 * @param key - The raw private key value from the environment.
 * @returns A PEM-formatted private key string.
 */
function formatPrivateKey(key: string): string {
  let normalized = key.trim();

  // Strip surrounding quotes that may be present in .env files.
  if (
    (normalized.startsWith('"') && normalized.endsWith('"')) ||
    (normalized.startsWith("'") && normalized.endsWith("'"))
  ) {
    normalized = normalized.slice(1, -1);
  }

  if (normalized.startsWith("-----BEGIN")) {
    return normalized.replace(/\\n/g, "\n");
  }

  return Buffer.from(normalized, "base64").toString("utf-8");
}

/**
 * Returns the configured GitHub App singleton.
 *
 * @returns The GitHub App instance.
 */
function getApp(): App {
  if (appInstance) {
    return appInstance;
  }

  const appId = process.env.GITHUB_APP_ID;
  const privateKey = process.env.GITHUB_APP_PRIVATE_KEY;

  if (!appId) {
    throw new Error("Missing required environment variable: GITHUB_APP_ID");
  }

  if (!privateKey) {
    throw new Error(
      "Missing required environment variable: GITHUB_APP_PRIVATE_KEY"
    );
  }

  appInstance = new App({
    appId,
    privateKey: formatPrivateKey(privateKey),
    Octokit,
  });

  return appInstance;
}

/**
 * Returns an Octokit instance authenticated as the GitHub App itself.
 *
 * @returns A Promise resolving to an app-authenticated Octokit client.
 */
export async function getAppOctokit(): Promise<Octokit> {
  return getApp().octokit as unknown as Octokit;
}

/**
 * Returns an Octokit instance authenticated for a specific installation.
 *
 * @param installationId - The GitHub App installation ID.
 * @returns A Promise resolving to an installation-authenticated Octokit client.
 */
export async function getInstallationOctokit(
  installationId: number
): Promise<Octokit> {
  return getApp().getInstallationOctokit(
    installationId
  ) as unknown as Promise<Octokit>;
}

/**
 * Inspects a caught GitHub API error and rethrows it as a descriptive error.
 * Detects rate-limit responses and throws {@link RateLimitError} instead.
 *
 * @param error - The error caught from an Octokit call.
 * @param context - A human-readable description of the operation being attempted.
 */
export function handleGithubError(error: unknown, context: string): never {
  if (error instanceof RateLimitError) {
    throw error;
  }

  if (
    error instanceof RequestError &&
    error.status === 403 &&
    error.response?.headers["x-ratelimit-remaining"] === "0"
  ) {
    throw new RateLimitError(
      `GitHub API rate limit exceeded while ${context}.`
    );
  }

  const message = error instanceof Error ? error.message : "Unknown error";
  console.error(`GitHub API error while ${context}:`, error);
  throw new Error(`GitHub API error while ${context}: ${message}`);
}
