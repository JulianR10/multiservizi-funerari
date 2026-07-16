"use client"

import { PROVINCE } from "@/lib/province"

export type AddressData = {
  firstName: string
  lastName: string
  company: string
  address: string
  address2: string
  city: string
  province: string
  postalCode: string
  phone: string
}

export const EMPTY_ADDRESS: AddressData = {
  firstName: "",
  lastName: "",
  company: "",
  address: "",
  address2: "",
  city: "",
  province: "",
  postalCode: "",
  phone: "",
}

type Props = {
  address: AddressData
  onChange: (field: keyof AddressData, value: string) => void
  onBlur?: (field: keyof AddressData) => void
  errors?: Partial<Record<keyof AddressData | "email", string>>
  touched?: Set<string>
  disabled?: boolean
  prefix: string
  showPhone?: boolean
}

export function AddressForm({ address, onChange, onBlur, errors, touched, disabled, prefix, showPhone }: Props) {
  function inputClass(field: keyof AddressData) {
    const hasError = touched?.has(field) && errors?.[field]
    return `mt-1 block w-full rounded-md border px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 ${
      hasError
        ? "border-red-400 focus:border-red-500 focus:ring-red-500"
        : "border-zinc-300 focus:border-zinc-900 focus:ring-zinc-900"
    }`
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div>
        <label className="block text-sm font-medium text-zinc-700" htmlFor={`${prefix}-firstName`}>Nome *</label>
        <input
          id={`${prefix}-firstName`}
          type="text"
          value={address.firstName}
          onChange={(e) => onChange("firstName", e.target.value)}
          onBlur={() => onBlur?.("firstName")}
          disabled={disabled}
          autoComplete={`${prefix} given-name`}
          aria-describedby={errors?.firstName && touched?.has("firstName") ? `${prefix}-error-firstName` : undefined}
          aria-invalid={errors?.firstName && touched?.has("firstName") ? "true" : undefined}
          className={inputClass("firstName")}
        />
        {touched?.has("firstName") && errors?.firstName && (
          <p id={`${prefix}-error-firstName`} className="mt-1 text-xs text-red-500">{errors.firstName}</p>
        )}
      </div>
      <div>
        <label className="block text-sm font-medium text-zinc-700" htmlFor={`${prefix}-lastName`}>Cognome *</label>
        <input
          id={`${prefix}-lastName`}
          type="text"
          value={address.lastName}
          onChange={(e) => onChange("lastName", e.target.value)}
          onBlur={() => onBlur?.("lastName")}
          disabled={disabled}
          autoComplete={`${prefix} family-name`}
          aria-describedby={errors?.lastName && touched?.has("lastName") ? `${prefix}-error-lastName` : undefined}
          aria-invalid={errors?.lastName && touched?.has("lastName") ? "true" : undefined}
          className={inputClass("lastName")}
        />
        {touched?.has("lastName") && errors?.lastName && (
          <p id={`${prefix}-error-lastName`} className="mt-1 text-xs text-red-500">{errors.lastName}</p>
        )}
      </div>
      <div className="sm:col-span-2">
        <label className="block text-sm font-medium text-zinc-700" htmlFor={`${prefix}-company`}>
          Azienda <span className="text-zinc-400">(opzionale)</span>
        </label>
        <input
          id={`${prefix}-company`}
          type="text"
          value={address.company}
          onChange={(e) => onChange("company", e.target.value)}
          disabled={disabled}
          autoComplete={`${prefix} organization`}
          className="mt-1 block w-full rounded-md border border-zinc-300 px-3 py-2 text-sm shadow-sm focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
        />
      </div>
      <div className="sm:col-span-2">
        <label className="block text-sm font-medium text-zinc-700" htmlFor={`${prefix}-address`}>Indirizzo *</label>
        <input
          id={`${prefix}-address`}
          type="text"
          value={address.address}
          onChange={(e) => onChange("address", e.target.value)}
          onBlur={() => onBlur?.("address")}
          disabled={disabled}
          placeholder="Via, Piazza, etc."
          autoComplete={`${prefix} address-line1`}
          aria-describedby={errors?.address && touched?.has("address") ? `${prefix}-error-address` : undefined}
          aria-invalid={errors?.address && touched?.has("address") ? "true" : undefined}
          className={inputClass("address")}
        />
        {touched?.has("address") && errors?.address && (
          <p id={`${prefix}-error-address`} className="mt-1 text-xs text-red-500">{errors.address}</p>
        )}
      </div>
      <div className="sm:col-span-2">
        <label className="block text-sm font-medium text-zinc-700" htmlFor={`${prefix}-address2`}>
          Altro <span className="text-zinc-400">(opzionale)</span>
        </label>
        <input
          id={`${prefix}-address2`}
          type="text"
          value={address.address2}
          onChange={(e) => onChange("address2", e.target.value)}
          disabled={disabled}
          placeholder="Scala, interno, etc."
          autoComplete={`${prefix} address-line2`}
          className="mt-1 block w-full rounded-md border border-zinc-300 px-3 py-2 text-sm shadow-sm focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-zinc-700" htmlFor={`${prefix}-city`}>Città *</label>
        <input
          id={`${prefix}-city`}
          type="text"
          value={address.city}
          onChange={(e) => onChange("city", e.target.value)}
          onBlur={() => onBlur?.("city")}
          disabled={disabled}
          autoComplete={`${prefix} address-level2`}
          aria-describedby={errors?.city && touched?.has("city") ? `${prefix}-error-city` : undefined}
          aria-invalid={errors?.city && touched?.has("city") ? "true" : undefined}
          className={inputClass("city")}
        />
        {touched?.has("city") && errors?.city && (
          <p id={`${prefix}-error-city`} className="mt-1 text-xs text-red-500">{errors.city}</p>
        )}
      </div>
      <div>
        <label className="block text-sm font-medium text-zinc-700" htmlFor={`${prefix}-province`}>Provincia</label>
        <select
          id={`${prefix}-province`}
          value={address.province}
          onChange={(e) => onChange("province", e.target.value)}
          disabled={disabled}
          autoComplete={`${prefix} address-level1`}
          className="mt-1 block w-full rounded-md border border-zinc-300 px-3 py-2 text-sm shadow-sm focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
        >
          <option value="">Seleziona provincia</option>
          {PROVINCE.map((p) => (<option key={p} value={p}>{p}</option>))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-zinc-700" htmlFor={`${prefix}-postalCode`}>CAP *</label>
        <input
          id={`${prefix}-postalCode`}
          type="text"
          inputMode="numeric"
          maxLength={5}
          value={address.postalCode}
          onChange={(e) => {
            const val = e.target.value.replace(/\D/g, "").slice(0, 5)
            onChange("postalCode", val)
          }}
          onBlur={() => onBlur?.("postalCode")}
          disabled={disabled}
          placeholder="87010"
          autoComplete={`${prefix} postal-code`}
          aria-describedby={errors?.postalCode && touched?.has("postalCode") ? `${prefix}-error-postalCode` : undefined}
          aria-invalid={errors?.postalCode && touched?.has("postalCode") ? "true" : undefined}
          className={inputClass("postalCode")}
        />
        {touched?.has("postalCode") && errors?.postalCode && (
          <p id={`${prefix}-error-postalCode`} className="mt-1 text-xs text-red-500">{errors.postalCode}</p>
        )}
      </div>
      {showPhone && (
        <div>
          <label className="block text-sm font-medium text-zinc-700" htmlFor={`${prefix}-phone`}>
            Telefono <span className="text-zinc-400">(opzionale)</span>
          </label>
          <input
            id={`${prefix}-phone`}
            type="tel"
            value={address.phone}
            onChange={(e) => onChange("phone", e.target.value)}
            disabled={disabled}
            placeholder="+39 3XX XXX XXXX"
            autoComplete={`${prefix} tel`}
            className="mt-1 block w-full rounded-md border border-zinc-300 px-3 py-2 text-sm shadow-sm focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
          />
        </div>
      )}
    </div>
  )
}
