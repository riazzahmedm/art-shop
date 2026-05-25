'use client'
import { motion } from 'framer-motion'
import { useCart } from '@/components/providers/CartProvider'

export function CartButton({ onClick }: { onClick: () => void }) {
  const { count } = useCart()
  return (
    <motion.button
      onClick={onClick}
      whileTap={{ scale: 0.9 }}
      className="relative w-8 h-8 flex items-center justify-center hover:text-accent transition-colors"
      aria-label="Open cart"
    >
      <span className="text-lg">🛍</span>
      {count > 0 && (
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -top-1 -right-1 w-4 h-4 bg-accent text-chalk text-[10px] font-bold rounded-full flex items-center justify-center"
        >
          {count}
        </motion.span>
      )}
    </motion.button>
  )
}
