"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { useHydratedCart } from "@/hooks/useCart"
import { OrderSummary } from "@/components/OrderSummary"
import { AddressForm, type AddressData } from "@/components/AddressForm"
import { ShippingMethodSelector } from "@/components/ShippingMethodSelector"
import { FREE_SHIPPING_THRESHOLD, qualifiesForFreeShipping } from "@/lib/shipping"

type CustomerSession = {
  userId: string
  email: string
  name: string | null
}

type ShippingMethod = {
  id: string
  name: string
  slug: string
  description: string | null
  price: number
  estimatedDaysMin: number | null
  estimatedDaysMax: number | null
}

type FieldErrors = Partial<Record<keyof AddressData | "email", string>>

const emptyAddress: AddressData = {
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

function validateForm(email: string, address: AddressData, billing?: AddressData): FieldErrors {
  const errors: FieldErrors = {}

  if (!email.trim()) {
    errors.email = "Inserisci un indirizzo email."
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
    errors.email = "Inserisci un indirizzo email valido."
  }

  function validateAddr(prefix: string, addr: AddressData) {
    if (!addr.firstName.trim()) errors[`${prefix}_firstName` as keyof FieldErrors] = "Campo obbligatorio."
    if (!addr.lastName.trim()) errors[`${prefix}_lastName` as keyof FieldErrors] = "Campo obbligatorio."
    if (!addr.address.trim()) errors[`${prefix}_address` as keyof FieldErrors] = "Campo obbligatorio."
    if (!addr.city.trim()) errors[`${prefix}_city` as keyof FieldErrors] = "Campo obbligatorio."
    if (!addr.province) errors[`${prefix}_province` as keyof FieldErrors] = "Seleziona una provincia."
    if (!addr.postalCode.trim()) {
      errors[`${prefix}_postalCode` as keyof FieldErrors] = "Campo obbligatorio."
    } else if (!/^\d{5}$/.test(addr.postalCode.trim())) {
      errors[`${prefix}_postalCode` as keyof FieldErrors] = "Il CAP deve essere di 5 cifre."
    }
  }

  validateAddr("shipping", address)
  if (billing) validateAddr("billing", billing)

  return errors
}

export function CheckoutButton() {
  const { items, totalPrice, hydrated } = useHydratedCart()
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [guestEmail, setGuestEmail] = useState("")
  const [confirmEmail, setConfirmEmail] = useState("")
  const [address, setAddress] = useState<AddressData>(emptyAddress)
  const [billingSame, setBillingSame] = useState(true)
  const [billingAddress, setBillingAddress] = useState<AddressData>(emptyAddress)
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [touched, setTouched] = useState<Set<string>>(new Set())
  const [billingErrors, setBillingErrors] = useState<FieldErrors>({})
  const [billingTouched, setBillingTouched] = useState<Set<string>>(new Set())
  const [shippingMethods, setShippingMethods] = useState<ShippingMethod[]>([])
  const [shippingError, setShippingError] = useState(false)
  const [selectedMethodId, setSelectedMethodId] = useState<string | null>(null)
  const [customerSession, setCustomerSession] = useState<CustomerSession | null>(null)
  const csrfToken = useRef<string | null>(null)

  if (hydrated && items.length === 0) {
    return (
      <div className="mt-12 text-center">
        <p className="text-zinc-500">Carrello vuoto</p>
        <Link
          href="/prodotti"
          className="mt-4 inline-block rounded-full bg-primary px-6 py-2.5 text-sm font-medium text-white hover:bg-primary-hover"
        >
          Visualizza i prodotti
        </Link>
      </div>
    )
  }

  useEffect(() => {
    fetch("/api/csrf").then((r) => r.json()).then((d) => { csrfToken.current = d.token }).catch(() => {})

    fetch("/api/customer/session")
      .then((res) => res.json())
      .then((data) => {
        if (data.session) {
          setCustomerSession(data.session)
          if (data.session.email) setGuestEmail(data.session.email)
          if (data.address) {
            setAddress((prev) => ({
              ...prev,
              ...data.address,
            }))
          }
        }
      })
      .catch(() => {})

    fetch("/api/shipping-methods")
      .then((res) => res.json())
      .then((methods: ShippingMethod[]) => {
        setShippingMethods(methods)
        if (methods.length > 0) setSelectedMethodId(methods[0].id)
      })
      .catch(() => setShippingError(true))
  }, [])

  const subtotal = hydrated ? totalPrice() : 0
  const qualifiesForFree = qualifiesForFreeShipping(subtotal)
  const selectedMethod = shippingMethods.find((m) => m.id === selectedMethodId)
  const shippingCost = qualifiesForFree ? 0 : (selectedMethod?.price ?? 0)

  function updateAddress(field: keyof AddressData, value: string) {
    setAddress((prev) => ({ ...prev, [field]: value }))
    if (touched.has(field)) {
      const newErrors = validateForm(guestEmail, { ...address, [field]: value })
      setFieldErrors((prev) => {
        const next = { ...prev }
        if (newErrors[field]) next[field] = newErrors[field]
        else delete next[field]
        return next
      })
    }
  }

  function handleBlur(field: keyof AddressData | "email") {
    setTouched((prev) => new Set(prev).add(field))
    if (field === "email") {
      if (!guestEmail.trim()) {
        setFieldErrors((prev) => ({ ...prev, email: "Inserisci un indirizzo email." }))
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(guestEmail)) {
        setFieldErrors((prev) => ({ ...prev, email: "Inserisci un indirizzo email valido." }))
      } else {
        setFieldErrors((prev) => { const next = { ...prev }; delete next.email; return next })
      }
      return
    }
    const newErrors = validateForm(guestEmail, address)
    setFieldErrors((prev) => {
      const next = { ...prev }
      if (newErrors[field]) next[field] = newErrors[field]
      else delete next[field]
      return next
    })
  }

  function updateBillingAddress(field: keyof AddressData, value: string) {
    setBillingAddress((prev) => ({ ...prev, [field]: value }))
  }

  function handleBillingBlur(field: keyof AddressData) {
    setBillingTouched((prev) => new Set(prev).add(field))
    const newErrors = validateForm(guestEmail, billingAddress)
    delete newErrors.email
    setBillingErrors((prev) => {
      const next = { ...prev }
      if (newErrors[field]) next[field] = newErrors[field]
      else delete next[field]
      return next
    })
  }

  async function handleCheckout(e: React.FormEvent) {
    e.preventDefault()

    const errors = validateForm(guestEmail, address)
    if (guestEmail !== confirmEmail) errors.email = "Le email non coincidono."
    setFieldErrors(errors)
    setTouched(new Set(["email", "confirmEmail", "firstName", "lastName", "address", "city", "postalCode"]))

    if (!billingSame) {
      const bErrors = validateForm(guestEmail, billingAddress)
      delete bErrors.email
      setBillingErrors(bErrors)
      setBillingTouched(new Set(["firstName", "lastName", "address", "city", "postalCode"]))
      Object.assign(errors, Object.fromEntries(Object.entries(bErrors).map(([k, v]) => [`billing_${k}`, v])))
    }

    if (Object.keys(errors).length > 0) return

    setPending(true)
    setError(null)

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-csrf-token": csrfToken.current || "" },
        body: JSON.stringify({
          items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
          email: guestEmail.trim(),
          address,
          billingAddress: billingSame ? address : billingAddress,
          shippingMethodId: selectedMethodId,
          userId: customerSession?.userId || null,
        }),
      })
      const data = await res.json()

      if (data.url) {
        window.location.href = data.url
      } else {
        setError(data.error || "Errore durante il checkout")
      }
    } catch {
      setError("Errore di connessione. Riprova.")
    } finally {
      setPending(false)
    }
  }

  function inputClass(field: string) {
    const hasError = touched.has(field) && fieldErrors[field as keyof FieldErrors]
    return `mt-1 block w-full rounded-md border px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 ${
      hasError
        ? "border-red-400 focus:border-red-500 focus:ring-red-500"
        : "border-zinc-300 focus:border-zinc-900 focus:ring-zinc-900"
    }`
  }

  return (
    <form onSubmit={handleCheckout} className="space-y-6">
      <OrderSummary items={items} subtotal={subtotal} shippingCost={shippingCost} />

      <ShippingMethodSelector
        methods={shippingError ? [] : shippingMethods}
        selectedId={selectedMethodId}
        onChange={setSelectedMethodId}
        subtotal={subtotal}
        freeShippingThreshold={FREE_SHIPPING_THRESHOLD}
      />

      <div>
        <label htmlFor="guest-email" className="block text-sm font-medium text-zinc-700">
          Email per conferma ordine *
        </label>
        <input
          id="guest-email"
          type="email"
          value={guestEmail}
          onChange={(e) => { setGuestEmail(e.target.value); if (touched.has("email")) handleBlur("email") }}
          onBlur={() => handleBlur("email")}
          placeholder="tua@email.com"
          disabled={pending}
          className={inputClass("email")}
          aria-describedby={fieldErrors.email ? "error-email" : undefined}
          aria-invalid={fieldErrors.email ? "true" : undefined}
          autoComplete="email"
        />
        {touched.has("email") && fieldErrors.email && (
          <p id="error-email" className="mt-1 text-xs text-red-500">{fieldErrors.email}</p>
        )}
      </div>

      <div>
        <label htmlFor="confirm-email" className="block text-sm font-medium text-zinc-700">
          Conferma email *
        </label>
        <input
          id="confirm-email"
          type="email"
          value={confirmEmail}
          onChange={(e) => setConfirmEmail(e.target.value)}
          onBlur={() => setTouched((prev) => new Set(prev).add("confirmEmail"))}
          placeholder="tua@email.com"
          disabled={pending}
          className={guestEmail !== confirmEmail && confirmEmail ? "mt-1 block w-full rounded-md border border-red-400 px-3 py-2 text-sm shadow-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500" : "mt-1 block w-full rounded-md border border-zinc-300 px-3 py-2 text-sm shadow-sm focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"}
        />
        {touched.has("confirmEmail") && confirmEmail && guestEmail !== confirmEmail && (
          <p id="error-confirmEmail" className="mt-1 text-xs text-red-500">Le email non coincidono.</p>
        )}
      </div>

      <div className="rounded-lg border border-zinc-200 bg-chalk p-4 sm:p-6">
        <h2 className="font-heading text-lg font-semibold text-zinc-900">Indirizzo di spedizione</h2>
        <p className="mt-1 text-sm text-zinc-500">I campi contrassegnati con * sono obbligatori.</p>
        <div className="mt-4">
          <AddressForm
            prefix="shipping"
            address={address}
            onChange={updateAddress}
            onBlur={handleBlur}
            errors={fieldErrors}
            touched={touched}
            disabled={pending}
            showPhone
          />
        </div>
      </div>

      <div className="rounded-lg border border-zinc-200 bg-chalk p-4 sm:p-6">
        <h2 className="font-heading text-lg font-semibold text-zinc-900">Indirizzo di fatturazione</h2>
        <label className="mt-3 flex items-center gap-3">
          <input
            type="checkbox"
            checked={billingSame}
            onChange={(e) => setBillingSame(e.target.checked)}
            className="h-4 w-4 rounded border-zinc-300 text-primary focus:ring-primary"
          />
          <span className="text-sm text-zinc-700">Stesso indirizzo di spedizione</span>
        </label>
        {!billingSame && (
          <div className="mt-4">
            <AddressForm
              prefix="billing"
              address={billingAddress}
              onChange={updateBillingAddress}
              onBlur={handleBillingBlur}
              errors={billingErrors}
              touched={billingTouched}
              disabled={pending}
            />
          </div>
        )}
      </div>

      <div className="text-center">
        <button
          type="submit"
          disabled={pending || items.length === 0}
          className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-zinc-900 px-8 py-3 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50"
        >
          {pending ? (
            <>
              <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
              </svg>
              Reindirizzamento a Stripe...
            </>
          ) : (
            "Vai al pagamento"
          )}
        </button>
      </div>

      <p className="flex items-center justify-center gap-2 text-xs text-zinc-400">
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
        </svg>
        Pagamento sicuro con Stripe &mdash; i tuoi dati sono al sicuro.
      </p>

      {error && <p className="text-center text-sm text-red-600">{error}</p>}
    </form>
  )
}
