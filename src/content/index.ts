import versesJson from './verses.json'
import adhkarJson from './adhkar.json'
import talksJson from './talks.json'
import type { ByFeeling, ContentItem, ContentType, Dhikr, Talk, Verse } from './types'
import type { FeelingId } from '../lib/feelings'

export const verses = versesJson as ByFeeling<Verse>
export const adhkar = adhkarJson as ByFeeling<Dhikr>
export const talks = talksJson as ByFeeling<Talk>

export function itemsFor(feeling: FeelingId, type: ContentType): ContentItem[] {
  switch (type) {
    case 'verse':
      return (verses[feeling] ?? []).map((item) => ({ type, item }))
    case 'dhikr':
      return (adhkar[feeling] ?? []).map((item) => ({ type, item }))
    case 'talk':
      return (talks[feeling] ?? []).map((item) => ({ type, item }))
  }
}

export function youtubeSearch(query: string): string {
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`
}

export function spotifySearch(query: string): string {
  return `https://open.spotify.com/search/${encodeURIComponent(query)}`
}

/** A short line of Arabic (or the talk title) for list previews. */
export function previewOf(content: ContentItem): { text: string; arabic: boolean } {
  switch (content.type) {
    case 'verse':
      return { text: content.item.ayat[0]?.text ?? '', arabic: true }
    case 'dhikr':
      return { text: content.item.arabic, arabic: true }
    case 'talk':
      return { text: `${content.item.speaker} on ${content.item.topic}`, arabic: false }
  }
}
