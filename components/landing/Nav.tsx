import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import Image from "next/image";

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
    <nav className="sticky top-0 z-50 border-b border-border-subtle bg-surface-page/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2 text-text-primary">
          <Image
            src="/images/logo/white_logo2_nobg.png"
            alt="DocDrift"
            width={28}
            height={28}
            className="object-contain"
          />
          <span className="text-sm font-semibold text-zinc-50">DocDrift</span>
        </Link>
        <div className="flex items-center gap-4">
          <Link
            href="/pricing"
            className="text-sm font-medium text-text-secondary transition-colors duration-150 hover:text-text-primary"
          >
            Pricing
          </Link>
          {isLoggedIn ? (
            <Link
              href="/dashboard"
              className="rounded-md bg-text-primary px-4 py-1.5 text-sm font-semibold text-surface-page transition-colors duration-150 hover:bg-zinc-200"
            >
              Dashboard
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm font-medium text-text-secondary transition-colors duration-150 hover:text-text-primary"
              >
                Sign in
              </Link>
              <Link
                href="/login"
                className="rounded-md bg-text-primary px-4 py-1.5 text-sm font-semibold text-surface-page transition-colors duration-150 hover:bg-zinc-200"
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
