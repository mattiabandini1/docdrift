import { createServerClient } from "@supabase/ssr";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

/**
 * Creates a server-side Supabase client that reads and writes cookies via
 * `next/headers`. Always create a new client per request; never share across
 * requests.
 *
 * @returns A Promise that resolves to a Supabase client configured for the
 * current request's cookies.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch (error) {
            // Setting cookies from a Server Component is not allowed. The
            // middleware is responsible for refreshing the session, so this
            // error can be safely ignored here.
            console.error("Failed to set auth cookies from server:", error);
          }
        },
      },
    }
  );
}

/**
 * Creates a Supabase client using the service role key, which bypasses
 * Row Level Security. Only use this in server-side contexts that need
 * unrestricted database access (e.g., webhooks, background jobs).
 *
 * @returns A Supabase client authenticated with the service role key.
 */
export function createServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error(
      "Missing required environment variables: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY"
    );
  }

  return createSupabaseClient(url, key);
}
