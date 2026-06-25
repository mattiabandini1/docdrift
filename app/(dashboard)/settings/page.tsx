import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import NotificationSettings from "@/components/dashboard/NotificationSettings";
import DeleteAccount from "@/components/dashboard/DeleteAccount";
import ManageSubscriptionButton from "@/components/dashboard/ManageSubscriptionButton";

const PLAN_BADGES: Record<string, string> = {
  free: "bg-surface-elevated text-text-secondary border-border-subtle",
  starter: "bg-accent-blue/10 text-accent-blue border-accent-blue/20",
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
    .select("email, plan, notification_email, stripe_subscription_id")
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
    <div className="max-w-2xl space-y-10">
      <div>
        <h1 className="text-xl font-semibold text-text-primary">Settings</h1>
        <p className="mt-1 text-sm text-text-secondary">
          Manage your DocDrift account.
        </p>
      </div>

      {/* Section 1 — Account */}
      <section className="space-y-4">
        <h2 className="text-sm font-semibold text-text-primary">Account</h2>
        <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs text-zinc-500 uppercase tracking-wide mb-1">
                Email address
              </p>
              <p className="text-sm text-zinc-50">{email}</p>
            </div>
            <div className="flex flex-col items-end gap-1.5">
              <span
                className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize ${planBadge}`}
              >
                {plan}
              </span>
              {plan === "free" && (
                <Link
                  href="/pricing"
                  className="text-xs font-semibold text-zinc-400 underline hover:text-zinc-300"
                >
                  Upgrade plan
                </Link>
              )}
              {profile?.stripe_subscription_id && (
                <ManageSubscriptionButton />
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Section 2 — Notifications */}
      <section className="space-y-4">
        <h2 className="text-sm font-semibold text-text-primary">Notifications</h2>
        <div className="rounded-lg border border-border-subtle bg-surface-card p-4">
          <NotificationSettings currentEmail={notificationEmail} />
        </div>
      </section>

      {/* Section 3 — Danger Zone */}
      <section className="space-y-4">
        <h2 className="text-sm font-semibold text-accent-red">Danger zone</h2>
        <div className="rounded-lg border border-accent-red/20 bg-surface-card p-4">
          <p className="text-sm font-semibold text-accent-red">Delete account</p>
          <p className="mt-1 text-xs text-text-secondary">
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
