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
