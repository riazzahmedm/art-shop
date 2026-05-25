'use client'
import { useRef } from 'react'
import { motion } from 'framer-motion'
import { useParallax } from '@/hooks/useParallax'

export function MarqueeBanner() {
  const ref = useRef<HTMLDivElement>(null)
  const y = useParallax(ref, [0, -20])
  const text = 'STICKERS · POSTERS · BOLD ART · RIAZ.ART · '
  const repeated = text.repeat(6)

  return (
    <motion.div
      ref={ref}
      style={{ y }}
      className="my-8 -rotate-[3deg] scale-x-[1.1]"
    >
      <div className="bg-accent text-chalk overflow-hidden py-3">
        <div className="flex font-display font-extrabold text-sm tracking-widest">
          <span className="whitespace-nowrap animate-marquee">{repeated}</span>
          <span className="whitespace-nowrap animate-marquee" aria-hidden="true">{repeated}</span>
        </div>
      </div>
    </motion.div>
  )
}
