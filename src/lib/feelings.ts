export const FEELINGS = [
  { id: 'anxious', label: 'Anxious' },
  { id: 'sad', label: 'Sad' },
  { id: 'lonely', label: 'Lonely' },
  { id: 'overwhelmed', label: 'Overwhelmed' },
  { id: 'tired', label: 'Tired' },
  { id: 'behind-on-studies', label: 'Behind on studies' },
  { id: 'unmotivated', label: 'Unmotivated' },
  { id: 'angry', label: 'Angry' },
  { id: 'guilty', label: 'Guilty' },
  { id: 'afraid', label: 'Afraid' },
  { id: 'grateful', label: 'Grateful' },
  { id: 'happy', label: 'Happy' },
  { id: 'hopeful', label: 'Hopeful' },
] as const

export type FeelingId = (typeof FEELINGS)[number]['id']

export const FEELING_IDS: FeelingId[] = FEELINGS.map((f) => f.id)

export function feelingLabel(id: FeelingId): string {
  return FEELINGS.find((f) => f.id === id)?.label ?? id
}

/** Feelings where the result card gently suggests reaching out to someone. */
export const HEAVY_FEELINGS: ReadonlySet<FeelingId> = new Set(['sad', 'lonely', 'overwhelmed', 'afraid'])
