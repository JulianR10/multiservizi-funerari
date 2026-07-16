export default function Loading() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between">
        <div>
          <div className="h-9 w-48 animate-pulse rounded bg-zinc-200" />
          <div className="mt-1 h-4 w-28 animate-pulse rounded bg-zinc-200" />
        </div>
        <div className="h-10 w-36 animate-pulse rounded-full bg-zinc-200" />
      </div>

      <div className="mt-8 space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="rounded-lg border border-zinc-200 bg-chalk p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="h-5 w-36 animate-pulse rounded bg-zinc-200" />
                  <div className="h-5 w-20 animate-pulse rounded-full bg-zinc-200" />
                  <div className="h-5 w-16 animate-pulse rounded-full bg-zinc-200" />
                </div>
                <div className="h-4 w-64 animate-pulse rounded bg-zinc-200" />
                <div className="h-3 w-32 animate-pulse rounded bg-zinc-200" />
                <div className="h-4 w-48 animate-pulse rounded bg-zinc-200" />
                <div className="h-5 w-24 animate-pulse rounded bg-zinc-200" />
              </div>
              <div className="flex flex-col items-end gap-2">
                <div className="h-8 w-28 animate-pulse rounded-md bg-zinc-200" />
                <div className="h-8 w-28 animate-pulse rounded-md bg-zinc-200" />
                <div className="h-8 w-28 animate-pulse rounded-md bg-zinc-200" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
