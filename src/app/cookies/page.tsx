import type { Metadata } from "next"
import { FormattedDate } from "@/components/CopyrightYear"

export const metadata: Metadata = {
  title: "Cookie Policy – Petrungaro Multiservizi",
}

export default function CookiePolicyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-zinc-900">Cookie Policy</h1>

      <section className="mt-8 space-y-6 text-sm leading-7 text-zinc-600">
        <p>
          Questa Cookie Policy spiega come Petrungaro Multiservizi utilizza i cookie e tecnologie
          simili sul sito petrungaro-multiservizi.it.
        </p>

        <h2 className="text-lg font-semibold text-zinc-900">Cosa sono i cookie</h2>
        <p>
          I cookie sono piccoli file di testo memorizzati sul tuo dispositivo quando visiti un sito
          web. Aiutano il sito a funzionare correttamente, migliorare l&apos;esperienza di navigazione e
          fornire informazioni statistiche anonime.
        </p>

        <h2 className="text-lg font-semibold text-zinc-900">Cookie utilizzati</h2>

        <table className="w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-zinc-200">
              <th className="py-2 pr-4 font-medium text-zinc-900">Cookie</th>
              <th className="py-2 pr-4 font-medium text-zinc-900">Tipo</th>
              <th className="py-2 font-medium text-zinc-900">Scopo</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            <tr>
              <td className="py-3 pr-4 font-mono text-xs text-zinc-500">
                admin_session
              </td>
              <td className="py-3 pr-4 text-zinc-700">Tecnico (sessione admin)</td>
              <td className="py-3 text-zinc-700">
                Mantiene la sessione di autenticazione dell&apos;amministratore. Utilizzato solo
                per l&apos;accesso al pannello di gestione.
              </td>
            </tr>
            <tr>
              <td className="py-3 pr-4 font-mono text-xs text-zinc-500">
                cart-storage
              </td>
              <td className="py-3 pr-4 text-zinc-700">
                Tecnico (localStorage)
              </td>
              <td className="py-3 text-zinc-700">
                Memorizza i prodotti nel carrello. Non è un cookie ma un dato salvato
                localmente nel browser.
              </td>
            </tr>
            <tr>
              <td className="py-3 pr-4 font-mono text-xs text-zinc-500">
                cookie-banner-dismissed
              </td>
              <td className="py-3 pr-4 text-zinc-700">
                Tecnico (localStorage)
              </td>
              <td className="py-3 text-zinc-700">
                Ricorda se hai accettato il banner informativo dei cookie.
              </td>
            </tr>
          </tbody>
        </table>

        <p className="mt-4">
          Il sito <strong>non</strong> utilizza cookie di profilazione, marketing o tracciamento
          di terze parti (Google Analytics, Facebook Pixel, etc.).
        </p>

        <h2 className="text-lg font-semibold text-zinc-900">Gestione dei cookie</h2>
        <p>
          Poiché utilizziamo solo cookie tecnici strettamente necessari, non è richiesto un
          consenso esplicito. Puoi comunque disabilitare i cookie dalle impostazioni del tuo
          browser, ma alcune funzionalità del sito potrebbero non essere disponibili.
        </p>

        <h2 className="text-lg font-semibold text-zinc-900">Modifiche</h2>
        <p>
          Questa Cookie Policy può essere aggiornata periodicamente. Ti invitiamo a consultarla
          regolarmente.
        </p>

        <p className="pt-4 text-xs text-zinc-400">
          Ultimo aggiornamento: <FormattedDate />
        </p>
      </section>
    </div>
  )
}
