'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { products, CategoryFilter as CategoryFilterType } from '@/lib/products'
import { ProductGrid } from '@/components/shop/ProductGrid'
import { CategoryFilter } from '@/components/shop/CategoryFilter'
import { AnimatedText } from '@/components/ui/AnimatedText'

export default function ShopPage() {
  const [category, setCategory] = useState<CategoryFilterType>('all')

  const filtered = category === 'all'
    ? products
    : products.filter((p) => p.category === category)

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="mb-10">
        <h1 className="font-display font-extrabold text-5xl md:text-7xl leading-none tracking-tight mb-4">
          <AnimatedText text="Shop" delay={0.1} />
        </h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-muted font-body"
        >
          Bold graphics. Print-ready. Ships worldwide.
        </motion.p>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="mb-8"
      >
        <CategoryFilter active={category} onChange={setCategory} />
      </motion.div>

      <ProductGrid products={filtered} />
    </div>
  )
}
