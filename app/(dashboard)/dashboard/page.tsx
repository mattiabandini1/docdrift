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

  // Fetch the profile plan for the upgrade banner
  const { data: profile } = await supabase
    .from("profiles")
    .select("plan")
    .eq("id", userData.user.id)
    .maybeSingle();

  const plan = (profile?.plan as string) ?? "free";

  const sevenDaysAgo = daysAgoISO(7);

  // Fetch repo data and stat counts in parallel
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

  // Fetch recent activity filtered by the user's repo IDs
  const activityResult = repoIds.length > 0
    ? await supabase
        .from("doc_updates")
        .select(
          "id, github_pr_number, github_pr_title, status, created_at, repo_id"
        )
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

      <div>
        <h1 className="text-xl font-semibold text-zinc-100">Dashboard</h1>
        <p className="mt-1 text-sm text-zinc-400">
          Overview of your documentation updates.
        </p>
      </div>

      {activeRepos === 0 ? (
        <div className="rounded-xl border border-blue-500/30 bg-zinc-900 p-8 text-center">
          <h2 className="text-lg font-semibold text-zinc-100">
            Welcome to DocDrift 👋
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-zinc-400">
            You&rsquo;re one step away from automated documentation. Connect
            your first GitHub repository to get started.
          </p>
          <Link
            href="/repos"
            className="mt-4 inline-flex items-center rounded-md bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-200"
          >
            Connect your first repo
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <StatCard
            label="Connected Repos"
            value={activeRepos}
            icon={<GitBranch className="h-4 w-4" />}
          />
          <StatCard
            label="Updates This Week"
            value={totalUpdates}
            icon={<FileText className="h-4 w-4" />}
          />
          <StatCard
            label="PRs Opened"
            value={prsOpened}
            icon={<GitPullRequest className="h-4 w-4" />}
          />
          <StatCard
            label="Errors"
            value={errors}
            icon={<AlertCircle className="h-4 w-4" />}
          />
        </div>
      )}

      {activeRepos > 0 && (
      <div>
        <h2 className="text-sm font-medium text-zinc-300">Recent Activity</h2>
        <div className="mt-3">
          {recentActivity.length === 0 ? (
            <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-8 text-center">
              <p className="text-sm text-zinc-400">
                No activity yet — merge a PR on a connected repository to see
                DocDrift in action.
              </p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-lg border border-zinc-800">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-800 bg-zinc-900/50">
                    <th className="px-4 py-3 text-left text-xs font-medium text-zinc-400">
                      Repository
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-zinc-400">
                      PR
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-zinc-400">
                      Status
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-zinc-400">
                      When
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  {recentActivity.map((item) => (
                    <tr
                      key={item.id}
                      className="bg-zinc-900 transition-colors hover:bg-zinc-900/70"
                    >
                      <td className="max-w-48 truncate px-4 py-3 text-zinc-300">
                        {item.repos?.full_name ?? "Unknown repo"}
                      </td>
                      <td className="px-4 py-3 text-zinc-400">
                        <span className="text-zinc-300">
                          #{item.github_pr_number}
                        </span>
                        {item.github_pr_title && (
                          <span className="ml-1.5 text-zinc-500">
                            {item.github_pr_title}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={item.status} />
                      </td>
                      <td className="px-4 py-3 text-right text-zinc-500">
                        {timeAgo(item.created_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      )}
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
    <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-4">
      <div className="flex items-center gap-2 text-zinc-400">
        {icon}
        <span className="text-xs font-medium uppercase tracking-wider">
          {label}
        </span>
      </div>
      <div className="mt-2 text-2xl font-semibold tabular-nums text-zinc-100">
        {value}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const variants: Record<string, string> = {
    generated: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    skipped: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20",
    error: "bg-red-500/10 text-red-400 border-red-500/20",
    pending: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${
        variants[status] ?? variants.skipped
      }`}
    >
      {status}
    </span>
  );
}
