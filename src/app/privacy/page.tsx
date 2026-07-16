import { LegalPageLayout } from "@/components/LegalPageLayout"

export default function PrivacyPage() {
  return (
    <LegalPageLayout>
      <h1 className="text-3xl font-bold text-zinc-900">Privacy Policy</h1>
      <div className="mt-8 space-y-4 text-sm leading-7 text-zinc-600">
        <p>
          La presente Informativa Privacy descrive come MULTISERVIZI FUNEBRI SRL raccoglie, utilizza e
          protegge i dati personali degli utenti del sito multiservizifunerarisrl.com, in conformità
          al Regolamento UE 2016/679 (GDPR) e al D.Lgs. 196/2003 (Codice Privacy).
        </p>

        <h2 className="text-lg font-semibold text-zinc-900">1. Titolare del trattamento</h2>
        <p>
          MULTISERVIZI FUNEBRI SRL, Partita IVA: IT03164970786, email: info@multiservizifunerarisrl.com.
        </p>

        <h2 className="text-lg font-semibold text-zinc-900">2. Responsabile della protezione dei dati (DPO)</h2>
        <p>
          Il Titolare del trattamento può essere contattato all&apos;indirizzo email sopra indicato per
          qualsiasi richiesta relativa al trattamento dei dati personali.
        </p>

        <h2 className="text-lg font-semibold text-zinc-900">3. Dati personali raccolti</h2>
        <p>Raccogliamo i seguenti dati personali:</p>
        <ul className="list-disc space-y-1 pl-6">
          <li>Nome e cognome</li>
          <li>Indirizzo email</li>
          <li>Indirizzo di spedizione e fatturazione</li>
          <li>Numero di telefono</li>
          <li>Dati di pagamento (gestiti esclusivamente da Stripe, non memorizzati sui nostri server)</li>
          <li>Dati di navigazione (cookie tecnici)</li>
        </ul>

        <h2 className="text-lg font-semibold text-zinc-900">4. Finalità del trattamento</h2>
        <p>I dati sono utilizzati per le seguenti finalità:</p>
        <ul className="list-disc space-y-1 pl-6">
          <li>Gestione degli ordini e delle consegne</li>
          <li>Comunicazioni relative all&apos;ordine (conferma, spedizione, fattura)</li>
          <li>Adempimenti fiscali e contabili (emissione fatture)</li>
          <li>Assistenza clienti e gestione reclami</li>
          <li>Registrazione e gestione dell&apos;account utente</li>
        </ul>

        <h2 className="text-lg font-semibold text-zinc-900">5. Base giuridica del trattamento</h2>
        <p>
          Il trattamento dei dati si basa sulle seguenti basi giuridiche:
        </p>
        <ul className="list-disc space-y-1 pl-6">
          <li>Esecuzione del contratto di acquisto (art. 6.1.b GDPR)</li>
          <li>Adempimento di obblighi legali (art. 6.1.c GDPR) — fatturazione, obblighi fiscali</li>
          <li>Consenso dell&apos;interessato (art. 6.1.a GDPR) — per eventuali finalità di marketing</li>
        </ul>

        <h2 className="text-lg font-semibold text-zinc-900">6. Periodo di conservazione</h2>
        <p>
          I dati personali sono conservati per il tempo necessario a soddisfare le finalità per cui
          sono stati raccolti. I dati fiscali e contabili sono conservati per 10 anni come previsto
          dalla normativa italiana. I dati di navigazione (cookie) sono conservati per la durata
          della sessione di navigazione.
        </p>

        <h2 className="text-lg font-semibold text-zinc-900">7. Diritti dell&apos;interessato</h2>
        <p>Ai sensi del GDPR, l&apos;utente ha diritto di:</p>
        <ul className="list-disc space-y-1 pl-6">
          <li>Accesso ai propri dati personali</li>
          <li>Rettifica dei dati inesatti o incompleti</li>
          <li>Cancellazione dei dati (diritto all&apos;oblio)</li>
          <li>Limitazione del trattamento</li>
          <li>Portabilità dei dati</li>
          <li>Opposizione al trattamento</li>
        </ul>
        <p>
          Per esercitare i propri diritti, l&apos;utente può contattare il Titolare del trattamento
          all&apos;indirizzo email: info@multiservizifunerarisrl.com. È inoltre possibile proporre reclamo
          al Garante per la Protezione dei Dati Personali.
        </p>

        <h2 className="text-lg font-semibold text-zinc-900">8. Cookie</h2>
        <p>
          Questo sito utilizza esclusivamente cookie tecnici necessari al corretto funzionamento del
          sito stesso. Per maggiori informazioni, consultare la Cookie Policy.
        </p>

        <h2 className="text-lg font-semibold text-zinc-900">9. Comunicazione dei dati</h2>
        <p>
          I dati personali non vengono venduti o ceduti a terzi. Possono essere comunicati a soggetti
          terzi solo per l&apos;esecuzione del contratto (corrieri, Stripe per pagamenti, consulenti
          fiscali) e per obblighi di legge.
        </p>

        <h2 className="text-lg font-semibold text-zinc-900">10. Aggiornamenti</h2>
        <p>
          La presente informativa può essere aggiornata periodicamente. Gli utenti saranno informati
          di eventuali modifiche tramite pubblicazione sul sito.
        </p>

        <p className="text-xs text-zinc-400">Ultimo aggiornamento: Luglio 2026</p>
      </div>
    </LegalPageLayout>
  )
}
