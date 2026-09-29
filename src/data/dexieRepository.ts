import Dexie, { type EntityTable } from 'dexie'
import type { LogEntry, LogRepository, NewLogEntry } from './LogRepository'

class SakinahDb extends Dexie {
  entries!: EntityTable<LogEntry, 'id'>

  constructor() {
    super('sakinah')
    this.version(1).stores({ entries: 'id, createdAt, feeling' })
  }
}

function newId(): string {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`
}

export function createDexieRepository(db = new SakinahDb()): LogRepository {
  return {
    async add(entry: NewLogEntry) {
      const saved: LogEntry = { ...entry, id: newId(), createdAt: Date.now() }
      await db.entries.add(saved)
      return saved
    },
    list() {
      return db.entries.orderBy('createdAt').reverse().toArray()
    },
    get(id) {
      return db.entries.get(id)
    },
    async remove(id) {
      await db.entries.delete(id)
    },
  }
}
