'use client'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { useCart } from '@/components/providers/CartProvider'

export function CartDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { items, removeItem, clear, total } = useCart()

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-ink/40 dark:bg-chalk/10 backdrop-blur-sm"
          />
          <motion.aside
            key="drawer"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed right-0 top-0 h-full w-80 z-[51] bg-chalk dark:bg-ink border-l border-ink/10 dark:border-chalk/10 flex flex-col p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display font-bold text-2xl">Cart</h2>
              <button onClick={onClose} className="text-2xl hover:text-accent transition-colors" aria-label="Close">×</button>
            </div>

            {items.length === 0 ? (
              <p className="text-muted font-body text-sm mt-4">Your cart is empty.<br />Go fill it with art.</p>
            ) : (
              <>
                <ul className="flex-1 overflow-y-auto space-y-4">
                  {items.map((item) => (
                    <li key={`${item.id}-${item.size}`} className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-muted/20 rounded flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="font-display font-bold text-sm truncate">{item.name}</p>
                        <p className="text-muted text-xs">{item.size} · qty {item.qty}</p>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span className="font-body font-medium text-sm">£{(item.price * item.qty).toFixed(2)}</span>
                        <button
                          onClick={() => removeItem(item.id, item.size)}
                          className="text-muted hover:text-accent text-xs transition-colors"
                        >
                          remove
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
                <div className="pt-4 border-t border-ink/10 dark:border-chalk/10 space-y-3">
                  <div className="flex justify-between font-display font-bold text-lg">
                    <span>Total</span>
                    <span>£{total.toFixed(2)}</span>
                  </div>
                  <Link
                    href="/checkout"
                    onClick={onClose}
                    className="block w-full bg-accent text-chalk font-display font-bold py-3 rounded-xl hover:opacity-90 transition-opacity text-center"
                  >
                    Checkout →
                  </Link>
                  <button type="button" onClick={clear} className="w-full text-muted text-sm hover:text-accent transition-colors">
                    Clear cart
                  </button>
                </div>
              </>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}
