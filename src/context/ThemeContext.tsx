import React, { createContext, useContext, useEffect } from 'react'
import shopItems from '../data/shop-items.json'
import type { ThemeItem } from '../types'
import { useGame } from './GameContext'

interface ThemeContextValue {
  activeTheme: ThemeItem
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { state } = useGame()
  const activeTheme = (shopItems.themes as ThemeItem[]).find(t => t.id === state.shop.activeTheme)
    ?? shopItems.themes[0] as ThemeItem

  useEffect(() => {
    const root = document.documentElement
    Object.entries(activeTheme.cssVars).forEach(([k, v]) => root.style.setProperty(k, v))
  }, [activeTheme])

  return <ThemeContext.Provider value={{ activeTheme }}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
  return ctx
}
