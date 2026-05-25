import type { OrderStatus } from '@/lib/orders'
import { STATUS_LABELS } from '@/lib/orders'

type Props = { currentStatus: OrderStatus }

// Don't show 'cancelled' in the normal timeline nodes
const TIMELINE_STATUSES: OrderStatus[] = [
  'pending_payment',
  'payment_confirmed',
  'processing',
  'shipped',
  'delivered',
]

export function OrderTimeline({ currentStatus }: Props) {
  const isCancelled = currentStatus === 'cancelled'
  const currentIndex = TIMELINE_STATUSES.indexOf(currentStatus)

  if (isCancelled) {
    return (
      <div className="rounded-xl bg-muted/10 px-4 py-3 font-body text-sm text-muted">
        This order has been <strong>cancelled</strong>.
      </div>
    )
  }

  return (
    <ol className="space-y-3">
      {TIMELINE_STATUSES.map((status, index) => {
        const isDone = index < currentIndex
        const isCurrent = index === currentIndex

        return (
          <li key={status} className="flex items-center gap-3">
            <span
              className={`w-3 h-3 rounded-full flex-shrink-0 ${
                isDone
                  ? 'bg-accent'
                  : isCurrent
                  ? 'bg-accent ring-4 ring-accent/20'
                  : 'bg-muted/30'
              }`}
            />
            <span
              className={`font-body text-sm ${
                isCurrent ? 'font-bold text-ink dark:text-chalk' : 'text-muted'
              }`}
            >
              {STATUS_LABELS[status]}
            </span>
            {isCurrent && (
              <span className="ml-auto font-body text-xs text-accent font-medium">← now</span>
            )}
          </li>
        )
      })}
    </ol>
  )
}
