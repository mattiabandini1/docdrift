import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

/**
 * Handles the OAuth callback from Supabase Auth by exchanging the authorization
 * code for a session and redirecting the user to the dashboard.
 *
 * @param request - The incoming GET request containing the OAuth code.
 * @returns A redirect response to the dashboard or login page on failure.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=no_code`);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    console.error("OAuth code exchange failed:", error.message);
    return NextResponse.redirect(`${origin}/login?error=auth_error`);
  }

  return NextResponse.redirect(`${origin}/dashboard`);
}
