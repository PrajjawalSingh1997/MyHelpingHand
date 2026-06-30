'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { format, parseISO } from 'date-fns'
import { Plus, Pencil, Trash2, Loader2, TrendingUp, TrendingDown, DollarSign } from 'lucide-react'
import type { FinanceEntry } from '@/types/database'

const CATEGORIES = {
  income: ['Salary', 'Freelance', 'Rentlyf', 'Investment Returns', 'Other Income'],
  expense: ['Food', 'Rent', 'Transport', 'Utilities', 'Entertainment', 'Health', 'Education', 'Shopping', 'EMI / Debt', 'Other'],
}

const DEBT_TOTAL = 80000

function EntryForm({ initial, onSave, onCancel }: {
  initial?: Partial<FinanceEntry>
  onSave: (e: Partial<FinanceEntry>) => void
  onCancel: () => void
}) {
  const [f, setF] = useState({
    date: initial?.date ?? format(new Date(), 'yyyy-MM-dd'),
    type: (initial?.type ?? 'expense') as 'income' | 'expense',
    category: initial?.category ?? 'Food',
    description: initial?.description ?? '',
    amount: String(initial?.amount ?? ''),
    currency: initial?.currency ?? 'INR',
  })
  return (
    <div className="space-y-3 rounded-xl p-5" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
      <div className="flex gap-3">
        <div>
          <label className="label">Date</label>
          <input type="date" value={f.date} onChange={e => setF({ ...f, date: e.target.value })} className="input mt-1" />
        </div>
        <div>
          <label className="label">Type</label>
          <select value={f.type} onChange={e => setF({ ...f, type: e.target.value as 'income' | 'expense', category: e.target.value === 'income' ? 'Salary' : 'Food' })} className="input mt-1">
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
        </div>
        <div className="flex-1">
          <label className="label">Category</label>
          <select value={f.category ?? ''} onChange={e => setF({ ...f, category: e.target.value })} className="input mt-1 w-full">
            {(CATEGORIES[f.type] ?? []).map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="flex-1">
          <label className="label">Amount (₹)</label>
          <input type="number" value={f.amount} onChange={e => setF({ ...f, amount: e.target.value })} className="input mt-1 w-full" placeholder="0" />
        </div>
      </div>
      <div>
        <label className="label">Description</label>
        <input value={f.description ?? ''} onChange={e => setF({ ...f, description: e.target.value })} className="input mt-1 w-full" placeholder="What was this for?" />
      </div>
      <div className="flex gap-2">
        <button onClick={() => onSave({ ...f, amount: parseFloat(f.amount) })} className="btn-primary text-sm">Save</button>
        <button onClick={onCancel} className="btn-ghost text-sm">Cancel</button>
      </div>
    </div>
  )
}

export default function FinancePage() {
  const [entries, setEntries] = useState<FinanceEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [userId, setUserId]   = useState<string | null>(null)
  const [adding, setAdding]   = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [filter, setFilter]   = useState<'all' | 'income' | 'expense'>('all')
  const [debtPaid, setDebtPaid] = useState('')
  const [debtSaving, setDebtSaving] = useState(false)
  const [currentDebt, setCurrentDebt] = useState(DEBT_TOTAL)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setLoading(false); return }
      setUserId(user.id)

      const [eRes, sRes] = await Promise.all([
        supabase.from('finance_entries').select('*').eq('user_id', user.id).order('date', { ascending: false }).limit(100),
        supabase.from('user_settings').select('debt_remaining').eq('user_id', user.id).single(),
      ])
      const e = eRes.data as FinanceEntry[] | null
      const s = sRes.data as { debt_remaining: number } | null

      setEntries(e ?? [])
      if (s?.debt_remaining != null) setCurrentDebt(s.debt_remaining)
      setLoading(false)
    }
    load()
  }, [])

  const addEntry = async (partial: Partial<FinanceEntry>) => {
    if (!userId) return
    const supabase = createClient()
    const { data } = await supabase.from('finance_entries').insert({ ...partial, user_id: userId }).select().single() as { data: FinanceEntry | null }
    if (data) setEntries(prev => [data, ...prev])
    setAdding(false)
  }

  const updateEntry = async (id: string, partial: Partial<FinanceEntry>) => {
    const supabase = createClient()
    await supabase.from('finance_entries').update(partial).eq('id', id)
    setEntries(prev => prev.map(e => e.id === id ? { ...e, ...partial } : e))
    setEditingId(null)
  }

  const deleteEntry = async (id: string) => {
    if (!confirm('Delete this entry?')) return
    const supabase = createClient()
    await supabase.from('finance_entries').delete().eq('id', id)
    setEntries(prev => prev.filter(e => e.id !== id))
  }

  const saveDebt = async () => {
    if (!userId || !debtPaid) return
    setDebtSaving(true)
    const supabase = createClient()
    const newDebt = Math.max(0, currentDebt - parseFloat(debtPaid))
    await supabase.from('user_settings').update({ debt_remaining: newDebt }).eq('user_id', userId)
    await supabase.from('finance_entries').insert({
      user_id: userId,
      date: format(new Date(), 'yyyy-MM-dd'),
      type: 'expense',
      category: 'EMI / Debt',
      description: 'Debt repayment',
      amount: parseFloat(debtPaid),
      currency: 'INR',
    })
    setCurrentDebt(newDebt)
    const paid = parseFloat(debtPaid)
    setEntries(prev => [{
      id: crypto.randomUUID(),
      user_id: userId,
      date: format(new Date(), 'yyyy-MM-dd'),
      type: 'expense',
      category: 'EMI / Debt',
      description: 'Debt repayment',
      amount: paid,
      currency: 'INR',
      created_at: new Date().toISOString(),
    } as FinanceEntry, ...prev])
    setDebtPaid('')
    setDebtSaving(false)
  }

  if (loading) return (
    <div className="flex items-center justify-center py-24">
      <Loader2 size={32} className="animate-spin" style={{ color: 'var(--accent)' }} />
    </div>
  )

  const totalIncome  = entries.filter(e => e.type === 'income').reduce((s, e) => s + (e.amount ?? 0), 0)
  const totalExpense = entries.filter(e => e.type === 'expense').reduce((s, e) => s + (e.amount ?? 0), 0)
  const net          = totalIncome - totalExpense
  const debtPct      = Math.min(Math.round(((DEBT_TOTAL - currentDebt) / DEBT_TOTAL) * 100), 100)

  const filtered = filter === 'all' ? entries : entries.filter(e => e.type === filter)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text)' }}>💰 Finance Tracker</h1>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{entries.length} entries tracked</p>
        </div>
        <button onClick={() => { setAdding(true); setEditingId(null) }} className="btn-primary flex items-center gap-2 text-sm">
          <Plus size={16} /> Add Entry
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { icon: <TrendingUp size={18} style={{ color: 'var(--success)' }} />, label: 'Total Income', value: totalIncome, color: 'var(--success)' },
          { icon: <TrendingDown size={18} style={{ color: 'var(--danger)' }} />, label: 'Total Expense', value: totalExpense, color: 'var(--danger)' },
          { icon: <DollarSign size={18} style={{ color: net >= 0 ? 'var(--success)' : 'var(--danger)' }} />, label: 'Net Balance', value: net, color: net >= 0 ? 'var(--success)' : 'var(--danger)' },
        ].map(s => (
          <div key={s.label} className="card">
            <div className="flex items-center gap-2 mb-2">{s.icon}<span className="text-xs" style={{ color: 'var(--text-muted)' }}>{s.label}</span></div>
            <p className="text-2xl font-bold" style={{ color: s.color }}>
              {s.value >= 0 ? '' : '-'}₹{Math.abs(s.value).toLocaleString('en-IN')}
            </p>
          </div>
        ))}
      </div>

      {/* Debt tracker */}
      <div className="card">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-sm font-semibold" style={{ color: 'var(--text)' }}>Debt Countdown</h2>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Total: ₹{DEBT_TOTAL.toLocaleString('en-IN')}</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold" style={{ color: 'var(--danger)' }}>₹{currentDebt.toLocaleString('en-IN')}</p>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>remaining</p>
          </div>
        </div>
        <div className="h-3 w-full overflow-hidden rounded-full mb-3" style={{ background: 'var(--border)' }}>
          <div className="h-full rounded-full transition-all" style={{ width: `${debtPct}%`, background: 'linear-gradient(to right, #ff6b6b, #f43f5e)' }} />
        </div>
        <p className="mb-3 text-xs" style={{ color: 'var(--text-muted)' }}>{debtPct}% repaid (₹{(DEBT_TOTAL - currentDebt).toLocaleString('en-IN')} paid)</p>
        <div className="flex gap-3">
          <input type="number" value={debtPaid} onChange={e => setDebtPaid(e.target.value)} className="input flex-1" placeholder="Amount paid this time (₹)" />
          <button onClick={saveDebt} disabled={debtSaving || !debtPaid} className="btn-primary text-sm" style={{ opacity: debtSaving || !debtPaid ? 0.6 : 1 }}>
            {debtSaving ? 'Saving...' : 'Log Payment'}
          </button>
        </div>
      </div>

      {/* Entries */}
      <div className="flex gap-2">
        {(['all', 'income', 'expense'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className="rounded-full px-3 py-1 text-xs font-medium transition-all"
            style={{ background: filter === f ? 'var(--accent)' : 'var(--surface)', color: filter === f ? '#fff' : 'var(--text-muted)' }}>
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {adding && <EntryForm onSave={addEntry} onCancel={() => setAdding(false)} />}

      <div className="card">
        <div className="space-y-2">
          {filtered.length === 0 && !adding && (
            <p className="py-8 text-center text-sm" style={{ color: 'var(--text-muted)' }}>No entries yet.</p>
          )}
          {filtered.map(entry => {
            if (editingId === entry.id) {
              return (
                <EntryForm key={entry.id} initial={entry}
                  onSave={p => updateEntry(entry.id, p)}
                  onCancel={() => setEditingId(null)} />
              )
            }
            const isIncome = entry.type === 'income'
            return (
              <div key={entry.id} className="group flex items-center justify-between border-b py-2" style={{ borderColor: 'rgba(45,45,63,0.5)' }}>
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 flex-shrink-0 rounded-full flex items-center justify-center"
                    style={{ background: isIncome ? 'rgba(0,184,148,0.15)' : 'rgba(255,107,107,0.15)' }}>
                    {isIncome ? <TrendingUp size={14} style={{ color: 'var(--success)' }} /> : <TrendingDown size={14} style={{ color: 'var(--danger)' }} />}
                  </div>
                  <div>
                    <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>{entry.description || entry.category}</p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      {entry.category} · {format(parseISO(entry.date), 'MMM d, yyyy')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <p className="text-sm font-bold" style={{ color: isIncome ? 'var(--success)' : 'var(--danger)' }}>
                    {isIncome ? '+' : '-'}₹{(entry.amount ?? 0).toLocaleString('en-IN')}
                  </p>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => { setEditingId(entry.id); setAdding(false) }} className="rounded p-1" style={{ color: 'var(--text-muted)' }}><Pencil size={13} /></button>
                    <button onClick={() => deleteEntry(entry.id)} className="rounded p-1" style={{ color: 'var(--danger)' }}><Trash2 size={13} /></button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
