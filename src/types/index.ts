// ─── Player & Points ────────────────────────────────────────────────────────

export interface Player {
  name: string
  createdAt: string
}

export interface Points {
  earned: number
  spent: number
  balance: number
}

// ─── Wordle ──────────────────────────────────────────────────────────────────

export type LetterState = 'correct' | 'present' | 'absent' | 'empty' | 'tbd'

export interface WordleHistoryEntry {
  puzzle: number
  tier: Tier
  guesses: number
  score: number
  solved: boolean
}

export interface WordleState {
  currentPuzzle: number
  currentTier: Tier
  streak: number
  bestStreak: number
  history: WordleHistoryEntry[]
}

export interface WordlePuzzle {
  puzzleIndex: number // 1–100
  tier: Tier
  word: string
}

// ─── Crossword ───────────────────────────────────────────────────────────────

export type GridCell = string // letter A–Z or '#' (blocked)

export interface CrosswordClue {
  number: number
  row: number
  col: number
  clue: string
  answer: string
  length: number
}

export interface CrosswordPuzzleData {
  id: number
  puzzleIndex: number
  difficulty: Tier
  grid: GridCell[][]
  clues: {
    across: CrosswordClue[]
    down: CrosswordClue[]
  }
}

export interface CrosswordHistoryEntry {
  puzzle: number
  tier: Tier
  errors: number
  timeSeconds: number
  hintsUsed: number
  score: number
  completed: boolean
}

export interface CrosswordState {
  currentPuzzle: number
  currentTier: Tier
  streak: number
  bestStreak: number
  history: CrosswordHistoryEntry[]
}

// ─── Shop ────────────────────────────────────────────────────────────────────

export interface ShopState {
  ownedThemes: string[]
  ownedAvatars: string[]
  activeTheme: string
  activeAvatar: string
}

export interface ThemeItem {
  id: string
  name: string
  cost: number
  description: string
  cssVars: Record<string, string>
}

export interface AvatarItem {
  id: string
  emoji: string
  name: string
  cost: number
  unlockCondition?: 'all-wordle' | 'all-crossword' | 'all-puzzles'
}

// ─── Settings ────────────────────────────────────────────────────────────────

export interface Settings {
  soundEnabled: boolean
}

// ─── Difficulty ──────────────────────────────────────────────────────────────

export type Tier = 1 | 2 | 3

export type GameType = 'wordle' | 'crossword'

// ─── Global State ────────────────────────────────────────────────────────────

export interface GameState {
  player: Player
  points: Points
  wordle: WordleState
  crossword: CrosswordState
  shop: ShopState
  settings: Settings
}
