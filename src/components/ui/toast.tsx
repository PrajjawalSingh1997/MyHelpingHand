'use client'
import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'

type ToastType = 'success' | 'error' | 'info'
interface Toast { id: string; message: string; type: ToastType }
interface ToastCtx { show: (message: string, type?: ToastType) => void }

const ToastContext = createContext<ToastCtx>({ show: () => {} })

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const show = useCallback((message: string, type: ToastType = 'success') => {
    const id = `${Date.now()}-${Math.random()}`
    setToasts(t => [...t, { id, message, type }])
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3000)
  }, [])

  const bg: Record<ToastType, string> = {
    success: 'var(--success)',
    error:   'var(--danger)',
    info:    'var(--accent)',
  }
  const prefix: Record<ToastType, string> = {
    success: '✓',
    error:   '✗',
    info:    'ℹ',
  }

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      <div style={{ position: 'fixed', bottom: '24px', right: '24px', display: 'flex', flexDirection: 'column', gap: '8px', zIndex: 9999 }}>
        {toasts.map(t => (
          <div key={t.id} style={{
            padding: '10px 16px',
            borderRadius: '10px',
            fontSize: '13px',
            fontWeight: 500,
            color: '#fff',
            background: bg[t.type],
            boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
            animation: 'toast-in 0.2s ease',
            maxWidth: '320px',
          }}>
            {prefix[t.type]} {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() { return useContext(ToastContext) }
