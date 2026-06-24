"use client";

import { useState } from "react";
import { trialEndDate } from "@/lib/utils";

interface UpgradeBannerProps {
  plan: string;
}

/**
 * Dismissible upgrade banner shown on the dashboard after a successful
 * Stripe checkout. Displays the plan name and trial end date.
 */
export default function UpgradeBanner({ plan }: UpgradeBannerProps) {
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  const planLabel = plan.charAt(0).toUpperCase() + plan.slice(1);

  return (
    <div className="flex items-start justify-between gap-3 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-400">
      <p>
        Welcome to DocDrift {planLabel}! Your trial has started.
        You have 7 days free — no charge until {trialEndDate()}.
      </p>
      <button
        onClick={() => setVisible(false)}
        className="shrink-0 text-emerald-400/60 hover:text-emerald-400"
        aria-label="Dismiss"
      >
        ✕
      </button>
    </div>
  );
}
