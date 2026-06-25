"use client";

import Link from "next/link";

/**
 * Dashboard-specific error boundary. Renders when an error occurs within
 * any dashboard route.
 */
export default function DashboardErrorPage({
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-surface-page px-6 text-center text-text-primary">
      <h1 className="text-2xl font-semibold">
        Something went wrong in the dashboard
      </h1>
      <p className="mt-2 text-sm text-text-secondary">
        An unexpected error occurred. Please try again.
      </p>
      <div className="mt-6 flex items-center gap-4">
        <button
          onClick={reset}
          className="rounded-md bg-text-primary px-4 py-2 text-sm font-semibold text-surface-page transition-colors duration-150 hover:bg-zinc-200"
        >
          Try again
        </button>
        <Link
          href="/dashboard"
          className="text-sm text-text-secondary underline transition-colors duration-150 hover:text-text-primary"
        >
          Go to dashboard
        </Link>
      </div>
    </div>
  );
}
