'use client'
import { motion, AnimatePresence } from 'framer-motion'
import { useKonamiCode, useSecretTyping } from '@/lib/easter-eggs'

export function EasterEggs() {
  const konami = useKonamiCode()
  const secret = useSecretTyping('riaz')

  return (
    <>
      <AnimatePresence>
        {konami && (
          <motion.div
            key="konami"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className="fixed inset-0 z-[999] flex items-center justify-center pointer-events-none"
          >
            <div className="bg-accent text-chalk font-display font-bold text-4xl px-10 py-6 rounded-2xl rotate-[-3deg] shadow-2xl">
              ↑↑↓↓←→←→BA — you found it 👾
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {secret && (
          <motion.div
            key="secret"
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[999] pointer-events-none"
          >
            <div className="bg-ink dark:bg-chalk text-chalk dark:text-ink font-display font-bold text-xl px-6 py-3 rounded-full shadow-xl">
              hey, that's my name 👋
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
