import type { ContentItem } from '../content/types'
import type { FeelingId } from '../lib/feelings'

export interface LogEntry {
  id: string
  feeling: FeelingId
  note: string
  /** Milliseconds since epoch. */
  createdAt: number
  /** A snapshot of what was shown, so old entries reopen even if content changes. */
  content: ContentItem
}

export type NewLogEntry = Omit<LogEntry, 'id' | 'createdAt'>

/**
 * The only thing the UI knows about storage. Implement this interface to move
 * the log somewhere else (for example Supabase) and swap it in data/index.ts.
 */
export interface LogRepository {
  add(entry: NewLogEntry): Promise<LogEntry>
  /** Newest first. */
  list(): Promise<LogEntry[]>
  get(id: string): Promise<LogEntry | undefined>
  remove(id: string): Promise<void>
}
