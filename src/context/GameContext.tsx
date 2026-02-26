import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react'
import type { GameState, Player, Points, WordleState, CrosswordState, ShopState, Settings, Tier } from '../types'

// ─── Default State ────────────────────────────────────────────────────────────

const defaultState: GameState = {
  player: { name: '', createdAt: '' },
  points: { earned: 0, spent: 0, balance: 0 },
  wordle: {
    currentPuzzle: 1,
    currentTier: 1,
    streak: 0,
    bestStreak: 0,
    history: [],
  },
  crossword: {
    currentPuzzle: 1,
    currentTier: 1,
    streak: 0,
    bestStreak: 0,
    history: [],
  },
  shop: {
    ownedThemes: ['classic'],
    ownedAvatars: ['smiley'],
    activeTheme: 'classic',
    activeAvatar: 'smiley',
  },
  settings: { soundEnabled: false },
}

function loadState(): GameState {
  try {
    const keys: (keyof GameState)[] = ['player', 'points', 'wordle', 'crossword', 'shop', 'settings']
    const stored: Partial<GameState> = {}
    for (const k of keys) {
      const raw = localStorage.getItem(`pq_${k}`)
      if (raw) stored[k] = JSON.parse(raw) as never
    }
    return { ...defaultState, ...stored }
  } catch {
    return defaultState
  }
}

function saveKey(key: string, value: unknown) {
  try { localStorage.setItem(`pq_${key}`, JSON.stringify(value)) } catch { /* quota */ }
}

// ─── Actions ─────────────────────────────────────────────────────────────────

type Action =
  | { type: 'SET_PLAYER'; player: Player }
  | { type: 'ADD_POINTS'; amount: number }
  | { type: 'SPEND_POINTS'; amount: number }
  | { type: 'SET_WORDLE'; wordle: Partial<WordleState> }
  | { type: 'SET_CROSSWORD'; crossword: Partial<CrosswordState> }
  | { type: 'SET_SHOP'; shop: Partial<ShopState> }
  | { type: 'SET_SETTINGS'; settings: Partial<Settings> }
  | { type: 'SET_WORDLE_TIER'; tier: Tier }
  | { type: 'SET_CROSSWORD_TIER'; tier: Tier }
  | { type: 'RESET' }

function reducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case 'SET_PLAYER': {
      const next = { ...state, player: action.player }
      saveKey('player', next.player)
      return next
    }
    case 'ADD_POINTS': {
      const points: Points = {
        ...state.points,
        earned: state.points.earned + action.amount,
        balance: state.points.balance + action.amount,
      }
      saveKey('points', points)
      return { ...state, points }
    }
    case 'SPEND_POINTS': {
      const points: Points = {
        ...state.points,
        spent: state.points.spent + action.amount,
        balance: Math.max(0, state.points.balance - action.amount),
      }
      saveKey('points', points)
      return { ...state, points }
    }
    case 'SET_WORDLE': {
      const wordle = { ...state.wordle, ...action.wordle }
      saveKey('wordle', wordle)
      return { ...state, wordle }
    }
    case 'SET_CROSSWORD': {
      const crossword = { ...state.crossword, ...action.crossword }
      saveKey('crossword', crossword)
      return { ...state, crossword }
    }
    case 'SET_WORDLE_TIER': {
      const wordle = { ...state.wordle, currentTier: action.tier }
      saveKey('wordle', wordle)
      return { ...state, wordle }
    }
    case 'SET_CROSSWORD_TIER': {
      const crossword = { ...state.crossword, currentTier: action.tier }
      saveKey('crossword', crossword)
      return { ...state, crossword }
    }
    case 'SET_SHOP': {
      const shop = { ...state.shop, ...action.shop }
      saveKey('shop', shop)
      return { ...state, shop }
    }
    case 'SET_SETTINGS': {
      const settings = { ...state.settings, ...action.settings }
      saveKey('settings', settings)
      return { ...state, settings }
    }
    case 'RESET': {
      const keys = ['player', 'points', 'wordle', 'crossword', 'shop', 'settings']
      keys.forEach(k => localStorage.removeItem(`pq_${k}`))
      return defaultState
    }
    default:
      return state
  }
}

// ─── Context ──────────────────────────────────────────────────────────────────

interface GameContextValue {
  state: GameState
  dispatch: React.Dispatch<Action>
  addPoints: (amount: number) => void
  spendPoints: (amount: number) => void
}

const GameContext = createContext<GameContextValue | null>(null)

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, loadState)

  const addPoints = useCallback((amount: number) => dispatch({ type: 'ADD_POINTS', amount }), [])
  const spendPoints = useCallback((amount: number) => dispatch({ type: 'SPEND_POINTS', amount }), [])

  // Apply active theme CSS vars
  useEffect(() => {
    // Theme application is handled by ThemeContext
  }, [state.shop.activeTheme])

  return (
    <GameContext.Provider value={{ state, dispatch, addPoints, spendPoints }}>
      {children}
    </GameContext.Provider>
  )
}

export function useGame() {
  const ctx = useContext(GameContext)
  if (!ctx) throw new Error('useGame must be used within GameProvider')
  return ctx
}
