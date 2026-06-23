import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

/**
 * DELETE /api/settings/account
 * Permanently deletes the authenticated user's account and all associated data.
 * Uses the service-role client to call the admin deleteUser API.
 */
export async function DELETE() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { error: "Unauthorized", code: "UNAUTHORIZED" },
      { status: 401 }
    );
  }

  const { error } = await supabaseAdmin.auth.admin.deleteUser(user.id);

  if (error) {
    return NextResponse.json(
      { error: "Failed to delete account", code: "DELETE_FAILED" },
      { status: 500 }
    );
  }

  return NextResponse.json({ data: { deleted: true } });
}
