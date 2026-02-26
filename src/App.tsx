import React, { useState } from 'react'
import { GameProvider, useGame } from './context/GameContext'
import { ThemeProvider } from './context/ThemeContext'
import { HomeScreen } from './components/Home/HomeScreen'
import { WordleGame } from './components/Wordle/WordleGame'
import { CrosswordGame } from './components/Crossword/CrosswordGame'
import { ShopScreen } from './components/Shop/ShopScreen'
import { StatsScreen } from './components/Stats/StatsScreen'
import { SettingsScreen } from './components/shared/SettingsScreen'
import { OnboardingScreen } from './components/shared/OnboardingScreen'

export type Screen = 'home' | 'wordle' | 'crossword' | 'shop' | 'stats' | 'settings'

function AppInner() {
  const { state } = useGame()
  const [screen, setScreen] = useState<Screen>('home')

  if (!state.player.name) {
    return <OnboardingScreen onDone={() => setScreen('home')} />
  }

  const navigate = (s: Screen) => setScreen(s)

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
