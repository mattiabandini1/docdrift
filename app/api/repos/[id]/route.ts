import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";
import { PLAN_LIMITS } from "@/lib/plans";

const patchSchema = z.object({
  is_active: z.boolean().optional(),
  doc_mode: z.enum(["internal", "public", "both"]).optional(),
  doc_paths: z.array(z.string().min(1)).min(1).optional(),
});

/**
 * PATCH /api/repos/[id] — Update a connected repo's settings
 * (is_active, doc_mode, doc_paths). Validates ownership, enforces
 * plan limits on activation, and applies only the provided fields.
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();

  // Auth check
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json(
      { error: "Unauthorized", code: "UNAUTHORIZED" },
      { status: 401 }
    );
  }

  // Validate body
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body", code: "INVALID_BODY" },
      { status: 400 }
    );
  }

  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid body", code: "VALIDATION_ERROR" },
      { status: 400 }
    );
  }

  // Verify the repo belongs to the current user
  const { data: repo, error: repoError } = await supabase
    .from("repos")
    .select("id, user_id")
    .eq("id", id)
    .maybeSingle();

  if (repoError || !repo) {
    return NextResponse.json(
      { error: "Repository not found", code: "NOT_FOUND" },
      { status: 404 }
    );
  }

  if (repo.user_id !== user.id) {
    return NextResponse.json(
      { error: "Forbidden", code: "FORBIDDEN" },
      { status: 403 }
    );
  }

  // Plan enforcement: check repo limit when activating
  if (parsed.data.is_active === true) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("plan")
      .eq("id", user.id)
      .single();

    const { count: activeCount } = await supabase
      .from("repos")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("is_active", true);

    const plan = (profile?.plan as keyof typeof PLAN_LIMITS) ?? "free";
    const limit = PLAN_LIMITS[plan].repos;

    if (activeCount !== null && activeCount >= limit) {
      return NextResponse.json(
        {
          error: `Your ${plan} plan allows a maximum of ${limit} active ${limit === 1 ? "repository" : "repositories"}. Upgrade to connect more.`,
          code: "REPO_LIMIT_REACHED",
        },
        { status: 403 }
      );
    }
  }

  // Build update payload from all provided fields
  const updateData: Record<string, unknown> = {};
  if (parsed.data.is_active !== undefined) updateData.is_active = parsed.data.is_active;
  if (parsed.data.doc_mode !== undefined) updateData.doc_mode = parsed.data.doc_mode;
  if (parsed.data.doc_paths !== undefined) updateData.doc_paths = parsed.data.doc_paths;

  const { error: updateError } = await supabase
    .from("repos")
    .update(updateData)
    .eq("id", id);

  if (updateError) {
    return NextResponse.json(
      { error: "Failed to update repository", code: "UPDATE_FAILED" },
      { status: 500 }
    );
  }

  return NextResponse.json({
    data: { id, ...updateData },
  });
}

/**
 * DELETE /api/repos/[id] — Remove a connected repo.
 * Validates that the repo belongs to the authenticated user before deleting.
 */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();

  // Auth check
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json(
      { error: "Unauthorized", code: "UNAUTHORIZED" },
      { status: 401 }
    );
  }

  // Verify the repo belongs to the current user
  const { data: repo, error: repoError } = await supabase
    .from("repos")
    .select("id, user_id")
    .eq("id", id)
    .maybeSingle();

  if (repoError || !repo) {
    return NextResponse.json(
      { error: "Repository not found", code: "NOT_FOUND" },
      { status: 404 }
    );
  }

  if (repo.user_id !== user.id) {
    return NextResponse.json(
      { error: "Forbidden", code: "FORBIDDEN" },
      { status: 403 }
    );
  }

  // Delete (cascade handles doc_updates)
  const { error: deleteError } = await supabase
    .from("repos")
    .delete()
    .eq("id", id);

  if (deleteError) {
    return NextResponse.json(
      { error: "Failed to delete repository", code: "DELETE_FAILED" },
      { status: 500 }
    );
  }

  return NextResponse.json({ data: { deleted: true } });
}
