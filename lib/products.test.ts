/** @jest-environment node */
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
