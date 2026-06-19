"use client"

import { useState } from "react"
import { useCart } from "@/hooks/useCart"

type AddressData = {
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

export function CheckoutButton() {
  const { items } = useCart()
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [guestEmail, setGuestEmail] = useState("")
  const [address, setAddress] = useState<AddressData>(emptyAddress)

  function updateAddress(field: keyof AddressData, value: string) {
    setAddress((prev) => ({ ...prev, [field]: value }))
  }

  function isAddressValid() {
    return (
      address.firstName.trim() &&
      address.lastName.trim() &&
      address.address.trim() &&
      address.city.trim() &&
      address.postalCode.trim()
    )
  }

  async function handleCheckout() {
    if (!guestEmail.trim()) {
      setError("Inserisci un indirizzo email per ricevere la conferma dell'ordine.")
      return
    }

    if (!isAddressValid()) {
      setError("Compila tutti i campi obbligatori dell'indirizzo di spedizione.")
      return
    }

    setPending(true)
    setError(null)

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
          email: guestEmail.trim(),
          address,
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

  return (
    <div className="space-y-6">
      <div>
          <label htmlFor="guest-email" className="block text-sm font-medium text-zinc-700">
            Email per conferma ordine
          </label>
          <input
            id="guest-email"
            type="email"
            value={guestEmail}
            onChange={(e) => setGuestEmail(e.target.value)}
            placeholder="tua@email.com"
            className="mt-1 block w-full rounded-md border border-zinc-300 px-3 py-2 text-sm shadow-sm focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
          />
        </div>

      <div className="rounded-lg border border-zinc-200 bg-chalk p-6">
        <h2 className="font-heading text-lg font-semibold text-zinc-900">Indirizzo di spedizione</h2>
        <p className="mt-1 text-sm text-zinc-500">I campi contrassegnati con * sono obbligatori.</p>

        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-zinc-700">
              Nome *
            </label>
            <input
              type="text"
              value={address.firstName}
              onChange={(e) => updateAddress("firstName", e.target.value)}
              className="mt-1 block w-full rounded-md border border-zinc-300 px-3 py-2 text-sm shadow-sm focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700">
              Cognome *
            </label>
            <input
              type="text"
              value={address.lastName}
              onChange={(e) => updateAddress("lastName", e.target.value)}
              className="mt-1 block w-full rounded-md border border-zinc-300 px-3 py-2 text-sm shadow-sm focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-zinc-700">
              Azienda <span className="text-zinc-400">(opzionale)</span>
            </label>
            <input
              type="text"
              value={address.company}
              onChange={(e) => updateAddress("company", e.target.value)}
              className="mt-1 block w-full rounded-md border border-zinc-300 px-3 py-2 text-sm shadow-sm focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-zinc-700">
              Indirizzo *
            </label>
            <input
              type="text"
              value={address.address}
              onChange={(e) => updateAddress("address", e.target.value)}
              placeholder="Via, Piazza, etc."
              className="mt-1 block w-full rounded-md border border-zinc-300 px-3 py-2 text-sm shadow-sm focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-zinc-700">
              Altro <span className="text-zinc-400">(opzionale)</span>
            </label>
            <input
              type="text"
              value={address.address2}
              onChange={(e) => updateAddress("address2", e.target.value)}
              placeholder="Scala, interno, etc."
              className="mt-1 block w-full rounded-md border border-zinc-300 px-3 py-2 text-sm shadow-sm focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700">
              Città *
            </label>
            <input
              type="text"
              value={address.city}
              onChange={(e) => updateAddress("city", e.target.value)}
              className="mt-1 block w-full rounded-md border border-zinc-300 px-3 py-2 text-sm shadow-sm focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700">
              Provincia <span className="text-zinc-400">(opzionale)</span>
            </label>
            <input
              type="text"
              value={address.province}
              onChange={(e) => updateAddress("province", e.target.value)}
              className="mt-1 block w-full rounded-md border border-zinc-300 px-3 py-2 text-sm shadow-sm focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700">
              CAP *
            </label>
            <input
              type="text"
              value={address.postalCode}
              onChange={(e) => updateAddress("postalCode", e.target.value)}
              className="mt-1 block w-full rounded-md border border-zinc-300 px-3 py-2 text-sm shadow-sm focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700">
              Telefono <span className="text-zinc-400">(opzionale)</span>
            </label>
            <input
              type="tel"
              value={address.phone}
              onChange={(e) => updateAddress("phone", e.target.value)}
              placeholder="+39 3XX XXX XXXX"
              className="mt-1 block w-full rounded-md border border-zinc-300 px-3 py-2 text-sm shadow-sm focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-center">
        <button
          onClick={handleCheckout}
          disabled={pending || items.length === 0}
          className="w-fit rounded-full bg-zinc-900 px-6 py-3 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50"
        >
          {pending ? "Reindirizzamento a Stripe..." : "Vai al pagamento"}
        </button>
      </div>

      {error && <p className="text-sm text-red-600 text-center">{error}</p>}
    </div>
  )
}
