export const TAX_RATE = 0.22
export const VAT_RATE_PERCENT = 22

export function computeTax(subtotal: number): number {
  return Math.round(subtotal * TAX_RATE)
}

export function computeTotal(subtotal: number, tax: number, shippingCost: number): number {
  return subtotal + tax + shippingCost
}
