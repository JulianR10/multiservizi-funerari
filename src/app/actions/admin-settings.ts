"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { getAdminSession } from "@/lib/admin-auth"
import { writeAuditLog } from "@/lib/audit"

const MAX = 2000

function trim(v: unknown, max = MAX): string {
  if (typeof v !== "string") return ""
  return v.trim().slice(0, max)
}

export type SettingsResult = { success: boolean; error?: string }

export async function saveSettings(
  formData: Record<string, string>
): Promise<SettingsResult> {
  const session = await getAdminSession()
  if (!session) {
    return { success: false, error: "Non autorizzato" }
  }

  const freeShipping = Number(formData.free_shipping_threshold)
  if (Number.isNaN(freeShipping) || freeShipping < 0) {
    return { success: false, error: "Soglia spedizione gratuita non valida" }
  }

  const taxRate = Number(formData.default_tax_rate)
  if (Number.isNaN(taxRate) || taxRate < 0 || taxRate > 100) {
    return { success: false, error: "Aliquota IVA non valida (0-100)" }
  }

  const adminEmail = trim(formData.admin_notify_email, 200)
  if (adminEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(adminEmail)) {
    return { success: false, error: "Email admin non valida" }
  }

  const lowStock = Number(formData.low_stock_threshold)
  if (Number.isNaN(lowStock) || lowStock < 0) {
    return { success: false, error: "Soglia stock basso non valida" }
  }

  const entries: { key: string; value: string }[] = [
    { key: "free_shipping_threshold", value: String(Math.round(freeShipping)) },
    { key: "default_tax_rate", value: String(taxRate) },
    { key: "admin_notify_email", value: adminEmail },
    { key: "invoice_prefix", value: trim(formData.invoice_prefix, 20) || "FATT" },
    { key: "order_email_bcc", value: trim(formData.order_email_bcc, 200) },
    { key: "low_stock_threshold", value: String(Math.round(lowStock)) },
  ]

  const before = await prisma.setting.findMany({
    where: { key: { in: entries.map((e) => e.key) } },
  })
  const beforeMap = new Map(before.map((b) => [b.key, b.value]))

  await prisma.$transaction(
    entries.map((e) =>
      prisma.setting.upsert({
        where: { key: e.key },
        update: { value: e.value, updatedBy: session.userId },
        create: { key: e.key, value: e.value, updatedBy: session.userId },
      })
    )
  )

  const changed = entries
    .filter((e) => beforeMap.get(e.key) !== e.value)
    .map((e) => ({ key: e.key, from: beforeMap.get(e.key), to: e.value }))

  await writeAuditLog({
    actorId: session.userId,
    actorEmail: session.email,
    action: "settings.update",
    entity: "Setting",
    entityId: "global",
    metadata: { changed },
  })

  revalidatePath("/admin/settings")
  return { success: true }
}
