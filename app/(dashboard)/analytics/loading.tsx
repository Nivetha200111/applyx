export default function AnalyticsLoading() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="space-y-3">
        <div className="h-8 w-32 rounded-lg bg-muted" />
        <div className="h-4 w-[24rem] max-w-full rounded bg-muted" />
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-[24px] border border-border/50 bg-card/50 p-6 space-y-4">
            <div className="h-5 w-36 rounded bg-muted" />
            <div className="h-40 w-full rounded-lg bg-muted" />
          </div>
        ))}
      </div>
    </div>
  );
}

