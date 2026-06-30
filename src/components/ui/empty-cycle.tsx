import Link from 'next/link'
import { Sparkles } from 'lucide-react'

export function EmptyCycle() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <Sparkles size={48} style={{ color: 'var(--accent)' }} className="mb-4" />
      <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--text)' }}>
        No active 90-day plan yet
      </h2>
      <p className="text-sm mb-6 max-w-sm" style={{ color: 'var(--text-muted)' }}>
        Fill your prompt template, paste it into AI, import the result — and your 90-day plan will power this entire app.
      </p>
      <Link
        href="/prompt"
        className="px-5 py-2.5 rounded-lg text-sm font-semibold"
        style={{ background: 'var(--accent)', color: '#fff' }}
      >
        Go to Prompt &amp; Import
      </Link>
    </div>
  )
}
