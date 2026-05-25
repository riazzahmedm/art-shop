import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServiceClient } from '@/lib/supabase'
import { generateOrderId } from '@/lib/order-id'
import { sendOrderConfirmationEmail, sendSellerNotificationEmail } from '@/lib/email'
import type { CreateOrderInput, Order } from '@/lib/orders'

export async function POST(request: NextRequest) {
  let body: CreateOrderInput

  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { customer_name, email, phone, address, items, total, payment_screenshot_url } = body

  if (!customer_name || !email || !phone || !address || !items?.length || total == null) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const id = generateOrderId()
  const supabase = createSupabaseServiceClient()

  const { data, error } = await supabase
    .from('orders')
    .insert({
      id,
      customer_name,
      email,
      phone,
      address,
      items,
      total,
      status: 'pending_payment',
      payment_screenshot_url: payment_screenshot_url ?? null,
    })
    .select()
    .single()

  if (error) {
    console.error('[POST /api/orders]', error)
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 })
  }

  // Fire-and-forget emails (failures must not block the response)
  sendOrderConfirmationEmail(data as Order)
  sendSellerNotificationEmail(data as Order)

  return NextResponse.json({ id }, { status: 201 })
}
