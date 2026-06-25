import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Sidebar from "@/components/dashboard/Sidebar";
import type { ReactNode } from "react";

/**
 * Dashboard route group layout. Verifies authentication server-side and
 * renders the sidebar + content shell. Unauthenticated users are redirected
 * to /login.
 */
export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();

  if (!data.user?.email) {
    redirect("/login");
  }

  return (
    <div className="flex h-screen bg-surface-page">
      <div className="hidden md:flex">
        <Sidebar email={data.user.email} />
      </div>
      <main className="flex-1 overflow-auto md:ml-0">
        <div className="mx-auto max-w-4xl px-4 py-6 sm:px-8 sm:py-10">{children}</div>
      </main>
    </div>
  );
}
