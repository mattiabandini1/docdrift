import Link from "next/link";

/**
 * Custom 404 page shown when a route does not match any page.
 */
export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-950 px-6 text-center text-zinc-100">
      <h1 className="text-2xl font-semibold">404 — Page not found</h1>
      <p className="mt-2 text-sm text-zinc-400">
        The page you are looking for does not exist.
      </p>
      <Link
        href="/"
        className="mt-6 text-sm text-zinc-400 underline transition-colors hover:text-zinc-300"
      >
        Go home
      </Link>
    </div>
  );
}
