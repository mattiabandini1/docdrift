"use client";

import { useState, useEffect, useTransition, useRef } from "react";

interface NotificationSettingsProps {
  currentEmail: string;
}

/**
 * Notification email settings. Allows the user to update the email address
 * where DocDrift sends update notifications. Shows inline success/error
 * feedback that auto-hides after 3 seconds.
 */
export default function NotificationSettings({
  currentEmail,
}: NotificationSettingsProps) {
  const [email, setEmail] = useState(currentEmail);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [isPending, startTransition] = useTransition();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const showFeedback = (type: "success" | "error", message: string) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setFeedback({ type, message });
    timerRef.current = setTimeout(() => setFeedback(null), 3000);
  };

  const handleSave = () => {
    startTransition(async () => {
      try {
        const res = await fetch("/api/settings/notifications", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ notification_email: email }),
        });
        if (res.ok) {
          showFeedback("success", "Saved successfully");
        } else {
          showFeedback("error", "Failed to save. Please try again.");
        }
      } catch {
        showFeedback("error", "Failed to save. Please try again.");
      }
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <label
          htmlFor="notification-email"
          className="block text-sm font-semibold text-text-primary"
        >
          Notification email
        </label>
        <p className="text-xs text-text-tertiary">
          DocDrift will send updates to this address
        </p>
        <div className="mt-2 flex gap-2">
          <input
            id="notification-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="block w-full max-w-sm rounded-md border border-border-subtle bg-surface-elevated px-3 py-1.5 text-sm text-text-primary placeholder:text-text-tertiary focus:border-border-strong focus:outline-none"
          />
          <button
            onClick={handleSave}
            disabled={isPending || !email}
            className="inline-flex items-center rounded-md bg-text-primary px-4 py-1.5 text-sm font-semibold text-surface-page transition-colors hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isPending ? "Saving…" : "Save"}
          </button>
        </div>
        {feedback && (
          <p
            className={`mt-1 text-xs font-semibold ${
              feedback.type === "success"
                ? "text-emerald-400"
                : "text-accent-red"
            }`}
          >
            {feedback.type === "success" ? "✓ " : "✗ "}
            {feedback.message}
          </p>
        )}
      </div>
    </div>
  );
}
