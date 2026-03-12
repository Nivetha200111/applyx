export default function ResumesLoading() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="space-y-3">
        <div className="h-8 w-44 rounded-lg bg-muted" />
        <div className="h-4 w-[26rem] max-w-full rounded bg-muted" />
      </div>
      <div className="grid gap-4">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="rounded-[24px] border border-border/50 bg-card/50 p-6 space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div className="space-y-2">
                <div className="h-5 w-48 rounded bg-muted" />
                <div className="h-3 w-36 rounded bg-muted" />
              </div>
              <div className="h-6 w-16 rounded-full bg-muted" />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <div className="h-4 w-20 rounded bg-muted" />
                <div className="h-3 w-40 rounded bg-muted" />
              </div>
              <div className="space-y-2">
                <div className="h-4 w-20 rounded bg-muted" />
                <div className="h-3 w-56 rounded bg-muted" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

