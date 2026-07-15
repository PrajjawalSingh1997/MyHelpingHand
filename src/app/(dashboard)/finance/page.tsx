'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { format, parseISO } from 'date-fns'
import { Plus, Pencil, Trash2, Loader2, TrendingUp, TrendingDown, DollarSign } from 'lucide-react'
import { useToast } from '@/components/ui/toast'
import type { FinanceEntry } from '@/types/database'

const CATEGORIES = {
  income: ['Salary', 'Freelance', 'Rentlyf', 'Investment Returns', 'Other Income'],
  expense: ['Food', 'Rent', 'Transport', 'Utilities', 'Entertainment', 'Health', 'Education', 'Shopping', 'EMI / Debt', 'Other'],
}

function EntryForm({ initial, onSave, onCancel }: {
  initial?: Partial<FinanceEntry>
  onSave: (e: Partial<FinanceEntry>) => Promise<void>
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
  const [saving, setSaving] = useState(false)
  const [error, setError]   = useState('')

  const handleSave = async () => {
    const amt = parseFloat(f.amount)
    if (!f.amount || isNaN(amt) || amt <= 0) { setError('Enter a valid amount.'); return }
    setSaving(true); setError('')
    await onSave({ ...f, amount: amt })
    setSaving(false)
  }

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
      {error && <p className="text-xs" style={{ color: 'var(--danger)' }}>{error}</p>}
      <div className="flex gap-2">
        <button onClick={handleSave} disabled={saving}
          className="btn-primary flex items-center gap-2 text-sm" style={{ opacity: saving ? 0.6 : 1 }}>
          {saving && <Loader2 size={14} className="animate-spin" />}
          {saving ? 'Saving…' : 'Save'}
        </button>
        <button onClick={onCancel} className="btn-ghost text-sm">Cancel</button>
      </div>
    </div>
  )
}

export default function FinancePage() {
  const { show } = useToast()
  const [entries, setEntries] = useState<FinanceEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [userId, setUserId]   = useState<string | null>(null)
  const [adding, setAdding]   = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [filter, setFilter]   = useState<'all' | 'income' | 'expense'>('all')
  const [debtPaid, setDebtPaid] = useState('')
  const [debtSaving, setDebtSaving] = useState(false)
  const [currentDebt, setCurrentDebt] = useState(0)
  const [debtTotal, setDebtTotal] = useState(80000)
  const [editingDebtTotal, setEditingDebtTotal] = useState(false)
  const [debtTotalInput, setDebtTotalInput] = useState('')

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setLoading(false); return }
      setUserId(user.id)

      const [eRes, sRes] = await Promise.all([
        supabase.from('finance_entries').select('*').eq('user_id', user.id).order('date', { ascending: false }).limit(100),
        supabase.from('user_settings').select('debt_remaining, debt_total').eq('user_id', user.id).single(),
      ])
      const e = eRes.data as FinanceEntry[] | null
      const s = sRes.data as { debt_remaining: number; debt_total: number } | null

      setEntries(e ?? [])
      if (s?.debt_remaining != null) setCurrentDebt(s.debt_remaining)
      if (s?.debt_total != null && s.debt_total > 0) setDebtTotal(s.debt_total)
      setLoading(false)
    }
    load()
  }, [])

  const addEntry = async (partial: Partial<FinanceEntry>) => {
    if (!userId) return
    const supabase = createClient()
    const { data, error } = await supabase.from('finance_entries').insert({ ...partial, user_id: userId }).select().single() as { data: FinanceEntry | null; error: any }
    if (data && !error) { setEntries(prev => [data, ...prev]); show('Entry added!', 'success') }
    else show('Failed to add entry.', 'error')
    setAdding(false)
  }

  const updateEntry = async (id: string, partial: Partial<FinanceEntry>) => {
    const supabase = createClient()
    const { error } = await supabase.from('finance_entries').update(partial).eq('id', id)
    if (!error) { setEntries(prev => prev.map(e => e.id === id ? { ...e, ...partial } : e)); show('Entry updated!', 'success') }
    else show('Failed to update entry.', 'error')
    setEditingId(null)
  }

  const deleteEntry = async (id: string) => {
    if (!confirm('Delete this entry?')) return
    const supabase = createClient()
    const { error } = await supabase.from('finance_entries').delete().eq('id', id)
    if (!error) { setEntries(prev => prev.filter(e => e.id !== id)); show('Entry deleted.', 'success') }
    else show('Failed to delete entry.', 'error')
  }

  const saveDebtTotal = async () => {
    if (!userId || !debtTotalInput) return
    const val = parseFloat(debtTotalInput)
    if (isNaN(val) || val <= 0) return
    const supabase = createClient()
    const { error } = await supabase.from('user_settings').update({ debt_total: val }).eq('user_id', userId)
    if (!error) { setDebtTotal(val); show('Debt total updated!', 'success') }
    else show('Failed to update debt total.', 'error')
    setEditingDebtTotal(false)
    setDebtTotalInput('')
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
      is_debt_payment: true,
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
      is_debt_payment: true,
      created_at: new Date().toISOString(),
    } as FinanceEntry, ...prev])
    setDebtPaid('')
    setDebtSaving(false)
    show(`Debt payment of ₹${paid.toLocaleString('en-IN')} recorded!`, 'success')
  }

  if (loading) return (
    <div className="flex items-center justify-center py-24">
      <Loader2 size={32} className="animate-spin" style={{ color: 'var(--accent)' }} />
    </div>
  )

  const totalIncome  = entries.filter(e => e.type === 'income').reduce((s, e) => s + (e.amount ?? 0), 0)
  const totalExpense = entries.filter(e => e.type === 'expense').reduce((s, e) => s + (e.amount ?? 0), 0)
  const net          = totalIncome - totalExpense
  const debtPct      = debtTotal > 0 ? Math.min(Math.round(((debtTotal - currentDebt) / debtTotal) * 100), 100) : 0

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
            {editingDebtTotal ? (
              <div className="flex items-center gap-2 mt-1">
                <input type="number" value={debtTotalInput} onChange={e => setDebtTotalInput(e.target.value)}
                  className="input text-xs w-32" placeholder="Total debt (₹)" />
                <button onClick={saveDebtTotal} className="text-xs btn-primary py-1">Save</button>
                <button onClick={() => setEditingDebtTotal(false)} className="text-xs btn-ghost py-1">Cancel</button>
              </div>
            ) : (
              <button onClick={() => { setEditingDebtTotal(true); setDebtTotalInput(String(debtTotal)) }}
                className="text-xs" style={{ color: 'var(--text-muted)' }}>
                Total: ₹{debtTotal.toLocaleString('en-IN')} <span style={{ color: 'var(--accent)' }}>(edit)</span>
              </button>
            )}
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold" style={{ color: 'var(--danger)' }}>₹{currentDebt.toLocaleString('en-IN')}</p>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>remaining</p>
          </div>
        </div>
        <div className="h-3 w-full overflow-hidden rounded-full mb-3" style={{ background: 'var(--border)' }}>
          <div className="h-full rounded-full transition-all" style={{ width: `${debtPct}%`, background: 'linear-gradient(to right, #ff6b6b, #f43f5e)' }} />
        </div>
        <p className="mb-3 text-xs" style={{ color: 'var(--text-muted)' }}>{debtPct}% repaid (₹{(debtTotal - currentDebt).toLocaleString('en-IN')} paid)</p>
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
                    {!entry.is_debt_payment && (
                      <button onClick={() => deleteEntry(entry.id)} className="rounded p-1" style={{ color: 'var(--danger)' }}><Trash2 size={13} /></button>
                    )}
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
