'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useCart } from '@/components/providers/CartProvider'
import { CheckoutForm } from '@/components/checkout/CheckoutForm'
import { PaymentStep } from '@/components/checkout/PaymentStep'
import { ConfirmationStep } from '@/components/checkout/ConfirmationStep'
import type { CustomerDetails } from '@/components/checkout/CheckoutForm'

type Step = 'details' | 'payment' | 'confirmation'

export default function CheckoutPage() {
  const router = useRouter()
  const { items, total } = useCart()
  const [step, setStep] = useState<Step>('details')
  const [details, setDetails] = useState<CustomerDetails | null>(null)
  const [orderId, setOrderId] = useState<string | null>(null)

  useEffect(() => {
    if (items.length === 0 && step !== 'confirmation') {
      router.replace('/shop')
    }
  }, [items, step, router])

  if (items.length === 0 && step !== 'confirmation') {
    return null
  }

  return (
    <main className="min-h-screen bg-chalk dark:bg-ink">
      <div className="max-w-lg mx-auto px-4 py-12">
        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-10 font-body text-xs text-muted">
          <span className={step === 'details' ? 'text-accent font-bold' : ''}>Details</span>
          <span>→</span>
          <span className={step === 'payment' ? 'text-accent font-bold' : ''}>Payment</span>
          <span>→</span>
          <span className={step === 'confirmation' ? 'text-accent font-bold' : ''}>Confirmation</span>
        </div>

        {step === 'details' && (
          <CheckoutForm
            onContinue={(d) => {
              setDetails(d)
              setStep('payment')
            }}
          />
        )}

        {step === 'payment' && details && (
          <PaymentStep
            details={details}
            items={items}
            total={total}
            onOrderPlaced={(id) => {
              setOrderId(id)
              setStep('confirmation')
            }}
          />
        )}

        {step === 'confirmation' && orderId && (
          <ConfirmationStep orderId={orderId} />
        )}
      </div>
    </main>
  )
}
