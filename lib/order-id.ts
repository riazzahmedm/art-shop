const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'

export function generateOrderId(): string {
  let suffix = ''
  for (let i = 0; i < 4; i++) {
    suffix += CHARS[Math.floor(Math.random() * CHARS.length)]
  }
  return `RA-${suffix}`
}
