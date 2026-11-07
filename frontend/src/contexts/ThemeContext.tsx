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
    description: 'OLED midnight navy with electric blue accents.',
    palette: { bg: '#05070D', card: '#111C2E', accent: '#5EA8FF', text: '#F5F7FF' },
  },
  {
    id: 'cinema-night',
    name: 'Cinema Night',
    description: 'OLED cinema black with vivid amber accents.',
    palette: { bg: '#090705', card: '#24170B', accent: '#FFB52E', text: '#FFF4D6' },
  },
  {
    id: 'noir',
    name: 'Noir',
    description: 'Pure OLED black with crisp, high-contrast silver.',
    palette: { bg: '#000000', card: '#171717', accent: '#F5F5F5', text: '#FFFFFF' },
  },
  {
    id: 'burgundy-premiere',
    name: 'Burgundy Premiere',
    description: 'OLED burgundy with vivid rose-pink accents.',
    palette: { bg: '#080204', card: '#260D16', accent: '#FF4F82', text: '#FFF1F5' },
  },
  {
    id: 'forest-cinema',
    name: 'Forest Cinema',
    description: 'OLED forest green with vibrant neon-sage accents.',
    palette: { bg: '#020805', card: '#0E2619', accent: '#42E887', text: '#EDFFF4' },
  },
  {
    id: 'ivory-matinee',
    name: 'Ivory Matinee',
    description: 'Bright ivory with energetic cinema-orange accents.',
    palette: { bg: '#FFFDF8', card: '#EEE5D5', accent: '#C86B1F', text: '#17120D' },
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
