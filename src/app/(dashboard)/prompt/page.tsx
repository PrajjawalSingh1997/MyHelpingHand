'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Copy, Check, Upload, Loader2, AlertCircle } from 'lucide-react'

const PROMPT_TEMPLATE = `You are a Life OS planning assistant. Generate a complete 90-day plan for me in exact JSON format.

## My Profile
Name: [YOUR NAME]
Start Date: [START DATE, e.g. 2026-07-05]
Main Goal This Cycle: [YOUR MAIN GOAL]
Current Situation: [BRIEF DESCRIPTION - e.g. "building freelance career, learning full-stack dev"]

## My 90-Day Objectives
1. [OBJECTIVE 1]
2. [OBJECTIVE 2]
3. [OBJECTIVE 3]

## Daily Timetable Plans
Plan A (Standard day): 5AM wake, morning routine, deep work 9-1PM, afternoon tasks, evening content/skills
Plan B (Heavy work day): More deep work blocks, minimal social media
Plan C (Business dev day): Cold calls, proposals, networking, client work

## Task Categories Available
linkedin, github, twitter, freelance, portfolio, blog, rentlyf, learning, networking, health, personal

---

Please generate the JSON in this EXACT format (no deviations):

\`\`\`json
{
  "cycle": {
    "title": "90-Day Cycle: [YOUR GOAL]",
    "start_date": "[YYYY-MM-DD]",
    "end_date": "[YYYY-MM-DD 90 days later]",
    "goal": "[YOUR MAIN GOAL]"
  },
  "days": [
    {
      "day_number": 1,
      "date": "[YYYY-MM-DD]",
      "plan_type": "A",
      "theme": "Launch Day",
      "notes": "First day - establish momentum",
      "tasks": [
        {
          "title": "Morning routine: workout + meditation",
          "category": "health",
          "platform": null,
          "content": "30 min workout, 10 min meditation",
          "sort_order": 1
        },
        {
          "title": "Write LinkedIn post about starting 90-day challenge",
          "category": "linkedin",
          "platform": "LinkedIn",
          "content": "Hook: [Write hook here]\\n\\nBody: [Write post body]\\n\\nCTA: [Call to action]",
          "sort_order": 2
        }
      ]
    }
    ... (continue for all 90 days)
  ]
}
\`\`\`

Generate all 90 days. Each day should have 6-10 tasks. Vary the plan_type (A/B/C) based on day of week per the weekly rhythm. Include realistic, actionable tasks for each category. Make tasks specific, not generic.`

function CopyButton({ text, label }: { text: string; label: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <button onClick={async () => {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 3000)
    }} className="flex items-center gap-2 btn-primary text-sm">
      {copied ? <><Check size={14} /> Copied!</> : <><Copy size={14} /> {label}</>}
    </button>
  )
}

export default function PromptPage() {
  const router = useRouter()
  const [jsonInput, setJsonInput]   = useState('')
  const [importing, setImporting]   = useState(false)
  const [error, setError]           = useState<string | null>(null)
  const [success, setSuccess]       = useState(false)
  const [step, setStep]             = useState<1 | 2 | 3>(1)

  const importPlan = async () => {
    setError(null)
    setImporting(true)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      let parsed: any
      try {
        // Strip markdown code fences if present
        const clean = jsonInput.replace(/^```json\n?/m, '').replace(/\n?```$/m, '').trim()
        parsed = JSON.parse(clean)
      } catch {
        throw new Error('Invalid JSON. Make sure you copied the full JSON output from the AI.')
      }

      if (!parsed.cycle || !parsed.days || !Array.isArray(parsed.days)) {
        throw new Error('JSON missing required fields: cycle and days array.')
      }

      // Deactivate existing cycles
      await supabase.from('ninety_day_cycles').update({ is_active: false }).eq('user_id', user.id)

      // Create cycle
      const { data: cycle, error: cycleErr } = await supabase
        .from('ninety_day_cycles')
        .insert({
          user_id: user.id,
          title: parsed.cycle.title,
          start_date: parsed.cycle.start_date,
          end_date: parsed.cycle.end_date,
          goal: parsed.cycle.goal,
          is_active: true,
        })
        .select()
        .single()
      if (cycleErr) throw new Error(`Failed to create cycle: ${cycleErr.message}`)

      // Insert days in batches
      const BATCH_SIZE = 10
      for (let i = 0; i < parsed.days.length; i += BATCH_SIZE) {
        const batch = parsed.days.slice(i, i + BATCH_SIZE)
        const { data: insertedDays, error: daysErr } = await supabase
          .from('days')
          .insert(batch.map((d: any) => ({
            cycle_id: cycle.id,
            user_id: user.id,
            day_number: d.day_number,
            date: d.date,
            plan_type: d.plan_type ?? 'A',
            theme: d.theme ?? null,
            notes: d.notes ?? null,
          })))
          .select('id, day_number')
        if (daysErr) throw new Error(`Failed to insert days: ${daysErr.message}`)

        // Insert tasks for each day
        const dayMap = new Map((insertedDays ?? []).map((d: any) => [d.day_number, d.id]))
        const allTasks: any[] = []
        batch.forEach((d: any) => {
          const dayId = dayMap.get(d.day_number)
          if (!dayId || !d.tasks) return
          d.tasks.forEach((t: any, idx: number) => {
            allTasks.push({
              day_id: dayId,
              user_id: user.id,
              title: t.title,
              category: t.category ?? 'personal',
              platform: t.platform ?? null,
              content: t.content ?? null,
              status: 'pending',
              sort_order: t.sort_order ?? idx + 1,
            })
          })
        })
        if (allTasks.length > 0) {
          const { error: tasksErr } = await supabase.from('tasks').insert(allTasks)
          if (tasksErr) throw new Error(`Failed to insert tasks: ${tasksErr.message}`)
        }
      }

      setSuccess(true)
      setTimeout(() => router.push('/'), 2000)
    } catch (e: any) {
      setError(e.message ?? 'Unknown error')
    }
    setImporting(false)
  }

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="text-5xl mb-4">🎉</div>
        <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--text)' }}>90-Day Plan Imported!</h2>
        <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>Redirecting to your dashboard...</p>
      </div>
    )
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text)' }}>✨ Prompt & Import</h1>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          Generate your 90-day plan using AI, then import it here to power your entire Life OS.
        </p>
      </div>

      {/* Steps indicator */}
      <div className="flex items-center gap-4">
        {([
          { n: 1 as const, label: 'Fill Prompt' },
          { n: 2 as const, label: 'Get JSON from AI' },
          { n: 3 as const, label: 'Import Plan' },
        ]).map(({ n, label }) => (
          <button key={n} onClick={() => setStep(n)} className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold"
              style={{ background: step === n ? 'var(--accent)' : step > n ? 'var(--success)' : 'var(--surface)', color: step >= n ? '#fff' : 'var(--text-muted)' }}>
              {step > n ? '✓' : n}
            </div>
            <span className="text-xs font-medium" style={{ color: step === n ? 'var(--text)' : 'var(--text-muted)' }}>{label}</span>
            {n < 3 && <ChevronRight size={14} style={{ color: 'var(--border)' }} />}
          </button>
        ))}
      </div>

      {step === 1 && (
        <div className="card space-y-4">
          <div>
            <h2 className="text-sm font-semibold mb-1" style={{ color: 'var(--text)' }}>Step 1: Copy this prompt template</h2>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              Fill in the bracketed fields with your real information, then paste into ChatGPT / Claude / Gemini.
            </p>
          </div>
          <div className="relative">
            <pre className="rounded-xl p-4 text-xs overflow-x-auto whitespace-pre-wrap leading-relaxed" style={{ background: 'var(--bg)', color: 'var(--text-muted)', border: '1px solid var(--border)', maxHeight: '500px' }}>
              {PROMPT_TEMPLATE}
            </pre>
          </div>
          <div className="flex gap-3">
            <CopyButton text={PROMPT_TEMPLATE} label="Copy Prompt Template" />
            <button onClick={() => setStep(2)} className="btn-ghost text-sm flex items-center gap-1">
              Next: Get JSON <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="card space-y-4">
          <h2 className="text-sm font-semibold" style={{ color: 'var(--text)' }}>Step 2: Get JSON from AI</h2>
          <div className="space-y-3 text-sm" style={{ color: 'var(--text-muted)' }}>
            <div className="flex items-start gap-3">
              <span className="h-6 w-6 flex-shrink-0 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: 'var(--accent)', color: '#fff' }}>1</span>
              <p>Paste the prompt into your AI (ChatGPT 4, Claude, or Gemini). Fill in all [BRACKETED] fields first.</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="h-6 w-6 flex-shrink-0 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: 'var(--accent)', color: '#fff' }}>2</span>
              <p>Wait for the AI to generate all 90 days. This may take a moment. Make sure you see "day_number: 90" at the end.</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="h-6 w-6 flex-shrink-0 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: 'var(--accent)', color: '#fff' }}>3</span>
              <p>Copy the entire JSON response (including the ``` fences if present). Then click Next.</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setStep(1)} className="btn-ghost text-sm">← Back</button>
            <button onClick={() => setStep(3)} className="btn-primary text-sm flex items-center gap-1">
              Next: Import <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="card space-y-4">
          <div>
            <h2 className="text-sm font-semibold mb-1" style={{ color: 'var(--text)' }}>Step 3: Paste & Import your 90-day plan</h2>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              Paste the complete JSON from the AI below. This will create your 90-day cycle and all tasks.
              <strong style={{ color: 'var(--warning)' }}> Warning: This will deactivate your current active cycle.</strong>
            </p>
          </div>

          {error && (
            <div className="flex items-start gap-2 rounded-lg p-3" style={{ background: 'rgba(255,107,107,0.15)', color: 'var(--danger)' }}>
              <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          <textarea
            value={jsonInput}
            onChange={e => setJsonInput(e.target.value)}
            rows={16}
            className="input w-full resize-none font-mono text-xs"
            placeholder={`Paste the JSON here...\n\n{\n  "cycle": {\n    "title": "...",\n    ...\n  },\n  "days": [...]\n}`}
          />

          <div className="flex gap-3">
            <button onClick={() => setStep(2)} className="btn-ghost text-sm">← Back</button>
            <button onClick={importPlan} disabled={importing || !jsonInput.trim()}
              className="btn-primary flex items-center gap-2 text-sm"
              style={{ opacity: importing || !jsonInput.trim() ? 0.6 : 1 }}>
              {importing ? <><Loader2 size={14} className="animate-spin" /> Importing...</> : <><Upload size={14} /> Import 90-Day Plan</>}
            </button>
          </div>
        </div>
      )}

      {/* How it works */}
      <div className="card" style={{ background: 'rgba(108,92,231,0.05)', border: '1px solid rgba(108,92,231,0.2)' }}>
        <h3 className="mb-2 text-sm font-semibold" style={{ color: 'var(--accent)' }}>How this works</h3>
        <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
          Every 90 days, you fill this prompt template with your goals and context, paste it into AI, and get back a complete daily plan with tasks for all 90 days. Import it here and the entire app — Today, Calendar, Progress, Goals — is powered by this plan. No manual data entry. Pure signal.
        </p>
      </div>
    </div>
  )
}

function ChevronRight({ size, style }: { size: number; style?: React.CSSProperties }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style}>
      <polyline points="9 18 15 12 9 6" />
    </svg>
  )
}
