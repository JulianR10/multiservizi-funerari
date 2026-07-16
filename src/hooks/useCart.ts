"use client"

import { useEffect, useState } from "react"
import { create } from "zustand"
import { persist } from "zustand/middleware"

export type CartItem = {
  productId: string
  name: string
  price: number
  image: string
  slug: string
  quantity: number
  stock: number
}

type CartStore = {
  items: CartItem[]
  openSlideOver: boolean
  setSlideOver: (open: boolean) => void
  addItem: (product: Omit<CartItem, "quantity">, quantity?: number) => void
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  syncProductData: (products: { id: string; name: string; price: number; images: string[]; slug: string; stock: number }[]) => void
  totalPrice: () => number
  _hydrated: boolean
  _setHydrated: () => void
}

export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      openSlideOver: false,
      _hydrated: false,
      _setHydrated: () => set({ _hydrated: true }),

      setSlideOver: (open) => set({ openSlideOver: open }),

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
          set({ items: get().items.filter((i) => i.productId !== productId) })
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
                stock: product.stock,
              }
            }
            return item
          }),
        })
      },

      totalPrice: () => get().items.reduce((acc, item) => acc + item.price * item.quantity, 0),
    }),
    {
      name: "cart-storage",
      onRehydrateStorage: () => () => {
        useCart.getState()._setHydrated()
      },
    }
  )
)

export function useHydratedCart() {
  const items = useCart((s) => s.items)
  const totalPrice = useCart((s) => s.totalPrice)
  const openSlideOver = useCart((s) => s.openSlideOver)
  const setSlideOver = useCart((s) => s.setSlideOver)
  const addItem = useCart((s) => s.addItem)
  const removeItem = useCart((s) => s.removeItem)
  const updateQuantity = useCart((s) => s.updateQuantity)
  const clearCart = useCart((s) => s.clearCart)
  const syncProductData = useCart((s) => s.syncProductData)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    setHydrated(useCart.getState()._hydrated)
    const unsub = useCart.subscribe((s) => {
      if (s._hydrated) setHydrated(true)
    })
    return unsub
  }, [])

  return {
    items,
    totalPrice,
    openSlideOver,
    setSlideOver,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    syncProductData,
    hydrated,
  }
}
