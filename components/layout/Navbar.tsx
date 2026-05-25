'use client'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useState } from 'react'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { CartButton } from '@/components/ui/CartButton'
import { CartDrawer } from '@/components/ui/CartDrawer'

export function Navbar() {
  const [cartOpen, setCartOpen] = useState(false)

  return (
    <>
      <motion.header
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="sticky top-0 z-50 w-full border-b border-ink/10 dark:border-chalk/10 bg-chalk/80 dark:bg-ink/80 backdrop-blur-sm"
      >
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="font-display font-extrabold text-xl tracking-tight hover:text-accent transition-colors">
            riaz.art
          </Link>

          <nav className="hidden md:flex items-center gap-6 font-body text-sm font-medium">
            {['Shop', 'About'].map((label) => (
              <Link
                key={label}
                href={`/${label.toLowerCase()}`}
                className="relative group hover:text-accent transition-colors"
              >
                {label}
                <span className="absolute -bottom-0.5 left-0 h-[2px] w-full bg-accent scale-x-0 origin-left group-hover:scale-x-100 transition-transform duration-300 ease-out" />
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <CartButton onClick={() => setCartOpen(true)} />
          </div>
        </div>
      </motion.header>

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  )
}
