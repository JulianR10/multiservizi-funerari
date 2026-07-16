import Link from "next/link"
import Image from "next/image"
import { getCustomerSession } from "@/lib/customer-auth"
import { prisma } from "@/lib/prisma"
import { formatPrice } from "@/lib/format"
import { STATUS_LABELS, STATUS_COLORS } from "@/lib/order-status"
import { ReorderProductButton } from "./reorder-product-button"

export default async function OrdersPage() {
  const session = await getCustomerSession()
  if (!session) {
    return null
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { status: true },
  })

  if (user?.status === "PENDING") {
    return (
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-6 text-sm text-amber-900">
        <p className="font-medium">Richiesta in attesa di approvazione</p>
        <p className="mt-1 text-amber-800">
          Non appena la tua richiesta verrà approvata potrai visualizzare lo storico dei tuoi ordini.
        </p>
      </div>
    )
  }

  if (user?.status === "REJECTED") {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-sm text-red-900">
        <p className="font-medium">Richiesta non approvata</p>
        <p className="mt-1 text-red-800">
          La tua richiesta di registrazione non è stata approvata. Per maggiori informazioni
          contatta l&apos;amministratore.
        </p>
      </div>
    )
  }

  const orders = await prisma.order.findMany({
    where: {
      OR: [{ userId: session.userId }, { guestEmail: session.email }],
    },
    include: {
      items: { select: { name: true, quantity: true, price: true } },
    },
    orderBy: { createdAt: "desc" },
  })

  return (
    <div>
      <h2 className="font-heading text-xl font-semibold text-zinc-900">I miei ordini</h2>
      <p className="mt-1 text-sm text-zinc-500">
        {orders.length === 0
          ? "Non hai ancora effettuato ordini."
          : `${orders.length} ordine${orders.length === 1 ? "" : "i"} total${orders.length === 1 ? "e" : "i"}.`}
      </p>

      {orders.length === 0 ? (
        <div className="mt-6 rounded-lg border border-zinc-200 bg-chalk p-8 text-center">
          <p className="text-zinc-500">Esplora il catalogo e inizia il tuo primo ordine.</p>
          <Link
            href="/prodotti"
            className="mt-4 inline-block rounded-full bg-zinc-900 px-6 py-2 text-sm font-medium text-white hover:bg-zinc-800"
          >
            Sfoglia il catalogo
          </Link>
        </div>
      ) : (
        <>
          <TopProducts userId={session.userId} />

          <ul className="mt-6 space-y-4">
            {orders.map((order) => (
              <li
                key={order.id}
                className="rounded-lg border border-zinc-200 bg-white p-6 transition hover:border-primary/40 hover:shadow-sm"
              >
                <Link href={`/account/orders/${order.id}`} className="block">
                  <div className="flex flex-wrap items-center justify-between gap-3">
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
                    <span className="text-base font-semibold text-zinc-900">
                      {formatPrice(order.total)}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-zinc-500">
                    {new Date(order.createdAt).toLocaleDateString("it-IT", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}{" "}
                    · {order.items.length}{" "}
                    {order.items.length === 1 ? "articolo" : "articoli"}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  )
}

async function TopProducts({ userId }: { userId: string }) {
  const items = await prisma.orderItem.groupBy({
    by: ["productId"],
    where: { order: { userId, paymentStatus: "paid" } },
    _sum: { quantity: true },
    orderBy: { _sum: { quantity: "desc" } },
    take: 5,
  })

  if (items.length === 0) return null

  const products = await prisma.product.findMany({
    where: { id: { in: items.map((i) => i.productId) } },
    select: { id: true, name: true, slug: true, images: true, price: true },
  })
  const byId = new Map(products.map((p) => [p.id, p]))

  const top = items
    .map((i) => {
      const p = byId.get(i.productId)
      if (!p) return null
      return { product: p, quantity: i._sum.quantity || 0 }
    })
    .filter((x): x is { product: NonNullable<typeof x>["product"]; quantity: number } => x !== null)

  if (top.length === 0) return null

  return (
    <section className="mt-6 rounded-lg border border-zinc-200 bg-white p-5">
      <h3 className="text-sm font-semibold text-zinc-900">Articoli acquistati spesso</h3>
      <p className="mt-1 text-xs text-zinc-500">
        I prodotti che ordini più spesso. Aggiungili al carrello con un click.
      </p>
      <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {top.map(({ product, quantity }) => (
          <li
            key={product.id}
            className="flex items-center gap-3 rounded-md border border-zinc-100 p-2"
          >
            <Link
              href={`/prodotti/${product.slug}`}
              className="relative h-14 w-14 shrink-0 overflow-hidden rounded-md bg-chalk"
            >
              {product.images[0] && (
                <Image
                  src={product.images[0]}
                  alt={product.name}
                  fill
                  sizes="56px"
                  className="object-cover"
                />
              )}
            </Link>
            <div className="min-w-0 flex-1">
              <Link
                href={`/prodotti/${product.slug}`}
                className="line-clamp-1 text-sm font-medium text-zinc-900 hover:text-primary"
              >
                {product.name}
              </Link>
              <p className="text-xs text-zinc-500">
                {formatPrice(product.price)} · {quantity} acquistati
              </p>
            </div>
            <ReorderProductButton
              product={{
                productId: product.id,
                name: product.name,
                price: product.price,
                image: product.images[0] || "",
                slug: product.slug,
                stock: 999,
              }}
            />
          </li>
        ))}
      </ul>
    </section>
  )
}
