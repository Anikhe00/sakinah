import { useEffect } from 'react'
import { TabBar } from './components/TabBar'
import { ThemeToggle } from './components/ThemeToggle'
import { useRoute } from './lib/route'
import { Entry } from './pages/Entry'
import { Log } from './pages/Log'
import { Today } from './pages/Today'

export default function App() {
  const route = useRoute()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [route])

  return (
    <>
      <a
        href="#main"
        onClick={(e) => {
          e.preventDefault()
          document.getElementById('main')?.focus()
        }}
        className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-20 focus:rounded-full focus:bg-surface focus:px-4 focus:py-2"
      >
        Skip to content
      </a>
      <div className="mx-auto flex max-w-md items-center justify-between px-5 pt-[max(0.75rem,env(safe-area-inset-top))]">
        <p className="flex items-baseline gap-2">
          <span className="font-serif text-[1.25rem] tracking-wide text-ink">Sakinah</span>
          <span lang="ar" dir="rtl" className="arabic text-[1.1rem] text-gold">
            سكينة
          </span>
        </p>
        <ThemeToggle />
      </div>
      <main id="main" tabIndex={-1} className="mx-auto max-w-md px-5 pb-32 pt-4 outline-none">
        <div hidden={route.name !== 'today'}>
          <Today />
        </div>
        {route.name === 'log' && <Log />}
        {route.name === 'entry' && <Entry id={route.id} />}
      </main>
      <TabBar route={route} />
    </>
  )
}
