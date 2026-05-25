'use client'
import { useState, useRef } from 'react'
import Image from 'next/image'
import type { CustomerDetails } from './CheckoutForm'
import { useCart } from '@/components/providers/CartProvider'

type CartItem = ReturnType<typeof useCart>['items'][number]

type Props = {
  details: CustomerDetails
  items: CartItem[]
  total: number
  onOrderPlaced: (orderId: string) => void
}

export function PaymentStep({ details, items, total, onOrderPlaced }: Props) {
  const [screenshotUrl, setScreenshotUrl] = useState<string | null>(null)
  const [uploadError, setUploadError] = useState('')
  const [uploading, setUploading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [copied, setCopied] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const upiId = process.env.NEXT_PUBLIC_UPI_ID ?? 'your-upi-id@upi'

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadError('')
    setUploading(true)

    try {
      const form = new FormData()
      form.append('file', file)
      const res = await fetch('/api/upload-screenshot', { method: 'POST', body: form })
      if (!res.ok) {
        const data = await res.json()
        setUploadError(data.error ?? 'Upload failed')
        return
      }
      const data = await res.json()
      setScreenshotUrl(data.url)
    } catch {
      setUploadError('Upload failed, please try again')
    } finally {
      setUploading(false)
    }
  }

  async function handlePlaceOrder() {
    setSubmitError('')
    setSubmitting(true)

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_name: details.name,
          email: details.email,
          phone: details.phone,
          address: details.address,
          items: items.map((i) => ({
            id: i.id,
            name: i.name,
            size: i.size,
            price: i.price,
            qty: i.qty,
          })),
          total,
          payment_screenshot_url: screenshotUrl,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        setSubmitError(data.error ?? 'Something went wrong, please try again')
        return
      }

      const data = await res.json()
      onOrderPlaced(data.id)
    } catch {
      setSubmitError('Something went wrong, please try again')
    } finally {
      setSubmitting(false)
    }
  }

  async function copyUpi() {
    await navigator.clipboard.writeText(upiId)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-6">
      <h2 className="font-display font-bold text-2xl">Payment</h2>

      {/* Cart summary */}
      <div className="border border-ink/10 dark:border-chalk/10 rounded-xl p-4 space-y-2">
        {items.map((item) => (
          <div key={`${item.id}-${item.size}`} className="flex justify-between font-body text-sm">
            <span>{item.name} ({item.size}) ×{item.qty}</span>
            <span>£{(item.price * item.qty).toFixed(2)}</span>
          </div>
        ))}
        <div className="pt-2 border-t border-ink/10 dark:border-chalk/10 flex justify-between font-display font-bold">
          <span>Total</span>
          <span>£{total.toFixed(2)}</span>
        </div>
      </div>

      {/* UPI section */}
      <div className="space-y-3 text-center">
        <div className="mx-auto w-40 h-40 bg-muted/20 rounded-xl flex items-center justify-center">
          <Image
            src="/images/upi-qr-placeholder.png"
            alt="UPI QR code"
            width={160}
            height={160}
            className="rounded-xl"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
          />
        </div>
        <p className="font-body text-sm text-muted">
          Pay exactly <strong className="text-ink dark:text-chalk">£{total.toFixed(2)}</strong> and upload your screenshot below
        </p>
        <button
          type="button"
          onClick={copyUpi}
          className="font-mono text-sm bg-ink/5 dark:bg-chalk/5 px-4 py-2 rounded-lg hover:bg-accent/10 transition-colors"
        >
          {copied ? '✓ Copied!' : upiId}
        </button>
      </div>

      {/* Screenshot upload */}
      <div className="space-y-2">
        <label className="block font-body text-sm text-muted">Payment screenshot</label>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="w-full border-2 border-dashed border-ink/20 dark:border-chalk/20 rounded-xl py-6 font-body text-sm text-muted hover:border-accent hover:text-accent transition-colors disabled:opacity-50"
        >
          {uploading
            ? 'Uploading…'
            : screenshotUrl
            ? '✓ Screenshot uploaded — tap to replace'
            : 'Tap to upload screenshot'}
        </button>
        {uploadError && <p className="text-red-500 font-body text-xs">{uploadError}</p>}
      </div>

      {submitError && <p className="text-red-500 font-body text-sm">{submitError}</p>}

      <button
        type="button"
        onClick={handlePlaceOrder}
        disabled={submitting || uploading}
        className="w-full bg-accent text-chalk font-display font-bold py-3 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-60"
      >
        {submitting ? 'Placing order…' : 'Place order'}
      </button>
    </div>
  )
}
