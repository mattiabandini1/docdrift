"use client";

import { useState } from "react";

/**
 * Client component that opens the Stripe Customer Portal for managing
 * an existing subscription. Redirects on success.
 */
export default function ManageSubscriptionButton() {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });

      if (res.ok) {
        const { data } = (await res.json()) as { data: { url: string } };
        window.location.href = data.url;
      } else {
        alert("Something went wrong");
      }
    } catch {
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="inline-flex items-center rounded-md border border-zinc-700 px-3 py-1.5 text-xs font-medium text-zinc-300 transition-colors hover:border-zinc-500 hover:text-zinc-100 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {loading ? "Loading..." : "Manage subscription"}
    </button>
  );
}
