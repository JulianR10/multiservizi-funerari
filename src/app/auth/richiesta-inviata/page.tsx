import Link from "next/link"

export default function RichiestaInviataPage() {
  return (
    <div className="mx-auto max-w-lg px-4 py-24 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
        <svg className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <h1 className="mt-6 font-heading text-2xl font-bold text-zinc-900">
        Richiesta inviata con successo
      </h1>
      <p className="mt-3 text-sm text-zinc-500 leading-relaxed">
        La tua richiesta di registrazione è stata ricevuta ed è in attesa di approvazione
        da parte dell&apos;amministratore. Riceverai una email non appena il tuo account sarà attivato.
      </p>
      <div className="mt-8 space-y-3">
        <Link
          href="/"
          className="inline-block rounded-full bg-zinc-900 px-8 py-3 text-sm font-medium text-white hover:bg-zinc-800"
        >
          Torna alla home
        </Link>
      </div>
    </div>
  )
}
