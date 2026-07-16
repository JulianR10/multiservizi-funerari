"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { formatPrice } from "@/lib/format"
import { STATUS_LABELS, STATUS_COLORS } from "@/lib/order-status"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts"

type DashboardStats = {
  totalOrders: number
  totalRevenue: number
  totalProducts: number
  recentOrders: {
    id: string
    invoiceNumber: string | null
    guestEmail: string | null
    user: { name: string | null; email: string | null } | null
    total: number
    status: string
    paymentStatus: string
    createdAt: string
    items: { name: string; quantity: number }[]
  }[]
  revenueLast30Days: number
  ordersLast30Days: number
  topProducts: { name: string; totalSold: number; revenue: number }[]
  dailyRevenue: { date: string; revenue: number; orders: number }[]
  orderStatusBreakdown: { status: string; count: number }[]
}

const STATUS_COLORS_MAP: Record<string, string> = {
  pending: "#FCD34D",
  confirmed: "#34D399",
  shipped: "#60A5FA",
  delivered: "#10B981",
  cancelled: "#F87171",
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    function loadStats() {
      fetch("/api/admin/dashboard")
        .then((res) => res.json())
        .then((data) => setStats(data))
        .catch(() => {})
        .finally(() => setLoading(false))
    }
    loadStats()
    const interval = setInterval(loadStats, 60_000)
    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-zinc-900">Dashboard</h1>
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="animate-pulse rounded-lg border border-zinc-200 bg-chalk p-6">
              <div className="h-3 w-20 rounded bg-zinc-200" />
              <div className="mt-3 h-7 w-32 rounded bg-zinc-200" />
              <div className="mt-2 h-3 w-24 rounded bg-zinc-200" />
            </div>
          ))}
        </div>
        <div className="mt-8 grid gap-8 lg:grid-cols-3">
          <div className="animate-pulse rounded-lg border border-zinc-200 bg-chalk p-6 lg:col-span-2">
            <div className="h-5 w-48 rounded bg-zinc-200" />
            <div className="mt-4 h-64 rounded bg-zinc-100" />
          </div>
          <div className="animate-pulse rounded-lg border border-zinc-200 bg-chalk p-6">
            <div className="h-5 w-32 rounded bg-zinc-200" />
            <div className="mt-4 h-64 rounded bg-zinc-100" />
          </div>
        </div>
        <div className="mt-8 grid gap-8 lg:grid-cols-2">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="animate-pulse rounded-lg border border-zinc-200 bg-chalk p-6">
              <div className="h-5 w-36 rounded bg-zinc-200" />
              <div className="mt-4 space-y-3">
                {Array.from({ length: 4 }).map((_, j) => (
                  <div key={j} className="flex items-center justify-between">
                    <div className="h-4 w-40 rounded bg-zinc-200" />
                    <div className="h-4 w-16 rounded bg-zinc-200" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-zinc-900">Dashboard</h1>
        <p className="mt-4 text-zinc-500">Errore nel caricamento delle statistiche.</p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-zinc-900">Dashboard</h1>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Ordini totali"
          value={stats.totalOrders.toString()}
          subtitle={`${stats.ordersLast30Days} negli ultimi 30 giorni`}
        />
        <StatCard
          title="Fatturato totale"
          value={formatPrice(stats.totalRevenue)}
          subtitle={formatPrice(stats.revenueLast30Days) + " ultimi 30gg"}
        />
        <StatCard
          title="Prodotti"
          value={stats.totalProducts.toString()}
          subtitle="nel catalogo"
        />
        <StatCard
          title="Media ordine"
          value={
            stats.totalOrders > 0
              ? formatPrice(Math.round(stats.totalRevenue / stats.totalOrders))
              : "—"
          }
          subtitle="per ordine"
        />
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-3">
        <div className="rounded-lg border border-zinc-200 bg-chalk p-6 lg:col-span-2">
          <h2 className="font-heading text-lg font-semibold text-zinc-900">Fatturato ultimi 30 giorni</h2>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.dailyRevenue}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E0DB" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11, fill: "#71717a" }}
                  tickFormatter={(value) => {
                    const d = new Date(value)
                    return `${d.getDate()}/${d.getMonth() + 1}`
                  }}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "#71717a" }}
                  tickFormatter={(value) => formatPrice(value)}
                />
                <Tooltip
                  formatter={(value) => formatPrice(Number(value))}
                  labelFormatter={(label) => {
                    const d = new Date(label)
                    return d.toLocaleDateString("it-IT", { day: "numeric", month: "long", year: "numeric" })
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#772123"
                  fill="#772123"
                  fillOpacity={0.1}
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-lg border border-zinc-200 bg-chalk p-6">
          <h2 className="font-heading text-lg font-semibold text-zinc-900">Stato ordini</h2>
          {stats.orderStatusBreakdown.length === 0 ? (
            <p className="mt-4 text-sm text-zinc-500">Nessun ordine.</p>
          ) : (
            <div className="mt-4 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.orderStatusBreakdown}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    dataKey="count"
                    nameKey="status"
                  >
                    {stats.orderStatusBreakdown.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={STATUS_COLORS_MAP[entry.status] || "#A1A1AA"}
                      />
                    ))}
                  </Pie>
                  <Legend
                    formatter={(value) => STATUS_LABELS[value] || value}
                    wrapperStyle={{ fontSize: 12 }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        <div className="rounded-lg border border-zinc-200 bg-chalk p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-heading text-lg font-semibold text-zinc-900">Ordini recenti</h2>
            <Link
              href="/admin/orders"
              className="text-xs font-medium text-primary hover:text-primary-hover"
            >
              Vedi tutti →
            </Link>
          </div>
          {stats.recentOrders.length === 0 ? (
            <p className="mt-4 text-sm text-zinc-500">Nessun ordine ancora.</p>
          ) : (
            <ul className="mt-4 divide-y divide-zinc-100">
              {stats.recentOrders.map((order) => (
                <li key={order.id} className="py-3">
                  <Link
                    href={`/admin/orders/${order.id}`}
                    className="block hover:bg-zinc-50 -mx-2 px-2 py-1 rounded transition"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-zinc-900">
                          {order.invoiceNumber || `#${order.id.slice(0, 8)}`}
                        </span>
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[order.status] || "bg-zinc-100 text-zinc-600"}`}
                        >
                          {STATUS_LABELS[order.status] || order.status}
                        </span>
                      </div>
                      <span className="text-sm font-medium text-zinc-900">
                        {formatPrice(order.total)}
                      </span>
                    </div>
                    <div className="mt-1 flex items-center justify-between text-xs text-zinc-500">
                      <span>
                        {order.user?.name || order.guestEmail || "Ospite"}
                      </span>
                      <span>
                        {new Date(order.createdAt).toLocaleDateString("it-IT", {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-lg border border-zinc-200 bg-chalk p-6">
          <h2 className="font-heading text-lg font-semibold text-zinc-900">Prodotti più venduti</h2>
          {stats.topProducts.length === 0 ? (
            <p className="mt-4 text-sm text-zinc-500">Nessuna vendita ancora.</p>
          ) : (
            <ul className="mt-4 divide-y divide-zinc-100">
              {stats.topProducts.map((product, i) => (
                <li key={i} className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-sm font-medium text-zinc-900">{product.name}</p>
                    <p className="text-xs text-zinc-500">{product.totalSold} venduti</p>
                  </div>
                  <span className="text-sm font-medium text-zinc-900">
                    {formatPrice(product.revenue)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}

function StatCard({
  title,
  value,
  subtitle,
}: {
  title: string
  value: string
  subtitle: string
}) {
  return (
    <div className="rounded-lg border border-zinc-200 bg-chalk p-6">
      <p className="text-sm font-medium text-zinc-500">{title}</p>
      <p className="mt-2 text-2xl font-bold text-zinc-900">{value}</p>
      <p className="mt-1 text-xs text-zinc-400">{subtitle}</p>
    </div>
  )
}
