'use client'
import { motion } from 'framer-motion'
import { CategoryFilter as Category } from '@/lib/products'

export function CategoryFilter({ active, onChange }: { active: Category; onChange: (c: Category) => void }) {
  const options: { label: string; value: Category }[] = [
    { label: 'All', value: 'all' },
    { label: 'Stickers', value: 'sticker' },
    { label: 'Posters', value: 'poster' },
  ]

  return (
    <div className="flex gap-2 flex-wrap">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={`relative font-display font-bold text-sm px-5 py-2 rounded-full border transition-colors ${
            active === opt.value
              ? 'border-accent text-accent'
              : 'border-ink/20 dark:border-chalk/20 hover:border-accent hover:text-accent'
          }`}
        >
          {active === opt.value && (
            <motion.span
              layoutId="filter-pill"
              className="absolute inset-0 bg-accent/10 rounded-full"
            />
          )}
          <span className="relative">{opt.label}</span>
        </button>
      ))}
    </div>
  )
}
