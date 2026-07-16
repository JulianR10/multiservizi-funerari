import Link from "next/link"
import { assertAdminPage } from "@/lib/admin-guard"
import { prisma } from "@/lib/prisma"

type Props = {
  searchParams: Promise<{ entity?: string; action?: string; actor?: string; page?: string }>
}

const PER_PAGE = 50

const ACTION_LABELS: Record<string, string> = {
  "user.approve": "Utente approvato",
  "user.reject": "Utente rifiutato",
  "user.update": "Utente aggiornato",
  "order.update_status": "Stato ordine cambiato",
  "order.update_tracking": "Tracking ordine aggiornato",
  "order.refund": "Rimborso totale",
  "order.partial_refund": "Rimborso parziale",
  "product.create": "Prodotto creato",
  "product.update": "Prodotto aggiornato",
  "product.delete": "Prodotto eliminato",
  "product.bulk_publish": "Prodotti pubblicati in massa",
  "product.bulk_unpublish": "Prodotti disattivati in massa",
  "product.bulk_delete": "Prodotti eliminati in massa",
  "shipping.create": "Metodo spedizione creato",
  "shipping.update": "Metodo spedizione aggiornato",
  "shipping.delete": "Metodo spedizione eliminato",
  "shipping.toggle": "Metodo spedizione attivato/disattivato",
  "settings.update": "Impostazioni aggiornate",
  "auth.login_failed": "Login fallito",
}

const ENTITY_COLORS: Record<string, string> = {
  User: "bg-purple-100 text-purple-700",
  Order: "bg-blue-100 text-blue-700",
  Product: "bg-emerald-100 text-emerald-700",
  ShippingMethod: "bg-amber-100 text-amber-700",
  Setting: "bg-zinc-100 text-zinc-700",
  Auth: "bg-red-100 text-red-700",
}

export default async function AdminAuditPage({ searchParams }: Props) {
  await assertAdminPage()
  const { entity, action, actor, page: pageStr } = await searchParams
  const currentPage = Math.max(1, Number(pageStr) || 1)

  const where: Record<string, unknown> = {}
  if (entity) where.entity = entity
  if (action) where.action = action
  if (actor) where.actorEmail = actor.toLowerCase()

  const [logs, total, distinctActions, distinctEntities] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (currentPage - 1) * PER_PAGE,
      take: PER_PAGE,
    }),
    prisma.auditLog.count({ where }),
    prisma.auditLog.groupBy({ by: ["action"] }),
    prisma.auditLog.groupBy({ by: ["entity"] }),
  ])

  const totalPages = Math.ceil(total / PER_PAGE)

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <div>
        <h1 className="text-3xl font-bold text-zinc-900">Log di audit</h1>
        <p className="mt-1 text-sm text-zinc-500">
          {total} event{total === 1 ? "o" : "i"} registrat{total === 1 ? "o" : "i"}. Tiene traccia di
          tutte le modifiche effettuate dall&apos;amministratore.
        </p>
      </div>

      <form method="GET" className="mt-6 flex flex-wrap items-end gap-3 rounded-lg border border-zinc-200 bg-chalk p-4">
        <div>
          <label className="block text-xs font-medium text-zinc-700">Entità</label>
          <select
            name="entity"
            defaultValue={entity || ""}
            className="mt-1 rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-sm"
          >
            <option value="">Tutte</option>
            {distinctEntities.map((e) => (
              <option key={e.entity} value={e.entity}>
                {e.entity}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-zinc-700">Azione</label>
          <select
            name="action"
            defaultValue={action || ""}
            className="mt-1 rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-sm"
          >
            <option value="">Tutte</option>
            {distinctActions.map((a) => (
              <option key={a.action} value={a.action}>
                {ACTION_LABELS[a.action] || a.action}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-zinc-700">Attore (email)</label>
          <input
            type="email"
            name="actor"
            defaultValue={actor || ""}
            placeholder="admin@petrungaro.it"
            className="mt-1 rounded-md border border-zinc-300 px-3 py-1.5 text-sm"
          />
        </div>
        <div className="flex gap-2">
          <button
            type="submit"
            className="rounded-md bg-zinc-900 px-4 py-1.5 text-sm font-medium text-white hover:bg-zinc-800"
          >
            Filtra
          </button>
          <Link
            href="/admin/audit"
            className="rounded-md border border-zinc-300 px-4 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
          >
            Reset
          </Link>
        </div>
      </form>

      <div className="mt-6 overflow-x-auto rounded-lg border border-zinc-200">
        <table className="min-w-full divide-y divide-zinc-200">
          <thead className="bg-zinc-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-zinc-500">
                Data
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-zinc-500">
                Attore
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-zinc-500">
                Azione
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-zinc-500">
                Entità
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-zinc-500">
                Dettaglio
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 bg-chalk">
            {logs.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-sm text-zinc-500">
                  Nessun evento registrato.
                </td>
              </tr>
            ) : (
              logs.map((log) => {
                const meta = (log.metadata as Record<string, unknown>) || {}
                return (
                  <tr key={log.id} className="hover:bg-zinc-50">
                    <td className="whitespace-nowrap px-4 py-3 text-xs text-zinc-600">
                      {new Date(log.createdAt).toLocaleString("it-IT")}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-xs">
                      {log.actorEmail ? (
                        <span className="text-zinc-700">{log.actorEmail}</span>
                      ) : (
                        <span className="text-zinc-400">sistema</span>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-xs">
                      <span className="font-medium text-zinc-900">
                        {ACTION_LABELS[log.action] || log.action}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-xs">
                      <span
                        className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
                          ENTITY_COLORS[log.entity] || "bg-zinc-100 text-zinc-700"
                        }`}
                      >
                        {log.entity}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs">
                      {log.entity === "Order" && log.entityId ? (
                        <Link
                          href={`/admin/orders/${log.entityId}`}
                          className="text-primary hover:underline"
                        >
                          {String(meta.invoiceNumber || log.entityId.slice(0, 8))}
                        </Link>
                      ) : log.entity === "User" && log.entityId ? (
                        <Link
                          href={`/admin/users/${log.entityId}`}
                          className="text-primary hover:underline"
                        >
                          {String(meta.email || log.entityId.slice(0, 8))}
                        </Link>
                      ) : (
                        <span className="text-zinc-500">
                          {log.entityId.length > 16
                            ? log.entityId.slice(0, 12) + "…"
                            : log.entityId}
                        </span>
                      )}
                      {Object.keys(meta).length > 0 && (
                        <div className="mt-1 max-w-md truncate text-[11px] text-zinc-400">
                          {JSON.stringify(meta)}
                        </div>
                      )}
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-center gap-4 text-sm">
          {currentPage > 1 && (
            <Link
              href={`/admin/audit?${new URLSearchParams({ ...(entity && { entity }), ...(action && { action }), ...(actor && { actor }), page: String(currentPage - 1) }).toString()}`}
              className="rounded-lg px-3 py-2 text-zinc-600 hover:bg-zinc-100"
            >
              &laquo; Precedente
            </Link>
          )}
          <span className="text-zinc-500">
            Pagina {currentPage} di {totalPages}
          </span>
          {currentPage < totalPages && (
            <Link
              href={`/admin/audit?${new URLSearchParams({ ...(entity && { entity }), ...(action && { action }), ...(actor && { actor }), page: String(currentPage + 1) }).toString()}`}
              className="rounded-lg px-3 py-2 text-zinc-600 hover:bg-zinc-100"
            >
              Successiva &raquo;
            </Link>
          )}
        </div>
      )}
    </div>
  )
}
