import { DashboardSidebar } from "@/components/dashboard-sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen lg:flex">
      <DashboardSidebar />
      <main className="flex-1 px-4 py-6 sm:px-6 lg:px-10 lg:py-8">
        <div className="mb-6 rounded-[28px] border border-amber-400/40 bg-amber-500/12 px-5 py-4 text-sm leading-6 text-amber-950 dark:text-amber-100">
          Public demo mode is active. You can browse the dashboard with sample data, but
          uploads, saved history, and real accounts are disabled in this build.
        </div>
        {children}
      </main>
    </div>
  );
}
