import { prisma } from "./prisma"

export const SETTING_KEYS = {
  FREE_SHIPPING_THRESHOLD: "free_shipping_threshold",
  DEFAULT_TAX_RATE: "default_tax_rate",
  ADMIN_NOTIFY_EMAIL: "admin_notify_email",
  INVOICE_PREFIX: "invoice_prefix",
  ORDER_EMAIL_BCC: "order_email_bcc",
  LOW_STOCK_THRESHOLD: "low_stock_threshold",
} as const

export type SettingKey = (typeof SETTING_KEYS)[keyof typeof SETTING_KEYS]

const DEFAULTS: Record<string, string> = {
  [SETTING_KEYS.FREE_SHIPPING_THRESHOLD]: process.env.NEXT_PUBLIC_FREE_SHIPPING_THRESHOLD || "15000",
  [SETTING_KEYS.DEFAULT_TAX_RATE]: "22",
  [SETTING_KEYS.ADMIN_NOTIFY_EMAIL]: process.env.ADMIN_NOTIFY_EMAIL || "",
  [SETTING_KEYS.INVOICE_PREFIX]: "FATT",
  [SETTING_KEYS.ORDER_EMAIL_BCC]: "",
  [SETTING_KEYS.LOW_STOCK_THRESHOLD]: "5",
}

export async function getSetting(key: string, fallback?: string): Promise<string> {
  try {
    const row = await prisma.setting.findUnique({ where: { key } })
    if (row) return row.value
  } catch {
    /* setting table may not exist yet */
  }
  return fallback ?? DEFAULTS[key] ?? ""
}

export async function getSettings(keys: string[]): Promise<Record<string, string>> {
  try {
    const rows = await prisma.setting.findMany({
      where: { key: { in: keys } },
    })
    const map: Record<string, string> = {}
    for (const k of keys) map[k] = DEFAULTS[k] ?? ""
    for (const r of rows) map[r.key] = r.value
    return map
  } catch {
    const map: Record<string, string> = {}
    for (const k of keys) map[k] = DEFAULTS[k] ?? ""
    return map
  }
}

export async function setSetting(key: string, value: string, updatedBy?: string): Promise<void> {
  await prisma.setting.upsert({
    where: { key },
    update: { value, updatedBy },
    create: { key, value, updatedBy },
  })
}
