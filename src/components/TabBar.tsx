import { hrefFor, type Route } from '../lib/route'
import { BookIcon, HeartIcon } from './icons'

export function TabBar({ route }: { route: Route }) {
  const onLog = route.name !== 'today'
  const tab = (active: boolean) =>
    [
      'flex min-h-14 flex-1 flex-col items-center justify-center gap-0.5 text-[12px] font-medium tracking-wide transition-colors',
      active ? 'text-accent' : 'text-ink-soft hover:text-ink',
    ].join(' ')
  return (
    <nav
      aria-label="Main"
      className="fixed inset-x-0 bottom-0 z-10 border-t border-line bg-surface/90 backdrop-blur-md"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="mx-auto flex max-w-md">
        <a href={hrefFor({ name: 'today' })} className={tab(!onLog)} aria-current={!onLog ? 'page' : undefined}>
          <HeartIcon />
          Today
        </a>
        <a href={hrefFor({ name: 'log' })} className={tab(onLog)} aria-current={onLog ? 'page' : undefined}>
          <BookIcon />
          My log
        </a>
      </div>
    </nav>
  )
}
