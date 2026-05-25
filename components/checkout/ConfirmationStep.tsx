'use client'
import { useEffect } from 'react'
import Link from 'next/link'
import { useCart } from '@/components/providers/CartProvider'

type Props = { orderId: string }

export function ConfirmationStep({ orderId }: Props) {
  const { clear } = useCart()

  useEffect(() => {
    clear()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="text-center space-y-6 py-8">
      <div className="text-5xl">🎉</div>
      <div>
        <h2 className="font-display font-extrabold text-3xl mb-2">Order placed!</h2>
        <p className="font-body text-muted">Your order ID is</p>
        <p className="font-display font-bold text-2xl mt-1">#{orderId}</p>
      </div>
      <p className="font-body text-sm text-muted max-w-xs mx-auto">
        We'll confirm your payment within 24 hours. You'll receive an email confirmation shortly.
      </p>
      <div className="space-y-3">
        <Link
          href={`/orders/${orderId}`}
          className="block w-full bg-accent text-chalk font-display font-bold py-3 rounded-xl hover:opacity-90 transition-opacity text-center"
        >
          Track your order →
        </Link>
        <Link
          href="/shop"
          className="block w-full font-body text-sm text-muted hover:text-accent transition-colors text-center py-2"
        >
          Continue shopping
        </Link>
      </div>
    </div>
  )
}
