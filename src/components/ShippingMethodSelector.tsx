"use client"

import { formatPrice } from "@/lib/format"

type ShippingMethod = {
  id: string
  name: string
  slug: string
  description: string | null
  price: number
  estimatedDaysMin: number | null
  estimatedDaysMax: number | null
}

export function ShippingMethodSelector({
  methods,
  selectedId,
  onChange,
  subtotal,
  freeShippingThreshold,
}: {
  methods: ShippingMethod[]
  selectedId: string | null
  onChange: (id: string) => void
  subtotal: number
  freeShippingThreshold: number
}) {
  const qualifiesForFree = freeShippingThreshold > 0 && subtotal >= freeShippingThreshold

  if (qualifiesForFree) {
    return (
      <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 sm:p-6">
        <div className="flex items-center gap-3">
          <svg className="h-5 w-5 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          <div>
            <p className="text-sm font-medium text-primary">Spedizione gratuita</p>
            <p className="text-xs text-zinc-500">
              Hai raggiunto la soglia minima di {formatPrice(freeShippingThreshold)} per la spedizione gratuita.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-zinc-200 bg-chalk p-4 sm:p-6">
      <h2 className="font-heading text-base font-semibold text-zinc-900">Metodo di spedizione</h2>
      {freeShippingThreshold > 0 && (
        <p className="mt-2 text-xs text-zinc-500">
          Aggiungi {formatPrice(freeShippingThreshold - subtotal)} per la spedizione gratuita.
        </p>
      )}
      <div className="mt-3 space-y-3">
        {methods.length === 0 ? (
          <p className="text-sm text-amber-600">
            Impossibile caricare i metodi di spedizione. Si prega di ricaricare la pagina.
          </p>
        ) : (
          methods.map((method) => (
            <label
              key={method.id}
              className={`flex cursor-pointer items-center gap-4 rounded-lg border p-4 transition ${
                selectedId === method.id
                  ? "border-primary bg-primary/5"
                  : "border-zinc-200 hover:border-zinc-300"
              }`}
            >
              <input
                type="radio"
                name="shippingMethod"
                value={method.id}
                checked={selectedId === method.id}
                onChange={() => onChange(method.id)}
                className="h-4 w-4 border-zinc-300 text-primary focus:ring-primary"
              />
              <div className="flex-1">
                <p className="text-sm font-medium text-zinc-900">{method.name}</p>
                {method.description && (
                  <p className="text-xs text-zinc-500">{method.description}</p>
                )}
              </div>
              <span className="text-sm font-medium text-zinc-900">
                {method.price > 0 ? formatPrice(method.price) : "Gratuito"}
              </span>
            </label>
          ))
        )}
      </div>
    </div>
  )
}
