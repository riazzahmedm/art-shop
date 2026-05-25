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
