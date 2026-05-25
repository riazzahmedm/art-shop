import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createSupabaseServiceClient } from '@/lib/supabase'
import type { Order } from '@/lib/orders'
import { OrderTimeline } from '@/components/orders/OrderTimeline'
import { OrderItemsList } from '@/components/orders/OrderItemsList'
import { StatusBadge } from '@/components/admin/StatusBadge'
import { OrderStatusForm } from '@/components/admin/OrderStatusForm'

async function fetchOrder(id: string): Promise<Order | null> {
  const supabase = createSupabaseServiceClient()
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('id', id)
    .single()
  if (error || !data) return null
  return data as Order
}

export const dynamic = 'force-dynamic'

export default async function AdminOrderDetailPage({
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
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <main className="min-h-screen bg-chalk dark:bg-ink">
      <div className="max-w-2xl mx-auto px-4 py-10 space-y-8">
        <div className="flex items-center gap-4">
          <Link href="/admin" className="font-body text-sm text-muted hover:text-accent transition-colors">
            ← Back to orders
          </Link>
        </div>

        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="font-display font-extrabold text-3xl">{order.id}</h1>
            <p className="font-body text-sm text-muted mt-1">{createdDate}</p>
          </div>
          <StatusBadge status={order.status} />
        </div>

        {/* Customer info */}
        <section className="space-y-1">
          <h2 className="font-display font-bold text-lg mb-3">Customer</h2>
          <p className="font-body text-sm"><strong>Name:</strong> {order.customer_name}</p>
          <p className="font-body text-sm"><strong>Email:</strong> {order.email}</p>
          <p className="font-body text-sm"><strong>Phone:</strong> {order.phone}</p>
          <p className="font-body text-sm"><strong>Address:</strong><br /><span className="text-muted whitespace-pre-line">{order.address}</span></p>
        </section>

        {/* Items */}
        <section>
          <h2 className="font-display font-bold text-lg mb-3">Items</h2>
          <OrderItemsList items={order.items} total={order.total} />
        </section>

        {/* Status timeline */}
        <section>
          <h2 className="font-display font-bold text-lg mb-3">Timeline</h2>
          <OrderTimeline currentStatus={order.status} />
        </section>

        {/* Payment screenshot */}
        {order.payment_screenshot_url && (
          <section>
            <h2 className="font-display font-bold text-lg mb-3">Payment screenshot</h2>
            <a
              href={order.payment_screenshot_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block hover:opacity-80 transition-opacity"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={order.payment_screenshot_url}
                alt="Payment screenshot"
                className="max-w-xs rounded-xl border border-ink/10 dark:border-chalk/10"
              />
            </a>
            <p className="font-body text-xs text-muted mt-1">Click to open full size</p>
          </section>
        )}

        {/* Status & notes form */}
        <section>
          <h2 className="font-display font-bold text-lg mb-3">Update order</h2>
          <OrderStatusForm order={order} />
        </section>
      </div>
    </main>
  )
}
