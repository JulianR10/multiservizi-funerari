import Link from "next/link"

export default function NotFound() {
  return (
    <div className="mx-auto max-w-lg px-4 py-24 text-center">
      <h1 className="font-heading text-7xl font-bold text-primary">404</h1>
      <p className="mt-6 font-heading text-2xl font-semibold text-zinc-800">
        Ci dispiace, la pagina che cerca non è disponibile.
      </p>
      <p className="mt-3 text-base leading-relaxed text-zinc-500">
        Può essere stata rimossa o l&apos;indirizzo potrebbe non essere corretto.
        La invitiamo a tornare alla home o a contattarci per assistenza.
      </p>
      <div className="mt-10 flex items-center justify-center gap-4">
        <Link
          href="/"
          className="rounded-full bg-primary px-6 py-2.5 text-sm font-medium text-white transition hover:bg-primary-hover"
        >
          Torna alla home
        </Link>
        <Link
          href="/#contatti"
          className="rounded-full border border-zinc-300 px-6 py-2.5 text-sm font-medium text-zinc-700 transition hover:border-zinc-400 hover:bg-zinc-50"
        >
          Contattaci
        </Link>
      </div>
    </div>
  )
}
