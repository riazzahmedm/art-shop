import { sendOrderConfirmationEmail } from './email'
import type { Order } from './orders'

jest.mock('resend', () => ({
  Resend: jest.fn().mockImplementation(() => ({
    emails: {
      send: jest.fn().mockResolvedValue({ data: { id: 'mock-id' }, error: null }),
    },
  })),
}))

const mockOrder: Order = {
  id: 'RA-TEST',
  customer_name: 'Test User',
  email: 'test@example.com',
  phone: '07700000000',
  address: '1 Test St, London',
  items: [
    { id: 'p1', name: 'Test Poster', size: 'A4', price: 12.99, qty: 2 },
  ],
  total: 25.98,
  status: 'pending_payment',
  payment_screenshot_url: null,
  notes: null,
  created_at: '2026-04-30T10:00:00Z',
}

describe('sendOrderConfirmationEmail', () => {
  it('resolves without throwing', async () => {
    await expect(sendOrderConfirmationEmail(mockOrder)).resolves.toBeUndefined()
  })

  it('does not throw even when Resend rejects', async () => {
    const { Resend } = jest.requireMock('resend')
    Resend.mockImplementationOnce(() => ({
      emails: { send: jest.fn().mockRejectedValue(new Error('network error')) },
    }))
    await expect(sendOrderConfirmationEmail(mockOrder)).resolves.toBeUndefined()
  })
})
