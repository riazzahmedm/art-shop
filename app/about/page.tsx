'use client'
import { motion } from 'framer-motion'
import Link from 'next/link'

export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="font-display font-extrabold text-5xl md:text-7xl leading-none tracking-tight mb-8">
          About
        </h1>

        <div className="aspect-video rounded-2xl bg-ink/5 dark:bg-chalk/5 mb-10 flex items-center justify-center">
          <span className="font-display font-extrabold text-9xl text-ink/10 dark:text-chalk/10 select-none">r.</span>
        </div>

        <div className="space-y-6 font-body text-lg leading-relaxed text-muted">
          <p>
            Hey — I'm <span className="text-ink dark:text-chalk font-medium">riaz</span>. I make bold, graphic digital art that is designed to be printed and lived with.
          </p>
          <p>
            Everything in the shop is available as a sticker or poster in A6, A5, or A4. All pieces are ready to print at home or at your local print shop.
          </p>
          <p>
            More products coming — tshirts, tote bags, badges. Stay tuned.
          </p>
        </div>

        <div className="mt-12 pt-8 border-t border-ink/10 dark:border-chalk/10 flex gap-6 flex-wrap">
          <Link href="/shop" className="font-display font-bold text-accent border-b border-accent pb-0.5 hover:opacity-70 transition-opacity">
            Browse the shop →
          </Link>
        </div>
      </motion.div>
    </div>
  )
}
