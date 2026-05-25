'use client'
import { createContext, useContext, useState, ReactNode } from 'react'

type CartItem = {
  id: string
  name: string
  price: number
  image: string
  size: string
  qty: number
}

type CartInput = Omit<CartItem, 'qty'>

type CartCtx = {
  items: CartItem[]
  addItem: (item: CartInput) => void
  removeItem: (id: string, size: string) => void
  clear: () => void
  total: number
  count: number
}

const CartContext = createContext<CartCtx | null>(null)

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])

  function addItem(input: CartInput) {
    setItems((prev) => {
      const existing = prev.find((i) => i.id === input.id && i.size === input.size)
      if (existing) return prev.map((i) => i.id === input.id && i.size === input.size ? { ...i, qty: i.qty + 1 } : i)
      return [...prev, { ...input, qty: 1 }]
    })
  }

  function removeItem(id: string, size: string) {
    setItems((prev) => prev.filter((i) => !(i.id === id && i.size === size)))
  }

  function clear() {
    setItems([])
  }

  const total = items.reduce((sum, i) => sum + i.price * i.qty, 0)
  const count = items.reduce((sum, i) => sum + i.qty, 0)

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, clear, total, count }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart(): CartCtx {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used inside CartProvider')
  return ctx
}
