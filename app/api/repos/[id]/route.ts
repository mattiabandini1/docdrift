import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const patchSchema = z.object({
  is_active: z.boolean(),
});

/**
 * PATCH /api/repos/[id] — Toggle the active state of a connected repo.
 * Validates that the repo belongs to the authenticated user before updating.
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

  // Update is_active
  const { error: updateError } = await supabase
    .from("repos")
    .update({ is_active: parsed.data.is_active })
    .eq("id", id);

  if (updateError) {
    return NextResponse.json(
      { error: "Failed to update repository", code: "UPDATE_FAILED" },
      { status: 500 }
    );
  }

  return NextResponse.json({
    data: { id, is_active: parsed.data.is_active },
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
