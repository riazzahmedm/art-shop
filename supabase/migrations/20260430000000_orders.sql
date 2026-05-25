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
