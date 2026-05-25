import { notFound } from 'next/navigation'
import type { Order } from '@/lib/orders'
import { OrderTimeline } from '@/components/orders/OrderTimeline'
import { OrderItemsList } from '@/components/orders/OrderItemsList'
import { OrderPoller } from './OrderPoller'

async function fetchOrder(id: string): Promise<Order | null> {
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL ??
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')

  const res = await fetch(`${baseUrl}/api/orders/${id}`, { cache: 'no-store' })
  if (!res.ok) return null
  return res.json()
}

export default async function OrderTrackingPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const order = await fetchOrder(id)

  if (!order) notFound()

  const createdDate = new Date(order.created_at).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  return (
    <main className="min-h-screen bg-chalk dark:bg-ink">
      <OrderPoller orderId={id} />
      <div className="max-w-lg mx-auto px-4 py-12 space-y-8">
        <div>
          <p className="font-body text-sm text-muted mb-1">Order placed {createdDate}</p>
          <h1 className="font-display font-extrabold text-3xl">#{order.id}</h1>
        </div>

        <section>
          <h2 className="font-display font-bold text-lg mb-4">Status</h2>
          <OrderTimeline currentStatus={order.status} />
        </section>

        <section>
          <h2 className="font-display font-bold text-lg mb-4">Items</h2>
          <OrderItemsList items={order.items} total={order.total} />
        </section>

        <section>
          <h2 className="font-display font-bold text-lg mb-2">Delivery address</h2>
          <p className="font-body text-sm text-muted whitespace-pre-line">{order.address}</p>
        </section>
      </div>
    </main>
  )
}
