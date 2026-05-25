import { Resend } from 'resend'
import type { Order } from './orders'

export async function sendSellerNotificationEmail(order: Order): Promise<void> {
  try {
    const resend = new Resend(process.env.RESEND_API_KEY)
    const adminUrl = `https://riaz.art/admin/${order.id}`

    const itemLines = order.items
      .map((i) => `${i.name} (${i.size}) ×${i.qty} — £${(i.price * i.qty).toFixed(2)}`)
      .join('\n')

    const html = `
      <h2>New order: ${order.id}</h2>
      <p><strong>From:</strong> ${order.customer_name} &lt;${order.email}&gt;</p>
      <p><strong>Phone:</strong> ${order.phone}</p>
      <p><strong>Address:</strong><br/>${order.address.replace(/\n/g, '<br/>')}</p>
      <pre style="background:#f5f5f5;padding:12px;border-radius:6px">${itemLines}</pre>
      <p><strong>Total: £${order.total.toFixed(2)}</strong></p>
      <p><a href="${adminUrl}">Review order in admin →</a></p>
    `

    const text = `New order: ${order.id}

From: ${order.customer_name} <${order.email}>
Phone: ${order.phone}
Address: ${order.address}

${itemLines}

Total: £${order.total.toFixed(2)}

Review: ${adminUrl}`

    await resend.emails.send({
      from: process.env.NODE_ENV === 'production'
        ? 'orders@riaz.art'
        : 'onboarding@resend.dev',
      to: process.env.SELLER_EMAIL!,
      subject: `New order ${order.id} — £${order.total.toFixed(2)} from ${order.customer_name}`,
      html,
      text,
    })
  } catch (err) {
    console.error('[email] Failed to send seller notification:', err)
  }
}

export async function sendOrderConfirmationEmail(order: Order): Promise<void> {
  try {
    const resend = new Resend(process.env.RESEND_API_KEY)

    const itemsHtml = order.items
      .map(
        (item) =>
          `<tr>
            <td style="padding:4px 8px">${item.name}</td>
            <td style="padding:4px 8px">${item.size}</td>
            <td style="padding:4px 8px">×${item.qty}</td>
            <td style="padding:4px 8px">£${(item.price * item.qty).toFixed(2)}</td>
          </tr>`,
      )
      .join('')

    const trackingUrl = `https://riaz.art/orders/${order.id}`

    const html = `
      <h2>Your riaz.art order ${order.id}</h2>
      <p>Thanks ${order.customer_name}! We've received your order.</p>
      <table style="border-collapse:collapse;width:100%">
        <thead>
          <tr>
            <th style="padding:4px 8px;text-align:left">Item</th>
            <th style="padding:4px 8px;text-align:left">Size</th>
            <th style="padding:4px 8px;text-align:left">Qty</th>
            <th style="padding:4px 8px;text-align:left">Price</th>
          </tr>
        </thead>
        <tbody>${itemsHtml}</tbody>
      </table>
      <p><strong>Total: £${order.total.toFixed(2)}</strong></p>
      <p>We'll confirm your UPI payment within 24 hours.</p>
      <p><a href="${trackingUrl}">Track your order →</a></p>
    `

    const text = `
Your riaz.art order ${order.id}

Thanks ${order.customer_name}! We've received your order.

${order.items.map((i) => `${i.name} (${i.size}) ×${i.qty} — £${(i.price * i.qty).toFixed(2)}`).join('\n')}

Total: £${order.total.toFixed(2)}

We'll confirm your UPI payment within 24 hours.
Track your order: ${trackingUrl}
    `.trim()

    await resend.emails.send({
      from: process.env.NODE_ENV === 'production'
        ? 'orders@riaz.art'
        : 'onboarding@resend.dev',
      to: order.email,
      subject: `Your riaz.art order ${order.id}`,
      html,
      text,
    })
  } catch (err) {
    // Email failure must NOT block order creation
    console.error('[email] Failed to send order confirmation:', err)
  }
}
