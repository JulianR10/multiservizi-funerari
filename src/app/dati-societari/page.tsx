import type { Metadata } from "next"
import { COMPANY } from "@/lib/company"

export const metadata: Metadata = {
  title: "Dati Societari | Petrungaro Multiservizi",
  description: "I dati della società Petrungaro Multiservizi Funerari.",
}

const dati = [
  { title: "Ragione sociale", value: COMPANY.name },
  { title: "Sede operativa", value: <>{COMPANY.address}<br />{COMPANY.city}</> },
  { title: "Sede legale", value: COMPANY.sedeLegale },
  { title: "Partita IVA", value: COMPANY.piva },
  { title: "REA", value: COMPANY.rea },
  { title: "PEC", value: COMPANY.pec },
  { title: "Telefono", value: COMPANY.phone },
  { title: "Cellulare", value: COMPANY.cellulare },
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
