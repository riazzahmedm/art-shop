'use client'
import { useEffect, useState } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'

export function CustomCursor() {
  const [isTouch, setIsTouch] = useState(true)
  const [hovered, setHovered] = useState(false)
  const [clicked, setClicked] = useState(false)

  // Dot — instant follow
  const dotX = useMotionValue(-100)
  const dotY = useMotionValue(-100)

  // Ring — lazy spring trail
  const ringX = useSpring(dotX, { stiffness: 120, damping: 18, mass: 0.5 })
  const ringY = useSpring(dotY, { stiffness: 120, damping: 18, mass: 0.5 })

  useEffect(() => {
    if (window.matchMedia('(pointer: coarse)').matches) return
    setIsTouch(false)

    const onMove = (e: MouseEvent) => {
      dotX.set(e.clientX)
      dotY.set(e.clientY)
    }

    const isInteractive = (t: EventTarget | null) =>
      (t as HTMLElement)?.closest('button, a, [data-magnetic], input, textarea, select') !== null

    const onOver = (e: MouseEvent) => { if (isInteractive(e.target)) setHovered(true) }
    const onOut  = (e: MouseEvent) => { if (isInteractive(e.target)) setHovered(false) }
    const onDown = () => setClicked(true)
    const onUp   = () => setClicked(false)

    window.addEventListener('mousemove', onMove)
    document.addEventListener('mouseover', onOver)
    document.addEventListener('mouseout', onOut)
    window.addEventListener('mousedown', onDown)
    window.addEventListener('mouseup', onUp)

    return () => {
      window.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseover', onOver)
      document.removeEventListener('mouseout', onOut)
      window.removeEventListener('mousedown', onDown)
      window.removeEventListener('mouseup', onUp)
    }
  }, [dotX, dotY])

  if (isTouch) return null

  return (
    <>
      {/* Dot — snaps to cursor instantly */}
      <motion.div
        className="fixed top-0 left-0 rounded-full bg-accent pointer-events-none z-[9999]"
        style={{ x: dotX, y: dotY, translateX: '-50%', translateY: '-50%' }}
        animate={{
          width:   clicked ? 6  : hovered ? 0  : 8,
          height:  clicked ? 6  : hovered ? 0  : 8,
          opacity: clicked ? 0.6 : hovered ? 0 : 1,
        }}
        transition={{ duration: 0.15 }}
      />

      {/* Ring — trails behind with spring */}
      <motion.div
        className="fixed top-0 left-0 rounded-full pointer-events-none z-[9998] border-2 border-accent"
        style={{ x: ringX, y: ringY, translateX: '-50%', translateY: '-50%' }}
        animate={{
          width:   clicked ? 24 : hovered ? 48 : 32,
          height:  clicked ? 36 : hovered ? 28 : 32,
          opacity: clicked ? 0.9 : hovered ? 0.7 : 0.5,
          rotate:  hovered ? 45 : 0,
          backgroundColor: hovered ? 'rgba(155, 127, 232, 0.12)' : 'transparent',
          borderRadius: hovered ? '40%' : '50%',
        }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
      />
    </>
  )
}
