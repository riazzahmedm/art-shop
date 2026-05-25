import Link from 'next/link'
import type { Order } from '@/lib/orders'
import { StatusBadge } from './StatusBadge'

type Props = { orders: Order[] }

export function OrdersTable({ orders }: Props) {
  if (orders.length === 0) {
    return <p className="font-body text-muted py-8 text-center">No orders yet.</p>
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full font-body text-sm border-collapse">
        <thead>
          <tr className="border-b border-ink/10 dark:border-chalk/10 text-left text-muted">
            <th className="py-3 pr-4 font-medium">ID</th>
            <th className="py-3 pr-4 font-medium">Customer</th>
            <th className="py-3 pr-4 font-medium">Date</th>
            <th className="py-3 pr-4 font-medium">Total</th>
            <th className="py-3 pr-4 font-medium">Status</th>
            <th className="py-3 font-medium">Screenshot</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr
              key={order.id}
              className="border-b border-ink/5 dark:border-chalk/5 hover:bg-ink/[0.03] dark:hover:bg-chalk/[0.03] transition-colors"
            >
              <td className="py-3 pr-4">
                <Link
                  href={`/admin/${order.id}`}
                  className="font-display font-bold text-accent hover:underline"
                >
                  {order.id}
                </Link>
              </td>
              <td className="py-3 pr-4">{order.customer_name}</td>
              <td className="py-3 pr-4 text-muted">
                {new Date(order.created_at).toLocaleDateString('en-GB')}
              </td>
              <td className="py-3 pr-4 font-medium">£{order.total.toFixed(2)}</td>
              <td className="py-3 pr-4">
                <StatusBadge status={order.status} />
              </td>
              <td className="py-3">
                {order.payment_screenshot_url ? (
                  <a
                    href={order.payment_screenshot_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-10 h-10 rounded overflow-hidden border border-ink/10 dark:border-chalk/10 hover:opacity-80 transition-opacity"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={order.payment_screenshot_url}
                      alt="Payment screenshot"
                      className="w-full h-full object-cover"
                    />
                  </a>
                ) : (
                  <span className="text-muted">—</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
