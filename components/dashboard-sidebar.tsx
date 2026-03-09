"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  ClipboardList,
  FileText,
  History,
  LayoutDashboard,
  Mail,
  Settings,
  Sparkles,
} from "lucide-react";
import { LogoutButton } from "@/components/logout-button";
import { ThemeToggle } from "@/components/theme-toggle";
import { ApplyxLogo } from "@/components/ui/applyx-logo";
import { cn } from "@/lib/utils";

const navItems = [
  {
    href: "/dashboard",
    label: "Overview",
    icon: LayoutDashboard,
  },
  {
    href: "/tracker",
    label: "Tracker",
    icon: ClipboardList,
  },
  {
    href: "/resumes",
    label: "Resumes",
    icon: FileText,
  },
  {
    href: "/tailored",
    label: "Tailored",
    icon: Sparkles,
  },
  {
    href: "/analytics",
    label: "Analytics",
    icon: BarChart3,
  },
  {
    href: "/templates",
    label: "Templates",
    icon: Mail,
  },
  {
    href: "/history",
    label: "History",
    icon: History,
  },
  {
    href: "/settings",
    label: "Settings",
    icon: Settings,
  },
];

interface DashboardSidebarProps {
  userName?: string | null;
  planLabel: string;
  usageLabel: string;
}

export function DashboardSidebar({
  userName,
  planLabel,
  usageLabel,
}: DashboardSidebarProps) {
  const pathname = usePathname();

  return (
    <>
      <aside className="hidden w-72 shrink-0 border-r border-border/70 bg-card/70 px-6 py-8 backdrop-blur-xl lg:block">
        <Link className="inline-flex items-center gap-3" href="/">
          <ApplyxLogo />
        </Link>
        {userName ? (
          <div className="mt-6 rounded-[24px] border border-border/70 bg-background/65 p-4">
            <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
              Signed in as
            </div>
            <div className="mt-2 font-semibold">{userName}</div>
          </div>
        ) : null}
        <div className="mt-6">
          <ThemeToggle />
        </div>
        <nav className="mt-10 space-y-2">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(`${item.href}/`);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-muted-foreground transition-all duration-200 hover:-translate-y-0.5 hover:bg-card hover:text-foreground",
                  isActive && "bg-card text-foreground shadow-sm",
                )}
                href={item.href}
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="mt-10 rounded-[24px] border border-primary/20 bg-primary/10 p-4">
          <div className="text-sm font-semibold text-primary">{planLabel}</div>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            {usageLabel}
          </p>
        </div>
        <div className="mt-4">
          <LogoutButton />
        </div>
      </aside>
      <div className="sticky top-0 z-30 border-b border-border/70 bg-background/95 backdrop-blur lg:hidden">
        <div className="flex items-center gap-3 px-4 py-2">
          <Link className="inline-flex items-center gap-2" href="/">
            <ApplyxLogo markOnly size="sm" />
            <span className="text-sm font-semibold">ApplyX</span>
          </Link>
          <span className="ml-auto text-xs font-medium text-primary">{planLabel}</span>
          <ThemeToggle />
        </div>
        <nav className="flex items-center gap-2 overflow-x-auto px-4 pb-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.href}
                className={cn(
                  "flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card/85 text-muted-foreground",
                )}
                href={item.href}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </>
  );
}
