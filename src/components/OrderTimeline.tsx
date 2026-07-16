const STEPS = ["confirmed", "shipped", "delivered"] as const

const STEP_LABELS: Record<string, { label: string; description: string }> = {
  confirmed: { label: "Confermato", description: "Pagamento ricevuto, ordine in elaborazione" },
  shipped: { label: "Spedito", description: "Il tuo ordine è in viaggio" },
  delivered: { label: "Consegnato", description: "Ordine consegnato con successo" },
}

export function OrderTimeline({ currentStatus }: { currentStatus: string }) {
  const currentIndex = STEPS.indexOf(currentStatus as typeof STEPS[number])

  if (currentStatus === "cancelled") {
    return (
      <div className="rounded-md bg-red-50 p-4 text-sm text-red-700">
        Ordine annullato
      </div>
    )
  }

  if (currentIndex === -1) return null

  return (
    <div className="py-4" role="list" aria-label="Stato dell'ordine">
      <ol className="relative ml-3 border-l border-zinc-200">
        {STEPS.map((step, i) => {
          const isActive = i <= currentIndex
          const isLast = i === STEPS.length - 1

          return (
            <li key={step} className={`relative ${isLast ? "" : "pb-8"}`} role="listitem">
              <div
                className={`absolute -left-[19px] h-4 w-4 rounded-full border-2 ${
                  isActive
                    ? "border-primary bg-primary"
                    : "border-zinc-300 bg-chalk"
                }`}
                aria-hidden="true"
              />
              <div className="ml-8">
                <p
                  className={`text-sm font-medium ${
                    isActive ? "text-zinc-900" : "text-zinc-400"
                  }`}
                  aria-current={isActive && i === currentIndex ? "step" : undefined}
                >
                  {STEP_LABELS[step].label}
                </p>
                <p
                  className={`text-xs ${
                    isActive ? "text-zinc-500" : "text-zinc-300"
                  }`}
                >
                  {STEP_LABELS[step].description}
                </p>
              </div>
            </li>
          )
        })}
      </ol>
    </div>
  )
}
