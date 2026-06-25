"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";

const CONFIRM_MESSAGE =
  "This will permanently delete your account, all connected repositories, and all activity history. This action cannot be undone.";

/**
 * Danger zone delete account button. Shows a confirmation dialog and calls
 * the account deletion endpoint. Redirects to /login on success.
 */
export default function DeleteAccount() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    if (!window.confirm(CONFIRM_MESSAGE)) return;

    startTransition(async () => {
      try {
        const res = await fetch("/api/settings/account", { method: "DELETE" });
        if (res.ok) {
          router.push("/login");
        }
      } catch {
        // Silently fail — user can retry
      }
    });
  };

  return (
    <button
      onClick={handleDelete}
      disabled={isPending}
      className="rounded-md border border-red-500/50 text-red-400 hover:bg-red-500/10 px-4 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50"
    >
      {isPending ? "Deleting…" : "Delete my account"}
    </button>
  );
}
