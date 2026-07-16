const VAT_REGEX = /^\d{11}$/

export function validateItalianVat(vat: string): string | null {
  const cleaned = vat.replace(/\s/g, "")
  if (!VAT_REGEX.test(cleaned)) {
    return "Partita IVA non valida: deve contenere 11 cifre."
  }

  let sum = 0
  for (let i = 0; i < 10; i++) {
    let n = parseInt(cleaned[i], 10)
    if (i % 2 === 0) {
      n *= 2
      if (n > 9) n -= 9
    }
    sum += n
  }
  const checkDigit = (10 - (sum % 10)) % 10
  if (checkDigit !== parseInt(cleaned[10], 10)) {
    return "Partita IVA non valida: cifra di controllo errata."
  }

  return null
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
export function isValidEmail(email: string): boolean {
  return EMAIL_REGEX.test(email)
}

export type CheckoutItemInput = { productId?: unknown; quantity?: unknown }

export function validateCheckoutItems(
  items: unknown
): { ok: true; items: { productId: string; quantity: number }[] } | { ok: false; error: string } {
  if (!Array.isArray(items) || items.length === 0) {
    return { ok: false, error: "Carrello vuoto" }
  }
  if (items.length > 50) {
    return { ok: false, error: "Troppi articoli nel carrello. Massimo 50." }
  }

  const cleaned: { productId: string; quantity: number }[] = []
  for (const raw of items as CheckoutItemInput[]) {
    if (!raw || typeof raw !== "object") {
      return { ok: false, error: "Articolo non valido" }
    }
    const { productId, quantity } = raw

    if (typeof productId !== "string" || productId.length === 0 || productId.length > 64) {
      return { ok: false, error: "ID prodotto non valido" }
    }
    if (
      typeof quantity !== "number" ||
      !Number.isInteger(quantity) ||
      quantity < 1 ||
      quantity > 999
    ) {
      return { ok: false, error: "Quantità non valida (deve essere intero tra 1 e 999)" }
    }
    cleaned.push({ productId, quantity })
  }

  return { ok: true, items: cleaned }
}

export function sanitizeCsvCell(value: unknown): string {
  if (value === null || value === undefined) return ""
  let str = String(value)
  if (/^[=+\-@\t\r]/.test(str)) {
    str = "'" + str
  }
  if (/[",\n\r]/.test(str)) {
    str = `"${str.replace(/"/g, '""')}"`
  }
  return str
}
