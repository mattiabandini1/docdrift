"use client";

import Link from "next/link";

/**
 * Global error boundary. Renders when an unhandled runtime error bubbles up
 * from a page or layout.
 */
export default function ErrorPage({
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-950 px-6 text-center text-zinc-100">
      <h1 className="text-2xl font-semibold">Something went wrong</h1>
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
          href="/"
          className="text-sm text-zinc-400 underline transition-colors hover:text-zinc-300"
        >
          Go home
        </Link>
      </div>
    </div>
  );
}
