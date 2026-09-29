import type { FeelingId } from '../lib/feelings'

export type ContentType = 'verse' | 'dhikr' | 'talk'

/** Optional cut of a long ayah, written as plain Arabic phrases (see README). */
export interface Excerpt {
  from?: string
  to?: string
}

export interface Verse {
  id: string
  /** "2:286" or a range within one surah, "94:5-8". */
  ref: string
  excerpt?: Excerpt
  /** Plain paraphrase of the meaning, not a published translation. */
  meaning: string
  /** Filled in by scripts/fetch-quran.mjs. */
  surah: { number: number; name: string; arabicName: string }
  /** Filled in by scripts/fetch-quran.mjs. */
  ayat: { ayah: number; text: string }[]
}

export interface Dhikr {
  id: string
  title: string
  /** For Qur'anic adhkar this is filled in by scripts/fetch-quran.mjs from quranRef. */
  arabic: string
  transliteration: string
  meaning: string
  source: string
  repeat?: number
  repeatNote?: string
  quranRef?: string
  excerpt?: Excerpt
}

export interface Talk {
  id: string
  speaker: string
  topic: string
  /** Search phrase used for the YouTube and Spotify links. */
  query: string
}

export type ByFeeling<T> = Record<FeelingId, T[]>

export type ContentItem =
  | { type: 'verse'; item: Verse }
  | { type: 'dhikr'; item: Dhikr }
  | { type: 'talk'; item: Talk }
