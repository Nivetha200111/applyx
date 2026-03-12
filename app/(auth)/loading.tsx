export default function AuthLoading() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="space-y-4 text-center animate-pulse">
        <div className="mx-auto h-10 w-32 rounded-lg bg-muted" />
        <div className="mx-auto h-4 w-48 rounded bg-muted" />
      </div>
    </div>
  );
}

