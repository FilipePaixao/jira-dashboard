'use client'

import { useEffect, useState } from 'react'
import { getStoredTheme, setStoredTheme } from './ThemeInit'

export function ThemeToggle() {
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    queueMicrotask(() => {
      const mode = getStoredTheme()
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      const dark = mode === 'dark' || (mode === 'system' && prefersDark)
      setIsDark(dark)
    })
  }, [])

  function toggleTheme() {
    const next = !isDark
    setIsDark(next)
    setStoredTheme(next ? 'dark' : 'light')
  }

  const label = isDark ? 'Ativar tema claro' : 'Ativar tema escuro'

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="app-theme-transition inline-flex h-8 w-8 items-center justify-center rounded-full border border-secondary-light/90 bg-white/90 text-sm text-neutral-700 shadow-sm transition-colors hover:border-sauvvi/40 hover:text-sauvvi dark:border-[#333333] dark:bg-[#1E1E1E]/90 dark:text-neutral-200 dark:hover:border-sauvvi/50"
      aria-label={label}
      title={label}
    >
      <span aria-hidden>{isDark ? '☀' : '☾'}</span>
    </button>
  )
}
