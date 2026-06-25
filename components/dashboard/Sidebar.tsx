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
    <aside className="flex w-56 shrink-0 flex-col border-r border-border-subtle bg-surface-card">
      <div className="flex flex-col gap-0.5 border-b border-border-subtle px-4 py-4">
        <span className="text-sm font-semibold text-text-primary">DocDrift</span>
        <span className="text-xs text-text-tertiary">docs that keep up</span>
      </div>

      <nav className="flex-1 space-y-1 p-2">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors duration-150 ${
                isActive
                  ? "bg-surface-elevated text-text-primary"
                  : "text-text-secondary hover:bg-surface-hover hover:text-text-primary"
              }`}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="shrink-0 border-t border-border-subtle px-4 py-3">
        <p className="max-w-full truncate text-xs text-text-tertiary">{email}</p>
        <button
          onClick={handleSignOut}
          className="mt-1.5 text-xs text-text-tertiary transition-colors duration-150 hover:text-text-secondary"
        >
          Sign out
        </button>
      </div>
    </aside>
  );
}
