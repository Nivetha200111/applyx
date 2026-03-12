export default function DashboardHomeLoading() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Hero card skeleton */}
      <div className="rounded-[24px] bg-slate-950 p-8 space-y-4">
        <div className="h-5 w-28 rounded bg-slate-800" />
        <div className="h-8 w-64 rounded-lg bg-slate-800" />
        <div className="h-4 w-96 max-w-full rounded bg-slate-800" />
        <div className="grid gap-4 sm:grid-cols-4 pt-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="h-10 w-16 rounded bg-slate-800" />
              <div className="h-3 w-20 rounded bg-slate-800" />
            </div>
          ))}
        </div>
      </div>

      {/* Quick actions row */}
      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="rounded-[24px] border border-border/50 bg-card/50 p-6 space-y-4">
            <div className="h-5 w-32 rounded bg-muted" />
            <div className="h-3 w-48 rounded bg-muted" />
            <div className="h-10 w-full rounded-lg bg-muted" />
          </div>
        ))}
      </div>

      {/* Tailor card */}
      <div className="rounded-[24px] border border-border/50 bg-card/50 p-6 space-y-4">
        <div className="h-5 w-40 rounded bg-muted" />
        <div className="h-3 w-72 max-w-full rounded bg-muted" />
        <div className="h-24 w-full rounded-lg bg-muted" />
      </div>
    </div>
  );
}

