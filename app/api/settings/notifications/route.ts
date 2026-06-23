import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const patchSchema = z.object({
  notification_email: z.string().email(),
});

/**
 * PATCH /api/settings/notifications
 * Updates the notification email for the authenticated user.
 */
export async function PATCH(request: Request) {
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
      {
        error: parsed.error.issues[0]?.message ?? "Invalid body",
        code: "VALIDATION_ERROR",
      },
      { status: 400 }
    );
  }

  const { error } = await supabase
    .from("profiles")
    .update({ notification_email: parsed.data.notification_email })
    .eq("id", user.id);

  if (error) {
    return NextResponse.json(
      { error: "Failed to update notification email", code: "UPDATE_FAILED" },
      { status: 500 }
    );
  }

  return NextResponse.json({
    data: { notification_email: parsed.data.notification_email },
  });
}
