"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard, GitBranch, Activity, Settings } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface SidebarProps {
  email: string;
}

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/repos", label: "Repositories", icon: GitBranch },
  { href: "/activity", label: "Activity", icon: Activity },
  { href: "/settings", label: "Settings", icon: Settings },
] as const;

/**
 * Fixed left sidebar with navigation links, brand, and user section.
 * Client component: uses usePathname for active link detection and handles sign-out.
 */
export default function Sidebar({ email }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <aside className="flex w-60 shrink-0 flex-col border-r border-zinc-800 bg-zinc-950">
      <div className="flex h-14 shrink-0 items-center gap-2 border-b border-zinc-800 px-4">
        <span className="text-base font-bold text-zinc-100">DocDrift</span>
        <span className="text-xs text-zinc-500">docs that keep up</span>
      </div>

      <nav className="flex-1 space-y-1 p-3">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ${
                isActive
                  ? "bg-zinc-800 text-white"
                  : "text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-100"
              }`}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="shrink-0 border-t border-zinc-800 p-3">
        <p className="truncate text-xs text-zinc-400">{email}</p>
        <button
          onClick={handleSignOut}
          className="mt-1.5 text-xs text-zinc-500 transition-colors hover:text-zinc-300"
        >
          Sign out
        </button>
      </div>
    </aside>
  );
}
