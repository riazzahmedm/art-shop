'use client'
import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { Product } from '@/lib/products'
import { useCart } from '@/components/providers/CartProvider'
import { useParallax } from '@/hooks/useParallax'

export function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart()
  const [selectedSize, setSelectedSize] = useState(product.sizes[0])
  const [added, setAdded] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const y = useParallax(ref, [15, -15])

  function handleAdd() {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      size: selectedSize,
    })
    setAdded(true)
    setTimeout(() => setAdded(false), 1200)
  }

  return (
    <motion.article
      ref={ref}
      style={{ y }}
      variants={{
        hidden: { opacity: 0, y: 24 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
      }}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-40px' }}
      whileHover={{ y: -8 }}
      className="group flex flex-col bg-chalk dark:bg-ink border border-ink/10 dark:border-chalk/10 rounded-2xl overflow-hidden"
    >
      <div className="aspect-square bg-ink/5 dark:bg-chalk/5 relative overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center text-muted/30 font-display font-bold text-6xl select-none transition-transform duration-500 group-hover:scale-105">
          art
        </div>
        <div className="absolute inset-0 bg-accent/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      <div className="p-4 flex flex-col flex-1 gap-3">
        <div>
          <h3 className="font-display font-bold text-base">{product.name}</h3>
          <p className="text-muted text-xs mt-1 line-clamp-2">{product.description}</p>
        </div>

        {product.sizes.length > 1 && (
          <div className="flex flex-wrap gap-1.5">
            {product.sizes.map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => setSelectedSize(size)}
                className={`text-xs px-2 py-0.5 rounded border transition-colors ${
                  selectedSize === size
                    ? 'border-accent text-accent bg-accent/10'
                    : 'border-ink/20 dark:border-chalk/20 hover:border-accent hover:text-accent'
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between mt-auto">
          <span className="font-display font-bold text-lg">£{product.price.toFixed(2)}</span>
          <motion.button
            type="button"
            onClick={handleAdd}
            disabled={added}
            whileHover={{ scale: 1.04, y: -2 }}
            whileTap={{ scale: 0.93 }}
            data-magnetic
            className={`font-display font-bold text-sm px-4 py-2 rounded-xl transition-colors ${
              added
                ? 'bg-accent text-chalk'
                : 'bg-ink text-chalk dark:bg-chalk dark:text-ink hover:bg-accent dark:hover:bg-accent dark:hover:text-chalk'
            }`}
          >
            {added ? 'Added ✓' : 'Add to cart'}
          </motion.button>
        </div>
      </div>
    </motion.article>
  )
}
