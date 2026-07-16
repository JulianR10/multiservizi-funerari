export default function ProductLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
        <div className="aspect-square animate-pulse rounded-lg bg-zinc-200" />
        <div className="space-y-4">
          <div className="h-4 w-24 animate-pulse rounded bg-zinc-200" />
          <div className="h-8 w-64 animate-pulse rounded bg-zinc-200" />
          <div className="h-8 w-32 animate-pulse rounded bg-zinc-200" />
          <div className="h-24 w-full animate-pulse rounded bg-zinc-200" />
          <div className="h-12 w-48 animate-pulse rounded-full bg-zinc-200" />
        </div>
      </div>
    </div>
  )
}
