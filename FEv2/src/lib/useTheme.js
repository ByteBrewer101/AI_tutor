import { useState, useEffect, useCallback } from 'react'

const STORAGE_KEY = 'marginalia-theme'
const THEMES = ['light', 'dark', 'nord']

function getSystemTheme() {
  if (typeof window === 'undefined') return 'light'
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function applyThemeClass(theme) {
  const root = document.documentElement
  THEMES.forEach((t) => root.classList.remove(t))
  if (theme !== 'light') {
    root.classList.add(theme)
  }
}

function getStoredPreference() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored)
      return { theme: parsed.theme || 'light', isSystem: parsed.isSystem ?? true }
    }
  } catch { /* ignore */ }
  return { theme: 'light', isSystem: true }
}

export function initTheme() {
  if (typeof window === 'undefined') return
  const { theme, isSystem } = getStoredPreference()
  const resolved = isSystem ? getSystemTheme() : theme
  applyThemeClass(resolved)
}

export function useTheme() {
  const [state, setState] = useState(() => {
    const { theme, isSystem } = getStoredPreference()
    return { theme, isSystem, resolved: isSystem ? getSystemTheme() : theme }
  })

  useEffect(() => {
    applyThemeClass(state.resolved)
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      theme: state.theme,
      isSystem: state.isSystem,
    }))
  }, [state])

  useEffect(() => {
    if (!state.isSystem) return

    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = (e) => {
      const sysTheme = e.matches ? 'dark' : 'light'
      setState((prev) => ({ ...prev, resolved: sysTheme }))
    }
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [state.isSystem])

  const setTheme = useCallback((theme) => {
    if (!THEMES.includes(theme)) return
    setState({ theme, isSystem: false, resolved: theme })
  }, [])

  const setSystemPreference = useCallback((isSystem) => {
    setState((prev) => ({
      ...prev,
      isSystem,
      resolved: isSystem ? getSystemTheme() : prev.theme,
    }))
  }, [])

  return {
    theme: state.theme,
    resolved: state.resolved,
    isSystem: state.isSystem,
    setTheme,
    setSystemPreference,
  }
}
