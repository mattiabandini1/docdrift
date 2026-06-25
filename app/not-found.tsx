import Link from "next/link";

/**
 * Custom 404 page shown when a route does not match any page.
 */
export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-surface-page px-6 text-center text-text-primary">
      <h1 className="text-2xl font-semibold">404 — Page not found</h1>
      <p className="mt-2 text-sm text-text-secondary">
        The page you are looking for does not exist.
      </p>
      <Link
        href="/"
        className="mt-6 text-sm font-semibold text-text-secondary underline transition-colors duration-150 hover:text-text-primary"
      >
        Go home
      </Link>
    </div>
  );
}
