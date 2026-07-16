const ENV_VALUE = Number(process.env.NEXT_PUBLIC_FREE_SHIPPING_THRESHOLD || "0")

export const FREE_SHIPPING_THRESHOLD = ENV_VALUE

export function qualifiesForFreeShipping(subtotal: number, threshold: number = FREE_SHIPPING_THRESHOLD) {
  return threshold > 0 && subtotal >= threshold
}
