import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { GitBranch, ExternalLink } from "lucide-react";
import RepoCard, { type RepoCardData } from "@/components/dashboard/RepoCard";

const GITHUB_APP_INSTALL_URL =
  "https://github.com/apps/docdrift-mattiabandini1/installations/new";

/**
 * Repositories page. Lists all connected repos with toggle/configure/remove
 * actions. Shows success/error banners based on URL search params.
 */
export default async function ReposPage({
  searchParams,
}: {
  searchParams: Promise<{ connected?: string; error?: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { connected, error } = await searchParams;

  const { data: repos } = await supabase
    .from("repos")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const repoList: RepoCardData[] = (repos ?? []).map((r) => ({
    id: r.id,
    full_name: r.full_name,
    github_repo_id: r.github_repo_id,
    is_active: r.is_active,
    doc_paths: r.doc_paths,
    doc_mode: r.doc_mode,
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-zinc-50">
            Repositories
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            Connect your GitHub repositories to auto-sync documentation.
          </p>
        </div>
        <a
          href={GITHUB_APP_INSTALL_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex shrink-0 items-center gap-2 self-start rounded-md bg-text-primary px-4 py-2 text-sm font-semibold text-surface-page transition-colors hover:bg-zinc-200"
        >
          <ExternalLink className="h-4 w-4" />
          Connect Repository
        </a>
      </div>

      {/* Success/Error banners */}
      {connected && (
        <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm font-semibold text-emerald-400">
          Repository connected successfully!
        </div>
      )}
      {error === "github_api_error" && (
        <div className="rounded-lg border border-accent-red/20 bg-accent-red-soft px-4 py-3 text-sm font-semibold text-accent-red">
          Failed to connect to GitHub. Please try again.
        </div>
      )}
      {error === "missing_installation" && (
        <div className="rounded-lg border border-accent-red/20 bg-accent-red-soft px-4 py-3 text-sm font-semibold text-accent-red">
          Installation ID missing. Please try again.
        </div>
      )}

      {/* Repo list or empty state */}
      {repoList.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-border-subtle bg-surface-card py-16 gap-4">
          <GitBranch className="h-10 w-10 text-zinc-700" />
          <div className="text-center">
            <p className="text-sm font-medium text-zinc-400">
              No repositories connected yet
            </p>
            <p className="text-xs text-zinc-600 mt-1">
              Click &ldquo;Connect Repository&rdquo; to get started
            </p>
          </div>
          <a
            href={GITHUB_APP_INSTALL_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center gap-2 rounded-md bg-text-primary px-4 py-2 text-sm font-semibold text-surface-page transition-colors hover:bg-zinc-200"
          >
            <ExternalLink className="h-4 w-4" />
            Connect Repository
          </a>
        </div>
      ) : (
        <div className="space-y-3">
          {repoList.map((repo) => (
            <RepoCard key={repo.id} repo={repo} />
          ))}
        </div>
      )}
    </div>
  );
}
