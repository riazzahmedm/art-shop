'use client'
import { useRef } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { getFeaturedProducts } from '@/lib/products'
import { ProductCard } from '@/components/shop/ProductCard'
import { AnimatedText } from '@/components/ui/AnimatedText'
import { useParallax } from '@/hooks/useParallax'

export function FeaturedProducts() {
  const featured = getFeaturedProducts()
  const sectionRef = useRef<HTMLDivElement>(null)
  const bgY = useParallax(sectionRef, [0, 30])

  return (
    <section ref={sectionRef} className="max-w-6xl mx-auto px-4 py-16 relative">
      {/* Parallax decorative bg circle */}
      <motion.div
        style={{ y: bgY }}
        className="absolute -left-32 top-0 w-[500px] aspect-square rounded-full bg-accent/5 blur-3xl pointer-events-none"
        aria-hidden
      />

      <div className="flex items-end justify-between mb-8 relative">
        <h2 className="font-display font-extrabold text-3xl md:text-5xl">
          <AnimatedText text="Featured" />
        </h2>
        <motion.div
          whileHover={{ x: 4 }}
          transition={{ type: 'spring', stiffness: 400, damping: 20 }}
        >
          <Link
            href="/shop"
            className="font-display font-bold text-sm hover:text-accent transition-colors"
          >
            View all →
          </Link>
        </motion.div>
      </div>

      <motion.div
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
        variants={{
          hidden: {},
          visible: { transition: { staggerChildren: 0.1 } },
        }}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-10%' }}
      >
        {featured.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </motion.div>
    </section>
  )
}
