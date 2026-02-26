import type { Tier, GameType, WordleHistoryEntry, CrosswordHistoryEntry } from '../types'
import { normalizeWordleScore, normalizeCrosswordScore } from './scoring'

const PROMOTE_THRESHOLD = 75
const DEMOTE_THRESHOLD = 40
const ROLLING_WINDOW = 5
const WARMUP_PUZZLES = 3

export function calcNextTier(
  currentTier: Tier,
  history: WordleHistoryEntry[] | CrosswordHistoryEntry[],
  gameType: GameType,
): { tier: Tier; changed: boolean; direction: 'up' | 'down' | 'same' } {
  if (history.length < WARMUP_PUZZLES) {
    return { tier: 1, changed: false, direction: 'same' }
  }

  const recent = history.slice(-ROLLING_WINDOW)
  const avgScore = recent.reduce((sum, entry) => {
    let normalized: number
    if (gameType === 'wordle') {
      const e = entry as WordleHistoryEntry
      normalized = normalizeWordleScore(e.score, e.tier)
    } else {
      const e = entry as CrosswordHistoryEntry
      normalized = normalizeCrosswordScore(e.score, e.tier)
    }
    return sum + normalized
  }, 0) / recent.length

  if (avgScore >= PROMOTE_THRESHOLD) {
    const nextTier = Math.min(currentTier + 1, 3) as Tier
    return {
      tier: nextTier,
      changed: nextTier !== currentTier,
      direction: nextTier !== currentTier ? 'up' : 'same',
    }
  } else if (avgScore < DEMOTE_THRESHOLD) {
    const nextTier = Math.max(currentTier - 1, 1) as Tier
    return {
      tier: nextTier,
      changed: nextTier !== currentTier,
      direction: nextTier !== currentTier ? 'down' : 'same',
    }
  }
  return { tier: currentTier, changed: false, direction: 'same' }
}

export function tierLabel(tier: Tier): string {
  return tier === 1 ? 'Easy' : tier === 2 ? 'Medium' : 'Hard'
}
