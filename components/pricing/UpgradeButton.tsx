"use client";

import { useState } from "react";

interface UpgradeButtonProps {
  plan: "starter" | "pro";
  label: string;
  className?: string;
}

/**
 * Client component that triggers a Stripe Checkout flow for the given plan.
 * Disables itself while loading and redirects to the Stripe Checkout URL on success.
 */
export default function UpgradeButton({ plan, label, className = "" }: UpgradeButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });

      if (res.ok) {
        const { data } = (await res.json()) as { data: { url: string } };
        window.location.href = data.url;
      } else {
        alert("Something went wrong. Please try again.");
      }
    } catch {
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={loading}
        className={
          className ||
          "mt-8 block w-full rounded-md bg-text-primary py-2.5 text-center text-sm font-semibold text-surface-page transition-colors hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-50"
        }
    >
      {loading ? "Loading..." : label}
    </button>
  );
}
