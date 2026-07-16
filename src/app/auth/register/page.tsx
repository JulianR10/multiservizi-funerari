"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { registerCustomer } from "@/app/actions/customer-auth"

const LEGAL_FORMS = [
  { value: "", label: "Seleziona..." },
  { value: "SRL", label: "Società (SRL o SRLS)" },
  { value: "SAS", label: "Società (SAS, SNC)" },
  { value: "COOPERATIVA", label: "Cooperativa" },
  { value: "DITTA_INDIVIDUALE", label: "Ditta Individuale" },
  { value: "ALTRO", label: "Altro" },
]

const BUSINESS_TYPES = [
  { value: "", label: "Seleziona..." },
  { value: "ONORANZE_FUNEBRI", label: "Onoranze Funebri" },
  { value: "COSTRUTTORE", label: "Costruttore/Rivenditore Cofani Funebri" },
  { value: "MARMISTA", label: "Marmista" },
  { value: "FIORISTA", label: "Fiorista" },
  { value: "ALTRO", label: "Altro" },
]

const PROVINCE = [
  "AG", "AL", "AN", "AO", "AP", "AQ", "AR", "AT", "AV", "BA", "BG", "BI", "BL", "BN", "BO",
  "BR", "BS", "BT", "BZ", "CA", "CB", "CE", "CH", "CL", "CN", "CO", "CR", "CS", "CT", "CZ",
  "EN", "FC", "FE", "FG", "FI", "FM", "FR", "GE", "GO", "GR", "IM", "IS", "KR", "LC", "LE",
  "LI", "LO", "LT", "LU", "MB", "MC", "ME", "MI", "MN", "MO", "MS", "MT", "NA", "NO", "NU",
  "OR", "PA", "PC", "PD", "PE", "PG", "PI", "PN", "PO", "PR", "PT", "PU", "PV", "PZ", "RA",
  "RC", "RE", "RG", "RI", "RM", "RN", "RO", "SA", "SI", "SO", "SP", "SR", "SS", "SU", "SV",
  "TA", "TE", "TN", "TO", "TP", "TR", "TS", "TV", "UD", "VA", "VB", "VC", "VE", "VI", "VR",
  "VT", "VV",
]

type FormData = {
  email: string
  confirmEmail: string
  password: string
  confirmPassword: string
  companyName: string
  vatNumber: string
  taxCode: string
  sdiCode: string
  legalForm: string
  businessType: string
  city: string
  province: string
  address: string
  postalCode: string
  phone: string
  notes: string
  privacy: boolean
}

const emptyForm: FormData = {
  email: "",
  confirmEmail: "",
  password: "",
  confirmPassword: "",
  companyName: "",
  vatNumber: "",
  taxCode: "",
  sdiCode: "",
  legalForm: "",
  businessType: "",
  city: "",
  province: "",
  address: "",
  postalCode: "",
  phone: "",
  notes: "",
  privacy: false,
}

export default function RegisterPage() {
  const router = useRouter()
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState<FormData>(emptyForm)

  function set<K extends keyof FormData>(field: K, value: FormData[K]) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.privacy) {
      setError("Devi acconsentire al trattamento dei dati.")
      return
    }
    setPending(true)
    setError(null)

    const result = await registerCustomer(form)

    if (result.success) {
      router.push("/auth/richiesta-inviata")
    } else {
      setError(result.error || "Errore durante la registrazione")
      setPending(false)
    }
  }

  function inputClass(field: keyof FormData) {
    return "mt-1 block w-full rounded-md border border-zinc-300 px-3 py-2 text-sm shadow-sm focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="font-heading text-3xl font-bold text-zinc-900 text-center">Richiesta di registrazione</h1>
      <p className="mt-2 text-center text-sm text-zinc-500">
        Compila il modulo per richiedere l&apos;accesso al listino prezzi.
      </p>

      <form onSubmit={handleSubmit} className="mt-10 space-y-8">
        {/* Accesso */}
        <fieldset className="rounded-lg border border-zinc-200 bg-chalk p-6">
          <legend className="font-heading text-base font-semibold text-zinc-900 px-2">Dati di accesso</legend>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-zinc-700" htmlFor="reg-email">Email *</label>
              <input id="reg-email" type="email" value={form.email} onChange={(e) => set("email", e.target.value)} disabled={pending} autoComplete="email" className={inputClass("email")} />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700" htmlFor="reg-confirm-email">Conferma Email *</label>
              <input id="reg-confirm-email" type="email" value={form.confirmEmail} onChange={(e) => set("confirmEmail", e.target.value)} disabled={pending} className={inputClass("confirmEmail")} />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700" htmlFor="reg-password">Password *</label>
              <input id="reg-password" type="password" value={form.password} onChange={(e) => set("password", e.target.value)} disabled={pending} minLength={8} autoComplete="new-password" className={inputClass("password")} />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700" htmlFor="reg-confirm-password">Conferma Password *</label>
              <input id="reg-confirm-password" type="password" value={form.confirmPassword} onChange={(e) => set("confirmPassword", e.target.value)} disabled={pending} className={inputClass("confirmPassword")} />
            </div>
          </div>
        </fieldset>

        {/* Dati aziendali */}
        <fieldset className="rounded-lg border border-zinc-200 bg-chalk p-6">
          <legend className="font-heading text-base font-semibold text-zinc-900 px-2">Dati aziendali</legend>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-zinc-700" htmlFor="reg-company">Ragione Sociale *</label>
              <input id="reg-company" type="text" value={form.companyName} onChange={(e) => set("companyName", e.target.value)} disabled={pending} className={inputClass("companyName")} />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700" htmlFor="reg-vat">Partita IVA *</label>
              <input id="reg-vat" type="text" value={form.vatNumber} onChange={(e) => set("vatNumber", e.target.value)} disabled={pending} className={inputClass("vatNumber")} />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700" htmlFor="reg-tax-code">
                Codice Fiscale <span className="text-zinc-400">(opzionale)</span>
              </label>
              <input id="reg-tax-code" type="text" value={form.taxCode} onChange={(e) => set("taxCode", e.target.value)} disabled={pending} className={inputClass("taxCode")} />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700" htmlFor="reg-sdi">Codice Destinatario (SDI) *</label>
              <input id="reg-sdi" type="text" value={form.sdiCode} onChange={(e) => set("sdiCode", e.target.value)} disabled={pending} className={inputClass("sdiCode")} />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700" htmlFor="reg-legal-form">Forma Giuridica *</label>
              <select id="reg-legal-form" value={form.legalForm} onChange={(e) => set("legalForm", e.target.value)} disabled={pending} className={inputClass("legalForm")}>
                {LEGAL_FORMS.map((opt) => (<option key={opt.value} value={opt.value}>{opt.label}</option>))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700" htmlFor="reg-business-type">Tipo Attività *</label>
              <select id="reg-business-type" value={form.businessType} onChange={(e) => set("businessType", e.target.value)} disabled={pending} className={inputClass("businessType")}>
                {BUSINESS_TYPES.map((opt) => (<option key={opt.value} value={opt.value}>{opt.label}</option>))}
              </select>
            </div>
          </div>
        </fieldset>

        {/* Sede */}
        <fieldset className="rounded-lg border border-zinc-200 bg-chalk p-6">
          <legend className="font-heading text-base font-semibold text-zinc-900 px-2">Sede</legend>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-zinc-700" htmlFor="reg-province">Provincia *</label>
              <select id="reg-province" value={form.province} onChange={(e) => set("province", e.target.value)} disabled={pending} className={inputClass("province")}>
                <option value="">Seleziona...</option>
                {PROVINCE.map((p) => (<option key={p} value={p}>{p}</option>))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700" htmlFor="reg-city">Città *</label>
              <input id="reg-city" type="text" value={form.city} onChange={(e) => set("city", e.target.value)} disabled={pending} autoComplete="address-level2" className={inputClass("city")} />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-zinc-700" htmlFor="reg-address">Indirizzo *</label>
              <input id="reg-address" type="text" value={form.address} onChange={(e) => set("address", e.target.value)} disabled={pending} autoComplete="address-line1" className={inputClass("address")} />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700" htmlFor="reg-cap">CAP *</label>
              <input id="reg-cap" type="text" inputMode="numeric" maxLength={5} value={form.postalCode} onChange={(e) => set("postalCode", e.target.value.replace(/\D/g, "").slice(0, 5))} disabled={pending} autoComplete="postal-code" className={inputClass("postalCode")} />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700" htmlFor="reg-phone">Telefono *</label>
              <input id="reg-phone" type="tel" value={form.phone} onChange={(e) => set("phone", e.target.value)} disabled={pending} autoComplete="tel" className={inputClass("phone")} />
            </div>
          </div>
        </fieldset>

        {/* Note */}
        <fieldset className="rounded-lg border border-zinc-200 bg-chalk p-6">
          <legend className="font-heading text-base font-semibold text-zinc-900 px-2">Note</legend>
          <div className="mt-4">
            <label className="block text-sm font-medium text-zinc-700" htmlFor="reg-notes">
              Comunicazioni <span className="text-zinc-400">(opzionale)</span>
            </label>
            <textarea id="reg-notes" value={form.notes} onChange={(e) => set("notes", e.target.value)} disabled={pending} rows={3} className="mt-1 block w-full rounded-md border border-zinc-300 px-3 py-2 text-sm shadow-sm focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900" />
          </div>
        </fieldset>

        {/* Privacy */}
        <fieldset className="rounded-lg border border-zinc-200 bg-chalk p-6">
          <legend className="font-heading text-base font-semibold text-zinc-900 px-2">Privacy</legend>
          <div className="mt-4 space-y-3">
            <label className="flex items-start gap-3">
              <input
                type="checkbox"
                checked={form.privacy}
                onChange={(e) => set("privacy", e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-zinc-300 text-primary focus:ring-primary"
              />
              <span className="text-sm text-zinc-700">
                Acconsento al trattamento dei miei dati personali per la registrazione al portale. *
              </span>
            </label>
          </div>
        </fieldset>

        {error && <p className="text-center text-sm text-red-600">{error}</p>}

        <div className="text-center">
          <button
            type="submit"
            disabled={pending}
            className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-zinc-900 px-10 py-3 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50"
          >
            {pending ? "Invio in corso..." : "Invia richiesta"}
          </button>
        </div>
      </form>

      <p className="mt-8 text-center text-sm text-zinc-500">
        Hai già un account?{" "}
        <Link href="/auth/login" className="font-medium text-primary hover:text-primary-hover">
          Accedi
        </Link>
      </p>
    </div>
  )
}
