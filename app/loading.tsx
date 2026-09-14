export default function Loading() {
  return (
    <main className="min-h-screen bg-neutral-50">
      <div className="mx-auto w-full max-w-2xl px-4 py-10" aria-busy="true" aria-live="polite">
        <header className="mb-8 flex items-center justify-between">
          <div className="h-7 w-32 animate-pulse rounded-md bg-neutral-200" />
          <div className="h-8 w-24 animate-pulse rounded-md bg-neutral-200" />
        </header>

        <div className="h-20 animate-pulse rounded-xl border border-neutral-200 bg-white" />

        <div className="mt-4 flex items-center justify-between">
          <div className="h-9 w-48 animate-pulse rounded-lg bg-neutral-200" />
          <div className="h-9 w-56 animate-pulse rounded-lg bg-neutral-200" />
        </div>

        <div className="mt-4 space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-16 animate-pulse rounded-lg border border-neutral-200 bg-white" />
          ))}
        </div>

        <p className="mt-6 flex items-center justify-center gap-2 text-xs text-neutral-400">
          <span className="size-3.5 animate-spin rounded-full border-2 border-neutral-300 border-t-neutral-500" />
          正在加载…
        </p>
      </div>
    </main>
  );
}
