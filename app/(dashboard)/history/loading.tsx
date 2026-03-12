export default function HistoryLoading() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="space-y-3">
        <div className="h-8 w-44 rounded-lg bg-muted" />
        <div className="h-4 w-[26rem] max-w-full rounded bg-muted" />
      </div>
      <div className="rounded-[24px] border border-border/50 bg-card/50 p-6 space-y-4">
        <div className="h-5 w-36 rounded bg-muted" />
        <div className="h-3 w-64 rounded bg-muted" />
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center justify-between rounded-[24px] border border-border/30 p-4">
            <div className="space-y-2">
              <div className="h-4 w-32 rounded bg-muted" />
              <div className="h-3 w-24 rounded bg-muted" />
            </div>
            <div className="h-6 w-20 rounded-full bg-muted" />
          </div>
        ))}
      </div>
    </div>
  );
}

