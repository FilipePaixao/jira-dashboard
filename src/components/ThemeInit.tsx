'use client'

import { useEffect } from 'react'

const STORAGE_KEY = 'sauvvi-theme'

function applyTheme(mode: 'light' | 'dark' | 'system') {
  const root = document.documentElement
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  const dark = mode === 'dark' || (mode === 'system' && prefersDark)
  root.classList.toggle('dark', dark)
}

export function ThemeInit() {
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY) as 'light' | 'dark' | 'system' | null
      const mode = raw === 'light' || raw === 'dark' || raw === 'system' ? raw : 'system'
      applyTheme(mode)
    } catch {
      applyTheme('system')
    }
  }, [])
  return null
}

export function setStoredTheme(mode: 'light' | 'dark' | 'system') {
  try {
    localStorage.setItem(STORAGE_KEY, mode)
  } catch {
    /* ignore */
  }
  applyTheme(mode)
}

export function getStoredTheme(): 'light' | 'dark' | 'system' {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw === 'light' || raw === 'dark' || raw === 'system') {
      return raw
    }
  } catch {
    /* ignore */
  }
  return 'system'
}
