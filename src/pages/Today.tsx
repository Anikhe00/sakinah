import { useEffect, useRef, useState } from 'react'
import { FeelingChips } from '../components/FeelingChips'
import { ResultCard } from '../components/ResultCard'
import { btnQuiet, eyebrow } from '../components/ui'
import type { ContentItem, ContentType } from '../content/types'
import { logRepository } from '../data'
import type { FeelingId } from '../lib/feelings'
import { pickContent } from '../lib/pick'

type Ask = ContentType | 'surprise'

const ASKS: { ask: Ask; label: string }[] = [
  { ask: 'verse', label: 'A verse' },
  { ask: 'dhikr', label: 'A dhikr' },
  { ask: 'talk', label: 'A talk' },
  { ask: 'surprise', label: 'Surprise me' },
]

const today = new Intl.DateTimeFormat(undefined, { weekday: 'long', day: 'numeric', month: 'long' })

export function Today() {
  const [feeling, setFeeling] = useState<FeelingId | null>(null)
  const [note, setNote] = useState('')
  const [ask, setAsk] = useState<Ask | null>(null)
  const [result, setResult] = useState<ContentItem | null>(null)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [dateLine] = useState(() => today.format(new Date()))
  const headingRef = useRef<HTMLHeadingElement>(null)
  const resultRef = useRef<HTMLElement>(null)
  const scrollPending = useRef(false)

  useEffect(() => {
    if (!result || !scrollPending.current) return
    scrollPending.current = false
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    resultRef.current?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' })
    headingRef.current?.focus({ preventScroll: true })
  }, [result])

  const choose = (next: FeelingId) => {
    setFeeling(next)
    setResult(null)
    setAsk(null)
  }

  const show = (nextAsk: Ask, previous?: ContentItem) => {
    if (!feeling) return
    const picked = pickContent(feeling, nextAsk, previous)
    if (!picked) return
    setAsk(nextAsk)
    setResult(picked)
    setSaved(false)
    setError(null)
    scrollPending.current = true
  }

  const save = async () => {
    if (!feeling || !result) return
    try {
      await logRepository.add({ feeling, note: note.trim(), content: result })
      setSaved(true)
    } catch {
      setError('Could not save this one. Please try again.')
    }
  }

  return (
    <div className="space-y-8">
      <header className="pt-2">
        <p className={eyebrow}>{dateLine}</p>
        <h1 className="mt-2 font-serif text-[2.1rem] leading-[1.15] text-ink">How is your heart right now?</h1>
      </header>

      <FeelingChips value={feeling} onChange={choose} />

      <div>
        <label htmlFor="note" className="mb-2 block text-[15px] text-ink-soft">
          Anything you want to say about it?
        </label>
        <textarea
          id="note"
          rows={3}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Optional"
          className="block w-full resize-y rounded-2xl border border-line bg-surface px-4 py-3 font-serif text-[1.05rem] leading-relaxed text-ink placeholder:text-ink-soft/70 focus:border-accent"
        />
      </div>

      <div>
        <div className="grid grid-cols-2 gap-2" role="group" aria-label="What would help?">
          {ASKS.map(({ ask: a, label }) => (
            <button
              key={a}
              type="button"
              disabled={!feeling}
              onClick={() => show(a)}
              aria-describedby={!feeling ? 'pick-first' : undefined}
              className={`${btnQuiet} ${ask === a && result ? 'border-accent text-accent' : ''}`}
            >
              {label}
            </button>
          ))}
        </div>
        {!feeling && (
          <p id="pick-first" className="mt-3 text-center text-[13px] text-ink-soft">
            Pick a feeling first.
          </p>
        )}
      </div>

      {result && feeling && (
        <section ref={resultRef} aria-label="Your result" className="scroll-mt-4">
          <ResultCard
            key={`${result.type}:${result.item.id}`}
            ref={headingRef}
            content={result}
            feeling={feeling}
            saved={saved}
            onSave={save}
            onShowAnother={() => show(ask ?? result.type, result)}
          />
          {error && (
            <p role="alert" className="mt-3 text-center text-[14px] text-ink">
              {error}
            </p>
          )}
          {saved && (
            <p className="mt-3 text-center text-[14px] text-ink-soft">
              Saved. You can find it in <a className="text-accent underline underline-offset-4" href="#/log">My log</a>.
            </p>
          )}
        </section>
      )}
    </div>
  )
}
