import { LegalPageLayout } from "@/components/LegalPageLayout"

export default function RecessoPage() {
  return (
    <LegalPageLayout>
      <h1 className="text-3xl font-bold text-zinc-900">Diritto di recesso</h1>
      <div className="mt-8 space-y-4 text-sm leading-7 text-zinc-600">
        <p>
          Ai sensi del D.Lgs. 21/2014 (Codice del Consumo), il cliente ha diritto di recedere dal
          contratto di acquisto entro 14 giorni dalla ricezione dei beni, senza dover fornire alcuna
          motivazione.
        </p>

        <h2 className="text-lg font-semibold text-zinc-900">Modalità di esercizio del recesso</h2>
        <p>
          Per esercitare il diritto di recesso, il cliente deve comunicare la propria decisione in modo
          inequivocabile entro il termine di 14 giorni. La comunicazione può essere inviata tramite:
        </p>
        <ul className="list-disc space-y-1 pl-6">
          <li>Email a: info@multiservizifunerarisrl.com</li>
          <li>Raccomandata A/R all&apos;indirizzo della sede legale della società</li>
        </ul>
        <p>
          È possibile utilizzare il modulo tipo di recesso allegato al D.Lgs. 21/2014, ma non è
          obbligatorio. È sufficiente una dichiarazione esplicita della decisione di recedere.
        </p>

        <h2 className="text-lg font-semibold text-zinc-900">Indirizzo per la restituzione</h2>
        <p>
          La restituzione dei prodotti dovrà avvenire presso la sede operativa indicata nella
          comunicazione di conferma del recesso. I costi di restituzione sono a carico del cliente.
        </p>

        <h2 className="text-lg font-semibold text-zinc-900">Effetti del recesso</h2>
        <p>
          In caso di recesso, verrà rimborsato l&apos;intero importo dell&apos;ordine, inclusi i costi di
          spedizione standard (esclusi eventuali costi aggiuntivi per spedizione espressa), entro 14
          giorni dalla data in cui il venditore riceve la comunicazione di recesso. Il rimborso verrà
          effettuato utilizzando lo stesso metodo di pagamento usato per la transazione iniziale,
          salvo diverso accordo.
        </p>
        <p>
          Il venditore può trattenere il rimborso fino all&apos;avvenuta ricezione dei beni o fino a
          quando il cliente non dimostri di aver rispedito i beni, a seconda di quale condizione si
          verifichi per prima.
        </p>

        <h2 className="text-lg font-semibold text-zinc-900">Condizioni di restituzione</h2>
        <p>
          I prodotti devono essere restituiti integri, nella loro confezione originale, completi di
          tutti gli accessori e della documentazione. Il cliente è responsabile della custodia dei
          beni durante il periodo di recesso.
        </p>

        <h2 className="text-lg font-semibold text-zinc-900">Eccezioni</h2>
        <p>
          Il diritto di recesso non si applica ai seguenti casi:
        </p>
        <ul className="list-disc space-y-1 pl-6">
          <li>Prodotti realizzati su misura o chiaramente personalizzati</li>
          <li>Beni sigillati che non possono essere restituiti per motivi igienici o di protezione della salute se aperti</li>
          <li>Fornitura di servizi già completamente eseguiti</li>
        </ul>

        <h2 className="text-lg font-semibold text-zinc-900">Modulo tipo di recesso</h2>
        <p>
          Ai sensi del D.Lgs. 21/2014, il cliente può utilizzare il seguente modulo per comunicare il recesso:
        </p>
        <div className="rounded-lg border border-zinc-200 bg-chalk p-4 text-xs leading-relaxed text-zinc-600">
          <p className="font-semibold text-zinc-900">Modulo di recesso</p>
          <p className="mt-2">Destinatario: MULTISERVIZI FUNEBRI SRL, [Indirizzo sede legale]</p>
          <p>Con la presente io sottoscritto comunico il recesso dal contratto di acquisto dei seguenti beni:</p>
          <p className="mt-1">— Prodotto: ______________</p>
          <p>— Data ricezione: ______________</p>
          <p>— Nome cliente: ______________</p>
          <p>— Indirizzo: ______________</p>
          <p>— Firma: ______________</p>
          <p>— Data: ______________</p>
        </div>

        <p className="text-xs text-zinc-400">Ultimo aggiornamento: Luglio 2026</p>
      </div>
    </LegalPageLayout>
  )
}
