import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

/**
 * Landing page navigation bar. Checks the Supabase session server-side
 * to show either authenticated (Dashboard) or unauthenticated (Sign in) links.
 */
export default async function Nav() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const isLoggedIn = !!user;

  return (
    <nav className="sticky top-0 z-50 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
        <Link href="/" className="text-base font-bold text-zinc-100">
          DocDrift
        </Link>
        <div className="flex items-center gap-4">
          <Link
            href="/pricing"
            className="text-sm text-zinc-400 transition-colors hover:text-zinc-200"
          >
            Pricing
          </Link>
          {isLoggedIn ? (
            <Link
              href="/dashboard"
              className="rounded-md bg-zinc-100 px-3 py-1.5 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-200"
            >
              Dashboard
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm text-zinc-400 transition-colors hover:text-zinc-200"
              >
                Sign in
              </Link>
              <Link
                href="/login"
                className="rounded-md bg-zinc-100 px-3 py-1.5 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-200"
              >
                Get started
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
