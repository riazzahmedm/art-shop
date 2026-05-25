'use client'
import { useEffect, useRef } from 'react'

const SPACING       = 32   // grid spacing in px
const VISIBLE_RADIUS = 100  // dots only appear within this distance of cursor
const RADIUS        = 100  // influence radius for displacement (matches visible)
const STRENGTH      = 20   // max displacement in px
const EASE          = 0.08 // lerp factor back to home (lower = springier)
const DOT_SIZE      = 1.5  // resting dot radius
const ACCENT        = { r: 255, g: 255, b: 0 }    // neon yellow

interface Node {
  homeX: number
  homeY: number
  x: number
  y: number
  vx: number
  vy: number
}

export function CursorGrid() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (window.matchMedia('(pointer: coarse)').matches) return

    const canvas = canvasRef.current!
    const ctx = canvas.getContext('2d')!
    let nodes: Node[] = []
    let mouse = { x: -9999, y: -9999 }
    let raf: number
    let isDark = document.documentElement.classList.contains('dark')

    // Observe theme changes
    const observer = new MutationObserver(() => {
      isDark = document.documentElement.classList.contains('dark')
    })
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })

    function buildGrid() {
      canvas.width  = window.innerWidth
      canvas.height = window.innerHeight
      nodes = []
      const cols = Math.ceil(canvas.width  / SPACING) + 1
      const rows = Math.ceil(canvas.height / SPACING) + 1
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const hx = c * SPACING
          const hy = r * SPACING
          nodes.push({ homeX: hx, homeY: hy, x: hx, y: hy, vx: 0, vy: 0 })
        }
      }
    }

    buildGrid()
    window.addEventListener('resize', buildGrid)

    const onMove = (e: MouseEvent) => { mouse = { x: e.clientX, y: e.clientY } }
    const onLeave = () => { mouse = { x: -9999, y: -9999 } }
    window.addEventListener('mousemove', onMove)
    document.addEventListener('mouseleave', onLeave)

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      for (const n of nodes) {
        const dx = mouse.x - n.homeX
        const dy = mouse.y - n.homeY
        const dist = Math.sqrt(dx * dx + dy * dy)

        // Only animate nodes that are — or recently were — near the cursor
        const near = dist < VISIBLE_RADIUS
        let targetX = n.homeX
        let targetY = n.homeY

        if (near && dist > 0) {
          // Pull strength falls off with distance (quadratic)
          const force = (1 - dist / RADIUS) ** 2 * STRENGTH
          targetX = n.homeX + (dx / dist) * force
          targetY = n.homeY + (dy / dist) * force
        }

        // Lerp toward target (also lerps back to home when cursor leaves)
        n.x += (targetX - n.x) * EASE
        n.y += (targetY - n.y) * EASE

        const disp = Math.sqrt((n.x - n.homeX) ** 2 + (n.y - n.homeY) ** 2)

        // Skip dots with negligible displacement that are outside visible radius
        if (!near && disp < 0.3) continue

        // Alpha: fades in with proximity, boosted further by displacement
        const proximity = near ? (1 - dist / VISIBLE_RADIUS) : 0
        const base = proximity * (isDark ? 0.45 : 0.30)
        const alpha = base + (disp / STRENGTH) * (isDark ? 0.55 : 0.40)
        const dotRadius = DOT_SIZE + (disp / STRENGTH) * 1.5

        ctx.beginPath()
        ctx.arc(n.x, n.y, dotRadius, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(${ACCENT.r}, ${ACCENT.g}, ${ACCENT.b}, ${Math.min(alpha, 0.9)})`
        ctx.fill()
      }

      raf = requestAnimationFrame(draw)
    }

    raf = requestAnimationFrame(draw)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', buildGrid)
      window.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseleave', onLeave)
      observer.disconnect()
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[9996]"
      aria-hidden
    />
  )
}
