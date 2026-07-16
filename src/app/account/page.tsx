import { redirect } from "next/navigation"
import Link from "next/link"
import { getCustomerSession } from "@/lib/customer-auth"
import { prisma } from "@/lib/prisma"
import { formatPrice } from "@/lib/format"
import { STATUS_LABELS, STATUS_COLORS } from "@/lib/order-status"
import { LogoutButton } from "./logout-button"

export default async function AccountPage() {
  const session = await getCustomerSession()
  if (!session) {
    redirect("/auth/login")
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { name: true, email: true, status: true },
  })

  if (user?.status === "PENDING") {
    return (
      <div className="mx-auto max-w-lg px-4 py-24 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-100">
          <svg className="h-8 w-8 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h1 className="mt-6 font-heading text-2xl font-bold text-zinc-900">
          Richiesta in attesa
        </h1>
        <p className="mt-3 text-sm text-zinc-500 leading-relaxed">
          La tua richiesta di registrazione è stata ricevuta ed è in attesa di approvazione
          da parte dell&apos;amministratore. Riceverai una email non appena il tuo account sarà attivato.
        </p>
      </div>
    )
  }

  if (user?.status === "REJECTED") {
    return (
      <div className="mx-auto max-w-lg px-4 py-24 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
          <svg className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
        </div>
        <h1 className="mt-6 font-heading text-2xl font-bold text-zinc-900">
          Richiesta non approvata
        </h1>
        <p className="mt-3 text-sm text-zinc-500 leading-relaxed">
          La tua richiesta di registrazione non è stata approvata.
          Per maggiori informazioni, contatta l&apos;amministratore.
        </p>
      </div>
    )
  }

  const orders = await prisma.order.findMany({
    where: { userId: session.userId },
    include: {
      items: { select: { name: true, quantity: true, price: true } },
    },
    orderBy: { createdAt: "desc" },
  })

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900">Il mio account</h1>
          <p className="mt-1 text-sm text-zinc-500">
            {user?.name || user?.email}
          </p>
        </div>
        <LogoutButton />
      </div>

      <div className="mt-8">
        <h2 className="font-heading text-xl font-semibold text-zinc-900">I miei ordini</h2>

        {orders.length === 0 ? (
          <div className="mt-6 rounded-lg border border-zinc-200 bg-chalk p-8 text-center">
            <p className="text-zinc-500">Non hai ancora effettuato ordini.</p>
            <Link
              href="/prodotti"
              className="mt-4 inline-block rounded-full bg-zinc-900 px-6 py-2 text-sm font-medium text-white hover:bg-zinc-800"
            >
              Sfoglia il catalogo
            </Link>
          </div>
        ) : (
          <div className="mt-4 space-y-4">
            {orders.map((order) => (
              <div
                key={order.id}
                className="rounded-lg border border-zinc-200 bg-chalk p-6"
              >
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="text-sm font-semibold text-zinc-900">
                        {order.invoiceNumber || `#${order.id.slice(0, 8)}`}
                      </span>
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          STATUS_COLORS[order.status] || "bg-zinc-100 text-zinc-600"
                        }`}
                      >
                        {STATUS_LABELS[order.status] || order.status}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-zinc-400">
                      {new Date(order.createdAt).toLocaleDateString("it-IT", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  <span className="text-sm font-medium text-zinc-900">
                    {formatPrice(order.total)}
                  </span>
                </div>

                <ul className="mt-3 divide-y divide-zinc-100 text-sm">
                  {order.items.map((item, i) => (
                    <li key={i} className="flex justify-between py-2">
                      <span className="text-zinc-600">
                        {item.name} × {item.quantity}
                      </span>
                      <span className="text-zinc-900">{formatPrice(item.price * item.quantity)}</span>
                    </li>
                  ))}
                </ul>

                {order.trackingNumber && (
                  <div className="mt-3 text-sm text-zinc-600">
                    Tracking:{" "}
                    {order.trackingUrl ? (
                      <a
                        href={order.trackingUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium text-primary hover:text-primary-hover"
                      >
                        {order.trackingNumber}
                      </a>
                    ) : (
                      <span className="font-medium">{order.trackingNumber}</span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
