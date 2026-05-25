export type OrderStatus =
  | 'pending_payment'
  | 'payment_confirmed'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'

export const ORDER_STATUSES: OrderStatus[] = [
  'pending_payment',
  'payment_confirmed',
  'processing',
  'shipped',
  'delivered',
  'cancelled',
]

export const STATUS_LABELS: Record<OrderStatus, string> = {
  pending_payment: 'Pending Payment',
  payment_confirmed: 'Payment Confirmed',
  processing: 'Processing',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
}

export type OrderItem = {
  id: string
  name: string
  size: string
  price: number
  qty: number
}

export type Order = {
  id: string
  customer_name: string
  email: string
  phone: string
  address: string
  items: OrderItem[]
  total: number
  status: OrderStatus
  payment_screenshot_url: string | null
  notes: string | null
  created_at: string
}

export type CreateOrderInput = {
  customer_name: string
  email: string
  phone: string
  address: string
  items: OrderItem[]
  total: number
  payment_screenshot_url: string | null
}
