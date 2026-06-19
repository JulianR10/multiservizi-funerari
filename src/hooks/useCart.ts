"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"

export type CartItem = {
  productId: string
  name: string
  price: number
  image: string
  slug: string
  quantity: number
}

type CartStore = {
  items: CartItem[]
  addItem: (product: Omit<CartItem, "quantity">, quantity?: number) => void
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  syncProductData: (products: { id: string; name: string; price: number; images: string[]; slug: string }[]) => void
  totalPrice: () => number
}

export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (product, quantity = 1) => {
        const items = get().items
        const existing = items.find((item) => item.productId === product.productId)

        if (existing) {
          set({
            items: items.map((item) =>
              item.productId === product.productId
                ? { ...item, quantity: item.quantity + quantity }
                : item
            ),
          })
        } else {
          set({ items: [...items, { ...product, quantity }] })
        }
      },

      removeItem: (productId) => {
        set({ items: get().items.filter((item) => item.productId !== productId) })
      },

      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId)
          return
        }
        set({
          items: get().items.map((item) =>
            item.productId === productId ? { ...item, quantity } : item
          ),
        })
      },

      clearCart: () => set({ items: [] }),

      syncProductData: (products) => {
        const items = get().items
        set({
          items: items.map((item) => {
            const product = products.find((p) => p.id === item.productId)
            if (product) {
              return {
                ...item,
                name: product.name,
                price: product.price,
                image: product.images[0] || "",
                slug: product.slug,
              }
            }
            return item
          }),
        })
      },

      totalPrice: () => get().items.reduce((acc, item) => acc + item.price * item.quantity, 0),
    }),
    { name: "cart-storage" }
  )
)
