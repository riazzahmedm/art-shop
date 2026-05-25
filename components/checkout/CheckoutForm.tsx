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
