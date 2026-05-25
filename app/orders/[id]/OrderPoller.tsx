'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export function OrderPoller({ orderId }: { orderId: string }) {
  const router = useRouter()

  useEffect(() => {
    const interval = setInterval(() => {
      router.refresh()
    }, 30_000)
    return () => clearInterval(interval)
  }, [router, orderId])

  return null
}
