import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { GitBranch, FileText, GitPullRequest, AlertCircle } from "lucide-react";
import { daysAgoISO, timeAgo } from "@/lib/utils";
import UpgradeBanner from "@/components/dashboard/UpgradeBanner";

interface ActivityRow {
  id: string;
  github_pr_number: number;
  github_pr_title: string | null;
  status: string;
  created_at: string;
  repos: { full_name: string } | null;
}

/**
 * Dashboard overview page. Queries Supabase for repo and doc_update stats
 * and displays them as stat cards alongside a recent activity table.
 */
export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ upgraded?: string }>;
}) {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();

  if (!userData.user) {
    redirect("/login");
  }

  const params = await searchParams;
  const showUpgradeBanner = params.upgraded === "true";

  const { data: profile } = await supabase
    .from("profiles")
    .select("plan")
    .eq("id", userData.user.id)
    .maybeSingle();

  const plan = (profile?.plan as string) ?? "free";

  const sevenDaysAgo = daysAgoISO(7);

  const [reposDataResult, reposCountResult, updatesResult, prsResult, errorsResult] =
    await Promise.all([
      supabase.from("repos").select("id, full_name, github_repo_id"),
      supabase
        .from("repos")
        .select("*", { count: "exact", head: true })
        .eq("is_active", true),
      supabase
        .from("doc_updates")
        .select("*", { count: "exact", head: true })
        .gte("created_at", sevenDaysAgo),
      supabase
        .from("doc_updates")
        .select("*", { count: "exact", head: true })
        .eq("status", "generated")
        .gte("created_at", sevenDaysAgo),
      supabase
        .from("doc_updates")
        .select("*", { count: "exact", head: true })
        .eq("status", "error")
        .gte("created_at", sevenDaysAgo),
    ]);

  const activeRepos = reposCountResult.error ? 0 : (reposCountResult.count ?? 0);
  const totalUpdates = updatesResult.error ? 0 : (updatesResult.count ?? 0);
  const prsOpened = prsResult.error ? 0 : (prsResult.count ?? 0);
  const errors = errorsResult.error ? 0 : (errorsResult.count ?? 0);

  const repoIds = reposDataResult.data?.map((r: { id: string }) => r.id) ?? [];
  const repoNameMap = new Map(
    (reposDataResult.data ?? []).map((r: { id: string; full_name: string | null }) => [
      r.id,
      r.full_name,
    ])
  );

  const activityResult = repoIds.length > 0
    ? await supabase
        .from("doc_updates")
        .select("id, github_pr_number, github_pr_title, status, created_at, repo_id")
        .in("repo_id", repoIds)
        .order("created_at", { ascending: false })
        .limit(5)
    : { data: [], error: null };

  const recentActivity: ActivityRow[] = activityResult.error
    ? []
    : (activityResult.data ?? []).map((d) => ({
        id: d.id,
        github_pr_number: d.github_pr_number,
        github_pr_title: d.github_pr_title,
        status: d.status,
        created_at: d.created_at,
        repos: repoNameMap.has(d.repo_id)
          ? { full_name: repoNameMap.get(d.repo_id)! }
          : null,
      }));

  return (
    <div className="space-y-8">
      {showUpgradeBanner && <UpgradeBanner plan={plan} />}

      <PageHeader title="Dashboard" subtitle="Overview of your documentation updates." />

      {activeRepos === 0 ? (
        <div className="rounded-lg border border-border-subtle bg-surface-card p-8 text-center">
          <h2 className="text-lg font-semibold text-text-primary">
            Welcome to DocDrift 👋
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-text-secondary">
            You&rsquo;re one step away from automated documentation. Connect
            your first GitHub repository to get started.
          </p>
          <Link
            href="/repos"
            className="mt-4 inline-flex items-center rounded-md bg-text-primary px-4 py-2 text-sm font-semibold text-surface-page transition-colors duration-150 hover:bg-zinc-200"
          >
            Connect your first repo
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Connected Repos"
            value={activeRepos}
            icon={<GitBranch className="h-4 w-4 text-text-secondary" />}
          />
          <StatCard
            label="Updates This Week"
            value={totalUpdates}
            icon={<FileText className="h-4 w-4 text-text-secondary" />}
          />
          <StatCard
            label="PRs Opened"
            value={prsOpened}
            icon={<GitPullRequest className="h-4 w-4 text-text-secondary" />}
          />
          <StatCard
            label="Errors"
            value={errors}
            icon={<AlertCircle className="h-4 w-4 text-accent-red" />}
          />
        </div>
      )}

      {activeRepos > 0 && (
      <div>
        <h2 className="mb-3 text-sm font-semibold text-text-primary">Recent Activity</h2>
        {recentActivity.length === 0 ? (
          <div className="rounded-lg border border-border-subtle bg-surface-card p-8 text-center">
            <p className="text-sm text-text-secondary">
              No activity yet — merge a PR on a connected repository to see
              DocDrift in action.
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg border border-border-subtle">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border-subtle bg-surface-card">
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-text-tertiary">
                    Repository
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-text-tertiary">
                    PR
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-text-tertiary">
                    Status
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-text-tertiary">
                    When
                  </th>
                </tr>
              </thead>
              <tbody>
                {recentActivity.map((item) => (
                  <tr
                    key={item.id}
                    className="border-b border-border-subtle/50 transition-colors duration-150 hover:bg-surface-card/50"
                  >
                    <td className="max-w-48 truncate px-4 py-3 text-text-primary">
                      {item.repos?.full_name ?? "Unknown repo"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex max-w-xs items-center gap-1.5">
                        <span className="shrink-0 font-mono font-semibold text-text-primary">
                          #{item.github_pr_number}
                        </span>
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
                    <td className="px-4 py-3 text-right text-text-tertiary">
                      {timeAgo(item.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      )}
    </div>
  );
}

function PageHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="mb-8">
      <h1 className="text-xl font-semibold text-text-primary">{title}</h1>
      <p className="mt-1 text-sm text-text-secondary">{subtitle}</p>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-border-subtle bg-surface-card p-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-text-tertiary">
          {label}
        </p>
        <p className="mt-1 text-2xl font-semibold text-text-primary">{value}</p>
      </div>
      <div className="rounded-md bg-surface-elevated p-2">{icon}</div>
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
