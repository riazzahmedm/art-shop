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
    featured: false,
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
    featured: false,
    tags: ['portrait', 'noise', 'contrast'],
  },
]

export function getProductsByCategory(category: ProductCategory): Product[] {
  return products.filter((p) => p.category === category)
}

export function getFeaturedProducts(): Product[] {
  return products.filter((p) => p.featured).slice(0, 4)
}

export type CategoryFilter = 'all' | 'sticker' | 'poster'
