import Link from 'next/link'

export default function OrderNotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-chalk dark:bg-ink px-4">
      <div className="text-center space-y-4">
        <h1 className="font-display font-extrabold text-4xl">Order not found</h1>
        <p className="font-body text-muted">
          Double-check your order ID — it looks like <strong>RA-XXXX</strong>.
        </p>
        <Link href="/shop" className="inline-block font-body text-sm text-accent hover:underline">
          Back to shop
        </Link>
      </div>
    </main>
  )
}
