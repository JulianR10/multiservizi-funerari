type CheckoutItem = {
  productId: string
  quantity: number
}

export async function validateStock(
  items: CheckoutItem[],
  productMap: Map<string, { id: string; name: string; stock: number; price: number }>
): Promise<void> {
  for (const item of items) {
    const product = productMap.get(item.productId)
    if (!product) {
      throw new Error(`Prodotto ${item.productId} non trovato`)
    }
    if (product.stock < item.quantity) {
      throw new Error(
        `Stock insufficiente per ${product.name}: disponibili ${product.stock}, richiesti ${item.quantity}`
      )
    }
  }
}

export function computeSubtotal(
  items: CheckoutItem[],
  productMap: Map<string, { price: number }>
): number {
  return items.reduce((acc, item) => {
    const product = productMap.get(item.productId)!
    return acc + product.price * item.quantity
  }, 0)
}
