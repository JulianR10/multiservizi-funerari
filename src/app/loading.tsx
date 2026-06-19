export default function Loading() {
  return (
    <div className="mx-auto max-w-lg px-4 py-24 text-center">
      <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-zinc-200 border-t-zinc-900" />
      <p className="mt-4 text-sm text-zinc-500">Caricamento...</p>
    </div>
  )
}
