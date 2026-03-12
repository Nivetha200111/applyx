export default function MarketingLoading() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="space-y-4 text-center animate-pulse">
        <div className="mx-auto h-8 w-48 rounded-lg bg-muted" />
        <div className="mx-auto h-4 w-64 rounded bg-muted" />
      </div>
    </div>
  );
}

