import { forwardRef } from 'react'
import { spotifySearch, youtubeSearch } from '../content'
import type { ContentItem, Dhikr, Talk, Verse } from '../content/types'
import { HEAVY_FEELINGS, feelingLabel, type FeelingId } from '../lib/feelings'
import { ExternalIcon } from './icons'
import { btnPrimary, btnQuiet, eyebrow } from './ui'

const arabicDigits = new Intl.NumberFormat('ar-EG', { useGrouping: false })

function range(verse: Verse): string {
  const first = verse.ayat[0]?.ayah
  const last = verse.ayat[verse.ayat.length - 1]?.ayah
  return first === last ? `${verse.surah.number}:${first}` : `${verse.surah.number}:${first}–${last}`
}

function MeaningLabel() {
  return <p className="mb-1.5 text-[11px] font-medium uppercase tracking-[0.16em] text-ink-soft">Meaning</p>
}

function VerseBody({ verse }: { verse: Verse }) {
  return (
    <>
      <p lang="ar" dir="rtl" className="arabic text-[1.85rem] leading-[2.15] text-ink sm:text-[2.1rem]">
        {verse.ayat.map((a, i) => {
          // Keep the ayah number on the same line as the ayah's last word.
          const cut = a.text.lastIndexOf(' ')
          return (
            <span key={a.ayah}>
              {a.text.slice(0, cut + 1)}
              <span className="whitespace-nowrap">
                {a.text.slice(cut + 1)}
                <span
                  aria-label={`ayah ${a.ayah}`}
                  className="mx-1.5 inline-flex size-[1.55em] translate-y-[0.1em] items-center justify-center rounded-full border border-gold/60 align-middle text-[0.5em] leading-none text-gold"
                >
                  {arabicDigits.format(a.ayah)}
                </span>
              </span>
              {i < verse.ayat.length - 1 ? ' ' : ''}
            </span>
          )
        })}
      </p>
      <div className="mt-6">
        <MeaningLabel />
        <p className="font-serif text-[1.13rem] leading-relaxed text-ink">{verse.meaning}</p>
      </div>
      <p className="mt-5 text-[13px] font-medium tracking-wide text-gold">
        Surah {verse.surah.name} <span aria-hidden>·</span> {range(verse)}
        {verse.excerpt ? <span className="font-normal"> (part)</span> : null}
      </p>
    </>
  )
}

function DhikrBody({ dhikr }: { dhikr: Dhikr }) {
  const repeat = [dhikr.repeat ? `${dhikr.repeat}×` : null, dhikr.repeatNote].filter(Boolean).join(' · ')
  return (
    <>
      <p className="mb-4 text-[14px] text-ink-soft">{dhikr.title}</p>
      <p lang="ar" dir="rtl" className="arabic text-[1.85rem] leading-[2.05] text-ink sm:text-[2.1rem]">
        {dhikr.arabic}
      </p>
      <p className="mt-5 font-serif text-[1.02rem] italic leading-relaxed text-ink-soft">
        {dhikr.transliteration}
      </p>
      <div className="mt-5">
        <MeaningLabel />
        <p className="font-serif text-[1.13rem] leading-relaxed text-ink">{dhikr.meaning}</p>
      </div>
      <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-2">
        <p className="text-[13px] font-medium tracking-wide text-gold">{dhikr.source}</p>
        {repeat ? (
          <p className="rounded-full border border-gold/50 px-2.5 py-0.5 text-[12px] font-medium text-gold">
            Repeat {repeat}
          </p>
        ) : null}
      </div>
    </>
  )
}

function TalkBody({ talk }: { talk: Talk }) {
  const link =
    'inline-flex min-h-11 items-center gap-2 rounded-full border border-line bg-surface-2 px-4 text-[15px] font-medium text-ink transition-colors hover:border-accent hover:text-accent'
  return (
    <>
      <p className="font-serif text-[1.9rem] leading-tight text-ink">{talk.speaker}</p>
      <p className="mt-1 font-serif text-[1.25rem] italic text-ink-soft">on {talk.topic}</p>
      <div className="mt-6 flex flex-wrap gap-2">
        <a className={link} href={youtubeSearch(talk.query)} target="_blank" rel="noopener noreferrer">
          Find on YouTube <ExternalIcon />
        </a>
        <a className={link} href={spotifySearch(talk.query)} target="_blank" rel="noopener noreferrer">
          Find on Spotify <ExternalIcon />
        </a>
      </div>
      <p className="mt-3 text-[13px] text-ink-soft">These open a search, so you need a connection.</p>
    </>
  )
}

const KIND: Record<ContentItem['type'], string> = { verse: 'A verse', dhikr: 'A dhikr', talk: 'A talk' }

interface Props {
  content: ContentItem
  feeling: FeelingId
  /** Omit to hide the button (for example when reopening a saved entry). */
  onSave?: () => void
  saved?: boolean
  onShowAnother?: () => void
}

export const ResultCard = forwardRef<HTMLHeadingElement, Props>(function ResultCard(
  { content, feeling, onSave, saved, onShowAnother },
  headingRef,
) {
  return (
    <article className="fade-in rounded-[28px] border border-line bg-surface px-6 pb-6 pt-5 shadow-[0_1px_0_rgba(0,0,0,0.02),0_18px_40px_-28px_rgba(22,38,61,0.45)]">
      <h2 ref={headingRef} tabIndex={-1} className={`${eyebrow} mb-5 focus-visible:outline-offset-4`}>
        {KIND[content.type]} for feeling {feelingLabel(feeling).toLowerCase()}
      </h2>

      {content.type === 'verse' && <VerseBody verse={content.item} />}
      {content.type === 'dhikr' && <DhikrBody dhikr={content.item} />}
      {content.type === 'talk' && <TalkBody talk={content.item} />}

      {HEAVY_FEELINGS.has(feeling) && (
        <p className="mt-6 border-t border-line pt-4 font-serif text-[0.98rem] italic leading-relaxed text-ink-soft">
          If this feeling stays heavy, it can help to talk to someone you trust.
        </p>
      )}

      {(onSave || onShowAnother) && (
        <div className="mt-6 flex flex-wrap gap-2">
          {onSave && (
            <button type="button" className={btnPrimary} onClick={onSave} disabled={saved}>
              {saved ? 'Saved to my log' : 'Save to my log'}
            </button>
          )}
          {onShowAnother && (
            <button type="button" className={btnQuiet} onClick={onShowAnother}>
              Show another
            </button>
          )}
        </div>
      )}
    </article>
  )
})
