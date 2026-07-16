import { LegalPageLayout } from "@/components/LegalPageLayout"

export default function TerminiPage() {
  return (
    <LegalPageLayout>
      <h1 className="text-3xl font-bold text-zinc-900">Termini e condizioni</h1>
      <div className="mt-8 space-y-4 text-sm leading-7 text-zinc-600">
        <h2 className="text-lg font-semibold text-zinc-900">1. Accettazione delle condizioni</h2>
        <p>
          L&apos;utilizzo del sito web multiservizifunerarisrl.com e l&apos;acquisto dei prodotti in esso presenti
          implicano l&apos;accettazione integrale dei presenti termini e condizioni d&apos;uso. Il cliente è tenuto a
          leggere attentamente il presente documento prima di effettuare qualsiasi ordine.
        </p>

        <h2 className="text-lg font-semibold text-zinc-900">2. Identificazione del venditore</h2>
        <p>
          MULTISERVIZI FUNEBRI SRL, con sede legale in Italia, Partita IVA: IT03164970786, email:
          info@multiservizifunerarisrl.com.
        </p>

        <h2 className="text-lg font-semibold text-zinc-900">3. Prezzi e pagamenti</h2>
        <p>
          I prezzi sono espressi in Euro (EUR) e includono l&apos;IVA al 22% salvo diversa indicazione. I prezzi
          visualizzati nel catalogo sono riservati agli utenti registrati e approvati. Il pagamento avviene
          tramite Stripe, circuito sicuro che accetta le principali carte di credito e debito. L&apos;importo
          totale dell&apos;ordine viene addebitato al momento dell&apos;acquisto.
        </p>

        <h2 className="text-lg font-semibold text-zinc-900">4. Spedizioni</h2>
        <p>
          Le spedizioni vengono effettuate in tutta Italia. I tempi di consegna variano in base alla
          destinazione e al metodo di spedizione scelto. I costi di spedizione sono indicati al momento
          del checkout e possono variare in base al peso, alle dimensioni e alla destinazione. La
          spedizione è gratuita per ordini di importo superiore a una soglia stabilita, indicata al
          momento del checkout.
        </p>

        <h2 className="text-lg font-semibold text-zinc-900">5. Diritto di recesso</h2>
        <p>
          Il cliente ha diritto di recedere dal contratto di acquisto entro 14 giorni dalla ricezione dei
          prodotti, ai sensi del D.Lgs. 21/2014 (Codice del Consumo). Per le modalità di esercizio del
          recesso, si rimanda all&apos;apposita sezione presente su questo sito.
        </p>

        <h2 className="text-lg font-semibold text-zinc-900">6. Garanzie</h2>
        <p>
          I prodotti venduti sono coperti dalla garanzia legale di conformità prevista dal Codice del
          Consumo. In caso di difetti o non conformità, il cliente ha diritto al ripristino o alla
          sostituzione del prodotto.
        </p>

        <h2 className="text-lg font-semibold text-zinc-900">7. Limitazioni di responsabilità</h2>
        <p>
          Petrungaro Multiservizi non sarà ritenuta responsabile per danni derivanti da uso improprio dei
          prodotti, eventi di forza maggiore, o ritardi nella consegna causati da terzi. Le immagini dei
          prodotti sono puramente indicative e potrebbero differire leggermente dal prodotto reale.
        </p>

        <h2 className="text-lg font-semibold text-zinc-900">8. Legge applicabile e foro competente</h2>
        <p>
          I presenti termini e condizioni sono regolati dalla legge italiana. Per qualsiasi controversia
          relativa all&apos;interpretazione o esecuzione del contratto di vendita, il foro competente è quello
          del domicilio del consumatore, ai sensi del D.Lgs. 206/2005.
        </p>

        <p className="text-xs text-zinc-400">Ultimo aggiornamento: Luglio 2026</p>
      </div>
    </LegalPageLayout>
  )
}
