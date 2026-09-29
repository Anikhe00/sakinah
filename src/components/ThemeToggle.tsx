import { useState } from 'react'
import { applyTheme, loadTheme, type ThemeChoice } from '../lib/theme'
import { AutoIcon, MoonIcon, SunIcon } from './icons'

const NEXT: Record<ThemeChoice, ThemeChoice> = { system: 'light', light: 'dark', dark: 'system' }
const LABEL: Record<ThemeChoice, string> = {
  system: 'Theme: follows your device',
  light: 'Theme: light',
  dark: 'Theme: dark',
}

export function ThemeToggle() {
  const [choice, setChoice] = useState<ThemeChoice>(loadTheme)
  const cycle = () => {
    const next = NEXT[choice]
    applyTheme(next)
    setChoice(next)
  }
  return (
    <button
      type="button"
      onClick={cycle}
      aria-label={`${LABEL[choice]}. Change theme`}
      title={LABEL[choice]}
      className="inline-flex size-11 items-center justify-center rounded-full text-ink-soft transition-colors hover:text-accent"
    >
      {choice === 'light' ? <SunIcon /> : choice === 'dark' ? <MoonIcon /> : <AutoIcon />}
    </button>
  )
}
