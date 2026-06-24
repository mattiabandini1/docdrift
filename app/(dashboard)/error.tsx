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
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-950 px-6 text-center text-zinc-100">
      <h1 className="text-2xl font-semibold">
        Something went wrong in the dashboard
      </h1>
      <p className="mt-2 text-sm text-zinc-400">
        An unexpected error occurred. Please try again.
      </p>
      <div className="mt-6 flex items-center gap-4">
        <button
          onClick={reset}
          className="rounded-md bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-200"
        >
          Try again
        </button>
        <Link
          href="/dashboard"
          className="text-sm text-zinc-400 underline transition-colors hover:text-zinc-300"
        >
          Go to dashboard
        </Link>
      </div>
    </div>
  );
}
