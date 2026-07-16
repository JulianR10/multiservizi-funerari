import { notFound } from "next/navigation"
import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { formatPrice } from "@/lib/format"
import { OrderActions } from "./actions"
import { assertAdminPage } from "@/lib/admin-guard"
import { STATUS_LABELS } from "@/lib/order-status"

type Props = {
  params: Promise<{ id: string }>
}

export default async function AdminOrderDetailPage({ params }: Props) {
  await assertAdminPage()
  const { id } = await params

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      user: { select: { name: true, email: true } },
      items: true,
      shippingAddress: true,
      billingAddress: true,
    },
  })

  if (!order) notFound()

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <Link
        href="/admin/orders"
        className="inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-900"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 12H5m7 7-7-7 7-7" />
        </svg>
        Torna agli ordini
      </Link>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900">
            {order.invoiceNumber || `Ordine #${order.id.slice(0, 8)}`}
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            {new Date(order.createdAt).toLocaleDateString("it-IT", {
              day: "numeric",
              month: "long",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-sm font-medium ${
            order.status === "confirmed"
              ? "bg-green-100 text-green-700"
              : order.status === "shipped"
                ? "bg-blue-100 text-blue-700"
                : order.status === "delivered"
                  ? "bg-green-100 text-green-700"
                  : order.status === "cancelled"
                    ? "bg-red-100 text-red-700"
                    : "bg-yellow-100 text-yellow-700"
          }`}
        >
          {STATUS_LABELS[order.status] || order.status}
        </span>
      </div>

      <OrderActions
        orderId={order.id}
        currentStatus={order.status}
        trackingNumber={order.trackingNumber}
        trackingUrl={order.trackingUrl}
        paymentStatus={order.paymentStatus}
        total={order.total}
        invoiceNumber={order.invoiceNumber}
      />

      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        <div className="rounded-lg border border-zinc-200 bg-chalk p-6">
          <h2 className="font-heading text-lg font-semibold text-zinc-900">Cliente</h2>
          {order.user ? (
            <div className="mt-3 space-y-1 text-sm">
              <p className="text-zinc-900">{order.user.name || "—"}</p>
              <p className="text-zinc-500">{order.user.email}</p>
            </div>
          ) : (
            <div className="mt-3 space-y-1 text-sm">
              <p className="text-zinc-500">Ospite</p>
              <p className="text-zinc-900">{order.guestEmail || "—"}</p>
            </div>
          )}

          <h2 className="mt-6 font-heading text-lg font-semibold text-zinc-900">Pagamento</h2>
          <div className="mt-3 space-y-1 text-sm">
            <p className="flex justify-between">
              <span className="text-zinc-500">Metodo</span>
              <span className="text-zinc-900 capitalize">{order.paymentMethod || "—"}</span>
            </p>
            <p className="flex justify-between">
              <span className="text-zinc-500">Stato</span>
              <span
                className={`font-medium ${
                  order.paymentStatus === "paid" ? "text-green-700" : "text-yellow-700"
                }`}
              >
                {order.paymentStatus === "paid" ? "Pagato" : "In attesa"}
              </span>
            </p>
            {order.stripePaymentId && (
              <p className="flex justify-between">
                <span className="text-zinc-500">Stripe ID</span>
                <span className="max-w-[200px] truncate text-zinc-900">
                  {order.stripePaymentId}
                </span>
              </p>
            )}
          </div>

          {order.shippingAddress && (
            <>
              <h2 className="mt-6 font-heading text-lg font-semibold text-zinc-900">
                Indirizzo spedizione
              </h2>
              <div className="mt-3 space-y-1 text-sm">
                <p className="text-zinc-900">
                  {order.shippingAddress.firstName} {order.shippingAddress.lastName}
                </p>
                <p className="text-zinc-500">{order.shippingAddress.address}</p>
                {order.shippingAddress.address2 && (
                  <p className="text-zinc-500">{order.shippingAddress.address2}</p>
                )}
                <p className="text-zinc-500">
                  {order.shippingAddress.postalCode} {order.shippingAddress.city}
                  {order.shippingAddress.province && ` (${order.shippingAddress.province})`}
                </p>
                {order.shippingAddress.phone && (
                  <p className="text-zinc-500">{order.shippingAddress.phone}</p>
                )}
              </div>
            </>
          )}
        </div>

        <div className="rounded-lg border border-zinc-200 bg-chalk p-6">
          <h2 className="font-heading text-lg font-semibold text-zinc-900">Articoli</h2>
          <ul className="mt-3 divide-y divide-zinc-100">
            {order.items.map((item) => (
              <li key={item.id} className="flex justify-between py-3 text-sm">
                <div>
                  <p className="text-zinc-900">{item.name}</p>
                  <p className="text-xs text-zinc-400">×{item.quantity}</p>
                </div>
                <span className="text-zinc-900">{formatPrice(item.price * item.quantity)}</span>
              </li>
            ))}
          </ul>

          <div className="mt-4 space-y-2 border-t border-zinc-100 pt-4 text-sm">
            <div className="flex justify-between">
              <span className="text-zinc-500">Subtotale</span>
              <span className="text-zinc-900">{formatPrice(order.subtotal)}</span>
            </div>
            {order.shippingCost > 0 && (
              <div className="flex justify-between">
                <span className="text-zinc-500">Spedizione</span>
                <span className="text-zinc-900">{formatPrice(order.shippingCost)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-zinc-500">IVA 22%</span>
              <span className="text-zinc-900">{formatPrice(order.tax)}</span>
            </div>
            <div className="flex justify-between border-t border-zinc-200 pt-2 text-base font-bold">
              <span className="text-zinc-900">Totale</span>
              <span className="text-primary">{formatPrice(order.total)}</span>
            </div>
          </div>

          {order.notes && (
            <div className="mt-6">
              <h3 className="font-heading text-sm font-semibold text-zinc-900">Note</h3>
              <p className="mt-1 text-sm text-zinc-600">{order.notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
