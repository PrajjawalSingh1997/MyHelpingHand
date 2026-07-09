'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Eye, EyeOff, Loader2, Mail } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()

  const [email, setEmail]         = useState('')
  const [password, setPassword]   = useState('')
  const [showPass, setShowPass]   = useState(false)
  const [loading, setLoading]     = useState(false)
  const [error, setError]         = useState('')

  // Forgot password state
  const [showForgot, setShowForgot] = useState(false)
  const [resetEmail, setResetEmail] = useState('')
  const [resetSent, setResetSent]   = useState(false)
  const [resetLoading, setResetLoading] = useState(false)
  const [resetError, setResetError]     = useState('')

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) { setError(error.message); setLoading(false); return }
    // keep loading=true during navigation so button stays disabled
    router.push('/')
    router.refresh()
  }

  async function handleReset(e: React.FormEvent) {
    e.preventDefault()
    setResetLoading(true)
    setResetError('')
    const { error } = await supabase.auth.resetPasswordForEmail(resetEmail.trim(), {
      redirectTo: `${window.location.origin}/auth/callback?type=recovery`,
    })
    setResetLoading(false)
    if (error) { setResetError(error.message); return }
    setResetSent(true)
  }

  const inputStyle = {
    background: 'var(--surface-hover)',
    border: '1px solid var(--border)',
    color: 'var(--text)',
  }

  return (
    <div className="card">
      <div className="mb-8 text-center">
        <div className="text-3xl mb-2">⚡</div>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text)' }}>Life OS</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Sign in to your operating system</p>
      </div>

      {!showForgot ? (
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-muted)' }}>Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com" required
              className="w-full px-3 py-2.5 rounded-lg text-sm outline-none transition-colors" style={inputStyle} />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-sm font-medium" style={{ color: 'var(--text-muted)' }}>Password</label>
              <button type="button" onClick={() => { setShowForgot(true); setResetEmail(email) }}
                className="text-xs" style={{ color: 'var(--accent)' }}>
                Forgot password?
              </button>
            </div>
            <div className="relative">
              <input type={showPass ? 'text' : 'password'} value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••" required
                className="w-full px-3 py-2.5 pr-10 rounded-lg text-sm outline-none transition-colors" style={inputStyle} />
              <button type="button" onClick={() => setShowPass(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }}>
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {error && (
            <p className="text-sm px-3 py-2 rounded-lg"
              style={{ background: 'rgba(255,107,107,0.1)', color: 'var(--danger)' }}>
              {error}
            </p>
          )}

          <button type="submit" disabled={loading}
            className="w-full py-2.5 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-opacity disabled:opacity-60"
            style={{ background: 'var(--accent)', color: '#fff' }}>
            {loading && <Loader2 size={15} className="animate-spin" />}
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>
      ) : (
        <div className="space-y-4">
          {!resetSent ? (
            <form onSubmit={handleReset} className="space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <Mail size={16} style={{ color: 'var(--accent)' }} />
                <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>Reset your password</p>
              </div>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                Enter your email and we&apos;ll send you a reset link.
              </p>
              <input type="email" value={resetEmail} onChange={e => setResetEmail(e.target.value)}
                placeholder="you@example.com" required
                className="w-full px-3 py-2.5 rounded-lg text-sm outline-none" style={inputStyle} />
              {resetError && (
                <p className="text-xs px-3 py-2 rounded-lg" style={{ background: 'rgba(255,107,107,0.1)', color: 'var(--danger)' }}>
                  {resetError}
                </p>
              )}
              <div className="flex gap-2">
                <button type="submit" disabled={resetLoading}
                  className="btn-primary text-sm flex items-center gap-2">
                  {resetLoading && <Loader2 size={14} className="animate-spin" />}
                  Send Reset Email
                </button>
                <button type="button" onClick={() => setShowForgot(false)} className="btn-ghost text-sm">
                  Back to login
                </button>
              </div>
            </form>
          ) : (
            <div className="text-center space-y-3 py-4">
              <div className="text-3xl">📧</div>
              <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>Check your inbox</p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                A reset link was sent to <strong>{resetEmail}</strong>. Check your email and follow the link.
              </p>
              <button onClick={() => { setShowForgot(false); setResetSent(false) }}
                className="btn-ghost text-sm">Back to login</button>
            </div>
          )}
        </div>
      )}

      <p className="text-center text-sm mt-6" style={{ color: 'var(--text-muted)' }}>
        Don&apos;t have an account?{' '}
        <Link href="/signup" className="font-medium" style={{ color: 'var(--accent)' }}>Sign up</Link>
      </p>
    </div>
  )
}
