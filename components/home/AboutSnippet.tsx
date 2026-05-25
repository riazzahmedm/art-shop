'use client'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { AnimatedText } from '@/components/ui/AnimatedText'

export function AboutSnippet() {
  return (
    <section className="max-w-6xl mx-auto px-4 py-16 border-t border-ink/10 dark:border-chalk/10">
      <div className="grid md:grid-cols-2 gap-12 items-center">
        <div>
          <h2 className="font-display font-extrabold text-3xl md:text-5xl mb-4">
            <AnimatedText text="The artist" />
          </h2>
          <p className="font-body text-muted leading-relaxed mb-6">
            <AnimatedText
              text="Based somewhere interesting. Making things that feel like a punch in the eye (in a good way). Each piece is designed to look great on your wall, your laptop, or wherever."
              delay={0.2}
              stagger={0.03}
            />
          </p>
          <motion.div
            whileHover={{ x: 4 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            className="inline-block"
          >
            <Link
              href="/about"
              className="font-display font-bold text-sm border-b border-accent text-accent pb-0.5 hover:opacity-70 transition-opacity"
            >
              More about riaz →
            </Link>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          whileHover={{ scale: 1.02 }}
          className="aspect-square rounded-2xl bg-ink/5 dark:bg-chalk/5 flex items-center justify-center transition-all"
        >
          <span className="font-display font-extrabold text-8xl text-ink/10 dark:text-chalk/10 select-none">r.</span>
        </motion.div>
      </div>
    </section>
  )
}
