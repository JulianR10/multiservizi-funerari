import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Dati Societari | Petrungaro Multiservizi",
  description: "I dati della società Petrungaro Multiservizi Funerari.",
}

const dati = [
  { title: "Ragione sociale", value: "MULTISERVIZI FUNEBRI SRL" },
  { title: "Sede operativa", value: <>Via Trento, 11, II° Trav.<br />87030 Fiumefreddo Bruzio (CS)</> },
  { title: "Sede legale", value: <>Via Sopra le Mura, 6<br />87030 Fiumefreddo Bruzio (CS)</> },
  { title: "Partita IVA", value: "03164970786" },
  { title: "REA", value: "Cosenza - REA 215445 - Cap. Soc. € 3.000 i.v." },
  { title: "Assistenza", value: "Reperibilità H24, 365 giorni all'anno" },
]

export default function DatiSocietariPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="text-center font-heading text-4xl font-bold text-primary sm:text-5xl">
        Dati della società
      </h1>
      <div className="mt-10 grid gap-6 sm:grid-cols-2">
        {dati.map((d) => (
          <div key={d.title} className="rounded-xl border border-primary/10 bg-chalk p-6 shadow-sm">
            <h2 className="font-heading text-lg font-semibold text-primary">{d.title}</h2>
            <p className="mt-1 font-sans text-sm text-zinc-600">{d.value}</p>
          </div>
        ))}
      </div>
    </main>
  )
}
