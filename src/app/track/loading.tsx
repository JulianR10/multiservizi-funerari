export default function TrackLoading() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="h-10 w-64 animate-pulse rounded bg-zinc-200" />
      <div className="mt-2 h-5 w-96 animate-pulse rounded bg-zinc-200" />
      <div className="mt-8 space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-lg border border-zinc-200 p-6">
            <div className="h-5 w-40 animate-pulse rounded bg-zinc-200" />
            <div className="mt-2 h-4 w-60 animate-pulse rounded bg-zinc-200" />
            <div className="mt-4 h-20 animate-pulse rounded bg-zinc-200" />
          </div>
        ))}
      </div>
    </div>
  )
}
