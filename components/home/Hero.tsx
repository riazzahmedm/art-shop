'use client'
import { useRef } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { AnimatedText } from '@/components/ui/AnimatedText'
import { useParallax } from '@/hooks/useParallax'

export function Hero() {
  const blobRef = useRef<HTMLDivElement>(null)
  const blobY = useParallax(blobRef, [0, -60])

  return (
    <section className="min-h-[90vh] flex flex-col justify-center px-4 max-w-6xl mx-auto relative overflow-hidden">
      {/* Parallax blob */}
      <motion.div
        ref={blobRef}
        style={{ y: blobY }}
        className="absolute right-0 top-1/2 -translate-y-1/2 w-[60vw] max-w-[500px] aspect-square rounded-full bg-accent/5 blur-3xl pointer-events-none"
      />

      <motion.p
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="font-body text-muted text-sm uppercase tracking-widest mb-4"
      >
        Digital art by riaz
      </motion.p>

      {/* Line-by-line headline */}
      <h1 className="font-display font-extrabold text-[min(15vw,7rem)] leading-none tracking-tight mb-6">
        <AnimatedText text="Bold." delay={0.2} />
        <AnimatedText
          text="Graphic."
          className="text-accent"
          delay={0.32}
        />
        <AnimatedText text="Yours." delay={0.44} />
      </h1>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.65 }}
        className="font-body text-muted max-w-md text-base md:text-lg mb-10"
      >
        Stickers and posters that actually say something. Print-ready art for your walls, laptop, and life.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="flex flex-wrap gap-4"
      >
        <Link
          href="/shop"
          data-magnetic
          className="group font-display font-bold px-8 py-3 bg-accent text-chalk rounded-xl hover:opacity-90 transition-opacity inline-flex items-center gap-2"
        >
          Shop now
          <motion.span
            className="inline-block"
            initial={{ x: 0 }}
            whileHover={{ x: 4 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
          >
            →
          </motion.span>
        </Link>
        <Link
          href="/about"
          className="font-display font-bold px-8 py-3 border border-ink/20 dark:border-chalk/20 rounded-xl hover:border-accent hover:text-accent transition-colors"
        >
          About
        </Link>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="text-muted/40 text-2xl select-none"
        >
          ↓
        </motion.div>
      </motion.div>
    </section>
  )
}
