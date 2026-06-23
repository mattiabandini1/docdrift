"use client";

import { useState, useTransition } from "react";

interface NotificationSettingsProps {
  currentEmail: string;
}

/**
 * Notification email settings. Allows the user to update the email address
 * where DocDrift sends update notifications.
 */
export default function NotificationSettings({
  currentEmail,
}: NotificationSettingsProps) {
  const [email, setEmail] = useState(currentEmail);
  const [saved, setSaved] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleSave = () => {
    startTransition(async () => {
      try {
        const res = await fetch("/api/settings/notifications", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ notification_email: email }),
        });
        if (res.ok) {
          setSaved(true);
          setTimeout(() => setSaved(false), 3000);
        }
      } catch {
        // Silently fail — user can retry
      }
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <label
          htmlFor="notification-email"
          className="block text-sm font-medium text-zinc-300"
        >
          Notification email
        </label>
        <p className="text-xs text-zinc-500">
          DocDrift will send updates to this address
        </p>
        <div className="mt-2 flex gap-2">
          <input
            id="notification-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="block w-full max-w-sm rounded-md border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-zinc-500 focus:outline-none"
          />
          <button
            onClick={handleSave}
            disabled={isPending || !email}
            className="inline-flex items-center rounded-md bg-zinc-100 px-4 py-1.5 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isPending ? "Saving…" : "Save"}
          </button>
        </div>
        {saved && (
          <p className="mt-1 text-xs text-emerald-400">Saved!</p>
        )}
      </div>
    </div>
  );
}
