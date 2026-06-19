import { Suspense } from "react"
import Link from "next/link"
import { ClearCartOnSuccess } from "@/components/ClearCartOnSuccess"

export default function OrdineConfermatoPage() {
  return (
    <div className="mx-auto max-w-lg px-4 py-24 text-center">
      <Suspense fallback={null}>
        <ClearCartOnSuccess />
      </Suspense>
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
        <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
        </svg>
      </div>
      <h1 className="mt-6 font-heading text-3xl font-bold text-zinc-900">Ordine confermato!</h1>
      <p className="mt-3 text-zinc-600">
        Grazie per il tuo ordine. Riceverai una email di conferma con tutti i dettagli.
      </p>
      <p className="mt-2 text-sm text-zinc-500">
        Puoi monitorare lo stato del tuo ordine inserendo la tua email nella pagina di tracking.
      </p>
      <div className="mt-8 flex flex-col items-center gap-4">
        <Link
          href="/track"
          className="rounded-full bg-primary px-6 py-3 text-sm font-medium text-white hover:bg-primary-hover"
        >
          Monitora il tuo ordine
        </Link>
        <Link href="/" className="text-sm font-medium text-zinc-600 hover:text-zinc-900 underline">
          Torna alla home
        </Link>
      </div>
    </div>
  )
}
