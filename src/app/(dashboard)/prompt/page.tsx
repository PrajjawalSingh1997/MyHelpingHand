'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Copy, Check, Upload, Loader2, AlertCircle } from 'lucide-react'

const PROMPT_FULL = `You are a Life OS planning assistant. Generate a complete 90-day plan for me in exact JSON format.

## My Profile
Name: [YOUR NAME]
Start Date: [START DATE, e.g. 2026-07-05]
Main Goal This Cycle: [YOUR MAIN GOAL]
Current Situation: [BRIEF DESCRIPTION]

## My 90-Day Objectives
1. [OBJECTIVE 1]
2. [OBJECTIVE 2]
3. [OBJECTIVE 3]

## Daily Plans
Plan A (Standard day): 5AM wake, morning routine, deep work 9-1PM, afternoon tasks, evening content/skills
Plan B (Heavy work day): More deep work blocks, minimal social media
Plan C (Business dev day): Cold calls, proposals, networking, client work

## Task Categories
linkedin, github, twitter, freelance, portfolio, blog, rentlyf, learning, networking, health, personal

---

Please generate the JSON in this EXACT format:

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

Generate all 90 days. Each day should have 6-10 tasks. Vary the plan_type (A/B/C). Include realistic, actionable tasks.`

const PROMPT_CHUNK = (chunkStart: number, chunkEnd: number) =>
`You are a Life OS planning assistant. Generate days ${chunkStart}–${chunkEnd} of my 90-day plan in exact JSON format.

NOTE: Output ONLY the days array for days ${chunkStart}–${chunkEnd}. No "cycle" wrapper needed — just the days.

## Context
Name: [YOUR NAME]
Start Date: [START DATE, e.g. 2026-07-05]
Main Goal: [YOUR MAIN GOAL]
Current Situation: [BRIEF DESCRIPTION]

## Task Categories
linkedin, github, twitter, freelance, portfolio, blog, rentlyf, learning, networking, health, personal

## Daily Plans
Plan A (Standard): morning routine, deep work, tasks, evening content
Plan B (Heavy): extended deep work, minimal social
Plan C (Business): calls, proposals, networking

---

Generate ONLY days ${chunkStart} to ${chunkEnd} in this EXACT format:

\`\`\`json
{
  "days": [
    {
      "day_number": ${chunkStart},
      "date": "[YYYY-MM-DD for day ${chunkStart}]",
      "plan_type": "A",
      "theme": "[Day theme]",
      "notes": "[Optional note]",
      "tasks": [
        {
          "title": "[Task title]",
          "category": "[category]",
          "platform": null,
          "content": "[Task content/post text]",
          "sort_order": 1
        }
      ]
    }
  ]
}
\`\`\`

Generate all ${chunkEnd - chunkStart + 1} days (${chunkStart}–${chunkEnd}). 6-10 tasks per day.`

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

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr + 'T00:00:00')
  d.setDate(d.getDate() + days)
  return d.toISOString().split('T')[0]
}

function todayLocal(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export default function PromptPage() {
  const router = useRouter()
  const [jsonInput, setJsonInput] = useState('')
  const [startDate, setStartDate] = useState(todayLocal)
  const [importing, setImporting] = useState(false)
  const [error, setError]         = useState<string | null>(null)
  const [success, setSuccess]     = useState(false)
  const [step, setStep]           = useState<1 | 2 | 3>(1)
  const [appendMode, setAppendMode] = useState(false)
  const [promptMode, setPromptMode] = useState<'full' | 'chunk'>('full')
  const [chunkStart, setChunkStart] = useState(31)
  const [chunkEnd, setChunkEnd]     = useState(60)

  const importPlan = async () => {
    setError(null)
    setImporting(true)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      let parsed: any
      try {
        const clean = jsonInput.replace(/^```json\n?/m, '').replace(/\n?```$/m, '').trim()
        parsed = JSON.parse(clean)
      } catch {
        throw new Error('Invalid JSON. Make sure you copied the full JSON output from the AI.')
      }

      // Normalize: chunk mode gives { days: [...] }, full mode gives { cycle, days }
      const isChunk = !parsed.cycle && Array.isArray(parsed.days)

      if (appendMode || isChunk) {
        // APPEND MODE — find existing active cycle and add days
        const { data: activeCycle } = await supabase
          .from('ninety_day_cycles')
          .select('id, start_date')
          .eq('user_id', user.id)
          .eq('is_active', true)
          .single() as { data: { id: string; start_date: string } | null }

        if (!activeCycle) throw new Error('No active cycle found. Import a full plan first before appending chunks.')

        const days = parsed.days
        if (!Array.isArray(days) || days.length === 0) throw new Error('No days found in the JSON.')

        // Recalculate dates from active cycle's start date
        const cycleStart = activeCycle.start_date
        const mappedDays = days.map((d: any) => ({
          ...d,
          date: addDays(cycleStart, d.day_number - 1),
        }))

        // Check for duplicates
        const dayNumbers = mappedDays.map((d: any) => d.day_number)
        const { data: existingDays } = await supabase
          .from('days')
          .select('day_number')
          .eq('cycle_id', activeCycle.id)
          .in('day_number', dayNumbers) as { data: { day_number: number }[] | null }

        if (existingDays && existingDays.length > 0) {
          const dupes = existingDays.map(d => d.day_number).join(', ')
          throw new Error(`Days ${dupes} already exist in your cycle. Remove them first or use different day numbers.`)
        }

        // Insert days in batches
        const BATCH_SIZE = 10
        for (let i = 0; i < mappedDays.length; i += BATCH_SIZE) {
          const batch = mappedDays.slice(i, i + BATCH_SIZE)
          const { data: insertedDays, error: daysErr } = await supabase
            .from('days')
            .insert(batch.map((d: any) => ({
              cycle_id: activeCycle.id,
              user_id: user.id,
              day_number: d.day_number,
              date: d.date,
              plan_type: d.plan_type ?? 'A',
              theme: d.theme ?? null,
              notes: d.notes ?? null,
            })))
            .select('id, day_number')
          if (daysErr) throw new Error(`Failed to insert days: ${daysErr.message}`)

          const dayMap = new Map((insertedDays ?? []).map((d: any) => [d.day_number, d.id]))
          const allTasks: any[] = []
          batch.forEach((d: any) => {
            const dayId = dayMap.get(d.day_number)
            if (!dayId || !d.tasks) return
            d.tasks.forEach((t: any, idx: number) => {
              allTasks.push({
                day_id: dayId, user_id: user.id,
                title: t.title, category: t.category ?? 'personal',
                platform: t.platform ?? null, content: t.content ?? null,
                status: 'pending', sort_order: t.sort_order ?? idx + 1,
              })
            })
          })
          if (allTasks.length > 0) {
            const { error: tasksErr } = await supabase.from('tasks').insert(allTasks)
            if (tasksErr) throw new Error(`Failed to insert tasks: ${tasksErr.message}`)
          }
        }

      } else {
        // FULL IMPORT MODE — create a new cycle
        if (!parsed.cycle || !Array.isArray(parsed.days)) {
          throw new Error('JSON missing required fields: cycle and days array. For chunk import, enable Append Mode.')
        }

        const chosenStart = startDate || parsed.cycle.start_date
        parsed.cycle.start_date = chosenStart
        parsed.cycle.end_date   = addDays(chosenStart, 89)
        parsed.days = parsed.days.map((d: any) => ({
          ...d,
          date: addDays(chosenStart, d.day_number - 1),
        }))

        await supabase.from('ninety_day_cycles').update({ is_active: false }).eq('user_id', user.id)

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

        const BATCH_SIZE = 10
        for (let i = 0; i < parsed.days.length; i += BATCH_SIZE) {
          const batch = parsed.days.slice(i, i + BATCH_SIZE)
          const { data: insertedDays, error: daysErr } = await supabase
            .from('days')
            .insert(batch.map((d: any) => ({
              cycle_id: cycle.id, user_id: user.id,
              day_number: d.day_number, date: d.date,
              plan_type: d.plan_type ?? 'A',
              theme: d.theme ?? null, notes: d.notes ?? null,
            })))
            .select('id, day_number')
          if (daysErr) throw new Error(`Failed to insert days: ${daysErr.message}`)

          const dayMap = new Map((insertedDays ?? []).map((d: any) => [d.day_number, d.id]))
          const allTasks: any[] = []
          batch.forEach((d: any) => {
            const dayId = dayMap.get(d.day_number)
            if (!dayId || !d.tasks) return
            d.tasks.forEach((t: any, idx: number) => {
              allTasks.push({
                day_id: dayId, user_id: user.id,
                title: t.title, category: t.category ?? 'personal',
                platform: t.platform ?? null, content: t.content ?? null,
                status: 'pending', sort_order: t.sort_order ?? idx + 1,
              })
            })
          })
          if (allTasks.length > 0) {
            const { error: tasksErr } = await supabase.from('tasks').insert(allTasks)
            if (tasksErr) throw new Error(`Failed to insert tasks: ${tasksErr.message}`)
          }
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
        <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--text)' }}>
          {appendMode ? 'Days Appended!' : '90-Day Plan Imported!'}
        </h2>
        <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>Redirecting to your dashboard...</p>
      </div>
    )
  }

  const chunkPromptText = PROMPT_CHUNK(chunkStart, chunkEnd)

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text)' }}>✨ Prompt & Import</h1>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          Generate your 90-day plan using AI, then import it here.
        </p>
      </div>

      {/* Steps indicator */}
      <div className="flex items-center gap-4">
        {([
          { n: 1 as const, label: 'Get Prompt' },
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
            <h2 className="text-sm font-semibold mb-1" style={{ color: 'var(--text)' }}>Step 1: Copy the prompt template</h2>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              Fill in the [BRACKETED] fields, then paste into ChatGPT / Claude / Gemini.
            </p>
          </div>

          {/* Prompt mode toggle */}
          <div className="flex gap-2">
            <button onClick={() => setPromptMode('full')}
              className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
              style={{ background: promptMode === 'full' ? 'var(--accent)' : 'var(--surface-hover)', color: promptMode === 'full' ? '#fff' : 'var(--text-muted)' }}>
              Full 90-Day (Claude / Gemini)
            </button>
            <button onClick={() => setPromptMode('chunk')}
              className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
              style={{ background: promptMode === 'chunk' ? 'var(--accent)' : 'var(--surface-hover)', color: promptMode === 'chunk' ? '#fff' : 'var(--text-muted)' }}>
              30-Day Chunk (ChatGPT / limited AI)
            </button>
          </div>

          {promptMode === 'chunk' && (
            <div className="flex items-center gap-4 p-3 rounded-xl" style={{ background: 'rgba(253,203,110,0.08)', border: '1px solid rgba(253,203,110,0.25)' }}>
              <p className="text-xs flex-1" style={{ color: 'var(--warning)' }}>
                ChatGPT often can&apos;t output 90 days at once. Use 30-day chunks: generate days 1–30, import, then append 31–60, then 61–90.
              </p>
              <div className="flex items-center gap-2 flex-shrink-0">
                <label className="text-xs" style={{ color: 'var(--text-muted)' }}>Days</label>
                <input type="number" value={chunkStart} min={1} max={89}
                  onChange={e => setChunkStart(Number(e.target.value))}
                  className="input w-16 text-xs text-center" />
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>–</span>
                <input type="number" value={chunkEnd} min={2} max={90}
                  onChange={e => setChunkEnd(Number(e.target.value))}
                  className="input w-16 text-xs text-center" />
              </div>
            </div>
          )}

          <div className="relative">
            <pre className="rounded-xl p-4 text-xs overflow-x-auto whitespace-pre-wrap leading-relaxed"
              style={{ background: 'var(--bg)', color: 'var(--text-muted)', border: '1px solid var(--border)', maxHeight: '420px' }}>
              {promptMode === 'full' ? PROMPT_FULL : chunkPromptText}
            </pre>
          </div>
          <div className="flex gap-3">
            <CopyButton text={promptMode === 'full' ? PROMPT_FULL : chunkPromptText}
              label={promptMode === 'full' ? 'Copy Full Prompt' : `Copy Days ${chunkStart}–${chunkEnd} Prompt`} />
            <button onClick={() => setStep(2)} className="btn-ghost text-sm flex items-center gap-1">
              Next <ChevronRight size={14} />
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
              <p>Paste the prompt into your AI. Fill in all [BRACKETED] fields first.</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="h-6 w-6 flex-shrink-0 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: 'var(--accent)', color: '#fff' }}>2</span>
              <p>Wait for the full JSON output. For full mode: make sure you see day_number: 90 at the end. For chunk mode: check that all days in your range are present.</p>
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
            <h2 className="text-sm font-semibold mb-1" style={{ color: 'var(--text)' }}>Step 3: Paste & Import</h2>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              Paste the JSON from the AI below, then click Import.
            </p>
          </div>

          {/* Start date override (full mode only) */}
          {!appendMode && (
            <div className="flex items-center gap-4 p-3 rounded-xl" style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}>
              <div className="flex-1">
                <p className="text-xs font-semibold mb-0.5" style={{ color: 'var(--text)' }}>Cycle Start Date</p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  All dates will be recalculated from this date.
                </p>
              </div>
              <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)}
                className="input text-sm" style={{ width: '160px' }} />
            </div>
          )}

          {/* Append mode toggle */}
          <div className="flex items-center gap-3 p-3 rounded-xl" style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}>
            <label className="flex items-center gap-3 cursor-pointer w-full">
              <div onClick={() => setAppendMode(v => !v)}
                className="relative h-5 w-9 rounded-full flex-shrink-0 transition-colors"
                style={{ background: appendMode ? 'var(--accent)' : 'var(--border)' }}>
                <div className="absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform"
                  style={{ transform: appendMode ? 'translateX(16px)' : 'translateX(2px)' }} />
              </div>
              <div>
                <p className="text-xs font-semibold" style={{ color: 'var(--text)' }}>Append Mode (for 30-day chunks)</p>
                <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                  Adds days to your existing active cycle instead of replacing it. Use this when importing chunks 2 and 3.
                </p>
              </div>
            </label>
          </div>

          {!appendMode && (
            <div className="rounded-lg px-3 py-2 text-xs" style={{ background: 'rgba(255,107,107,0.1)', color: 'var(--danger)' }}>
              Warning: This will deactivate your current active cycle and create a new one.
            </div>
          )}

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
            placeholder={appendMode
              ? `Paste the chunk JSON here...\n\n{\n  "days": [...]\n}`
              : `Paste the full JSON here...\n\n{\n  "cycle": {\n    "title": "...",\n    ...\n  },\n  "days": [...]\n}`}
          />

          <div className="flex gap-3">
            <button onClick={() => setStep(2)} className="btn-ghost text-sm">← Back</button>
            <button onClick={importPlan} disabled={importing || !jsonInput.trim()}
              className="btn-primary flex items-center gap-2 text-sm"
              style={{ opacity: importing || !jsonInput.trim() ? 0.6 : 1 }}>
              {importing
                ? <><Loader2 size={14} className="animate-spin" /> Importing...</>
                : <><Upload size={14} /> {appendMode ? 'Append Days' : 'Import 90-Day Plan'}</>}
            </button>
          </div>
        </div>
      )}

      {/* How it works */}
      <div className="card" style={{ background: 'rgba(108,92,231,0.05)', border: '1px solid rgba(108,92,231,0.2)' }}>
        <h3 className="mb-2 text-sm font-semibold" style={{ color: 'var(--accent)' }}>Workflow for ChatGPT users</h3>
        <ol className="space-y-1 text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
          <li>1. Use the <strong>30-Day Chunk</strong> prompt for days 1–30 → import normally (full mode)</li>
          <li>2. Use chunk prompt for days 31–60 → turn on <strong>Append Mode</strong> → import</li>
          <li>3. Use chunk prompt for days 61–90 → Append Mode → import</li>
          <li>4. Your cycle will have all 90 days combined, with no data loss.</li>
        </ol>
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
