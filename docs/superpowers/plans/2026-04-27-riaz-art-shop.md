# riaz.art Shop Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build riaz.art — a bold, graphic, mobile-first digital art shop selling stickers and posters (A6/A5/A4) with dark/light theme, scroll animations, and easter eggs.

**Architecture:** Next.js 14 App Router static site with a product catalog driven by local TypeScript data. Theme switching via `next-themes`, animations via Framer Motion, no backend or payment integration in this phase — all product/cart state is client-side.

**Tech Stack:** Next.js 14 (App Router), TypeScript, Tailwind CSS v3, Framer Motion, next-themes, Google Fonts (Syne + DM Sans)

---

## File Map

```
art-shop/
├── app/
│   ├── layout.tsx              # Root layout: fonts, ThemeProvider, Navbar, Footer
│   ├── page.tsx                # Home: Hero + FeaturedProducts + AboutSnippet
│   ├── globals.css             # CSS variables, base styles, scrollbar
│   ├── shop/
│   │   └── page.tsx            # Full product catalog with category filter
│   └── about/
│       └── page.tsx            # Artist about page
├── components/
│   ├── layout/
│   │   ├── Navbar.tsx          # Logo, nav links, ThemeToggle, CartButton
│   │   └── Footer.tsx          # Links, tagline, hidden easter egg trigger
│   ├── home/
│   │   ├── Hero.tsx            # Full-viewport bold hero with scroll cue
│   │   ├── FeaturedProducts.tsx # 3-4 highlighted products
│   │   └── AboutSnippet.tsx    # Brief artist intro, links to /about
│   ├── shop/
│   │   ├── ProductCard.tsx     # Card: image, name, size, price, add-to-cart
│   │   ├── ProductGrid.tsx     # Responsive grid of ProductCards
│   │   └── CategoryFilter.tsx  # Filter tabs: All / Stickers / Posters
│   ├── ui/
│   │   ├── ThemeToggle.tsx     # Sun/moon icon button
│   │   ├── CartDrawer.tsx      # Slide-in cart with item list + clear
│   │   └── EasterEggs.tsx      # Konami code, logo tap, Ctrl+K secret
│   └── providers/
│       ├── ThemeProvider.tsx   # Wraps next-themes Provider
│       └── CartProvider.tsx    # Context: items, addItem, removeItem, clear
├── lib/
│   ├── products.ts             # Product data array + types
│   └── easter-eggs.ts          # Hook: useKonamiCode, useLogoTap, useSecretKey
├── public/
│   └── images/                 # Placeholder product images
├── tailwind.config.ts
├── next.config.ts
└── package.json
```

---

## Task 1: Project Bootstrap

**Files:**
- Create: `package.json`, `next.config.ts`, `tailwind.config.ts`, `tsconfig.json`, `app/globals.css`

- [ ] **Step 1: Scaffold Next.js project**

```bash
cd /Users/riazahmed/Documents/MVP/art-shop
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir=false --import-alias="@/*" --use-npm
```

When prompted, accept all defaults.

- [ ] **Step 2: Install dependencies**

```bash
npm install framer-motion next-themes
npm install --save-dev @testing-library/react @testing-library/user-event @testing-library/jest-dom jest jest-environment-jsdom @types/jest
```

- [ ] **Step 3: Configure jest**

Create `jest.config.ts`:

```ts
import type { Config } from 'jest'
import nextJest from 'next/jest.js'

const createJestConfig = nextJest({ dir: './' })

const config: Config = {
  coverageProvider: 'v8',
  testEnvironment: 'jsdom',
  setupFilesAfterEach: ['<rootDir>/jest.setup.ts'],
}

export default createJestConfig(config)
```

Create `jest.setup.ts`:

```ts
import '@testing-library/jest-dom'
```

- [ ] **Step 4: Replace `app/globals.css` with design tokens**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;700;800&family=DM+Sans:wght@400;500&display=swap');

:root {
  --font-display: 'Syne', sans-serif;
  --font-body: 'DM Sans', sans-serif;
}

html {
  scroll-behavior: smooth;
}

::-webkit-scrollbar {
  width: 6px;
}
::-webkit-scrollbar-track {
  background: transparent;
}
::-webkit-scrollbar-thumb {
  background: #555;
  border-radius: 3px;
}

.dark ::-webkit-scrollbar-thumb {
  background: #888;
}
```

- [ ] **Step 5: Update `tailwind.config.ts`**

```ts
import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './lib/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['Syne', 'sans-serif'],
        body: ['DM Sans', 'sans-serif'],
      },
      colors: {
        ink: '#0a0a0a',
        chalk: '#f5f5f0',
        accent: '#ff3c00',
        muted: '#888888',
      },
      animation: {
        'spin-slow': 'spin 8s linear infinite',
        'marquee': 'marquee 20s linear infinite',
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
    },
  },
  plugins: [],
}

export default config
```

- [ ] **Step 6: Commit**

```bash
git add .
git commit -m "feat: bootstrap Next.js project with Tailwind, Framer Motion, next-themes"
```

---

## Task 2: Product Data & Types

**Files:**
- Create: `lib/products.ts`
- Create: `lib/products.test.ts`

- [ ] **Step 1: Write failing tests**

Create `lib/products.test.ts`:

```ts
import { products, getProductsByCategory, getFeaturedProducts } from './products'

describe('products data', () => {
  it('has at least 6 products', () => {
    expect(products.length).toBeGreaterThanOrEqual(6)
  })

  it('every product has required fields', () => {
    products.forEach((p) => {
      expect(p.id).toBeTruthy()
      expect(p.name).toBeTruthy()
      expect(p.price).toBeGreaterThan(0)
      expect(['sticker', 'poster']).toContain(p.category)
    })
  })

  it('getProductsByCategory filters correctly', () => {
    const stickers = getProductsByCategory('sticker')
    expect(stickers.every((p) => p.category === 'sticker')).toBe(true)
  })

  it('getFeaturedProducts returns at most 4', () => {
    expect(getFeaturedProducts().length).toBeLessThanOrEqual(4)
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npx jest lib/products.test.ts --no-coverage
```

Expected: FAIL — `Cannot find module './products'`

- [ ] **Step 3: Create `lib/products.ts`**

```ts
export type ProductCategory = 'sticker' | 'poster'

export type Product = {
  id: string
  name: string
  description: string
  price: number
  category: ProductCategory
  sizes: string[]
  image: string
  featured?: boolean
  tags: string[]
}

export const products: Product[] = [
  {
    id: 'sticker-001',
    name: 'Electric Eye',
    description: 'Bold graphic sticker — die-cut, waterproof, permanent adhesive.',
    price: 3.5,
    category: 'sticker',
    sizes: ['7cm × 7cm'],
    image: '/images/electric-eye.jpg',
    featured: true,
    tags: ['graphic', 'eye', 'neon'],
  },
  {
    id: 'sticker-002',
    name: 'Glitch Face',
    description: 'Distorted portrait sticker. Makes your laptop look like it needs therapy.',
    price: 3.5,
    category: 'sticker',
    sizes: ['8cm × 10cm'],
    image: '/images/glitch-face.jpg',
    featured: true,
    tags: ['glitch', 'portrait'],
  },
  {
    id: 'sticker-003',
    name: 'Signal Noise',
    description: 'Static and signal collide in this abstract sticker.',
    price: 3.0,
    category: 'sticker',
    sizes: ['6cm × 6cm'],
    image: '/images/signal-noise.jpg',
    tags: ['abstract', 'noise'],
  },
  {
    id: 'poster-a6-001',
    name: 'Void Walker',
    description: 'A figure stepping into the unknown. Risograph-inspired print.',
    price: 8.0,
    category: 'poster',
    sizes: ['A6', 'A5', 'A4'],
    image: '/images/void-walker.jpg',
    featured: true,
    tags: ['figure', 'dark', 'risograph'],
  },
  {
    id: 'poster-a5-001',
    name: 'Grid Break',
    description: 'Geometric composition. Looks great framed.',
    price: 10.0,
    category: 'poster',
    sizes: ['A5', 'A4'],
    image: '/images/grid-break.jpg',
    featured: true,
    tags: ['geometric', 'grid'],
  },
  {
    id: 'poster-a4-001',
    name: 'Noise Portrait',
    description: 'High-contrast portrait made from pure noise.',
    price: 14.0,
    category: 'poster',
    sizes: ['A4'],
    image: '/images/noise-portrait.jpg',
    tags: ['portrait', 'noise', 'contrast'],
  },
]

export function getProductsByCategory(category: ProductCategory): Product[] {
  return products.filter((p) => p.category === category)
}

export function getFeaturedProducts(): Product[] {
  return products.filter((p) => p.featured).slice(0, 4)
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npx jest lib/products.test.ts --no-coverage
```

Expected: PASS (4 tests)

- [ ] **Step 5: Commit**

```bash
git add lib/products.ts lib/products.test.ts
git commit -m "feat: add product data, types, and filter utilities"
```

---

## Task 3: Cart Provider

**Files:**
- Create: `components/providers/CartProvider.tsx`
- Create: `components/providers/CartProvider.test.tsx`

- [ ] **Step 1: Write failing tests**

Create `components/providers/CartProvider.test.tsx`:

```tsx
import { render, screen, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CartProvider, useCart } from './CartProvider'

function TestConsumer() {
  const { items, addItem, removeItem, total } = useCart()
  return (
    <div>
      <span data-testid="count">{items.length}</span>
      <span data-testid="total">{total}</span>
      <button onClick={() => addItem({ id: 'p1', name: 'Test', price: 5, image: '', size: 'A4' })}>add</button>
      <button onClick={() => removeItem('p1', 'A4')}>remove</button>
    </div>
  )
}

describe('CartProvider', () => {
  it('starts empty', () => {
    render(<CartProvider><TestConsumer /></CartProvider>)
    expect(screen.getByTestId('count').textContent).toBe('0')
  })

  it('adds an item', async () => {
    render(<CartProvider><TestConsumer /></CartProvider>)
    await userEvent.click(screen.getByText('add'))
    expect(screen.getByTestId('count').textContent).toBe('1')
  })

  it('removes an item', async () => {
    render(<CartProvider><TestConsumer /></CartProvider>)
    await userEvent.click(screen.getByText('add'))
    await userEvent.click(screen.getByText('remove'))
    expect(screen.getByTestId('count').textContent).toBe('0')
  })

  it('calculates total correctly', async () => {
    render(<CartProvider><TestConsumer /></CartProvider>)
    await userEvent.click(screen.getByText('add'))
    expect(screen.getByTestId('total').textContent).toBe('5')
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npx jest CartProvider --no-coverage
```

Expected: FAIL — `Cannot find module './CartProvider'`

- [ ] **Step 3: Create `components/providers/CartProvider.tsx`**

```tsx
'use client'
import { createContext, useContext, useState, ReactNode } from 'react'

type CartItem = {
  id: string
  name: string
  price: number
  image: string
  size: string
  qty: number
}

type CartInput = Omit<CartItem, 'qty'>

type CartCtx = {
  items: CartItem[]
  addItem: (item: CartInput) => void
  removeItem: (id: string, size: string) => void
  clear: () => void
  total: number
  count: number
}

const CartContext = createContext<CartCtx | null>(null)

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])

  function addItem(input: CartInput) {
    setItems((prev) => {
      const existing = prev.find((i) => i.id === input.id && i.size === input.size)
      if (existing) return prev.map((i) => i.id === input.id && i.size === input.size ? { ...i, qty: i.qty + 1 } : i)
      return [...prev, { ...input, qty: 1 }]
    })
  }

  function removeItem(id: string, size: string) {
    setItems((prev) => prev.filter((i) => !(i.id === id && i.size === size)))
  }

  function clear() {
    setItems([])
  }

  const total = items.reduce((sum, i) => sum + i.price * i.qty, 0)
  const count = items.reduce((sum, i) => sum + i.qty, 0)

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, clear, total, count }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart(): CartCtx {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used inside CartProvider')
  return ctx
}
```

- [ ] **Step 4: Run tests**

```bash
npx jest CartProvider --no-coverage
```

Expected: PASS (4 tests)

- [ ] **Step 5: Commit**

```bash
git add components/providers/CartProvider.tsx components/providers/CartProvider.test.tsx
git commit -m "feat: add CartProvider with add/remove/clear and total"
```

---

## Task 4: Theme Provider & Toggle

**Files:**
- Create: `components/providers/ThemeProvider.tsx`
- Create: `components/ui/ThemeToggle.tsx`

- [ ] **Step 1: Create `components/providers/ThemeProvider.tsx`**

```tsx
'use client'
import { ThemeProvider as NextThemesProvider } from 'next-themes'
import { ReactNode } from 'react'

export function ThemeProvider({ children }: { children: ReactNode }) {
  return (
    <NextThemesProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      {children}
    </NextThemesProvider>
  )
}
```

- [ ] **Step 2: Create `components/ui/ThemeToggle.tsx`**

```tsx
'use client'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  if (!mounted) return <div className="w-8 h-8" />

  const isDark = theme === 'dark'

  return (
    <motion.button
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className="relative w-8 h-8 flex items-center justify-center rounded-full hover:bg-ink/10 dark:hover:bg-chalk/10 transition-colors"
      whileTap={{ scale: 0.85 }}
      aria-label="Toggle theme"
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={theme}
          initial={{ rotate: -90, opacity: 0 }}
          animate={{ rotate: 0, opacity: 1 }}
          exit={{ rotate: 90, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="text-lg select-none"
        >
          {isDark ? '☀️' : '🌑'}
        </motion.span>
      </AnimatePresence>
    </motion.button>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add components/providers/ThemeProvider.tsx components/ui/ThemeToggle.tsx
git commit -m "feat: add ThemeProvider and animated ThemeToggle"
```

---

## Task 5: Easter Egg Hooks

**Files:**
- Create: `lib/easter-eggs.ts`
- Create: `lib/easter-eggs.test.ts`
- Create: `components/ui/EasterEggs.tsx`

- [ ] **Step 1: Write failing tests for easter egg hooks**

Create `lib/easter-eggs.test.ts`:

```ts
import { renderHook, act } from '@testing-library/react'
import { useKonamiCode } from './easter-eggs'

describe('useKonamiCode', () => {
  it('starts inactive', () => {
    const { result } = renderHook(() => useKonamiCode())
    expect(result.current).toBe(false)
  })

  it('activates after full konami sequence', () => {
    const { result } = renderHook(() => useKonamiCode())
    const sequence = [
      'ArrowUp','ArrowUp','ArrowDown','ArrowDown',
      'ArrowLeft','ArrowRight','ArrowLeft','ArrowRight',
      'b','a'
    ]
    act(() => {
      sequence.forEach((key) => {
        window.dispatchEvent(new KeyboardEvent('keydown', { key }))
      })
    })
    expect(result.current).toBe(true)
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npx jest easter-eggs --no-coverage
```

Expected: FAIL

- [ ] **Step 3: Create `lib/easter-eggs.ts`**

```ts
import { useState, useEffect } from 'react'

const KONAMI = [
  'ArrowUp','ArrowUp','ArrowDown','ArrowDown',
  'ArrowLeft','ArrowRight','ArrowLeft','ArrowRight',
  'b','a',
]

export function useKonamiCode(): boolean {
  const [activated, setActivated] = useState(false)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === KONAMI[progress]) {
        const next = progress + 1
        if (next === KONAMI.length) {
          setActivated(true)
          setProgress(0)
        } else {
          setProgress(next)
        }
      } else {
        setProgress(0)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [progress])

  return activated
}

export function useLogoTap(threshold = 5): boolean {
  const [taps, setTaps] = useState(0)
  const [activated, setActivated] = useState(false)

  function tap() {
    const next = taps + 1
    if (next >= threshold) {
      setActivated(true)
      setTaps(0)
    } else {
      setTaps(next)
    }
  }

  return activated
}

export function useSecretTyping(word: string): boolean {
  const [buffer, setBuffer] = useState('')

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const next = (buffer + e.key).slice(-word.length)
      setBuffer(next)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [buffer, word])

  return buffer === word
}
```

- [ ] **Step 4: Create `components/ui/EasterEggs.tsx`**

```tsx
'use client'
import { useEffect } from 'react'
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
```

- [ ] **Step 5: Run tests**

```bash
npx jest easter-eggs --no-coverage
```

Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add lib/easter-eggs.ts lib/easter-eggs.test.ts components/ui/EasterEggs.tsx
git commit -m "feat: add easter egg hooks (Konami code, secret typing) and overlay component"
```

---

## Task 6: Root Layout

**Files:**
- Modify: `app/layout.tsx`

- [ ] **Step 1: Replace `app/layout.tsx`**

```tsx
import type { Metadata } from 'next'
import './globals.css'
import { ThemeProvider } from '@/components/providers/ThemeProvider'
import { CartProvider } from '@/components/providers/CartProvider'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { EasterEggs } from '@/components/ui/EasterEggs'

export const metadata: Metadata = {
  title: 'riaz.art — bold digital art',
  description: 'Stickers, posters, and prints by riaz. Bold. Graphic. Yours.',
  openGraph: {
    title: 'riaz.art',
    description: 'Bold digital art — stickers & posters',
    url: 'https://riaz.art',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-body bg-chalk text-ink dark:bg-ink dark:text-chalk antialiased transition-colors duration-300 min-h-screen flex flex-col">
        <ThemeProvider>
          <CartProvider>
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
            <EasterEggs />
          </CartProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add app/layout.tsx
git commit -m "feat: configure root layout with providers and global structure"
```

---

## Task 7: Navbar

**Files:**
- Create: `components/layout/Navbar.tsx`

- [ ] **Step 1: Create `components/layout/Navbar.tsx`**

```tsx
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
            <Link href="/shop" className="hover:text-accent transition-colors">Shop</Link>
            <Link href="/about" className="hover:text-accent transition-colors">About</Link>
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
```

- [ ] **Step 2: Create `components/ui/CartButton.tsx`**

```tsx
'use client'
import { motion } from 'framer-motion'
import { useCart } from '@/components/providers/CartProvider'

export function CartButton({ onClick }: { onClick: () => void }) {
  const { count } = useCart()
  return (
    <motion.button
      onClick={onClick}
      whileTap={{ scale: 0.9 }}
      className="relative w-8 h-8 flex items-center justify-center hover:text-accent transition-colors"
      aria-label="Open cart"
    >
      <span className="text-lg">🛍</span>
      {count > 0 && (
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -top-1 -right-1 w-4 h-4 bg-accent text-chalk text-[10px] font-bold rounded-full flex items-center justify-center"
        >
          {count}
        </motion.span>
      )}
    </motion.button>
  )
}
```

- [ ] **Step 3: Create `components/ui/CartDrawer.tsx`**

```tsx
'use client'
import { motion, AnimatePresence } from 'framer-motion'
import { useCart } from '@/components/providers/CartProvider'

export function CartDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { items, removeItem, clear, total } = useCart()

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-ink/40 dark:bg-chalk/10 backdrop-blur-sm"
          />
          <motion.aside
            key="drawer"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed right-0 top-0 h-full w-80 z-50 bg-chalk dark:bg-ink border-l border-ink/10 dark:border-chalk/10 flex flex-col p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display font-bold text-2xl">Cart</h2>
              <button onClick={onClose} className="text-2xl hover:text-accent transition-colors" aria-label="Close">×</button>
            </div>

            {items.length === 0 ? (
              <p className="text-muted font-body text-sm mt-4">Your cart is empty.<br />Go fill it with art.</p>
            ) : (
              <>
                <ul className="flex-1 overflow-y-auto space-y-4">
                  {items.map((item) => (
                    <li key={`${item.id}-${item.size}`} className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-muted/20 rounded flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="font-display font-bold text-sm truncate">{item.name}</p>
                        <p className="text-muted text-xs">{item.size} · qty {item.qty}</p>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span className="font-body font-medium text-sm">£{(item.price * item.qty).toFixed(2)}</span>
                        <button
                          onClick={() => removeItem(item.id, item.size)}
                          className="text-muted hover:text-accent text-xs transition-colors"
                        >
                          remove
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
                <div className="pt-4 border-t border-ink/10 dark:border-chalk/10 space-y-3">
                  <div className="flex justify-between font-display font-bold text-lg">
                    <span>Total</span>
                    <span>£{total.toFixed(2)}</span>
                  </div>
                  <button className="w-full bg-accent text-chalk font-display font-bold py-3 rounded-xl hover:opacity-90 transition-opacity">
                    Checkout (coming soon)
                  </button>
                  <button onClick={clear} className="w-full text-muted text-sm hover:text-accent transition-colors">
                    Clear cart
                  </button>
                </div>
              </>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}
```

- [ ] **Step 4: Commit**

```bash
git add components/layout/Navbar.tsx components/ui/CartButton.tsx components/ui/CartDrawer.tsx
git commit -m "feat: add Navbar with cart drawer, theme toggle, and nav links"
```

---

## Task 8: Footer

**Files:**
- Create: `components/layout/Footer.tsx`

- [ ] **Step 1: Create `components/layout/Footer.tsx`**

```tsx
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
          onClick={() => setClicks((c) => c + 1)}
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
              🎨 you clicked the footer 7 times. legend.
            </motion.span>
          ) : (
            `© ${new Date().getFullYear()} riaz.art`
          )}
        </p>
      </div>
    </footer>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add components/layout/Footer.tsx
git commit -m "feat: add footer with hidden click easter egg"
```

---

## Task 9: ProductCard & ProductGrid

**Files:**
- Create: `components/shop/ProductCard.tsx`
- Create: `components/shop/ProductGrid.tsx`
- Create: `components/shop/CategoryFilter.tsx`

- [ ] **Step 1: Create `components/shop/ProductCard.tsx`**

```tsx
'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { Product } from '@/lib/products'
import { useCart } from '@/components/providers/CartProvider'

export function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart()
  const [selectedSize, setSelectedSize] = useState(product.sizes[0])
  const [added, setAdded] = useState(false)

  function handleAdd() {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      size: selectedSize,
    })
    setAdded(true)
    setTimeout(() => setAdded(false), 1200)
  }

  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.4 }}
      whileHover={{ y: -4 }}
      className="group flex flex-col bg-chalk dark:bg-ink border border-ink/10 dark:border-chalk/10 rounded-2xl overflow-hidden"
    >
      <div className="aspect-square bg-ink/5 dark:bg-chalk/5 relative overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center text-muted/30 font-display font-bold text-6xl select-none">
          art
        </div>
        <motion.div
          className="absolute inset-0 bg-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        />
      </div>

      <div className="p-4 flex flex-col flex-1 gap-3">
        <div>
          <h3 className="font-display font-bold text-base">{product.name}</h3>
          <p className="text-muted text-xs mt-1 line-clamp-2">{product.description}</p>
        </div>

        {product.sizes.length > 1 && (
          <div className="flex flex-wrap gap-1.5">
            {product.sizes.map((size) => (
              <button
                key={size}
                onClick={() => setSelectedSize(size)}
                className={`text-xs px-2 py-0.5 rounded border transition-colors ${
                  selectedSize === size
                    ? 'border-accent text-accent bg-accent/10'
                    : 'border-ink/20 dark:border-chalk/20 hover:border-accent hover:text-accent'
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between mt-auto">
          <span className="font-display font-bold text-lg">£{product.price.toFixed(2)}</span>
          <motion.button
            onClick={handleAdd}
            whileTap={{ scale: 0.93 }}
            className={`font-display font-bold text-sm px-4 py-2 rounded-xl transition-colors ${
              added
                ? 'bg-accent text-chalk'
                : 'bg-ink text-chalk dark:bg-chalk dark:text-ink hover:bg-accent hover:dark:bg-accent hover:dark:text-chalk'
            }`}
          >
            {added ? 'Added ✓' : 'Add to cart'}
          </motion.button>
        </div>
      </div>
    </motion.article>
  )
}
```

- [ ] **Step 2: Create `components/shop/CategoryFilter.tsx`**

```tsx
'use client'
import { motion } from 'framer-motion'

type Category = 'all' | 'sticker' | 'poster'

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
```

- [ ] **Step 3: Create `components/shop/ProductGrid.tsx`**

```tsx
import { Product } from '@/lib/products'
import { ProductCard } from './ProductCard'

export function ProductGrid({ products }: { products: Product[] }) {
  if (products.length === 0) {
    return (
      <div className="col-span-full text-center py-16 text-muted font-body">
        Nothing here yet. Check back soon.
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}
```

- [ ] **Step 4: Commit**

```bash
git add components/shop/ProductCard.tsx components/shop/CategoryFilter.tsx components/shop/ProductGrid.tsx
git commit -m "feat: add ProductCard, ProductGrid, and CategoryFilter components"
```

---

## Task 10: Shop Page

**Files:**
- Create: `app/shop/page.tsx`

- [ ] **Step 1: Create `app/shop/page.tsx`**

```tsx
'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { products } from '@/lib/products'
import { ProductGrid } from '@/components/shop/ProductGrid'
import { CategoryFilter } from '@/components/shop/CategoryFilter'

type Category = 'all' | 'sticker' | 'poster'

export default function ShopPage() {
  const [category, setCategory] = useState<Category>('all')

  const filtered = category === 'all'
    ? products
    : products.filter((p) => p.category === category)

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-10"
      >
        <h1 className="font-display font-extrabold text-5xl md:text-7xl leading-none tracking-tight mb-4">
          Shop
        </h1>
        <p className="text-muted font-body">
          Bold graphics. Print-ready. Ships worldwide.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="mb-8"
      >
        <CategoryFilter active={category} onChange={setCategory} />
      </motion.div>

      <ProductGrid products={filtered} />
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add app/shop/page.tsx
git commit -m "feat: add shop page with category filtering"
```

---

## Task 11: Hero Section & Home Page

**Files:**
- Create: `components/home/Hero.tsx`
- Create: `components/home/FeaturedProducts.tsx`
- Create: `components/home/AboutSnippet.tsx`
- Modify: `app/page.tsx`

- [ ] **Step 1: Create `components/home/Hero.tsx`**

```tsx
'use client'
import { motion } from 'framer-motion'
import Link from 'next/link'

export function Hero() {
  return (
    <section className="min-h-[90vh] flex flex-col justify-center px-4 max-w-6xl mx-auto relative overflow-hidden">
      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[60vw] max-w-[500px] aspect-square rounded-full bg-accent/5 blur-3xl pointer-events-none" />

      <motion.p
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="font-body text-muted text-sm uppercase tracking-widest mb-4"
      >
        Digital art by riaz
      </motion.p>

      <motion.h1
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="font-display font-extrabold text-[min(15vw,7rem)] leading-none tracking-tight mb-6"
      >
        Bold.
        <br />
        <span className="text-accent">Graphic.</span>
        <br />
        Yours.
      </motion.h1>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="font-body text-muted max-w-md text-base md:text-lg mb-10"
      >
        Stickers and posters that actually say something. Print-ready art for your walls, laptop, and life.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="flex flex-wrap gap-4"
      >
        <Link
          href="/shop"
          className="font-display font-bold px-8 py-3 bg-accent text-chalk rounded-xl hover:opacity-90 transition-opacity"
        >
          Shop now
        </Link>
        <Link
          href="/about"
          className="font-display font-bold px-8 py-3 border border-ink/20 dark:border-chalk/20 rounded-xl hover:border-accent hover:text-accent transition-colors"
        >
          About
        </Link>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="text-muted/40 text-2xl select-none"
        >
          ↓
        </motion.div>
      </motion.div>
    </section>
  )
}
```

- [ ] **Step 2: Create `components/home/FeaturedProducts.tsx`**

```tsx
import { getFeaturedProducts } from '@/lib/products'
import { ProductCard } from '@/components/shop/ProductCard'
import Link from 'next/link'

export function FeaturedProducts() {
  const featured = getFeaturedProducts()

  return (
    <section className="max-w-6xl mx-auto px-4 py-16">
      <div className="flex items-end justify-between mb-8">
        <h2 className="font-display font-extrabold text-3xl md:text-5xl">Featured</h2>
        <Link href="/shop" className="font-display font-bold text-sm hover:text-accent transition-colors">
          View all →
        </Link>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {featured.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  )
}
```

- [ ] **Step 3: Create `components/home/AboutSnippet.tsx`**

```tsx
'use client'
import Link from 'next/link'
import { motion } from 'framer-motion'

export function AboutSnippet() {
  return (
    <section className="max-w-6xl mx-auto px-4 py-16 border-t border-ink/10 dark:border-chalk/10">
      <div className="grid md:grid-cols-2 gap-12 items-center">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="font-display font-extrabold text-3xl md:text-5xl mb-4">
            The artist
          </h2>
          <p className="font-body text-muted leading-relaxed mb-6">
            Based somewhere interesting. Making things that feel like a punch in the eye (in a good way). Each piece is designed to look great on your wall, your laptop, or wherever.
          </p>
          <Link
            href="/about"
            className="font-display font-bold text-sm border-b border-accent text-accent pb-0.5 hover:opacity-70 transition-opacity"
          >
            More about riaz →
          </Link>
        </motion.div>
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="aspect-square rounded-2xl bg-ink/5 dark:bg-chalk/5 flex items-center justify-center"
        >
          <span className="font-display font-extrabold text-8xl text-ink/10 dark:text-chalk/10 select-none">r.</span>
        </motion.div>
      </div>
    </section>
  )
}
```

- [ ] **Step 4: Replace `app/page.tsx`**

```tsx
import { Hero } from '@/components/home/Hero'
import { FeaturedProducts } from '@/components/home/FeaturedProducts'
import { AboutSnippet } from '@/components/home/AboutSnippet'

export default function HomePage() {
  return (
    <>
      <Hero />
      <FeaturedProducts />
      <AboutSnippet />
    </>
  )
}
```

- [ ] **Step 5: Commit**

```bash
git add components/home/ app/page.tsx
git commit -m "feat: add Hero, FeaturedProducts, AboutSnippet and wire up home page"
```

---

## Task 12: About Page

**Files:**
- Create: `app/about/page.tsx`

- [ ] **Step 1: Create `app/about/page.tsx`**

```tsx
'use client'
import { motion } from 'framer-motion'
import Link from 'next/link'

export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="font-display font-extrabold text-5xl md:text-7xl leading-none tracking-tight mb-8">
          About
        </h1>

        <div className="aspect-video rounded-2xl bg-ink/5 dark:bg-chalk/5 mb-10 flex items-center justify-center">
          <span className="font-display font-extrabold text-9xl text-ink/10 dark:text-chalk/10 select-none">r.</span>
        </div>

        <div className="space-y-6 font-body text-lg leading-relaxed text-muted">
          <p>
            Hey — I'm <span className="text-ink dark:text-chalk font-medium">riaz</span>. I make bold, graphic digital art that's designed to be printed and lived with.
          </p>
          <p>
            Everything in the shop is available as a sticker or poster in A6, A5, or A4. All pieces are ready to print at home or at your local print shop.
          </p>
          <p>
            More products coming — tshirts, tote bags, badges. Stay tuned.
          </p>
        </div>

        <div className="mt-12 pt-8 border-t border-ink/10 dark:border-chalk/10 flex gap-6 flex-wrap">
          <Link href="/shop" className="font-display font-bold text-accent border-b border-accent pb-0.5 hover:opacity-70 transition-opacity">
            Browse the shop →
          </Link>
        </div>
      </motion.div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add app/about/page.tsx
git commit -m "feat: add about page"
```

---

## Task 13: Marquee Banner & Polish

**Files:**
- Create: `components/home/MarqueeBanner.tsx`
- Modify: `app/page.tsx`

- [ ] **Step 1: Create `components/home/MarqueeBanner.tsx`**

```tsx
export function MarqueeBanner() {
  const text = 'STICKERS · POSTERS · BOLD ART · RIAZ.ART · '
  const repeated = text.repeat(6)

  return (
    <div className="bg-accent text-chalk overflow-hidden py-3 my-8">
      <div className="flex whitespace-nowrap animate-marquee font-display font-extrabold text-sm tracking-widest">
        <span>{repeated}</span>
        <span aria-hidden>{repeated}</span>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Add `MarqueeBanner` to `app/page.tsx` between Hero and FeaturedProducts**

```tsx
import { Hero } from '@/components/home/Hero'
import { MarqueeBanner } from '@/components/home/MarqueeBanner'
import { FeaturedProducts } from '@/components/home/FeaturedProducts'
import { AboutSnippet } from '@/components/home/AboutSnippet'

export default function HomePage() {
  return (
    <>
      <Hero />
      <MarqueeBanner />
      <FeaturedProducts />
      <AboutSnippet />
    </>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add components/home/MarqueeBanner.tsx app/page.tsx
git commit -m "feat: add marquee banner between hero and featured products"
```

---

## Task 14: Dev Server Smoke Test

- [ ] **Step 1: Start dev server**

```bash
npm run dev
```

Expected: Server starts at `http://localhost:3000` with no build errors.

- [ ] **Step 2: Verify pages render**

Open `http://localhost:3000` — home page loads with hero, marquee, featured products, about snippet.
Open `http://localhost:3000/shop` — product grid with category filter works.
Open `http://localhost:3000/about` — about page renders.

- [ ] **Step 3: Verify interactive features**

- Theme toggle switches dark/light mode correctly.
- Add a product to cart — badge appears on cart button.
- Open cart drawer — product listed, total correct, remove works.
- Type "riaz" anywhere — easter egg toast appears.
- Enter Konami code — easter egg overlay appears.
- Click footer logo 7 times — easter egg message appears.

- [ ] **Step 4: Run all tests**

```bash
npx jest --no-coverage
```

Expected: All tests pass.

- [ ] **Step 5: Final commit**

```bash
git add .
git commit -m "feat: complete riaz.art MVP — shop, cart, themes, easter eggs"
```
