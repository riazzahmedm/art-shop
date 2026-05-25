import { generateOrderId } from './order-id'

describe('generateOrderId', () => {
  it('returns a string starting with "RA-"', () => {
    expect(generateOrderId()).toMatch(/^RA-/)
  })

  it('has exactly 4 characters after the prefix', () => {
    const id = generateOrderId()
    expect(id.slice(3)).toHaveLength(4)
  })

  it('uses only uppercase alphanumeric characters after prefix', () => {
    for (let i = 0; i < 50; i++) {
      expect(generateOrderId().slice(3)).toMatch(/^[A-Z0-9]{4}$/)
    }
  })

  it('generates unique IDs', () => {
    const ids = new Set(Array.from({ length: 100 }, generateOrderId))
    expect(ids.size).toBeGreaterThan(90)
  })
})
