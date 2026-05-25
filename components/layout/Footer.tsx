'use client'
import Link from 'next/link'
import { useState } from 'react'
import { motion } from 'framer-motion'

export function Footer() {
  const [clicks, setClicks] = useState(0)
  const unlocked = clicks >= 7

  return (
    <footer className="border-t border-ink/10 dark:border-chalk/10 py-8 mt-16">
      <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4 text-sm font-body text-muted">
        <button
          type="button"
          onClick={() => setClicks((c) => (c >= 7 ? c : c + 1))}
          className="font-display font-extrabold text-base text-ink dark:text-chalk hover:text-accent transition-colors select-none"
        >
          riaz.art
        </button>

        <nav className="flex gap-6">
          <Link href="/shop" className="hover:text-accent transition-colors">Shop</Link>
          <Link href="/about" className="hover:text-accent transition-colors">About</Link>
        </nav>

        <p className="text-xs text-muted/60">
          {unlocked ? (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-accent font-bold"
            >
              you clicked the footer 7 times. legend.
            </motion.span>
          ) : (
            `© ${new Date().getFullYear()} riaz.art`
          )}
        </p>
      </div>
    </footer>
  )
}
