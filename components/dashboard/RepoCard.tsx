"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Power, PowerOff, Settings, Trash2 } from "lucide-react";

export interface RepoCardData {
  id: string;
  full_name: string | null;
  github_repo_id: number;
  is_active: boolean;
  doc_paths: string[];
  doc_mode: string;
}

interface RepoCardProps {
  repo: RepoCardData;
}

/**
 * Displays a single repository with toggle, configure, and remove actions.
 * Handles PATCH/DELETE calls to the repos API and refreshes the page on success.
 */
export default function RepoCard({ repo }: RepoCardProps) {
  const router = useRouter();
  const [active, setActive] = useState(repo.is_active);
  const [isToggling, startToggle] = useTransition();
  const [isRemoving, startRemove] = useTransition();

  const handleToggle = () => {
    startToggle(async () => {
      const newValue = !active;
      setActive(newValue);
      try {
        const res = await fetch(`/api/repos/${repo.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ is_active: newValue }),
        });
        if (!res.ok) {
          setActive(!newValue);
        }
      } catch {
        setActive(!newValue);
      }
    });
  };

  const handleRemove = () => {
    // TODO: replace with a proper modal dialog before launch
    if (!window.confirm("Are you sure you want to remove this repository?")) {
      return;
    }
    startRemove(async () => {
      try {
        const res = await fetch(`/api/repos/${repo.id}`, {
          method: "DELETE",
        });
        if (res.ok) {
          router.refresh();
        }
      } catch {
        // Silently fail — user can retry
      }
    });
  };

  return (
    <div className="flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-900 p-4 transition-colors duration-150 hover:bg-zinc-900/50 hover:border-zinc-700">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-3">
          <span className="truncate text-sm font-semibold text-text-primary">
            {repo.full_name ?? `#${repo.github_repo_id}`}
          </span>
          <span className="inline-flex shrink-0 items-center rounded-full border border-border-subtle bg-surface-elevated px-2 py-0.5 text-xs font-medium text-text-secondary">
            {repo.doc_mode}
          </span>
        </div>
        {repo.doc_paths.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {repo.doc_paths.map((path) => (
              <span
                key={path}
                className="inline-flex items-center rounded border border-border-subtle bg-surface-elevated px-1.5 py-0.5 font-mono text-xs text-text-tertiary"
              >
                {path}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="ml-4 flex shrink-0 items-center gap-2">
        <button
          onClick={handleToggle}
          disabled={isToggling}
          className={`inline-flex items-center gap-1.5 text-xs font-medium rounded-md px-2.5 py-1 transition-colors duration-150 ${
            active
              ? "text-green-400 bg-green-500/10 border border-green-500/20"
              : "text-zinc-500 bg-zinc-800 border border-zinc-700"
          }`}
        >
          {isToggling ? (
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-text-secondary border-t-transparent" />
          ) : active ? (
            <>
              <Power className="h-3.5 w-3.5" />
              Active
            </>
          ) : (
            <>
              <PowerOff className="h-3.5 w-3.5" />
              Inactive
            </>
          )}
        </button>

        <button
          className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-50 transition-colors duration-150"
          aria-label="Configure repository"
        >
          <Settings className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Configure</span>
        </button>

        <button
          onClick={handleRemove}
          disabled={isRemoving}
          className="inline-flex items-center gap-1.5 text-xs text-red-500/70 hover:text-red-400 transition-colors duration-150"
          aria-label="Remove repository"
        >
          <Trash2 className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Remove</span>
        </button>
      </div>
    </div>
  );
}
