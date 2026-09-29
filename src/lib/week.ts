import type { FeelingId } from './feelings'

/** Monday 00:00 of the current week, local time. */
export function startOfWeek(now = new Date()): Date {
  const d = new Date(now)
  d.setHours(0, 0, 0, 0)
  const daysSinceMonday = (d.getDay() + 6) % 7
  d.setDate(d.getDate() - daysSinceMonday)
  return d
}

export function countFeelings(entries: { feeling: FeelingId; createdAt: number }[], since: Date) {
  const counts = new Map<FeelingId, number>()
  for (const e of entries) {
    if (e.createdAt < since.getTime()) continue
    counts.set(e.feeling, (counts.get(e.feeling) ?? 0) + 1)
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1])
}

const time = new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' })
const day = new Intl.DateTimeFormat(undefined, { weekday: 'short', day: 'numeric', month: 'short' })

export function formatWhen(ts: number, now = new Date()): string {
  const d = new Date(ts)
  const today = new Date(now)
  today.setHours(0, 0, 0, 0)
  const yesterday = new Date(today)
  yesterday.setDate(today.getDate() - 1)
  if (d >= today) return `Today, ${time.format(d)}`
  if (d >= yesterday) return `Yesterday, ${time.format(d)}`
  return `${day.format(d)}, ${time.format(d)}`
}
