"use client"

import { useEffect, useState } from "react"

type Notifications = {
  pendingUsers: number
  lowStock: number
  openOrders: number
  lowStockThreshold: number
}

export function AdminNotifications() {
  const [data, setData] = useState<Notifications | null>(null)

  useEffect(() => {
    let cancelled = false
    function load() {
      fetch("/api/admin/notifications", { cache: "no-store" })
        .then((r) => r.json())
        .then((d) => {
          if (!cancelled) setData(d)
        })
        .catch(() => {})
    }
    load()
    const interval = setInterval(load, 30_000)
    return () => {
      cancelled = true
      clearInterval(interval)
    }
  }, [])

  if (!data) return null

  const items: { href: string; label: string; count: number; color: string }[] = []
  if (data.pendingUsers > 0) {
    items.push({
      href: "/admin/users",
      label: "richieste",
      count: data.pendingUsers,
      color: "bg-amber-100 text-amber-800",
    })
  }
  if (data.openOrders > 0) {
    items.push({
      href: "/admin/orders",
      label: "ordini aperti",
      count: data.openOrders,
      color: "bg-blue-100 text-blue-800",
    })
  }
  if (data.lowStock > 0) {
    items.push({
      href: "/admin/products?q=lowstock",
      label: "stock basso",
      count: data.lowStock,
      color: "bg-red-100 text-red-800",
    })
  }

  if (items.length === 0) return null

  return (
    <div className="flex items-center gap-2">
      {items.map((item) => (
        <a
          key={item.label}
          href={item.href}
          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium transition hover:opacity-80 ${item.color}`}
        >
          <span className="font-bold">{item.count}</span>
          <span>{item.label}</span>
        </a>
      ))}
    </div>
  )
}
