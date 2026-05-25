import type { OrderStatus } from '@/lib/orders'
import { STATUS_LABELS } from '@/lib/orders'

const STATUS_COLOURS: Record<OrderStatus, string> = {
  pending_payment: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
  payment_confirmed: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  processing: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
  shipped: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
  delivered: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  cancelled: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
}

export function StatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span
      className={`inline-block px-2 py-0.5 rounded-full font-body text-xs font-medium ${STATUS_COLOURS[status]}`}
    >
      {STATUS_LABELS[status]}
    </span>
  )
}
