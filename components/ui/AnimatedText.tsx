'use client'
import { motion } from 'framer-motion'

type Props = {
  text: string
  className?: string
  wordClassName?: string
  delay?: number
  stagger?: number
}

const ease = [0.22, 1, 0.36, 1] as const

export function AnimatedText({
  text,
  className,
  wordClassName,
  delay = 0,
  stagger = 0.06,
}: Props) {
  const words = text.split(' ')

  const container = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: stagger,
        delayChildren: delay,
      },
    },
  }

  const wordVariant = {
    hidden: { y: 60, opacity: 0, rotateX: 20 },
    visible: {
      y: 0,
      opacity: 1,
      rotateX: 0,
      transition: { duration: 0.5, ease },
    },
  }

  return (
    <motion.span
      className={className}
      style={{ display: 'block', perspective: 1000 }}
      variants={container}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-10%' }}
    >
      {words.map((w, i) => (
        <span
          key={i}
          style={{ display: 'inline-block', overflow: 'hidden', marginRight: '0.25em' }}
        >
          <motion.span
            style={{ display: 'inline-block' }}
            className={wordClassName}
            variants={wordVariant}
          >
            {w}
          </motion.span>
        </span>
      ))}
    </motion.span>
  )
}
