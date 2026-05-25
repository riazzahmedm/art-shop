import { createSupabaseServiceClient } from '@/lib/supabase'
import type { Order } from '@/lib/orders'
import { OrdersTable } from '@/components/admin/OrdersTable'

async function fetchOrders(): Promise<Order[]> {
  const supabase = createSupabaseServiceClient()
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('[admin/page]', error)
    return []
  }
  return (data ?? []) as Order[]
}

export const dynamic = 'force-dynamic'

export default async function AdminOrdersPage() {
  const orders = await fetchOrders()

  return (
    <main className="min-h-screen bg-chalk dark:bg-ink">
      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-8">
          <h1 className="font-display font-extrabold text-3xl">Orders</h1>
          <span className="font-body text-sm text-muted">{orders.length} total</span>
        </div>
        <OrdersTable orders={orders} />
      </div>
    </main>
  )
}
