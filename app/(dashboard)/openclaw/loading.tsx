export default function OpenClawLoading() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="space-y-3">
        <div className="h-6 w-28 rounded-full bg-muted" />
        <div className="h-8 w-44 rounded-lg bg-muted" />
        <div className="h-4 w-[28rem] max-w-full rounded bg-muted" />
      </div>
      <div className="rounded-[24px] border border-border/50 bg-card/50 p-8 space-y-6">
        <div className="h-14 w-14 rounded-3xl bg-muted" />
        <div className="h-6 w-72 rounded bg-muted" />
        <div className="h-4 w-96 max-w-full rounded bg-muted" />
      </div>
    </div>
  );
}

