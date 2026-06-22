import { createBrowserClient } from "@supabase/ssr";

/**
 * Creates a browser-side Supabase client for use in client components.
 *
 * @returns A Supabase client configured with the public anon key.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
