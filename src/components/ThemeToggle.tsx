'use client'

import { useEffect, useState } from 'react'
import { getStoredTheme, setStoredTheme } from './ThemeInit'

type Mode = 'light' | 'dark' | 'system'

export function ThemeToggle() {
  const [mode, setMode] = useState<Mode>('system')

  useEffect(() => {
    queueMicrotask(() => {
      setMode(getStoredTheme())
    })
  }, [])

  function cycle() {
    const order: Mode[] = ['system', 'light', 'dark']
    const next = order[(order.indexOf(mode) + 1) % order.length]
    setMode(next)
    setStoredTheme(next)
  }

  const label =
    mode === 'system' ? 'Tema: sistema' : mode === 'light' ? 'Tema: claro' : 'Tema: escuro'

  return (
    <button
      type="button"
      onClick={() => cycle()}
      className="rounded-full border border-secondary-light/90 bg-white/90 px-3 py-1.5 text-xs font-medium text-neutral-700 shadow-sm transition-colors duration-200 hover:border-sauvvi/40 hover:text-sauvvi dark:border-[#333333] dark:bg-[#1E1E1E]/90 dark:text-neutral-200 dark:hover:border-sauvvi/50"
      aria-label={label}
      title={label}
    >
      {mode === 'system' ? '◐' : mode === 'light' ? '☀' : '☾'}{' '}
      <span className="hidden sm:inline">{label}</span>
    </button>
  )
}
