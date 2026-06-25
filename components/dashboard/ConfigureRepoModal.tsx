"use client";

import { useState, useEffect, useCallback } from "react";
import { X } from "lucide-react";

type DocMode = "internal" | "public" | "both";

interface ConfigureRepoModalProps {
  repo: {
    id: string;
    full_name: string;
    doc_mode: DocMode;
    doc_paths: string[];
  };
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

const DOC_MODES: { value: DocMode; label: string; description: string }[] = [
  {
    value: "internal",
    label: "Internal",
    description: "Technical tone for your development team",
  },
  {
    value: "public",
    label: "Public",
    description: "User-friendly tone for end users",
  },
  {
    value: "both",
    label: "Both",
    description: "Balances technical accuracy with readability",
  },
];

const PATH_RE = /^[a-zA-Z/.].*\.(md|mdx)$/;

/**
 * Configuration modal for a repository. Lets the user change the
 * documentation tone (doc_mode) and the list of documentation files
 * (doc_paths) that DocDrift monitors and updates.
 *
 * @param repo - The repository to configure, including current doc_mode and doc_paths.
 * @param isOpen - Whether the modal is visible.
 * @param onClose - Callback to dismiss the modal.
 * @param onSave - Callback invoked after a successful PATCH to /api/repos/[id].
 */
export default function ConfigureRepoModal({
  repo,
  isOpen,
  onClose,
  onSave,
}: ConfigureRepoModalProps) {
  const [mode, setMode] = useState<DocMode>(repo.doc_mode);
  const [paths, setPaths] = useState<string[]>([...repo.doc_paths]);
  const [newPath, setNewPath] = useState("");
  const [pathError, setPathError] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  // Sync state when repo changes (e.g. after router.refresh in parent)
  useEffect(() => {
    setMode(repo.doc_mode);
    setPaths([...repo.doc_paths]);
  }, [repo.doc_mode, repo.doc_paths]);

  // Close on Escape
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }
  }, [isOpen, handleKeyDown]);

  const validatePath = (p: string): boolean => PATH_RE.test(p.trim());

  const handleAddPath = () => {
    const trimmed = newPath.trim();
    if (!trimmed) return;

    if (!validatePath(trimmed)) {
      setPathError("Path must be a .md or .mdx file");
      return;
    }

    if (paths.includes(trimmed)) {
      setPathError("Path already added");
      return;
    }

    setPaths((prev) => [...prev, trimmed]);
    setNewPath("");
    setPathError("");
  };

  const handleRemovePath = (idx: number) => {
    setPaths((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveError("");
    try {
      const res = await fetch(`/api/repos/${repo.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ doc_mode: mode, doc_paths: paths }),
      });
      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        throw new Error(data.error ?? "Failed to save");
      }
      onSave();
    } catch (err) {
      setSaveError(
        err instanceof Error
          ? err.message
          : "Failed to save configuration. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal card */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md rounded-xl border border-zinc-800 bg-zinc-900 p-6">
          {/* Header */}
          <div className="mb-6 flex items-center justify-between">
            <h2 className="truncate text-base font-semibold text-zinc-50 pr-4">
              {repo.full_name}
            </h2>
            <button
              onClick={onClose}
              className="shrink-0 rounded-md p-1 text-zinc-500 transition-colors hover:bg-zinc-800 hover:text-zinc-50"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Section 1 — Documentation tone */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-zinc-300">
              Documentation tone
            </label>
            <p className="mt-1 text-xs text-zinc-500">
              Choose the tone DocDrift uses when rewriting your documentation
            </p>
            <div className="mt-3 space-y-2">
              {DOC_MODES.map((dm) => {
                const selected = mode === dm.value;
                return (
                  <button
                    key={dm.value}
                    type="button"
                    onClick={() => setMode(dm.value)}
                    className={`w-full rounded-lg border p-3 text-left text-sm transition-colors duration-150 cursor-pointer ${
                      selected
                        ? "border-blue-500 bg-blue-500/10 text-zinc-50"
                        : "border-zinc-700 bg-zinc-800 text-zinc-400 hover:border-zinc-600"
                    }`}
                  >
                    <span className="text-sm font-medium">{dm.label}</span>
                    <span
                      className={`mt-0.5 block text-xs ${
                        selected ? "text-zinc-400" : "text-zinc-500"
                      }`}
                    >
                      {dm.description}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 2 — Documentation files */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-zinc-300">
              Documentation files to update
            </label>
            <p className="mt-1 text-xs text-zinc-500">
              DocDrift will search these files for sections to update when a PR
              is merged. Add any markdown file that documents your project.
            </p>

            {/* Path tags */}
            {paths.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {paths.map((p, idx) => (
                  <span
                    key={`${p}-${idx}`}
                    className="inline-flex items-center gap-1.5 rounded border border-zinc-700 bg-zinc-800 px-2 py-1 text-xs text-zinc-300"
                  >
                    {p}
                    {paths.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemovePath(idx)}
                        className="text-zinc-500 hover:text-zinc-50 transition-colors"
                        aria-label={`Remove ${p}`}
                      >
                        &times;
                      </button>
                    )}
                  </span>
                ))}
              </div>
            )}

            {/* Add path input */}
            <div className="mt-3 flex items-center gap-2">
              <input
                type="text"
                value={newPath}
                onChange={(e) => {
                  setNewPath(e.target.value);
                  setPathError("");
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleAddPath();
                }}
                placeholder="e.g. docs/API.md"
                className="flex-1 rounded-md border border-zinc-700 bg-zinc-950 px-3 py-1.5 text-sm text-zinc-50 placeholder:text-zinc-600 focus:border-zinc-500 focus:outline-none"
              />
              <button
                type="button"
                onClick={handleAddPath}
                className="rounded-md bg-zinc-700 px-3 py-1.5 text-xs font-medium text-zinc-50 transition-colors hover:bg-zinc-600"
              >
                Add
              </button>
            </div>
            {pathError && (
              <p className="mt-1 text-xs text-red-400">{pathError}</p>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3">
            {saveError && (
              <p className="mr-auto text-xs text-red-400">{saveError}</p>
            )}
            <button
              type="button"
              onClick={onClose}
              className="rounded-md px-4 py-2 text-sm text-zinc-400 transition-colors hover:text-zinc-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving || paths.length === 0}
              className="rounded-md bg-zinc-50 px-4 py-2 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-200 disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
