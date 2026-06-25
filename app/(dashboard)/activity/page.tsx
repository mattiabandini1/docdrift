import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Activity } from "lucide-react";
import { timeAgo } from "@/lib/utils";

const STATUSES = [
  { value: "", label: "All" },
  { value: "generated", label: "Generated" },
  { value: "skipped", label: "Skipped" },
  { value: "error", label: "Error" },
  { value: "pending", label: "Pending" },
] as const;

const PAGE_SIZE = 20;

interface ActivityItem {
  id: string;
  repo_id: string;
  github_pr_number: number;
  github_pr_title: string | null;
  doc_pr_url: string | null;
  status: string;
  error_message: string | null;
  created_at: string;
  full_name: string | null;
}

function buildFilterHref(
  baseParams: URLSearchParams,
  overrides: Record<string, string | undefined>
): string {
  const params = new URLSearchParams(baseParams.toString());
  for (const [key, value] of Object.entries(overrides)) {
    if (value === undefined || value === "") {
      params.delete(key);
    } else {
      params.set(key, value);
    }
  }
  if (overrides.status !== undefined || overrides.repo !== undefined) {
    params.delete("page");
  }
  const qs = params.toString();
  return `/activity${qs ? `?${qs}` : ""}`;
}

/**
 * Activity log page. Lists all doc_updates for the current user's repos
 * with pagination and status/repo filters via URL search params.
 */
export default async function ActivityPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; status?: string; repo?: string }>;
}) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page) || 1);
  const statusFilter = params.status ?? "";
  const repoFilter = params.repo ?? "";

  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) redirect("/login");

  // Fetch user's repos for repo IDs and name map
  const { data: userRepos } = await supabase
    .from("repos")
    .select("id, full_name");

  const repoNameMap = new Map(
    (userRepos ?? []).map((r: { id: string; full_name: string | null }) => [
      r.id,
      r.full_name,
    ])
  );
  const repoIds = (userRepos ?? []).map((r: { id: string }) => r.id);

  if (repoIds.length === 0) {
    return (
      <div className="space-y-6">
        <Header />
        <EmptyState message="No activity yet" />
      </div>
    );
  }

  // Build query
  let query = supabase
    .from("doc_updates")
    .select("*", { count: "exact" })
    .in("repo_id", repoIds)
    .order("created_at", { ascending: false });

  if (statusFilter) {
    query = query.eq("status", statusFilter);
  }
  if (repoFilter) {
    query = query.eq("repo_id", repoFilter);
  }

  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;
  query = query.range(from, to);

  const { data: rawData, count, error } = await query;

  const hasError = !!error;
  const totalCount = count ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  const baseParams = new URLSearchParams();
  if (statusFilter) baseParams.set("status", statusFilter);
  if (repoFilter) baseParams.set("repo", repoFilter);

  const items: ActivityItem[] = (rawData ?? []).map((d: ActivityItem) => ({
    ...d,
    full_name: repoNameMap.get(d.repo_id) ?? null,
  }));

  return (
    <div className="space-y-6">
      <Header />

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-text-tertiary">Status:</span>
          {STATUSES.map((s) => {
            const active = statusFilter === s.value;
            return (
              <Link
                key={s.value || "all"}
                href={buildFilterHref(baseParams, { status: s.value || undefined })}
                  className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
                    active
                      ? "bg-text-primary text-surface-page"
                      : "bg-surface-elevated text-text-secondary hover:bg-surface-hover hover:text-text-primary"
                }`}
              >
                {s.label}
              </Link>
            );
          })}
        </div>

        {userRepos && userRepos.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-text-tertiary">Repo:</span>
            <Link
              href={buildFilterHref(baseParams, { repo: undefined })}
              className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
                !repoFilter
                  ? "bg-text-primary text-surface-page"
                  : "bg-surface-elevated text-text-secondary hover:bg-surface-hover hover:text-text-primary"
              }`}
            >
              All
            </Link>
            {userRepos.map((r: { id: string; full_name: string | null }) => (
              <Link
                key={r.id}
                href={buildFilterHref(baseParams, { repo: r.id })}
                className={`max-w-40 truncate rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
                  repoFilter === r.id
                    ? "bg-text-primary text-surface-page"
                    : "bg-surface-elevated text-text-secondary hover:bg-surface-hover hover:text-text-primary"
                }`}
              >
                {r.full_name ?? `#${r.id}`}
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Table */}
      {hasError ? (
        <EmptyState message="Failed to load activity" />
      ) : items.length === 0 ? (
        <EmptyState
          message={
            statusFilter || repoFilter
              ? "No results for this filter"
              : "No activity yet"
          }
        />
      ) : (
        <>
          <div className="overflow-hidden rounded-lg border border-border-subtle">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border-subtle bg-surface-card">
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-text-tertiary">
                    Repository
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-text-tertiary">
                    Triggered by
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-text-tertiary">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-text-tertiary">
                    Error
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-text-tertiary">
                    When
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {items.map((item) => (
                  <tr
                    key={item.id}
                    className="border-b border-border-subtle/50 transition-colors duration-150 hover:bg-surface-card/50"
                  >
                    <td className="max-w-40 truncate px-4 py-3 text-text-primary">
                      {item.full_name ?? "Unknown repo"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex max-w-xs items-center gap-1.5">
                        {item.doc_pr_url ? (
                          <a
                            href={item.doc_pr_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="shrink-0 font-mono font-semibold text-text-primary underline hover:text-text-secondary"
                          >
                            #{item.github_pr_number}
                          </a>
                        ) : (
                          <span className="shrink-0 font-mono font-semibold text-text-primary">
                            #{item.github_pr_number}
                          </span>
                        )}
                        {item.github_pr_title && (
                          <span
                            className="truncate text-text-secondary"
                            title={item.github_pr_title}
                          >
                            {item.github_pr_title}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={item.status} />
                    </td>
                    <td className="px-4 py-3">
                      {item.status === "error" && item.error_message ? (
                        <span
                          className="inline-block max-w-[200px] truncate rounded border border-red-500/20 bg-red-500/10 px-2 py-0.5 text-xs text-red-400 cursor-help"
                          title={item.error_message}
                        >
                          {item.error_message}
                        </span>
                      ) : (
                        <span className="text-zinc-600">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right text-text-tertiary">
                      {timeAgo(item.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-text-tertiary">
              Showing {from + 1}–{Math.min(to + 1, totalCount)} of{" "}
              {totalCount} results
            </span>
            <div className="flex items-center gap-2">
              {page > 1 ? (
                <Link
                  href={buildFilterHref(baseParams, {
                    page: String(page - 1),
                  })}
                  className="rounded-md bg-surface-elevated px-3 py-1.5 text-xs font-semibold text-text-secondary transition-colors hover:bg-surface-hover hover:text-text-primary"
                >
                  Previous
                </Link>
              ) : (
                <span className="cursor-not-allowed rounded-md bg-surface-elevated/50 px-3 py-1.5 text-xs text-text-tertiary">
                  Previous
                </span>
              )}
              {page < totalPages ? (
                <Link
                  href={buildFilterHref(baseParams, {
                    page: String(page + 1),
                  })}
                  className="rounded-md bg-surface-elevated px-3 py-1.5 text-xs font-semibold text-text-secondary transition-colors hover:bg-surface-hover hover:text-text-primary"
                >
                  Next
                </Link>
              ) : (
                <span className="cursor-not-allowed rounded-md bg-surface-elevated/50 px-3 py-1.5 text-xs text-text-tertiary">
                  Next
                </span>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function Header() {
  return (
    <div className="mb-8">
      <h1 className="text-xl font-semibold text-zinc-50">Activity</h1>
      <p className="mt-1 text-sm text-zinc-500">
        Every documentation update DocDrift has generated.
      </p>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-border-subtle bg-surface-card py-16 gap-4">
      <Activity className="h-10 w-10 text-zinc-700" />
      <div className="text-center">
        <p className="text-sm font-medium text-zinc-400">{message}</p>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const variants: Record<string, string> = {
    generated:
      "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
    skipped: "bg-surface-elevated text-text-secondary border border-border-subtle",
    error: "bg-accent-red-soft text-accent-red border border-accent-red/20",
    pending:
      "bg-amber-500/10 text-amber-400 border border-amber-500/20",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${
        variants[status] ?? variants.skipped
      }`}
    >
      {status}
    </span>
  );
}
