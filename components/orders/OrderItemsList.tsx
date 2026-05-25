import type { OrderItem } from '@/lib/orders'

type Props = { items: OrderItem[]; total: number }

export function OrderItemsList({ items, total }: Props) {
  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <div
          key={`${item.id}-${item.size}-${i}`}
          className="flex justify-between font-body text-sm py-2 border-b border-ink/5 dark:border-chalk/5 last:border-0"
        >
          <div>
            <span className="font-medium">{item.name}</span>
            <span className="text-muted ml-2">({item.size}) ×{item.qty}</span>
          </div>
          <span>£{(item.price * item.qty).toFixed(2)}</span>
        </div>
      ))}
      <div className="flex justify-between font-display font-bold pt-2">
        <span>Total</span>
        <span>£{total.toFixed(2)}</span>
      </div>
    </div>
  )
}
