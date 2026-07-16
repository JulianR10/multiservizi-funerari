import { notFound } from "next/navigation"
import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { assertAdminPage } from "@/lib/admin-guard"
import { formatPrice } from "@/lib/format"
import { STATUS_LABELS, STATUS_COLORS } from "@/lib/order-status"
import { UserActions } from "./actions"

const LEGAL_FORM_LABELS: Record<string, string> = {
  SRL: "SRL / SRLS",
  SAS: "SAS / SNC",
  COOPERATIVA: "Cooperativa",
  DITTA_INDIVIDUALE: "Ditta Individuale",
  ALTRO: "Altro",
}

const BUSINESS_TYPE_LABELS: Record<string, string> = {
  ONORANZE_FUNEBRI: "Onoranze Funebri",
  COSTRUTTORE: "Costruttore / Rivenditore Cofani",
  MARMISTA: "Marmista",
  FIORISTA: "Fiorista",
  ALTRO: "Altro",
}

type Props = {
  params: Promise<{ id: string }>
}

export default async function AdminUserDetailPage({ params }: Props) {
  await assertAdminPage()
  const { id } = await params

  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      addresses: { orderBy: [{ isDefault: "desc" }, { createdAt: "asc" }] },
      orders: {
        orderBy: { createdAt: "desc" },
        take: 50,
        include: { items: { select: { id: true } } },
      },
    },
  })

  if (!user || user.role !== "user") {
    notFound()
  }

  const totalRevenue = user.orders
    .filter((o) => o.paymentStatus === "paid")
    .reduce((sum, o) => sum + o.total, 0)
  const paidOrders = user.orders.filter((o) => o.paymentStatus === "paid").length

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <Link
        href="/admin/users"
        className="inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-900"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 12H5m7 7-7-7 7-7" />
        </svg>
        Torna alle richieste
      </Link>

      <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-bold text-zinc-900">
              {user.companyName || user.name || "—"}
            </h1>
            <span
              className={`rounded-full px-3 py-1 text-xs font-medium ${
                user.status === "APPROVED"
                  ? "bg-emerald-100 text-emerald-700"
                  : user.status === "REJECTED"
                    ? "bg-red-100 text-red-700"
                    : "bg-amber-100 text-amber-700"
              }`}
            >
              {user.status === "APPROVED"
                ? "Approvato"
                : user.status === "REJECTED"
                  ? "Rifiutato"
                  : "In attesa"}
            </span>
          </div>
          <p className="mt-1 text-sm text-zinc-500">{user.email}</p>
        </div>
        <UserActions userId={user.id} currentStatus={user.status} />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <section className="rounded-lg border border-zinc-200 bg-chalk p-6 lg:col-span-2">
          <h2 className="font-heading text-base font-semibold text-zinc-900">
            Anagrafica
          </h2>
          <dl className="mt-4 grid gap-4 text-sm sm:grid-cols-2">
            <Item label="Ragione sociale" value={user.companyName} />
            <Item label="Email" value={user.email} />
            <Item
              label="Partita IVA"
              value={user.vatNumber}
            />
            <Item label="Codice fiscale" value={user.taxCode} />
            <Item label="Codice SDI" value={user.sdiCode} />
            <Item
              label="Forma giuridica"
              value={user.legalForm ? LEGAL_FORM_LABELS[user.legalForm] || user.legalForm : null}
            />
            <Item
              label="Tipo attività"
              value={
                user.businessType
                  ? BUSINESS_TYPE_LABELS[user.businessType] || user.businessType
                  : null
              }
            />
            <Item label="Telefono" value={user.phone} />
            <div className="sm:col-span-2">
              <Item
                label="Sede legale"
                value={
                  [user.address, user.postalCode, user.city, user.province]
                    .filter(Boolean)
                    .join(", ") || null
                }
              />
            </div>
            {user.notes && (
              <div className="sm:col-span-2">
                <dt className="text-xs font-medium text-zinc-500">Note</dt>
                <dd className="mt-1 text-sm italic text-zinc-700">{user.notes}</dd>
              </div>
            )}
          </dl>
        </section>

        <section className="space-y-4">
          <div className="rounded-lg border border-zinc-200 bg-chalk p-5">
            <h2 className="font-heading text-base font-semibold text-zinc-900">Riepilogo</h2>
            <dl className="mt-3 space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-zinc-500">Ordini totali</dt>
                <dd className="font-medium text-zinc-900">{user.orders.length}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-zinc-500">Ordini pagati</dt>
                <dd className="font-medium text-zinc-900">{paidOrders}</dd>
              </div>
              <div className="flex justify-between border-t border-zinc-200 pt-2">
                <dt className="text-zinc-500">Fatturato</dt>
                <dd className="font-semibold text-primary">{formatPrice(totalRevenue)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-zinc-500">Registrato il</dt>
                <dd className="text-zinc-900">
                  {new Date(user.createdAt).toLocaleDateString("it-IT")}
                </dd>
              </div>
            </dl>
          </div>

          {user.addresses.length > 0 && (
            <div className="rounded-lg border border-zinc-200 bg-chalk p-5">
              <h2 className="font-heading text-base font-semibold text-zinc-900">
                Indirizzi salvati
              </h2>
              <ul className="mt-3 space-y-3 text-sm">
                {user.addresses.map((a) => (
                  <li key={a.id} className="border-b border-zinc-100 pb-3 last:border-0 last:pb-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-zinc-900">
                        {a.label || `${a.firstName} ${a.lastName}`}
                      </p>
                      {a.isDefault && (
                        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                          Default
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 text-xs text-zinc-500">
                      {a.address}, {a.postalCode} {a.city}
                      {a.province && ` (${a.province})`}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      </div>

      <section className="mt-8 rounded-lg border border-zinc-200 bg-chalk p-6">
        <h2 className="font-heading text-base font-semibold text-zinc-900">
          Storico ordini ({user.orders.length})
        </h2>
        {user.orders.length === 0 ? (
          <p className="mt-3 text-sm text-zinc-500">Nessun ordine.</p>
        ) : (
          <ul className="mt-4 divide-y divide-zinc-100">
            {user.orders.map((order) => (
              <li key={order.id} className="py-3">
                <Link
                  href={`/admin/orders/${order.id}`}
                  className="-mx-2 block rounded px-2 py-1 hover:bg-zinc-50"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-medium text-zinc-900">
                        {order.invoiceNumber || `#${order.id.slice(0, 8)}`}
                      </span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                          STATUS_COLORS[order.status] || "bg-zinc-100 text-zinc-600"
                        }`}
                      >
                        {STATUS_LABELS[order.status] || order.status}
                      </span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                          order.paymentStatus === "paid"
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {order.paymentStatus === "paid" ? "Pagato" : order.paymentStatus}
                      </span>
                    </div>
                    <span className="text-sm font-semibold text-zinc-900">
                      {formatPrice(order.total)}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-zinc-500">
                    {new Date(order.createdAt).toLocaleDateString("it-IT", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}{" "}
                    · {order.items.length} articol{order.items.length === 1 ? "o" : "i"}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}

function Item({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div>
      <dt className="text-xs font-medium text-zinc-500">{label}</dt>
      <dd className="mt-0.5 text-zinc-900">{value || <span className="text-zinc-400">—</span>}</dd>
    </div>
  )
}
