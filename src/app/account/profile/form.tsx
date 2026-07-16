"use client"

import { useState, useTransition } from "react"
import { toast } from "sonner"
import { updateCompanyProfile, updateContactEmail } from "@/app/actions/customer-profile"

const LEGAL_FORMS: Record<string, string> = {
  SRL: "Società (SRL o SRLS)",
  SAS: "Società (SAS, SNC)",
  COOPERATIVA: "Cooperativa",
  DITTA_INDIVIDUALE: "Ditta Individuale",
  ALTRO: "Altro",
}

const BUSINESS_TYPES: Record<string, string> = {
  ONORANZE_FUNEBRI: "Onoranze Funebri",
  COSTRUTTORE: "Costruttore/Rivenditore Cofani Funebri",
  MARMISTA: "Marmista",
  FIORISTA: "Fiorista",
  ALTRO: "Altro",
}

type ProfileFormProps = {
  user: {
    id: string
    email: string
    companyName: string
    vatNumber: string
    taxCode: string
    sdiCode: string
    legalForm: string
    businessType: string
    phone: string
    city: string
    province: string
    address: string
    postalCode: string
    notes: string
  }
}

export function ProfileForm({ user }: ProfileFormProps) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [email, setEmail] = useState(user.email)
  const [emailChanged, setEmailChanged] = useState(false)

  async function handleSubmit(formData: FormData) {
    setError(null)
    setSuccess(false)
    startTransition(async () => {
      const result = await updateCompanyProfile({
        companyName: String(formData.get("companyName") || ""),
        vatNumber: String(formData.get("vatNumber") || ""),
        taxCode: String(formData.get("taxCode") || ""),
        sdiCode: String(formData.get("sdiCode") || "").toUpperCase(),
        legalForm: String(formData.get("legalForm") || ""),
        businessType: String(formData.get("businessType") || ""),
        phone: String(formData.get("phone") || ""),
        city: String(formData.get("city") || ""),
        province: String(formData.get("province") || "").toUpperCase(),
        address: String(formData.get("address") || ""),
        postalCode: String(formData.get("postalCode") || ""),
        notes: String(formData.get("notes") || ""),
      })

      if (result.success) {
        setSuccess(true)
        toast.success("Dati aggiornati correttamente")
      } else {
        setError(result.error || "Errore durante l'aggiornamento")
        toast.error(result.error || "Errore durante l'aggiornamento")
      }
    })
  }

  async function handleEmailSave() {
    if (!emailChanged || email === user.email) return
    setError(null)
    startTransition(async () => {
      const result = await updateContactEmail(email)
      if (result.success) {
        toast.success("Email aggiornata")
        setEmailChanged(false)
      } else {
        setError(result.error || "Errore")
        toast.error(result.error || "Errore")
      }
    })
  }

  return (
    <form action={handleSubmit} className="space-y-8">
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </div>
      )}
      {success && (
        <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
          Dati salvati correttamente.
        </div>
      )}

      <section className="rounded-lg border border-zinc-200 bg-white p-6">
        <h3 className="text-sm font-semibold text-zinc-900">Email di accesso</h3>
        <p className="mt-1 text-xs text-zinc-500">
          Verrà utilizzata per accedere al portale e per la fatturazione elettronica.
        </p>
        <div className="mt-4 flex flex-wrap items-end gap-3">
          <div className="flex-1 min-w-[240px]">
            <label className="block text-xs font-medium text-zinc-700">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                setEmailChanged(e.target.value !== user.email)
              }}
              className="mt-1 block w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <button
            type="button"
            onClick={handleEmailSave}
            disabled={!emailChanged || isPending}
            className="rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-800 hover:bg-zinc-50 disabled:opacity-50"
          >
            Aggiorna email
          </button>
        </div>
      </section>

      <section className="rounded-lg border border-zinc-200 bg-white p-6">
        <h3 className="text-sm font-semibold text-zinc-900">Anagrafica azienda</h3>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field label="Ragione sociale *" name="companyName" defaultValue={user.companyName} required />
          <Field label="Partita IVA *" name="vatNumber" defaultValue={user.vatNumber} required pattern="[0-9]{11}" maxLength={11} />
          <Field label="Codice fiscale" name="taxCode" defaultValue={user.taxCode} maxLength={16} />
          <Field
            label="Codice destinatario (SDI)"
            name="sdiCode"
            defaultValue={user.sdiCode}
            maxLength={7}
            placeholder="ABC1234"
          />
          <SelectField
            label="Forma giuridica"
            name="legalForm"
            defaultValue={user.legalForm}
            options={LEGAL_FORMS}
            placeholder="—"
          />
          <SelectField
            label="Tipo attività"
            name="businessType"
            defaultValue={user.businessType}
            options={BUSINESS_TYPES}
            placeholder="—"
          />
          <Field label="Telefono *" name="phone" defaultValue={user.phone} required type="tel" />
        </div>
      </section>

      <section className="rounded-lg border border-zinc-200 bg-white p-6">
        <h3 className="text-sm font-semibold text-zinc-900">Sede legale</h3>
        <div className="mt-4 grid gap-4 sm:grid-cols-6">
          <div className="sm:col-span-6">
            <Field label="Indirizzo *" name="address" defaultValue={user.address} required />
          </div>
          <div className="sm:col-span-3">
            <Field label="Città *" name="city" defaultValue={user.city} required />
          </div>
          <div className="sm:col-span-1">
            <Field
              label="Prov."
              name="province"
              defaultValue={user.province}
              maxLength={2}
              placeholder="CZ"
            />
          </div>
          <div className="sm:col-span-2">
            <Field
              label="CAP *"
              name="postalCode"
              defaultValue={user.postalCode}
              required
              maxLength={10}
              pattern="[0-9]{5}"
            />
          </div>
        </div>
      </section>

      <section className="rounded-lg border border-zinc-200 bg-white p-6">
        <h3 className="text-sm font-semibold text-zinc-900">Note interne</h3>
        <p className="mt-1 text-xs text-zinc-500">
          Eventuali note o richieste particolari visibili all&apos;amministratore.
        </p>
        <textarea
          name="notes"
          defaultValue={user.notes}
          rows={3}
          maxLength={1000}
          className="mt-3 block w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        />
      </section>

      <div className="flex items-center justify-end gap-3">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-chalk hover:bg-primary-hover disabled:opacity-50"
        >
          {isPending ? "Salvataggio…" : "Salva modifiche"}
        </button>
      </div>
    </form>
  )
}

function Field({
  label,
  name,
  defaultValue,
  required,
  type = "text",
  maxLength,
  pattern,
  placeholder,
}: {
  label: string
  name: string
  defaultValue?: string
  required?: boolean
  type?: string
  maxLength?: number
  pattern?: string
  placeholder?: string
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-zinc-700">{label}</label>
      <input
        type={type}
        name={name}
        defaultValue={defaultValue}
        required={required}
        maxLength={maxLength}
        pattern={pattern}
        placeholder={placeholder}
        className="mt-1 block w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
      />
    </div>
  )
}

function SelectField({
  label,
  name,
  defaultValue,
  options,
  placeholder,
}: {
  label: string
  name: string
  defaultValue?: string
  options: Record<string, string>
  placeholder?: string
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-zinc-700">{label}</label>
      <select
        name={name}
        defaultValue={defaultValue || ""}
        className="mt-1 block w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
      >
        {placeholder && <option value="">{placeholder}</option>}
        {Object.entries(options).map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>
    </div>
  )
}
