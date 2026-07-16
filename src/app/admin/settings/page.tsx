import { assertAdminPage } from "@/lib/admin-guard"
import { getSettings, SETTING_KEYS } from "@/lib/settings"
import { SettingsForm } from "./form"

export default async function AdminSettingsPage() {
  await assertAdminPage()

  const settings = await getSettings([
    SETTING_KEYS.FREE_SHIPPING_THRESHOLD,
    SETTING_KEYS.DEFAULT_TAX_RATE,
    SETTING_KEYS.ADMIN_NOTIFY_EMAIL,
    SETTING_KEYS.INVOICE_PREFIX,
    SETTING_KEYS.ORDER_EMAIL_BCC,
    SETTING_KEYS.LOW_STOCK_THRESHOLD,
  ])

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <div>
        <h1 className="text-3xl font-bold text-zinc-900">Impostazioni</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Configurazione globale del negozio. Le modifiche hanno effetto immediato.
        </p>
      </div>

      <SettingsForm
        initial={{
          freeShippingThreshold: settings[SETTING_KEYS.FREE_SHIPPING_THRESHOLD] || "15000",
          defaultTaxRate: settings[SETTING_KEYS.DEFAULT_TAX_RATE] || "22",
          adminNotifyEmail: settings[SETTING_KEYS.ADMIN_NOTIFY_EMAIL] || "",
          invoicePrefix: settings[SETTING_KEYS.INVOICE_PREFIX] || "FATT",
          orderEmailBcc: settings[SETTING_KEYS.ORDER_EMAIL_BCC] || "",
          lowStockThreshold: settings[SETTING_KEYS.LOW_STOCK_THRESHOLD] || "5",
        }}
      />
    </div>
  )
}
