export default function TrackerLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="space-y-2">
        <div className="h-8 w-56 rounded-lg bg-muted" />
        <div className="h-4 w-[32rem] max-w-full rounded bg-muted" />
      </div>
      {/* Stats row */}
      <div className="grid gap-4 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-[24px] border border-border/50 bg-card/50 p-4 space-y-2">
            <div className="h-8 w-12 rounded bg-muted" />
            <div className="h-3 w-20 rounded bg-muted" />
          </div>
        ))}
      </div>
      {/* Table skeleton */}
      <div className="rounded-[24px] border border-border/50 bg-card/50 p-4 space-y-3">
        <div className="h-10 w-full rounded bg-muted" />
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-14 w-full rounded bg-muted/60" />
        ))}
      </div>
    </div>
  );
}

