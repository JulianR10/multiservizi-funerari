import Link from "next/link"
import { notFound } from "next/navigation"
import { getCustomerSession } from "@/lib/customer-auth"
import { prisma } from "@/lib/prisma"
import { formatPrice } from "@/lib/format"
import { STATUS_LABELS, STATUS_COLORS } from "@/lib/order-status"
import { ReorderButton } from "./reorder-button"

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const session = await getCustomerSession()
  if (!session) {
    return null
  }

  const order = await prisma.order.findFirst({
    where: {
      id,
      OR: [{ userId: session.userId }, { guestEmail: session.email }],
    },
    include: {
      items: true,
      shippingAddress: true,
      billingAddress: true,
    },
  })

  if (!order) {
    notFound()
  }

  const date = new Date(order.createdAt).toLocaleDateString("it-IT", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })

  return (
    <div>
      <Link
        href="/account/orders"
        className="inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-primary"
      >
        <span aria-hidden>←</span> Torna ai miei ordini
      </Link>

      <div className="mt-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-heading text-2xl font-semibold text-zinc-900">
            {order.invoiceNumber || `Ordine #${order.id.slice(0, 8)}`}
          </h2>
          <p className="mt-1 text-sm text-zinc-500">Effettuato il {date}</p>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-xs font-medium ${
            STATUS_COLORS[order.status] || "bg-zinc-100 text-zinc-600"
          }`}
        >
          {STATUS_LABELS[order.status] || order.status}
        </span>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <section className="lg:col-span-2 space-y-6">
          <div className="rounded-lg border border-zinc-200 bg-white">
            <h3 className="border-b border-zinc-200 px-5 py-3 text-sm font-semibold text-zinc-900">
              Articoli
            </h3>
            <ul className="divide-y divide-zinc-100">
              {order.items.map((item) => (
                <li
                  key={item.id}
                  className="flex flex-wrap items-center justify-between gap-3 px-5 py-4"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-zinc-900">{item.name}</p>
                    <p className="mt-0.5 text-xs text-zinc-500">
                      {formatPrice(item.price)} · {item.quantity}{" "}
                      {item.quantity === 1 ? "pezzo" : "pezzi"}
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-zinc-900">
                    {formatPrice(item.price * item.quantity)}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-lg border border-zinc-200 bg-white p-5 text-sm">
            <h3 className="mb-3 text-sm font-semibold text-zinc-900">Riepilogo</h3>
            <dl className="space-y-2">
              <div className="flex justify-between text-zinc-600">
                <dt>Subtotale</dt>
                <dd>{formatPrice(order.subtotal)}</dd>
              </div>
              <div className="flex justify-between text-zinc-600">
                <dt>Spedizione</dt>
                <dd>
                  {order.shippingCost === 0 ? (
                    <span className="text-green-700">Gratuita</span>
                  ) : (
                    formatPrice(order.shippingCost)
                  )}
                </dd>
              </div>
              <div className="flex justify-between text-zinc-600">
                <dt>IVA 22%</dt>
                <dd>{formatPrice(order.tax)}</dd>
              </div>
              <div className="flex justify-between border-t border-zinc-200 pt-3 text-base font-semibold text-zinc-900">
                <dt>Totale</dt>
                <dd>{formatPrice(order.total)}</dd>
              </div>
            </dl>
          </div>
        </section>

        <aside className="space-y-4">
          {order.shippingAddress && (
            <div className="rounded-lg border border-zinc-200 bg-white p-5 text-sm">
              <h3 className="mb-2 text-sm font-semibold text-zinc-900">Spedizione</h3>
              <p className="text-zinc-700">
                {order.shippingAddress.firstName} {order.shippingAddress.lastName}
                {order.shippingAddress.company && (
                  <>
                    <br />
                    <span className="text-zinc-500">{order.shippingAddress.company}</span>
                  </>
                )}
              </p>
              <p className="mt-1 text-zinc-600">
                {order.shippingAddress.address}
                {order.shippingAddress.address2 && (
                  <>
                    <br />
                    {order.shippingAddress.address2}
                  </>
                )}
                <br />
                {order.shippingAddress.postalCode} {order.shippingAddress.city}
                {order.shippingAddress.province && ` (${order.shippingAddress.province})`}
              </p>
            </div>
          )}

          {order.trackingNumber && (
            <div className="rounded-lg border border-zinc-200 bg-white p-5 text-sm">
              <h3 className="mb-2 text-sm font-semibold text-zinc-900">Tracking</h3>
              {order.trackingUrl ? (
                <a
                  href={order.trackingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="break-all font-medium text-primary hover:underline"
                >
                  {order.trackingNumber}
                </a>
              ) : (
                <p className="font-mono text-zinc-700">{order.trackingNumber}</p>
              )}
            </div>
          )}

          {order.invoiceNumber && (
            <a
              href={`/api/customer/orders/${order.id}/invoice`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 rounded-full border border-zinc-300 px-4 py-2.5 text-sm font-medium text-zinc-800 hover:bg-zinc-50"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.8}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 4v12m0 0l-4-4m4 4l4-4M4 20h16"
                />
              </svg>
              Scarica fattura
            </a>
          )}

          <ReorderButton
            items={order.items.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
            }))}
          />
        </aside>
      </div>
    </div>
  )
}
