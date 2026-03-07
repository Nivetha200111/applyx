"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FileText,
  History,
  LayoutDashboard,
  Settings,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  {
    href: "/dashboard",
    label: "Overview",
    icon: LayoutDashboard,
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

export function DashboardSidebar() {
  const pathname = usePathname();

  return (
    <>
      <aside className="hidden w-72 shrink-0 border-r border-border/70 bg-white/60 px-6 py-8 backdrop-blur-xl lg:block">
        <Link className="inline-flex items-center gap-3" href="/">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/15 text-lg font-semibold text-primary">
            A
          </span>
          <div>
            <div className="font-semibold">ApplyX</div>
            <div className="text-sm text-muted-foreground">Resume tailoring engine</div>
          </div>
        </Link>
        <nav className="mt-10 space-y-2">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(`${item.href}/`);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-white hover:text-foreground",
                  isActive && "bg-white text-foreground shadow-sm",
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
          <div className="text-sm font-semibold text-primary">Basic plan</div>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            12 of 30 tailors used this billing cycle.
          </p>
        </div>
      </aside>
      <nav className="sticky top-0 z-30 flex gap-2 overflow-x-auto border-b border-border/70 bg-background/95 px-4 py-3 backdrop-blur lg:hidden">
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
                  : "border-border bg-white/80 text-muted-foreground",
              )}
              href={item.href}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
