export default function SettingsLoading() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="space-y-3">
        <div className="h-8 w-52 rounded-lg bg-muted" />
        <div className="h-4 w-[28rem] max-w-full rounded bg-muted" />
      </div>
      <div className="rounded-[24px] border border-border/50 bg-card/50 p-6 space-y-4">
        <div className="h-5 w-32 rounded bg-muted" />
        <div className="h-3 w-64 rounded bg-muted" />
        <div className="h-3 w-96 max-w-full rounded bg-muted" />
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-[24px] border border-border/50 bg-card/50 p-6 space-y-4">
            <div className="h-5 w-24 rounded bg-muted" />
            <div className="h-8 w-20 rounded bg-muted" />
            <div className="h-3 w-full rounded bg-muted" />
            <div className="h-10 w-32 rounded-lg bg-muted" />
          </div>
        ))}
      </div>
    </div>
  );
}

