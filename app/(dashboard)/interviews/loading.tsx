export default function InterviewsLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="space-y-2">
        <div className="h-8 w-48 rounded-lg bg-muted" />
        <div className="h-4 w-[30rem] max-w-full rounded bg-muted" />
      </div>
      <div className="rounded-[24px] border border-border/50 bg-card/50 p-8 space-y-6">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-2xl bg-muted" />
          <div className="space-y-2">
            <div className="h-6 w-56 rounded bg-muted" />
            <div className="h-3 w-40 rounded bg-muted" />
          </div>
        </div>
        <div className="rounded-lg border border-border/30 p-4 space-y-2">
          <div className="h-3 w-64 rounded bg-muted" />
          <div className="h-3 w-48 rounded bg-muted" />
          <div className="h-3 w-56 rounded bg-muted" />
        </div>
        <div className="space-y-4">
          <div className="h-10 w-full rounded-lg bg-muted" />
          <div className="h-32 w-full rounded-lg bg-muted" />
        </div>
        <div className="h-12 w-full rounded-lg bg-muted" />
      </div>
    </div>
  );
}

