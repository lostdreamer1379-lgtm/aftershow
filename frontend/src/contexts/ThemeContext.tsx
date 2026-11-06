import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'

export type ThemeId =
  | 'midnight-blue'
  | 'cinema-night'
  | 'noir'
  | 'burgundy-premiere'
  | 'forest-cinema'
  | 'ivory-matinee'

export interface Theme {
  id: ThemeId
  name: string
  description: string
  palette: {
    bg: string
    card: string
    accent: string
    text: string
  }
}

export const THEMES: Theme[] = [
  {
    id: 'midnight-blue',
    name: 'Midnight Blue',
    description: 'Dark navy with cool slate surfaces and muted blue accents.',
    palette: { bg: '#0D111B', card: '#1C2638', accent: '#8199C7', text: '#F1F3F7' },
  },
  {
    id: 'cinema-night',
    name: 'Cinema Night',
    description: 'Deep charcoal with warm ivory text and muted gold accents.',
    palette: { bg: '#1A1612', card: '#2C261E', accent: '#C9A84C', text: '#F5EDD8' },
  },
  {
    id: 'noir',
    name: 'Noir',
    description: 'Near-black graphite with high-contrast monochromatic silver.',
    palette: { bg: '#111111', card: '#222222', accent: '#CCCCCC', text: '#EEEEEE' },
  },
  {
    id: 'burgundy-premiere',
    name: 'Burgundy Premiere',
    description: 'Deep wine tones with muted rose and champagne accents.',
    palette: { bg: '#120A0D', card: '#261518', accent: '#C47A8A', text: '#F5E8EC' },
  },
  {
    id: 'forest-cinema',
    name: 'Forest Cinema',
    description: 'Deep forest green with muted olive and sage accents.',
    palette: { bg: '#0A1210', card: '#172320', accent: '#74A882', text: '#E8F0EC' },
  },
  {
    id: 'ivory-matinee',
    name: 'Ivory Matinee',
    description: 'Warm ivory and cream with dark charcoal and muted bronze.',
    palette: { bg: '#F7F4EE', card: '#E4DFD4', accent: '#8C6A3A', text: '#1A1612' },
  },
]

const STORAGE_KEY = 'aftershow-theme'
const DEFAULT_THEME: ThemeId = 'midnight-blue'

interface ThemeContextValue {
  theme: ThemeId
  themeData: Theme
  setTheme: (id: ThemeId) => void
  resetTheme: () => void
  themes: Theme[]
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeId>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) as ThemeId | null
      if (saved && THEMES.find(t => t.id === saved)) return saved
    } catch {}
    return DEFAULT_THEME
  })

  const applyTheme = useCallback((id: ThemeId) => {
    document.documentElement.setAttribute('data-theme', id)
    try {
      localStorage.setItem(STORAGE_KEY, id)
    } catch {}
  }, [])

  useEffect(() => {
    applyTheme(theme)
  }, [theme, applyTheme])

  const setTheme = useCallback((id: ThemeId) => {
    setThemeState(id)
  }, [])

  const resetTheme = useCallback(() => {
    setThemeState(DEFAULT_THEME)
  }, [])

  const themeData = THEMES.find(t => t.id === theme) ?? THEMES[0]

  return (
    <ThemeContext.Provider value={{ theme, themeData, setTheme, resetTheme, themes: THEMES }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used inside ThemeProvider')
  return ctx
}
