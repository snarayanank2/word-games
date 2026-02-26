import React, { lazy, Suspense, useState } from 'react'
import { GameProvider, useGame } from './context/GameContext'
import { ThemeProvider } from './context/ThemeContext'
import { HomeScreen } from './components/Home/HomeScreen'

// Lazy-load all non-home screens so their code (and bundled puzzle data) only
// loads when the player first navigates to that screen.
const WordleGame     = lazy(() => import('./components/Wordle/WordleGame').then(m => ({ default: m.WordleGame })))
const CrosswordGame  = lazy(() => import('./components/Crossword/CrosswordGame').then(m => ({ default: m.CrosswordGame })))
const ShopScreen     = lazy(() => import('./components/Shop/ShopScreen').then(m => ({ default: m.ShopScreen })))
const StatsScreen    = lazy(() => import('./components/Stats/StatsScreen').then(m => ({ default: m.StatsScreen })))
const SettingsScreen = lazy(() => import('./components/shared/SettingsScreen').then(m => ({ default: m.SettingsScreen })))
const OnboardingScreen = lazy(() => import('./components/shared/OnboardingScreen').then(m => ({ default: m.OnboardingScreen })))

export type Screen = 'home' | 'wordle' | 'crossword' | 'shop' | 'stats' | 'settings'

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center">
      <div className="text-[var(--text-secondary)] text-sm animate-pulse">Loading…</div>
    </div>
  )
}

function AppInner() {
  const { state } = useGame()
  const [screen, setScreen] = useState<Screen>('home')

  const navigate = (s: Screen) => setScreen(s)

  if (!state.player.name) {
    return (
      <Suspense fallback={<LoadingFallback />}>
        <OnboardingScreen onDone={() => setScreen('home')} />
      </Suspense>
    )
  }

  return (
    <Suspense fallback={<LoadingFallback />}>
      {(() => {
        switch (screen) {
          case 'wordle':
            return <WordleGame onNavigate={navigate} onSettings={() => navigate('settings')} />
          case 'crossword':
            return <CrosswordGame onNavigate={navigate} onSettings={() => navigate('settings')} />
          case 'shop':
            return <ShopScreen onNavigate={navigate} />
          case 'stats':
            return <StatsScreen onNavigate={navigate} />
          case 'settings':
            return <SettingsScreen onNavigate={navigate} />
          default:
            return <HomeScreen onNavigate={navigate} />
        }
      })()}
    </Suspense>
  )
}

export default function App() {
  return (
    <GameProvider>
      <ThemeProvider>
        <AppInner />
      </ThemeProvider>
    </GameProvider>
  )
}
