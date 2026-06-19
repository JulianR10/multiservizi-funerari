export default function TerminiPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-zinc-900">Termini e condizioni</h1>
      <div className="mt-8 space-y-4 text-sm leading-7 text-zinc-600">
        <h2 className="text-lg font-semibold text-zinc-900">1. Accettazione delle condizioni</h2>
        <p>
          L&apos;utilizzo del sito e l&apos;acquisto dei prodotti implica l&apos;accettazione dei presenti termini e condizioni.
        </p>
        <h2 className="text-lg font-semibold text-zinc-900">2. Prezzi e pagamenti</h2>
        <p>
          I prezzi sono espressi in Euro (EUR) e includono l&apos;IVA al 22% salvo diversa indicazione. Il pagamento avviene tramite Stripe.
        </p>
        <h2 className="text-lg font-semibold text-zinc-900">3. Spedizioni</h2>
        <p>
          Le spedizioni vengono effettuate in tutta Italia. I tempi di consegna variano in base alla destinazione.
        </p>
        <h2 className="text-lg font-semibold text-zinc-900">4. Diritto di recesso</h2>
        <p>
          Il cliente ha diritto di recedere dall&apos;acquisto entro 14 giorni dalla ricezione dei prodotti, ai sensi del D.Lgs. 21/2014.
        </p>
      </div>
    </div>
  )
}
