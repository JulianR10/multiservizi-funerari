import type { Metadata } from "next"
import Link from "next/link"
import { COMPANY } from "@/lib/company"

export const metadata: Metadata = {
  title: "Contatti | Petrungaro Multiservizi",
  description: "Contatta Petrungaro Multiservizi per informazioni sui nostri prodotti e servizi funebri.",
}

export default function ContattiPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="font-heading text-3xl font-bold text-zinc-900">Contatti</h1>
      <p className="mt-4 text-zinc-600">
        Siamo a tua disposizione per qualsiasi informazione.
      </p>

      <div className="mt-10 grid gap-6 sm:grid-cols-2">
        <div className="rounded-lg border border-zinc-200 bg-chalk p-6">
          <h2 className="font-heading text-lg font-semibold text-zinc-900">Telefono</h2>
          <p className="mt-2 text-sm text-zinc-600">Reperibilità H24, 365 giorni all'anno</p>
          <a href={`tel:${COMPANY.phone}`} className="mt-1 inline-block text-sm font-medium text-primary hover:text-primary-hover">
            {COMPANY.phone}
          </a>
        </div>

        <div className="rounded-lg border border-zinc-200 bg-chalk p-6">
          <h2 className="font-heading text-lg font-semibold text-zinc-900">Email</h2>
          <p className="mt-2 text-sm text-zinc-600">Per richieste e informazioni</p>
          <a href={`mailto:${COMPANY.infoEmail}`} className="mt-1 inline-block text-sm font-medium text-primary hover:text-primary-hover">
            {COMPANY.infoEmail}
          </a>
        </div>

        <div className="rounded-lg border border-zinc-200 bg-chalk p-6">
          <h2 className="font-heading text-lg font-semibold text-zinc-900">Sede operativa</h2>
          <p className="mt-2 text-sm text-zinc-600">
            {COMPANY.address}<br />
            {COMPANY.city}
          </p>
        </div>

        <div className="rounded-lg border border-zinc-200 bg-chalk p-6">
          <h2 className="font-heading text-lg font-semibold text-zinc-900">PEC</h2>
          <p className="mt-2 text-sm text-zinc-600">Per comunicazioni certificate</p>
          <a href={`mailto:${COMPANY.pec}`} className="mt-1 inline-block text-sm font-medium text-primary hover:text-primary-hover">
            {COMPANY.pec}
          </a>
        </div>
      </div>

      <p className="mt-10 text-center text-sm text-zinc-400">
        <Link href="/" className="text-primary hover:text-primary-hover">Torna alla home</Link>
      </p>
    </div>
  )
}
