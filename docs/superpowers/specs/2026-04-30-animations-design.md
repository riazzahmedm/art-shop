# riaz.art Animation System Design

**Date:** 2026-04-30
**Status:** Approved

## Overview

Add a cohesive, bold animation system to riaz.art: a magnetic blob custom cursor, parallax scroll depth on all major sections, staggered word-by-word text reveals, and creative hover animations. All built on Framer Motion (already installed). Mobile-safe — cursor hidden on touch devices, parallax reduced on `prefers-reduced-motion`.

---

## Architecture

### New files

| File | Responsibility |
|------|---------------|
| `components/ui/CustomCursor.tsx` | Global magnetic blob cursor — mounts in layout, hidden on touch |
| `components/ui/AnimatedText.tsx` | Splits text into words/lines, staggers each in with `whileInView` |
| `hooks/useParallax.ts` | `useScroll` + `useTransform` utility — returns a motion value for Y offset |

### Modified files

| File | Change |
|------|--------|
| `app/layout.tsx` | Mount `<CustomCursor />`, add `cursor-none` to `<body>` |
| `app/globals.css` | Add `cursor: none` on body, restore on touch via media query |
| `components/home/Hero.tsx` | Parallax blob, line-by-line headline via `AnimatedText` |
| `components/home/FeaturedProducts.tsx` | Animated heading, decorative bg circle with parallax, staggered card grid |
| `components/home/AboutSnippet.tsx` | Word-by-word heading + paragraph via `AnimatedText` |
| `components/home/MarqueeBanner.tsx` | Vertical parallax drift on scroll |
| `components/shop/ProductCard.tsx` | Enhanced hover (lift, image zoom, accent overlay) |
| `components/layout/Navbar.tsx` | Underline-slide hover on nav links |

---

## Custom Cursor — Magnetic Blob

### Behaviour

- A `40×40px` soft circle, accent colour (`bg-accent/40`), `blur-sm`, `rounded-full`, `pointer-events-none`.
- Follows mouse via two `useSpring` motion values (`x`, `y`) — stiffness `500`, damping `28` for smooth lag.
- **Default state:** 40px diameter, opacity 0.3.
- **Hover state** (any `button`, `a`, `[data-magnetic]`): expands to `80px`, opacity `0.5`, `scale(1.2)`. Achieved by listening to `mouseenter`/`mouseleave` on the document.
- **Click state:** momentary `scale(0.85)` squeeze on `mousedown`.
- Renders `null` if `window.matchMedia('(pointer: coarse)').matches` (touch device).
- Mounted once in `app/layout.tsx` at the top of `<body>`.

### CSS

`body { cursor: none; }` in `globals.css`.
`@media (pointer: coarse) { body { cursor: auto; } }` restores cursor on touch.

---

## `AnimatedText` Component

### Props

```ts
type Props = {
  text: string          // the string to animate
  el?: 'h1'|'h2'|'h3'|'p'|'span'  // wrapper element, default 'span'
  className?: string
  wordClassName?: string
  delay?: number        // initial delay before stagger starts, default 0
  stagger?: number      // per-word delay, default 0.06
}
```

### Animation

Each word is wrapped in an overflow-hidden `<span>` and animated:
- `initial`: `{ y: 60, opacity: 0, rotateX: 20 }`
- `animate`: `{ y: 0, opacity: 1, rotateX: 0 }`
- `transition`: `{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }` (custom ease — fast out)
- Triggered by `whileInView` with `once: true`, `viewport: { margin: '-10%' }`
- Stagger via `variants` on the container with `staggerChildren`

### Usage

```tsx
<AnimatedText el="h2" text="Featured" className="font-display font-extrabold text-5xl" />
```

---

## `useParallax` Hook

```ts
function useParallax(
  ref: RefObject<HTMLElement>,
  outputRange: [number, number]   // e.g. [0, -60] means element moves up 60px over scroll
): MotionValue<number>
```

Uses `useScroll({ target: ref, offset: ['start end', 'end start'] })` scoped to the element, then `useTransform` to map `[0, 1]` scroll progress to `outputRange`. Returns a `MotionValue<number>` used as `style={{ y }}` on a `motion.div`.

Respects `prefers-reduced-motion` — returns a static `0` motion value when reduced motion is preferred.

---

## Parallax Per Section

### Hero — background blob

The existing `bg-accent/5 blur-3xl` decorative circle gets a `ref` and `useParallax(ref, [0, -60])`. As the user scrolls out of the hero, the blob drifts upward 60px independently of the content — creates a floating depth effect.

### MarqueeBanner

Wrap the outer `div` in a `motion.div` with `useParallax(ref, [0, -20])`. The entire banner drifts up slightly as the page scrolls past it.

### FeaturedProducts — decorative circle

Add a new absolutely-positioned `div` (large, blurred accent circle, `opacity-5`, `pointer-events-none`) behind the section. Apply `useParallax(ref, [0, 30])` — it drifts **down** 30px (slower than the page), giving the section a layered background feel.

### ProductCards — scroll depth

Each `ProductCard` gets `useParallax(ref, [15, -15])` applied to the card's `motion.article` — it starts 15px lower and rises to −15px as it scrolls through. Combined with stagger timing this gives the grid a cascading, 3D depth feel.

---

## Text Animations Per Section

| Section | Element | Mode |
|---------|---------|------|
| Hero | `"Bold."`, `"Graphic."`, `"Yours."` | Line-by-line (each line is one `AnimatedText`) |
| Hero | Subtitle paragraph | Full string, word-by-word |
| FeaturedProducts | `"Featured"` heading | Word-by-word |
| AboutSnippet | `"The artist"` heading | Word-by-word |
| AboutSnippet | Body paragraph | Word-by-word, `delay: 0.2` |
| Shop page | `"Shop"` heading | Word-by-word |

The hero headline currently uses `motion.h1` with `animate`. Replace with three separate `AnimatedText el="span"` instances (one per line), each in a block `<div>`, with staggered `delay` (0, 0.1, 0.2).

---

## Hover Animations

### ProductCard

- Card: already has `whileHover={{ y: -4 }}` — increase to `y: -8`
- Image area: on hover, `scale(1.05)` on the inner image div (CSS transition `duration-500`)
- Accent overlay: already has `opacity-0 → opacity-100` on hover — change colour to `bg-accent/10` and add `backdrop-blur-[1px]`

### CTA / Primary buttons (`"Shop now"`, `"Place order"`)

- Wrap button text + a `→` arrow in a `motion.span`
- On hover: arrow translates `x: 4px`
- Button: `whileHover={{ scale: 1.03 }}`, `whileTap={{ scale: 0.97 }}`

### Navbar links

Replace plain `<a>` / `<Link>` with a wrapper that has:
- An absolutely-positioned underline `span` behind the text
- CSS: `scaleX: 0 → 1`, `transform-origin: left`, `transition: transform 300ms ease`
- On hover the underline slides in from left; on leave it slides out to the right (`transform-origin: right`)
- Accent colour underline, `height: 2px`

### "View all →" and text links

- `whileHover` shifts the entire link `x: 4px` with a `transition: { type: 'spring', stiffness: 400, damping: 20 }`
- Arrow character gets a separate `motion.span` with `x: 0 → 8px` on parent hover

### Add to cart button

- `whileHover` adds a subtle magnetic shift: `y: -2, scale: 1.04`
- Existing `whileTap={{ scale: 0.93 }}` stays

---

## Reduced Motion

`useParallax` returns a static `MotionValue(0)` when `prefers-reduced-motion: reduce`.
`AnimatedText` sets `initial` and `animate` to the same visible state (no offset, opacity 1) when reduced motion is preferred — text appears instantly.
`CustomCursor` still renders but with no spring lag (instant follow) and no scale transitions.

---

## Out of Scope

- Page transition animations (route changes)
- 3D transforms beyond subtle `rotateX` on text
- Canvas or WebGL effects
- Scroll-jacking or overriding native scroll behaviour
- Animation on checkout / orders / admin pages
