import { itemsFor } from '../content'
import type { ContentItem, ContentType } from '../content/types'
import type { FeelingId } from './feelings'

const TYPES: ContentType[] = ['verse', 'dhikr', 'talk']

function randomOf<T>(list: T[]): T | undefined {
  return list[Math.floor(Math.random() * list.length)]
}

/**
 * Pick an item for this feeling. `type: 'surprise'` picks a random type.
 * Never returns `previous` again while another choice exists.
 */
export function pickContent(
  feeling: FeelingId,
  type: ContentType | 'surprise',
  previous?: ContentItem,
): ContentItem | undefined {
  const pool =
    type === 'surprise' ? TYPES.flatMap((t) => itemsFor(feeling, t)) : itemsFor(feeling, type)
  const fresh = previous
    ? pool.filter((c) => !(c.type === previous.type && c.item.id === previous.item.id))
    : pool
  return randomOf(fresh.length ? fresh : pool)
}
