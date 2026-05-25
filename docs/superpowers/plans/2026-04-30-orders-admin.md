# Orders & Admin Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add UPI-based checkout, order tracking, transactional email, and an admin panel to riaz.art.

**Architecture:** Next.js App Router API routes handle all mutations; Supabase Postgres stores orders; Supabase Storage holds payment screenshots; Resend sends transactional email; admin auth is a plain-text env var checked in middleware via a signed cookie.

**Tech Stack:** `@supabase/supabase-js`, `resend`, Next.js middleware, React `useEffect` polling, Tailwind CSS v3, TypeScript strict.

---

## File Map

| File | Status | Responsibility |
|------|--------|----------------|
| `lib/order-id.ts` | Create | `generateOrderId()` → `"RA-XXXX"` |
| `lib/orders.ts` | Create | `Order` type, `OrderStatus`, `STATUS_LABELS`, `ORDER_STATUSES` |
| `lib/supabase.ts` | Create | `createSupabaseBrowserClient()`, `createSupabaseServiceClient()` |
| `lib/email.ts` | Create | `sendOrderConfirmationEmail(order)` via Resend |
| `supabase/migrations/20260430000000_orders.sql` | Create | `orders` table DDL |
| `app/api/upload-screenshot/route.ts` | Create | `POST` — uploads file to Supabase Storage, returns public URL |
| `app/api/orders/route.ts` | Create | `POST /api/orders` — create order |
| `app/api/orders/[id]/route.ts` | Create | `GET` + `PATCH /api/orders/:id` |
| `app/api/admin/login/route.ts` | Create | `POST /api/admin/login` — set cookie |
| `middleware.ts` | Create | Protect `/admin/*` via `admin_session` cookie |
| `components/checkout/CheckoutForm.tsx` | Create | Step 1: customer details form |
| `components/checkout/PaymentStep.tsx` | Create | Step 2: UPI QR + screenshot upload |
| `components/checkout/ConfirmationStep.tsx` | Create | Step 3: order confirmed, clear cart |
| `app/checkout/page.tsx` | Create | Multi-step checkout orchestrator (client component) |
| `components/orders/OrderTimeline.tsx` | Create | Status timeline, shared |
| `components/orders/OrderItemsList.tsx` | Create | Line items table, shared |
| `app/orders/[id]/page.tsx` | Create | Customer-facing order tracking page (server + client poller) |
| `components/admin/StatusBadge.tsx` | Create | Coloured status badge |
| `components/admin/OrdersTable.tsx` | Create | Orders list with status badges |
| `components/admin/OrderStatusForm.tsx` | Create | Status dropdown + notes save |
| `app/admin/login/page.tsx` | Create | Admin login form |
| `app/admin/page.tsx` | Create | Admin orders list |
| `app/admin/[id]/page.tsx` | Create | Admin order detail |
| `components/ui/CartDrawer.tsx` | Modify | Wire checkout button to `/checkout` |

---

### Task 1: Install dependencies & set up env vars

**Files:**
- Modify: `package.json` (via npm install)
- Create: `.env.local.example`

- [ ] **Step 1: Install packages**

```bash
cd /Users/riazahmed/Documents/MVP/art-shop
npm install @supabase/supabase-js resend
```

Expected: `added N packages` with no errors.

- [ ] **Step 2: Create `.env.local.example`**

Create `/Users/riazahmed/Documents/MVP/art-shop/.env.local.example`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
RESEND_API_KEY=re_your_key
ADMIN_PASSWORD=your-admin-password
ADMIN_SESSION_SECRET=a-random-string-at-least-32-chars
```

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json .env.local.example
git commit -m "chore: install supabase-js and resend, add env example"
```

---

### Task 2: Order ID utility

**Files:**
- Create: `lib/order-id.ts`
- Create: `lib/order-id.test.ts`

- [ ] **Step 1: Write failing tests**

Create `/Users/riazahmed/Documents/MVP/art-shop/lib/order-id.test.ts`:

```ts
import { generateOrderId } from './order-id'

describe('generateOrderId', () => {
  it('returns a string starting with "RA-"', () => {
    expect(generateOrderId()).toMatch(/^RA-/)
  })

  it('has exactly 4 characters after the prefix', () => {
    const id = generateOrderId()
    expect(id.slice(3)).toHaveLength(4)
  })

  it('uses only uppercase alphanumeric characters after prefix', () => {
    for (let i = 0; i < 50; i++) {
      expect(generateOrderId().slice(3)).toMatch(/^[A-Z0-9]{4}$/)
    }
  })

  it('generates unique IDs', () => {
    const ids = new Set(Array.from({ length: 100 }, generateOrderId))
    expect(ids.size).toBeGreaterThan(90)
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
cd /Users/riazahmed/Documents/MVP/art-shop
npx jest lib/order-id.test.ts --no-coverage
```

Expected: FAIL — `Cannot find module './order-id'`

- [ ] **Step 3: Implement `lib/order-id.ts`**

Create `/Users/riazahmed/Documents/MVP/art-shop/lib/order-id.ts`:

```ts
const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'

export function generateOrderId(): string {
  let suffix = ''
  for (let i = 0; i < 4; i++) {
    suffix += CHARS[Math.floor(Math.random() * CHARS.length)]
  }
  return `RA-${suffix}`
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npx jest lib/order-id.test.ts --no-coverage
```

Expected: PASS — 4 tests pass.

- [ ] **Step 5: Commit**

```bash
git add lib/order-id.ts lib/order-id.test.ts
git commit -m "feat: add generateOrderId utility (RA-XXXX format)"
```

---

### Task 3: Order types & Supabase clients

**Files:**
- Create: `lib/orders.ts`
- Create: `lib/supabase.ts`

- [ ] **Step 1: Create `lib/orders.ts`**

Create `/Users/riazahmed/Documents/MVP/art-shop/lib/orders.ts`:

```ts
export type OrderStatus =
  | 'pending_payment'
  | 'payment_confirmed'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'

export const ORDER_STATUSES: OrderStatus[] = [
  'pending_payment',
  'payment_confirmed',
  'processing',
  'shipped',
  'delivered',
  'cancelled',
]

export const STATUS_LABELS: Record<OrderStatus, string> = {
  pending_payment: 'Pending Payment',
  payment_confirmed: 'Payment Confirmed',
  processing: 'Processing',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
}

export type OrderItem = {
  id: string
  name: string
  size: string
  price: number
  qty: number
}

export type Order = {
  id: string
  customer_name: string
  email: string
  phone: string
  address: string
  items: OrderItem[]
  total: number
  status: OrderStatus
  payment_screenshot_url: string | null
  notes: string | null
  created_at: string
}

export type CreateOrderInput = {
  customer_name: string
  email: string
  phone: string
  address: string
  items: OrderItem[]
  total: number
  payment_screenshot_url: string | null
}
```

- [ ] **Step 2: Create `lib/supabase.ts`**

Create `/Users/riazahmed/Documents/MVP/art-shop/lib/supabase.ts`:

```ts
import { createClient } from '@supabase/supabase-js'

export function createSupabaseBrowserClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )
}

export function createSupabaseServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )
}
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add lib/orders.ts lib/supabase.ts
git commit -m "feat: add Order types and Supabase client helpers"
```

---

### Task 4: Email helper

**Files:**
- Create: `lib/email.ts`
- Create: `lib/email.test.ts`

- [ ] **Step 1: Write failing tests**

Create `/Users/riazahmed/Documents/MVP/art-shop/lib/email.test.ts`:

```ts
import { sendOrderConfirmationEmail } from './email'
import type { Order } from './orders'

jest.mock('resend', () => ({
  Resend: jest.fn().mockImplementation(() => ({
    emails: {
      send: jest.fn().mockResolvedValue({ data: { id: 'mock-id' }, error: null }),
    },
  })),
}))

const mockOrder: Order = {
  id: 'RA-TEST',
  customer_name: 'Test User',
  email: 'test@example.com',
  phone: '07700000000',
  address: '1 Test St, London',
  items: [
    { id: 'p1', name: 'Test Poster', size: 'A4', price: 12.99, qty: 2 },
  ],
  total: 25.98,
  status: 'pending_payment',
  payment_screenshot_url: null,
  notes: null,
  created_at: '2026-04-30T10:00:00Z',
}

describe('sendOrderConfirmationEmail', () => {
  it('resolves without throwing', async () => {
    await expect(sendOrderConfirmationEmail(mockOrder)).resolves.toBeUndefined()
  })

  it('does not throw even when Resend rejects', async () => {
    const { Resend } = jest.requireMock('resend')
    Resend.mockImplementationOnce(() => ({
      emails: { send: jest.fn().mockRejectedValue(new Error('network error')) },
    }))
    await expect(sendOrderConfirmationEmail(mockOrder)).resolves.toBeUndefined()
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npx jest lib/email.test.ts --no-coverage
```

Expected: FAIL — `Cannot find module './email'`

- [ ] **Step 3: Implement `lib/email.ts`**

Create `/Users/riazahmed/Documents/MVP/art-shop/lib/email.ts`:

```ts
import { Resend } from 'resend'
import type { Order } from './orders'

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
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npx jest lib/email.test.ts --no-coverage
```

Expected: PASS — 2 tests pass.

- [ ] **Step 5: Commit**

```bash
git add lib/email.ts lib/email.test.ts
git commit -m "feat: add sendOrderConfirmationEmail via Resend"
```

---

### Task 5: Database migration

**Files:**
- Create: `supabase/migrations/20260430000000_orders.sql`

- [ ] **Step 1: Create migration directory and file**

```bash
mkdir -p /Users/riazahmed/Documents/MVP/art-shop/supabase/migrations
```

Create `/Users/riazahmed/Documents/MVP/art-shop/supabase/migrations/20260430000000_orders.sql`:

```sql
-- Orders table for riaz.art
CREATE TABLE IF NOT EXISTS orders (
  id                    text PRIMARY KEY,
  customer_name         text NOT NULL,
  email                 text NOT NULL,
  phone                 text NOT NULL,
  address               text NOT NULL,
  items                 jsonb NOT NULL,
  total                 numeric(10, 2) NOT NULL,
  status                text NOT NULL DEFAULT 'pending_payment',
  payment_screenshot_url text,
  notes                 text,
  created_at            timestamptz NOT NULL DEFAULT now()
);

-- Index for admin list (sorted by newest first)
CREATE INDEX IF NOT EXISTS orders_created_at_idx ON orders (created_at DESC);
```

- [ ] **Step 2: Apply migration in Supabase**

Go to your Supabase project → SQL Editor → paste the contents of the migration file and run it.

Verify by checking Table Editor — you should see the `orders` table with all columns.

- [ ] **Step 3: Create storage bucket**

In Supabase dashboard → Storage → New bucket:
- Name: `payment-screenshots`
- Public: ✅ (toggle on)
- Click "Create bucket"

Then add a storage policy to allow service role uploads. In Storage → Policies → `payment-screenshots` → New policy → "For full customization":

```sql
-- Allow service role to insert (upload)
CREATE POLICY "Service role can upload screenshots"
ON storage.objects FOR INSERT
TO service_role
WITH CHECK (bucket_id = 'payment-screenshots');
```

- [ ] **Step 4: Commit migration file**

```bash
git add supabase/migrations/20260430000000_orders.sql
git commit -m "feat: add orders table migration and payment-screenshots bucket"
```

---

### Task 6: Upload screenshot API route

**Files:**
- Create: `app/api/upload-screenshot/route.ts`

- [ ] **Step 1: Create the route handler**

Create `/Users/riazahmed/Documents/MVP/art-shop/app/api/upload-screenshot/route.ts`:

```ts
import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServiceClient } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  const formData = await request.formData()
  const file = formData.get('file') as File | null

  if (!file) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 })
  }

  if (file.size > 5 * 1024 * 1024) {
    return NextResponse.json({ error: 'File too large (max 5MB)' }, { status: 400 })
  }

  if (!file.type.startsWith('image/')) {
    return NextResponse.json({ error: 'File must be an image' }, { status: 400 })
  }

  const supabase = createSupabaseServiceClient()
  const ext = file.name.split('.').pop() ?? 'jpg'
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

  const { error } = await supabase.storage
    .from('payment-screenshots')
    .upload(filename, file, { contentType: file.type, upsert: false })

  if (error) {
    console.error('[upload-screenshot]', error)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }

  const { data } = supabase.storage
    .from('payment-screenshots')
    .getPublicUrl(filename)

  return NextResponse.json({ url: data.publicUrl }, { status: 201 })
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add app/api/upload-screenshot/route.ts
git commit -m "feat: add POST /api/upload-screenshot route"
```

---

### Task 7: Orders API routes

**Files:**
- Create: `app/api/orders/route.ts`
- Create: `app/api/orders/[id]/route.ts`

- [ ] **Step 1: Create `app/api/orders/route.ts`**

Create `/Users/riazahmed/Documents/MVP/art-shop/app/api/orders/route.ts`:

```ts
import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServiceClient } from '@/lib/supabase'
import { generateOrderId } from '@/lib/order-id'
import { sendOrderConfirmationEmail } from '@/lib/email'
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

  // Fire-and-forget email (failure must not block the response)
  sendOrderConfirmationEmail(data as Order)

  return NextResponse.json({ id }, { status: 201 })
}
```

- [ ] **Step 2: Create `app/api/orders/[id]/route.ts`**

First create the directory:

```bash
mkdir -p /Users/riazahmed/Documents/MVP/art-shop/app/api/orders/\[id\]
```

Create `/Users/riazahmed/Documents/MVP/art-shop/app/api/orders/[id]/route.ts`:

```ts
import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServiceClient } from '@/lib/supabase'
import type { OrderStatus } from '@/lib/orders'
import { ORDER_STATUSES } from '@/lib/orders'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const supabase = createSupabaseServiceClient()

  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !data) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 })
  }

  return NextResponse.json(data)
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = request.cookies.get('admin_session')
  if (session?.value !== process.env.ADMIN_SESSION_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  let body: { status?: OrderStatus; notes?: string }

  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const update: Record<string, unknown> = {}
  if (body.status !== undefined) {
    if (!ORDER_STATUSES.includes(body.status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }
    update.status = body.status
  }
  if (body.notes !== undefined) {
    update.notes = body.notes
  }

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: 'Nothing to update' }, { status: 400 })
  }

  const supabase = createSupabaseServiceClient()

  const { data, error } = await supabase
    .from('orders')
    .update(update)
    .eq('id', id)
    .select()
    .single()

  if (error || !data) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 })
  }

  return NextResponse.json(data)
}
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add app/api/orders/route.ts "app/api/orders/[id]/route.ts"
git commit -m "feat: add POST /api/orders and GET+PATCH /api/orders/:id"
```

---

### Task 8: Admin auth — middleware, login API, login page

**Files:**
- Create: `middleware.ts`
- Create: `app/api/admin/login/route.ts`
- Create: `app/admin/login/page.tsx`

- [ ] **Step 1: Create `middleware.ts`**

Create `/Users/riazahmed/Documents/MVP/art-shop/middleware.ts`:

```ts
import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    const session = request.cookies.get('admin_session')
    if (session?.value !== process.env.ADMIN_SESSION_SECRET) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'],
}
```

- [ ] **Step 2: Create `app/api/admin/login/route.ts`**

```bash
mkdir -p /Users/riazahmed/Documents/MVP/art-shop/app/api/admin/login
```

Create `/Users/riazahmed/Documents/MVP/art-shop/app/api/admin/login/route.ts`:

```ts
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  let body: { password?: string }

  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  if (body.password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Incorrect password' }, { status: 401 })
  }

  const response = NextResponse.json({ ok: true })
  response.cookies.set('admin_session', process.env.ADMIN_SESSION_SECRET!, {
    httpOnly: true,
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60, // 7 days
    path: '/',
    secure: process.env.NODE_ENV === 'production',
  })

  return response
}
```

- [ ] **Step 3: Create `app/admin/login/page.tsx`**

```bash
mkdir -p /Users/riazahmed/Documents/MVP/art-shop/app/admin/login
```

Create `/Users/riazahmed/Documents/MVP/art-shop/app/admin/login/page.tsx`:

```tsx
'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminLoginPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })

      if (!res.ok) {
        setError('Incorrect password')
        return
      }

      router.replace('/admin')
    } catch {
      setError('Something went wrong, please try again')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-chalk dark:bg-ink px-4">
      <div className="w-full max-w-sm">
        <h1 className="font-display font-extrabold text-3xl mb-8 text-center">Admin</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="password" className="block font-body text-sm mb-1 text-muted">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoFocus
              className="w-full border border-ink/20 dark:border-chalk/20 rounded-xl px-4 py-3 bg-transparent font-body focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>
          {error && <p className="text-red-500 font-body text-sm">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-accent text-chalk font-display font-bold py-3 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-60"
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </div>
    </main>
  )
}
```

- [ ] **Step 4: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add middleware.ts app/api/admin/login/route.ts app/admin/login/page.tsx
git commit -m "feat: add admin auth (middleware, login API, login page)"
```

---

### Task 9: Checkout components

**Files:**
- Create: `components/checkout/CheckoutForm.tsx`
- Create: `components/checkout/PaymentStep.tsx`
- Create: `components/checkout/ConfirmationStep.tsx`

- [ ] **Step 1: Create `components/checkout/CheckoutForm.tsx`**

```bash
mkdir -p /Users/riazahmed/Documents/MVP/art-shop/components/checkout
```

Create `/Users/riazahmed/Documents/MVP/art-shop/components/checkout/CheckoutForm.tsx`:

```tsx
'use client'
import { useState } from 'react'

export type CustomerDetails = {
  name: string
  email: string
  phone: string
  address: string
}

type Props = {
  onContinue: (details: CustomerDetails) => void
}

export function CheckoutForm({ onContinue }: Props) {
  const [form, setForm] = useState<CustomerDetails>({
    name: '',
    email: '',
    phone: '',
    address: '',
  })
  const [errors, setErrors] = useState<Partial<CustomerDetails>>({})

  function validate(): boolean {
    const e: Partial<CustomerDetails> = {}
    if (!form.name.trim()) e.name = 'Full name is required'
    if (!form.email.trim()) e.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Enter a valid email'
    if (!form.phone.trim()) e.phone = 'Phone number is required'
    if (!form.address.trim()) e.address = 'Delivery address is required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (validate()) onContinue(form)
  }

  function field(
    id: keyof CustomerDetails,
    label: string,
    type: string = 'text',
    multiline = false,
  ) {
    return (
      <div>
        <label htmlFor={id} className="block font-body text-sm mb-1 text-muted">
          {label}
        </label>
        {multiline ? (
          <textarea
            id={id}
            value={form[id]}
            onChange={(e) => setForm((f) => ({ ...f, [id]: e.target.value }))}
            rows={3}
            className="w-full border border-ink/20 dark:border-chalk/20 rounded-xl px-4 py-3 bg-transparent font-body focus:outline-none focus:ring-2 focus:ring-accent resize-none"
          />
        ) : (
          <input
            id={id}
            type={type}
            value={form[id]}
            onChange={(e) => setForm((f) => ({ ...f, [id]: e.target.value }))}
            className="w-full border border-ink/20 dark:border-chalk/20 rounded-xl px-4 py-3 bg-transparent font-body focus:outline-none focus:ring-2 focus:ring-accent"
          />
        )}
        {errors[id] && <p className="text-red-500 font-body text-xs mt-1">{errors[id]}</p>}
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <h2 className="font-display font-bold text-2xl">Your details</h2>
      {field('name', 'Full name')}
      {field('email', 'Email', 'email')}
      {field('phone', 'Phone number', 'tel')}
      {field('address', 'Delivery address', 'text', true)}
      <button
        type="submit"
        className="w-full bg-accent text-chalk font-display font-bold py-3 rounded-xl hover:opacity-90 transition-opacity"
      >
        Continue to payment →
      </button>
    </form>
  )
}
```

- [ ] **Step 2: Create `components/checkout/PaymentStep.tsx`**

Create `/Users/riazahmed/Documents/MVP/art-shop/components/checkout/PaymentStep.tsx`:

```tsx
'use client'
import { useState, useRef } from 'react'
import Image from 'next/image'
import type { CustomerDetails } from './CheckoutForm'
import type { CartItem } from '@/components/providers/CartProvider'

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

  const upiId = 'placeholder@upi'

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
```

- [ ] **Step 3: Create `components/checkout/ConfirmationStep.tsx`**

Create `/Users/riazahmed/Documents/MVP/art-shop/components/checkout/ConfirmationStep.tsx`:

```tsx
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
```

- [ ] **Step 4: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add components/checkout/
git commit -m "feat: add CheckoutForm, PaymentStep, ConfirmationStep components"
```

---

### Task 10: Checkout page & CartDrawer wiring

**Files:**
- Create: `app/checkout/page.tsx`
- Modify: `components/ui/CartDrawer.tsx` (line 62–68)

- [ ] **Step 1: Create `app/checkout/page.tsx`**

```bash
mkdir -p /Users/riazahmed/Documents/MVP/art-shop/app/checkout
```

Create `/Users/riazahmed/Documents/MVP/art-shop/app/checkout/page.tsx`:

```tsx
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
```

- [ ] **Step 2: Wire CartDrawer checkout button to `/checkout`**

Open `components/ui/CartDrawer.tsx`. Replace the disabled checkout button (lines 62–68) with a real Link. The current code reads:

```tsx
                  <button
                    type="button"
                    disabled
                    className="w-full bg-accent text-chalk font-display font-bold py-3 rounded-xl opacity-70 cursor-not-allowed"
                  >
                    Checkout (coming soon)
                  </button>
```

Replace with:

```tsx
                  <Link
                    href="/checkout"
                    onClick={onClose}
                    className="block w-full bg-accent text-chalk font-display font-bold py-3 rounded-xl hover:opacity-90 transition-opacity text-center"
                  >
                    Checkout →
                  </Link>
```

Also add the `Link` import at the top of the file. The current first line is:

```tsx
'use client'
import { motion, AnimatePresence } from 'framer-motion'
import { useCart } from '@/components/providers/CartProvider'
```

Replace with:

```tsx
'use client'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { useCart } from '@/components/providers/CartProvider'
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add app/checkout/page.tsx components/ui/CartDrawer.tsx
git commit -m "feat: add checkout page and wire CartDrawer to /checkout"
```

---

### Task 11: Order tracking page

**Files:**
- Create: `components/orders/OrderTimeline.tsx`
- Create: `components/orders/OrderItemsList.tsx`
- Create: `app/orders/[id]/page.tsx`

- [ ] **Step 1: Create `components/orders/OrderTimeline.tsx`**

```bash
mkdir -p /Users/riazahmed/Documents/MVP/art-shop/components/orders
```

Create `/Users/riazahmed/Documents/MVP/art-shop/components/orders/OrderTimeline.tsx`:

```tsx
import type { OrderStatus } from '@/lib/orders'
import { ORDER_STATUSES, STATUS_LABELS } from '@/lib/orders'

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
```

- [ ] **Step 2: Create `components/orders/OrderItemsList.tsx`**

Create `/Users/riazahmed/Documents/MVP/art-shop/components/orders/OrderItemsList.tsx`:

```tsx
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
```

- [ ] **Step 3: Create `app/orders/[id]/page.tsx`**

```bash
mkdir -p "/Users/riazahmed/Documents/MVP/art-shop/app/orders/[id]"
```

Create `/Users/riazahmed/Documents/MVP/art-shop/app/orders/[id]/page.tsx`:

```tsx
import { notFound } from 'next/navigation'
import type { Order } from '@/lib/orders'
import { OrderTimeline } from '@/components/orders/OrderTimeline'
import { OrderItemsList } from '@/components/orders/OrderItemsList'
import { OrderPoller } from './OrderPoller'

async function fetchOrder(id: string): Promise<Order | null> {
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL ??
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')

  const res = await fetch(`${baseUrl}/api/orders/${id}`, { cache: 'no-store' })
  if (!res.ok) return null
  return res.json()
}

export default async function OrderTrackingPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const order = await fetchOrder(id)

  if (!order) notFound()

  const createdDate = new Date(order.created_at).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  return (
    <main className="min-h-screen bg-chalk dark:bg-ink">
      <OrderPoller orderId={id} />
      <div className="max-w-lg mx-auto px-4 py-12 space-y-8">
        <div>
          <p className="font-body text-sm text-muted mb-1">Order placed {createdDate}</p>
          <h1 className="font-display font-extrabold text-3xl">#{order.id}</h1>
        </div>

        <section>
          <h2 className="font-display font-bold text-lg mb-4">Status</h2>
          <OrderTimeline currentStatus={order.status} />
        </section>

        <section>
          <h2 className="font-display font-bold text-lg mb-4">Items</h2>
          <OrderItemsList items={order.items} total={order.total} />
        </section>

        <section>
          <h2 className="font-display font-bold text-lg mb-2">Delivery address</h2>
          <p className="font-body text-sm text-muted whitespace-pre-line">{order.address}</p>
        </section>
      </div>
    </main>
  )
}
```

- [ ] **Step 4: Create `app/orders/[id]/OrderPoller.tsx`**

Create `/Users/riazahmed/Documents/MVP/art-shop/app/orders/[id]/OrderPoller.tsx`:

```tsx
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
```

- [ ] **Step 5: Create `app/orders/[id]/not-found.tsx`**

Create `/Users/riazahmed/Documents/MVP/art-shop/app/orders/[id]/not-found.tsx`:

```tsx
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
```

- [ ] **Step 6: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 7: Commit**

```bash
git add components/orders/ "app/orders/[id]/"
git commit -m "feat: add order tracking page with 30s polling"
```

---

### Task 12: Admin orders list

**Files:**
- Create: `components/admin/StatusBadge.tsx`
- Create: `components/admin/OrdersTable.tsx`
- Create: `app/admin/page.tsx`

- [ ] **Step 1: Create `components/admin/StatusBadge.tsx`**

```bash
mkdir -p /Users/riazahmed/Documents/MVP/art-shop/components/admin
```

Create `/Users/riazahmed/Documents/MVP/art-shop/components/admin/StatusBadge.tsx`:

```tsx
import type { OrderStatus } from '@/lib/orders'
import { STATUS_LABELS } from '@/lib/orders'

const STATUS_COLOURS: Record<OrderStatus, string> = {
  pending_payment: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
  payment_confirmed: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  processing: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
  shipped: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
  delivered: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  cancelled: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
}

export function StatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span
      className={`inline-block px-2 py-0.5 rounded-full font-body text-xs font-medium ${STATUS_COLOURS[status]}`}
    >
      {STATUS_LABELS[status]}
    </span>
  )
}
```

- [ ] **Step 2: Create `components/admin/OrdersTable.tsx`**

Create `/Users/riazahmed/Documents/MVP/art-shop/components/admin/OrdersTable.tsx`:

```tsx
import Link from 'next/link'
import type { Order } from '@/lib/orders'
import { StatusBadge } from './StatusBadge'

type Props = { orders: Order[] }

export function OrdersTable({ orders }: Props) {
  if (orders.length === 0) {
    return <p className="font-body text-muted py-8 text-center">No orders yet.</p>
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full font-body text-sm border-collapse">
        <thead>
          <tr className="border-b border-ink/10 dark:border-chalk/10 text-left text-muted">
            <th className="py-3 pr-4 font-medium">ID</th>
            <th className="py-3 pr-4 font-medium">Customer</th>
            <th className="py-3 pr-4 font-medium">Date</th>
            <th className="py-3 pr-4 font-medium">Total</th>
            <th className="py-3 pr-4 font-medium">Status</th>
            <th className="py-3 font-medium">Screenshot</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr
              key={order.id}
              className="border-b border-ink/5 dark:border-chalk/5 hover:bg-ink/3 dark:hover:bg-chalk/3 transition-colors"
            >
              <td className="py-3 pr-4">
                <Link
                  href={`/admin/${order.id}`}
                  className="font-display font-bold text-accent hover:underline"
                >
                  {order.id}
                </Link>
              </td>
              <td className="py-3 pr-4">{order.customer_name}</td>
              <td className="py-3 pr-4 text-muted">
                {new Date(order.created_at).toLocaleDateString('en-GB')}
              </td>
              <td className="py-3 pr-4 font-medium">£{order.total.toFixed(2)}</td>
              <td className="py-3 pr-4">
                <StatusBadge status={order.status} />
              </td>
              <td className="py-3">
                {order.payment_screenshot_url ? (
                  <a
                    href={order.payment_screenshot_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-10 h-10 rounded overflow-hidden border border-ink/10 dark:border-chalk/10 hover:opacity-80 transition-opacity"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={order.payment_screenshot_url}
                      alt="Payment screenshot"
                      className="w-full h-full object-cover"
                    />
                  </a>
                ) : (
                  <span className="text-muted">—</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
```

- [ ] **Step 3: Create `app/admin/page.tsx`**

```bash
mkdir -p /Users/riazahmed/Documents/MVP/art-shop/app/admin
```

Create `/Users/riazahmed/Documents/MVP/art-shop/app/admin/page.tsx`:

```tsx
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
```

- [ ] **Step 4: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add components/admin/StatusBadge.tsx components/admin/OrdersTable.tsx app/admin/page.tsx
git commit -m "feat: add admin orders list page"
```

---

### Task 13: Admin order detail

**Files:**
- Create: `components/admin/OrderStatusForm.tsx`
- Create: `app/admin/[id]/page.tsx`

- [ ] **Step 1: Create `components/admin/OrderStatusForm.tsx`**

Create `/Users/riazahmed/Documents/MVP/art-shop/components/admin/OrderStatusForm.tsx`:

```tsx
'use client'
import { useState } from 'react'
import type { Order, OrderStatus } from '@/lib/orders'
import { ORDER_STATUSES, STATUS_LABELS } from '@/lib/orders'

type Props = { order: Order }

export function OrderStatusForm({ order }: Props) {
  const [status, setStatus] = useState<OrderStatus>(order.status)
  const [notes, setNotes] = useState(order.notes ?? '')
  const [statusSaving, setStatusSaving] = useState(false)
  const [notesSaving, setNotesSaving] = useState(false)
  const [statusMsg, setStatusMsg] = useState('')
  const [notesMsg, setNotesMsg] = useState('')

  async function saveStatus() {
    setStatusSaving(true)
    setStatusMsg('')
    try {
      const res = await fetch(`/api/orders/${order.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      setStatusMsg(res.ok ? 'Saved!' : 'Failed to save')
      setTimeout(() => setStatusMsg(''), 2000)
    } catch {
      setStatusMsg('Failed to save')
    } finally {
      setStatusSaving(false)
    }
  }

  async function saveNotes() {
    setNotesSaving(true)
    setNotesMsg('')
    try {
      const res = await fetch(`/api/orders/${order.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes }),
      })
      setNotesMsg(res.ok ? 'Saved!' : 'Failed to save')
      setTimeout(() => setNotesMsg(''), 2000)
    } catch {
      setNotesMsg('Failed to save')
    } finally {
      setNotesSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <label htmlFor="status" className="block font-body text-sm text-muted">
          Status
        </label>
        <div className="flex gap-2">
          <select
            id="status"
            value={status}
            onChange={(e) => setStatus(e.target.value as OrderStatus)}
            className="flex-1 border border-ink/20 dark:border-chalk/20 rounded-xl px-4 py-2 bg-transparent font-body text-sm focus:outline-none focus:ring-2 focus:ring-accent"
          >
            {ORDER_STATUSES.map((s) => (
              <option key={s} value={s}>
                {STATUS_LABELS[s]}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={saveStatus}
            disabled={statusSaving}
            className="bg-accent text-chalk font-display font-bold px-5 py-2 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-60"
          >
            {statusSaving ? 'Saving…' : 'Save'}
          </button>
        </div>
        {statusMsg && (
          <p className={`font-body text-xs ${statusMsg === 'Saved!' ? 'text-green-600' : 'text-red-500'}`}>
            {statusMsg}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <label htmlFor="notes" className="block font-body text-sm text-muted">
          Admin notes
        </label>
        <textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={4}
          placeholder="Internal notes (not visible to customer)"
          className="w-full border border-ink/20 dark:border-chalk/20 rounded-xl px-4 py-3 bg-transparent font-body text-sm focus:outline-none focus:ring-2 focus:ring-accent resize-none"
        />
        <button
          type="button"
          onClick={saveNotes}
          disabled={notesSaving}
          className="bg-accent text-chalk font-display font-bold px-5 py-2 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-60"
        >
          {notesSaving ? 'Saving…' : 'Save notes'}
        </button>
        {notesMsg && (
          <p className={`font-body text-xs ${notesMsg === 'Saved!' ? 'text-green-600' : 'text-red-500'}`}>
            {notesMsg}
          </p>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Create `app/admin/[id]/page.tsx`**

```bash
mkdir -p "/Users/riazahmed/Documents/MVP/art-shop/app/admin/[id]"
```

Create `/Users/riazahmed/Documents/MVP/art-shop/app/admin/[id]/page.tsx`:

```tsx
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createSupabaseServiceClient } from '@/lib/supabase'
import type { Order } from '@/lib/orders'
import { OrderTimeline } from '@/components/orders/OrderTimeline'
import { OrderItemsList } from '@/components/orders/OrderItemsList'
import { StatusBadge } from '@/components/admin/StatusBadge'
import { OrderStatusForm } from '@/components/admin/OrderStatusForm'

async function fetchOrder(id: string): Promise<Order | null> {
  const supabase = createSupabaseServiceClient()
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('id', id)
    .single()
  if (error || !data) return null
  return data as Order
}

export const dynamic = 'force-dynamic'

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const order = await fetchOrder(id)

  if (!order) notFound()

  const createdDate = new Date(order.created_at).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <main className="min-h-screen bg-chalk dark:bg-ink">
      <div className="max-w-2xl mx-auto px-4 py-10 space-y-8">
        <div className="flex items-center gap-4">
          <Link href="/admin" className="font-body text-sm text-muted hover:text-accent transition-colors">
            ← Back to orders
          </Link>
        </div>

        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="font-display font-extrabold text-3xl">{order.id}</h1>
            <p className="font-body text-sm text-muted mt-1">{createdDate}</p>
          </div>
          <StatusBadge status={order.status} />
        </div>

        {/* Customer info */}
        <section className="space-y-1">
          <h2 className="font-display font-bold text-lg mb-3">Customer</h2>
          <p className="font-body text-sm"><strong>Name:</strong> {order.customer_name}</p>
          <p className="font-body text-sm"><strong>Email:</strong> {order.email}</p>
          <p className="font-body text-sm"><strong>Phone:</strong> {order.phone}</p>
          <p className="font-body text-sm"><strong>Address:</strong><br /><span className="text-muted whitespace-pre-line">{order.address}</span></p>
        </section>

        {/* Items */}
        <section>
          <h2 className="font-display font-bold text-lg mb-3">Items</h2>
          <OrderItemsList items={order.items} total={order.total} />
        </section>

        {/* Status timeline */}
        <section>
          <h2 className="font-display font-bold text-lg mb-3">Timeline</h2>
          <OrderTimeline currentStatus={order.status} />
        </section>

        {/* Payment screenshot */}
        {order.payment_screenshot_url && (
          <section>
            <h2 className="font-display font-bold text-lg mb-3">Payment screenshot</h2>
            <a
              href={order.payment_screenshot_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block hover:opacity-80 transition-opacity"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={order.payment_screenshot_url}
                alt="Payment screenshot"
                className="max-w-xs rounded-xl border border-ink/10 dark:border-chalk/10"
              />
            </a>
            <p className="font-body text-xs text-muted mt-1">Click to open full size</p>
          </section>
        )}

        {/* Status & notes form */}
        <section>
          <h2 className="font-display font-bold text-lg mb-3">Update order</h2>
          <OrderStatusForm order={order} />
        </section>
      </div>
    </main>
  )
}
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add components/admin/OrderStatusForm.tsx "app/admin/[id]/page.tsx"
git commit -m "feat: add admin order detail page with status and notes editing"
```

---

### Task 14: Build verification

**Files:** None (verification only)

- [ ] **Step 1: Run the full test suite**

```bash
cd /Users/riazahmed/Documents/MVP/art-shop
npx jest --no-coverage
```

Expected: all tests pass (order-id, email, existing lib tests).

- [ ] **Step 2: Run production build**

```bash
npm run build
```

Expected: Build completes without errors. Note any warnings but do not block on warnings.

- [ ] **Step 3: Check for missing env vars**

Ensure `.env.local` (not committed) contains all six vars from `.env.local.example`:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `RESEND_API_KEY`
- `ADMIN_PASSWORD`
- `ADMIN_SESSION_SECRET`

- [ ] **Step 4: Smoke-test locally**

```bash
npm run dev
```

Verify manually:
1. Open `/shop` → add item to cart → open drawer → click "Checkout →" → lands on `/checkout`
2. Fill details form → Continue to payment → shows cart summary + UPI section + upload button
3. Place order (without screenshot) → gets to confirmation screen with order ID
4. Navigate to `/orders/RA-XXXX` → order tracking page shows correct status
5. Navigate to `/admin/login` → enter password → redirects to `/admin` → orders table shows the order
6. Click order ID → detail page shows all fields + status dropdown

- [ ] **Step 5: Final commit**

```bash
git add -A
git commit -m "chore: build verification pass — orders & admin feature complete"
```

---

## Notes for implementer

- **Next.js 16 App Router:** `params` in route handlers and page components is a `Promise` — always `await params`. See `node_modules/next/dist/docs/` for the current API.
- **Supabase service client** is used in all server-side code (API routes, server components). Never expose `SUPABASE_SERVICE_ROLE_KEY` to the browser.
- **Email failures** are caught silently — `sendOrderConfirmationEmail` never throws. Order creation must not fail because of email.
- **Empty cart guard** in checkout redirects to `/shop` before rendering anything — `return null` after the redirect handles the brief moment before navigation.
- **UPI QR image** at `/images/upi-qr-placeholder.png` — add a placeholder PNG to `public/images/` if you want the image to render rather than error silently.
- **`ADMIN_SESSION_SECRET`** is the cookie value itself (not a signing key) — keep it long and random.
