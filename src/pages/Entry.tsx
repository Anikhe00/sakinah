import { useEffect, useState } from 'react'
import { ArrowLeftIcon } from '../components/icons'
import { ResultCard } from '../components/ResultCard'
import { btnQuiet, eyebrow } from '../components/ui'
import { logRepository, type LogEntry } from '../data'
import { hrefFor } from '../lib/route'
import { formatWhen } from '../lib/week'

export function Entry({ id }: { id: string }) {
  const [entry, setEntry] = useState<LogEntry | null | undefined>(undefined)

  useEffect(() => {
    logRepository
      .get(id)
      .then((e) => setEntry(e ?? null))
      .catch(() => setEntry(null))
  }, [id])

  const remove = async () => {
    if (!entry || !window.confirm('Remove this from your log?')) return
    await logRepository.remove(entry.id)
    window.location.hash = hrefFor({ name: 'log' })
  }

  return (
    <div className="space-y-6">
      <a
        href={hrefFor({ name: 'log' })}
        className="-ml-2 inline-flex min-h-11 items-center gap-1 rounded-full px-2 text-[15px] text-ink-soft hover:text-accent"
      >
        <ArrowLeftIcon /> My log
      </a>

      {entry === null && <p className="text-ink-soft">This entry is no longer in your log.</p>}

      {entry && (
        <>
          <header>
            <p className={eyebrow}>{formatWhen(entry.createdAt)}</p>
            {entry.note && (
              <p className="mt-3 font-serif text-[1.15rem] italic leading-relaxed text-ink">“{entry.note}”</p>
            )}
          </header>
          <ResultCard content={entry.content} feeling={entry.feeling} />
          <div className="flex justify-center">
            <button type="button" onClick={remove} className={btnQuiet}>
              Remove from my log
            </button>
          </div>
        </>
      )}
    </div>
  )
}
