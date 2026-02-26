import type { Tier } from '../types'

const DIFFICULTY_MULTIPLIER: Record<Tier, number> = { 1: 1.0, 2: 1.5, 3: 2.0 }

// ─── Wordle ──────────────────────────────────────────────────────────────────

const WORDLE_BASE_POINTS: Record<number, number> = {
  1: 100, 2: 80, 3: 60, 4: 40, 5: 25, 6: 15,
}

export function calcWordleScore(guesses: number, tier: Tier, streak: number, solved: boolean): number {
  if (!solved) return 0
  const base = WORDLE_BASE_POINTS[guesses] ?? 0
  const streakBonus = Math.min(streak * 5, 50)
  return Math.floor(base * DIFFICULTY_MULTIPLIER[tier]) + streakBonus
}

// ─── Crossword ───────────────────────────────────────────────────────────────

export function calcCrosswordScore(
  errors: number,
  timeSeconds: number,
  hintsUsed: number,
  tier: Tier,
  streak: number,
  completed: boolean,
): number {
  if (!completed) return 0

  let base = 0
  if (errors === 0) base = 100
  else if (errors <= 2) base = 70
  else if (errors <= 5) base = 40
  else base = 20

  let timeBonus = 0
  if (timeSeconds < 120) timeBonus = 30
  else if (timeSeconds < 300) timeBonus = 15
  else if (timeSeconds < 600) timeBonus = 5

  const hintBonus = hintsUsed === 0 ? 20 : 0
  const streakBonus = Math.min(streak * 5, 50)

  return Math.floor((base + timeBonus + hintBonus) * DIFFICULTY_MULTIPLIER[tier]) + streakBonus
}

// ─── Crossword normalized score (0–100) for adaptive difficulty ───────────────

export function normalizeCrosswordScore(score: number, tier: Tier): number {
  // Max possible score for this tier (0 errors, <2min, no hints, 10-streak)
  const maxScore = Math.floor((100 + 30 + 20) * DIFFICULTY_MULTIPLIER[tier]) + 50
  return Math.round((score / maxScore) * 100)
}

export function normalizeWordleScore(score: number, tier: Tier): number {
  // Max possible: solve in 1 guess + 10-streak bonus
  const maxScore = Math.floor(100 * DIFFICULTY_MULTIPLIER[tier]) + 50
  return Math.round((score / maxScore) * 100)
}
