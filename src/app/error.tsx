"use client"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="mx-auto max-w-lg px-4 py-24 text-center">
      <h1 className="text-6xl font-bold text-zinc-900">500</h1>
      <p className="mt-4 text-lg text-zinc-600">Errore interno del server</p>
      <p className="mt-2 text-sm text-zinc-400">
        {process.env.NODE_ENV === "development" ? error.message : "Qualcosa è andato storto."}
      </p>
      <button
        onClick={reset}
        className="mt-8 inline-block rounded-full bg-zinc-900 px-6 py-2 text-sm font-medium text-white hover:bg-zinc-800"
      >
        Riprova
      </button>
    </div>
  )
}
