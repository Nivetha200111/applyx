export default function JobsLoading() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="space-y-3">
        <div className="h-6 w-24 rounded-full bg-muted" />
        <div className="h-8 w-36 rounded-lg bg-muted" />
        <div className="h-4 w-[28rem] max-w-full rounded bg-muted" />
      </div>
      <div className="rounded-[24px] border border-border/50 bg-card/50 p-8 space-y-6">
        <div className="h-14 w-14 rounded-3xl bg-muted" />
        <div className="h-6 w-64 rounded bg-muted" />
        <div className="h-4 w-96 max-w-full rounded bg-muted" />
        <div className="grid gap-4 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-3xl border border-border/30 p-5 space-y-3">
              <div className="h-11 w-11 rounded-2xl bg-muted" />
              <div className="h-4 w-28 rounded bg-muted" />
              <div className="h-3 w-full rounded bg-muted" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

