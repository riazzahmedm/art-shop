'use client'
import { useEffect, useState } from 'react'
import { useScroll, useTransform, useSpring, useMotionValue, type MotionValue } from 'framer-motion'
import type { RefObject } from 'react'

export function useParallax(
  ref: RefObject<HTMLElement | null>,
  outputRange: [number, number],
): MotionValue<number> {
  const fallback = useMotionValue(0)
  const [reducedMotion, setReducedMotion] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReducedMotion(mq.matches)
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  // Bidirectional: offset: ['start end', 'end start'] covers full scroll range
  // in both directions — scrolling up decreases progress, parallax reverses naturally
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  })

  const raw = useTransform(scrollYProgress, [0, 1], outputRange)

  // Spring wrapper for silky smoothness in both scroll directions
  const smoothed = useSpring(raw, {
    stiffness: 60,
    damping: 20,
    mass: 0.3,
  })

  return reducedMotion ? fallback : smoothed
}
