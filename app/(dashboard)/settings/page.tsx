import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import NotificationSettings from "@/components/dashboard/NotificationSettings";
import DeleteAccount from "@/components/dashboard/DeleteAccount";

const PLAN_BADGES: Record<string, string> = {
  free: "bg-zinc-800 text-zinc-400",
  starter: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  pro: "bg-purple-500/10 text-purple-400 border-purple-500/20",
};

/**
 * Settings page. Shows account info, notification preferences, and a danger
 * zone to delete the account.
 */
export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch the profile row for plan and notification_email
  const { data: profile } = await supabase
    .from("profiles")
    .select("email, plan, notification_email")
    .eq("id", user.id)
    .maybeSingle();

  const email =
    (profile?.email as string) ?? user.email ?? "Unknown";
  const plan = (profile?.plan as string) ?? "free";
  const notificationEmail =
    (profile?.notification_email as string) ?? email;

  const planBadge =
    PLAN_BADGES[plan] ?? PLAN_BADGES.free;

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-xl font-semibold text-zinc-100">Settings</h1>
        <p className="mt-1 text-sm text-zinc-400">
          Manage your DocDrift account.
        </p>
      </div>

      {/* Section 1 — Account */}
      <section className="space-y-4">
        <h2 className="text-sm font-medium text-zinc-300">Account</h2>
        <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-zinc-500">Email address</p>
              <p className="text-sm text-zinc-200">{email}</p>
            </div>
            <div className="flex items-center gap-4">
              <span
                className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize ${planBadge}`}
              >
                {plan}
              </span>
              {plan === "free" && (
                <Link
                  href="/pricing"
                  className="text-xs text-zinc-400 underline hover:text-zinc-300"
                >
                  Upgrade plan
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Section 2 — Notifications */}
      <section className="space-y-4">
        <h2 className="text-sm font-medium text-zinc-300">Notifications</h2>
        <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-4">
          <NotificationSettings currentEmail={notificationEmail} />
        </div>
      </section>

      {/* Section 3 — Danger Zone */}
      <section className="space-y-4">
        <h2 className="text-sm font-medium text-red-400">Danger zone</h2>
        <div className="rounded-lg border border-red-500/20 bg-zinc-900 p-4">
          <p className="text-sm font-medium text-red-400">Delete account</p>
          <p className="mt-1 text-xs text-zinc-500">
            This will permanently delete your account, all connected
            repositories, and all activity history. This action cannot be
            undone.
          </p>
          <div className="mt-4">
            <DeleteAccount />
          </div>
        </div>
      </section>
    </div>
  );
}
