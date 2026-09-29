import { createDexieRepository } from './dexieRepository'
import type { LogRepository } from './LogRepository'

export type { LogEntry, LogRepository, NewLogEntry } from './LogRepository'

/** Swap this line to change where the log lives. */
export const logRepository: LogRepository = createDexieRepository()
