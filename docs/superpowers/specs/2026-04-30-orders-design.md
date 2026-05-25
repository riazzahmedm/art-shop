# riaz.art Orders & Admin Design

**Date:** 2026-04-30  
**Status:** Approved

## Overview

Add UPI-based order placement, order tracking, transactional email, and an admin panel to riaz.art. No customer accounts — customers are identified by their order ID. Orders are stored in Supabase. Emails are sent via Resend.

---

## Architecture

- **Database:** Supabase (Postgres) — one `orders` table
- **File storage:** Supabase Storage — `payment-screenshots` bucket (public read, write via service role key)
- **Email:** Resend — one transactional email per order
- **Admin auth:** `ADMIN_PASSWORD` env var, checked in Next.js middleware, session stored in a signed `admin_session` cookie
- **API:** Next.js App Router route handlers (`app/api/...`)
- **No customer auth** — order tracking is by URL knowledge only (`/orders/RA-XXXX`)

---

## Data Model

### `orders` table (Supabase Postgres)

| Column | Type | Notes |
|--------|------|-------|
| `id` | `text` PRIMARY KEY | Format: `RA-XXXX` (4 random uppercase alphanumeric chars) |
| `customer_name` | `text` NOT NULL | |
| `email` | `text` NOT NULL | |
| `phone` | `text` NOT NULL | |
| `address` | `text` NOT NULL | Full delivery address |
| `items` | `jsonb` NOT NULL | Snapshot of cart at order time |
| `total` | `numeric(10,2)` NOT NULL | In GBP (£) |
| `status` | `text` NOT NULL DEFAULT `'pending_payment'` | See statuses below |
| `payment_screenshot_url` | `text` | Supabase Storage public URL, nullable |
| `notes` | `text` | Admin-only notes, nullable |
| `created_at` | `timestamptz` NOT NULL DEFAULT `now()` | |

### Order statuses (in lifecycle order)

1. `pending_payment` — order placed, awaiting payment screenshot
2. `payment_confirmed` — you've confirmed the UPI transfer
3. `processing` — preparing the order (printing/packaging)
4. `shipped` — dispatched
5. `delivered` — confirmed delivered
6. `cancelled` — cancelled for any reason

### `items` jsonb shape

```ts
Array<{
  id: string          // product ID
  name: string        // product name at time of order
  size: string        // selected size
  price: number       // unit price at time of order
  qty: number         // quantity
}>
```

---

## File Structure

```
app/
  checkout/
    page.tsx                  # Multi-step checkout: details → payment → confirmation
  orders/
    [id]/
      page.tsx                # Customer-facing order tracking page
  admin/
    page.tsx                  # Admin orders list (protected)
    [id]/
      page.tsx                # Admin order detail + status update
  api/
    orders/
      route.ts                # POST /api/orders — create order
    orders/[id]/
      route.ts                # GET /api/orders/:id — fetch order
                              # PATCH /api/orders/:id — update status/notes (admin)
middleware.ts                 # Protect /admin/* routes via cookie check
lib/
  supabase.ts                 # createServerClient + createBrowserClient helpers
  orders.ts                   # Order type definitions + DB query helpers
  email.ts                    # sendOrderConfirmationEmail(order) via Resend
  order-id.ts                 # generateOrderId() → "RA-XXXX"
components/
  checkout/
    CheckoutForm.tsx           # Step 1: customer details form
    PaymentStep.tsx            # Step 2: UPI QR + screenshot upload
    ConfirmationStep.tsx       # Step 3: order confirmed, ID + tracking link
  orders/
    OrderTimeline.tsx          # Status timeline component (shared: tracking + admin)
    OrderItemsList.tsx         # Line items table (shared: tracking + admin)
  admin/
    OrdersTable.tsx            # Sortable orders list with status badges
    OrderStatusForm.tsx        # Status dropdown + notes + save
```

---

## User-Facing Flows

### Checkout (`/checkout`)

Entry point: "Checkout" button in `CartDrawer` (currently disabled "coming soon"). Navigates to `/checkout` with cart state (from `CartProvider` context — no URL params needed since it's client-side state).

**Step 1 — Customer details**
- Fields: Full name (required), Email (required, validated), Phone (required), Delivery address (required, textarea)
- "Continue to payment" button → Step 2

**Step 2 — Payment**
- Shows cart summary (items + total)
- Placeholder UPI QR image (`/images/upi-qr-placeholder.png`)
- UPI ID displayed as copyable text: `placeholder@upi`
- Instructions: "Pay exactly £X.XX and upload your payment screenshot below"
- File upload: accepts image/* (JPEG/PNG/WebP), max 5MB
- Screenshot uploaded to Supabase Storage on selection (before submit), returns public URL
- "Place order" button → calls `POST /api/orders` → Step 3

**Step 3 — Confirmation**
- Shows order ID: `#RA-XXXX`
- Message: "Order placed! We'll confirm your payment within 24 hours."
- "Track your order →" link to `/orders/RA-XXXX`
- "Continue shopping" link to `/shop`
- Email is sent server-side inside the POST handler

**Cart is cleared** after successful order creation by calling `clear()` from `CartProvider` context inside `ConfirmationStep`.

**Empty cart guard:** If `/checkout` is visited with an empty cart, redirect immediately to `/shop`.

### Order Tracking (`/orders/[id]`)

- Fetches order via `GET /api/orders/:id`
- 404 page if ID not found
- Shows:
  - Order ID + created date
  - Status timeline (5 nodes, current status highlighted)
  - Ordered items list with sizes, quantities, prices
  - Order total
  - Delivery address (customer's own data, no privacy concern)
- **No login required** — URL is the "auth"
- Page refreshes status every 30 seconds via `setInterval` in a `useEffect` calling `router.refresh()` (Next.js server component re-fetch, no websockets needed)

### Transactional Email

Sent immediately after `POST /api/orders` succeeds.

- **From:** `orders@riaz.art` (requires DNS verification in Resend — use `onboarding@resend.dev` as fallback during development)
- **To:** customer email
- **Subject:** `Your riaz.art order #RA-XXXX`
- **Body (plain + HTML):**
  - Order ID
  - Items summary
  - Total
  - Tracking link: `https://riaz.art/orders/RA-XXXX`
  - "We'll confirm your UPI payment within 24 hours"

---

## Admin Panel

### Authentication

`middleware.ts` intercepts all requests to `/admin/*`. Checks for a valid `admin_session` cookie (value = `sha256(ADMIN_PASSWORD + secret_salt)`). If absent/invalid → redirect to `/admin/login`.

`/admin/login` — simple form: password field → `POST /api/admin/login` → sets cookie → redirect to `/admin`.

Cookie: `httpOnly`, `sameSite: strict`, `maxAge: 7 days`.

### `/admin` — Orders list

- Server component — fetches all orders from Supabase ordered by `created_at DESC`
- Table columns: ID, Customer name, Date, Total, Status (coloured badge), Payment screenshot (thumbnail, click to enlarge)
- Status badge colours:
  - `pending_payment` → yellow
  - `payment_confirmed` → blue
  - `processing` → purple
  - `shipped` → orange
  - `delivered` → green
  - `cancelled` → grey
- Each row links to `/admin/[id]`

### `/admin/[id]` — Order detail

- Full customer info (name, email, phone, address)
- Items ordered
- Payment screenshot (full size, opens in new tab)
- **Status update:** dropdown with all 6 statuses + "Save" button → `PATCH /api/orders/:id`
- **Admin notes:** textarea + "Save notes" button → same PATCH endpoint
- "Back to orders" link

---

## API Routes

### `POST /api/orders`

**Body:**
```ts
{
  customer_name: string
  email: string
  phone: string
  address: string
  items: CartItem[]
  total: number
  payment_screenshot_url: string | null
}
```

**Logic:**
1. Validate all required fields
2. Generate order ID via `generateOrderId()`
3. Insert into Supabase `orders` table
4. Call `sendOrderConfirmationEmail(order)`
5. Return `{ id: "RA-XXXX" }` with 201

**Error:** 400 on validation failure, 500 on DB/email error

### `GET /api/orders/[id]`

- Fetch order by ID from Supabase
- Return full order object (all fields including `notes` — order ID is the only "auth")
- 404 if not found

### `PATCH /api/orders/[id]`

- **Admin only** — middleware validates `admin_session` cookie
- Body: `{ status?: string, notes?: string }`
- Updates Supabase row
- Returns updated order
- 401 if not authenticated, 404 if order not found

### `POST /api/admin/login`

- Body: `{ password: string }`
- Compares against `ADMIN_PASSWORD` env var
- On match: sets `admin_session` cookie, returns 200
- On mismatch: returns 401

---

## Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=       # used server-side only (file uploads, admin ops)
RESEND_API_KEY=
ADMIN_PASSWORD=
ADMIN_SESSION_SECRET=            # random string for cookie signing
```

---

## Error Handling

- **Checkout:** inline form validation before submit; API errors show inline error message ("Something went wrong, please try again"); screenshot upload errors shown immediately on file select
- **Order tracking:** 404 page with "Order not found — double-check your order ID" message
- **Admin:** all PATCH errors shown as toast; login failure shows "Incorrect password"
- **Email failure:** does NOT block order creation — order is saved, email failure is logged server-side (order still gets confirmation page)

---

## Out of Scope

- Customer login / accounts
- Automated payment verification (UPI confirmation is manual)
- Order cancellation by customer
- Refund flow
- Product inventory tracking
- Multiple admin users
- Push/SMS notifications
