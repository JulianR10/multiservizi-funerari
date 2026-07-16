export default function ProductsLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="h-9 w-32 animate-pulse rounded bg-zinc-200" />
      <div className="mt-8 flex flex-wrap gap-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-7 w-20 animate-pulse rounded-full bg-zinc-200" />
        ))}
      </div>
      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i}>
            <div className="aspect-square animate-pulse rounded-lg bg-zinc-200" />
            <div className="mt-4 space-y-2">
              <div className="h-3 w-16 animate-pulse rounded bg-zinc-200" />
              <div className="h-4 w-36 animate-pulse rounded bg-zinc-200" />
              <div className="h-5 w-20 animate-pulse rounded bg-zinc-200" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
