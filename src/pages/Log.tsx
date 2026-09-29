import { useEffect, useState } from 'react'
import { eyebrow } from '../components/ui'
import { previewOf } from '../content'
import { logRepository, type LogEntry } from '../data'
import { feelingLabel } from '../lib/feelings'
import { hrefFor } from '../lib/route'
import { countFeelings, formatWhen, startOfWeek } from '../lib/week'

const KIND = { verse: 'Verse', dhikr: 'Dhikr', talk: 'Talk' } as const

export function Log() {
  const [entries, setEntries] = useState<LogEntry[] | null>(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    logRepository
      .list()
      .then(setEntries)
      .catch(() => setFailed(true))
  }, [])

  const week = entries ? countFeelings(entries, startOfWeek()) : []

  return (
    <div className="space-y-8">
      <header className="pt-2">
        <h1 className="font-serif text-[2.1rem] leading-tight text-ink">My log</h1>
      </header>

      <section aria-labelledby="week-heading" className="rounded-[24px] border border-line bg-surface px-5 py-4">
        <h2 id="week-heading" className={eyebrow}>
          This week
        </h2>
        {week.length ? (
          <ul className="mt-3 flex flex-wrap gap-2">
            {week.map(([feeling, n]) => (
              <li
                key={feeling}
                className="inline-flex items-center gap-2 rounded-full bg-accent-soft px-3 py-1.5 text-[14px] text-ink"
              >
                {feelingLabel(feeling)}
                <span className="font-semibold text-accent">{n}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-[15px] text-ink-soft">Nothing saved yet this week.</p>
        )}
      </section>

      {failed && <p role="alert">Your log could not be opened in this browser.</p>}

      {entries && entries.length === 0 && (
        <p className="text-center font-serif text-[1.1rem] italic text-ink-soft">
          Moments you save will gather here.{' '}
          <a href={hrefFor({ name: 'today' })} className="not-italic text-accent underline underline-offset-4">
            Check in now
          </a>
        </p>
      )}

      {entries && entries.length > 0 && (
        <ol className="space-y-3">
          {entries.map((e) => {
            const preview = previewOf(e.content)
            return (
              <li key={e.id}>
                <a
                  href={hrefFor({ name: 'entry', id: e.id })}
                  className="block rounded-[22px] border border-line bg-surface px-5 py-4 transition-colors hover:border-accent"
                >
                  <span className="flex items-baseline justify-between gap-3">
                    <span className="text-[15px] font-medium text-accent">{feelingLabel(e.feeling)}</span>
                    <span className="shrink-0 text-[13px] text-ink-soft">{formatWhen(e.createdAt)}</span>
                  </span>
                  {preview.arabic ? (
                    <span lang="ar" dir="rtl" className="arabic mt-2 block truncate text-[1.35rem] leading-[1.9] text-ink">
                      {preview.text}
                    </span>
                  ) : (
                    <span className="mt-2 block truncate font-serif text-[1.1rem] text-ink">{preview.text}</span>
                  )}
                  {e.note && (
                    <span className="mt-1 line-clamp-2 block font-serif text-[0.98rem] italic text-ink-soft">
                      “{e.note}”
                    </span>
                  )}
                  <span className="mt-2 block text-[12px] uppercase tracking-[0.14em] text-ink-soft">
                    {KIND[e.content.type]}
                  </span>
                </a>
              </li>
            )
          })}
        </ol>
      )}
    </div>
  )
}
