import React, { useEffect, useCallback, useState } from 'react'
import { useGame } from '../../context/GameContext'
import { useWordle } from '../../hooks/useWordle'
import { calcWordleScore } from '../../utils/scoring'
import { calcNextTier } from '../../utils/difficulty'
import { Header } from '../Layout/Header'
import { WordleGrid } from './WordleGrid'
import { WordleKeyboard } from './WordleKeyboard'
import { PuzzleComplete } from '../shared/PuzzleComplete'
import { useToast } from '../shared/Toast'
import { ConfettiEffect } from '../shared/ConfettiEffect'
import type { Screen } from '../../App'

interface WordleGameProps {
  onNavigate: (screen: Screen) => void
  onSettings: () => void
}

export function WordleGame({ onNavigate, onSettings }: WordleGameProps) {
  const { state, dispatch, addPoints } = useGame()
  const { wordle } = state
  const puzzleIndex = Math.min(wordle.currentPuzzle, 100)
  const tier = wordle.currentTier

  const {
    rows, currentRow, keyboardMap, gameStatus,
    isShaking, isBouncing, errorMessage,
    submitGuess, addLetter, deleteLetter, targetWord, guessCount,
  } = useWordle(puzzleIndex, tier)

  const { showToast, ToastComponent } = useToast()
  const [showComplete, setShowComplete] = useState(false)

  // Show error toast
  useEffect(() => {
    if (errorMessage) showToast(errorMessage)
  }, [errorMessage, showToast])

  // Delay popup: for a win, wait for bounce to finish (~1s) before showing modal
  useEffect(() => {
    if (gameStatus === 'won') {
      const t = setTimeout(() => setShowComplete(true), 150)
      return () => clearTimeout(t)
    } else if (gameStatus === 'lost') {
      const t = setTimeout(() => setShowComplete(true), 400)
      return () => clearTimeout(t)
    }
  }, [gameStatus])

  // Handle game end
  const handleComplete = useCallback(() => {
    const solved = gameStatus === 'won'
    const newStreak = solved ? wordle.streak + 1 : 0
    const bestStreak = Math.max(wordle.bestStreak, newStreak)
    const score = calcWordleScore(guessCount, tier, wordle.streak, solved)

    const newHistory = [
      ...wordle.history,
      { puzzle: puzzleIndex, tier, guesses: guessCount, score, solved },
    ]

    const { tier: nextTier, changed, direction } = calcNextTier(tier, newHistory, 'wordle')

    dispatch({
      type: 'SET_WORDLE',
      wordle: {
        currentPuzzle: Math.min(puzzleIndex + 1, 101),
        currentTier: nextTier,
        streak: newStreak,
        bestStreak,
        history: newHistory,
      },
    })

    if (score > 0) addPoints(score)

    if (changed) {
      setTimeout(() => {
        showToast(direction === 'up' ? 'Difficulty increased! ⬆️' : 'Difficulty adjusted ⬇️')
      }, 500)
    }

    return score
  }, [gameStatus, guessCount, tier, wordle, puzzleIndex, dispatch, addPoints, showToast])

  // Keyboard handler
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return
      if (e.key === 'Enter') submitGuess()
      else if (e.key === 'Backspace') deleteLetter()
      else if (/^[a-zA-Z]$/.test(e.key)) addLetter(e.key.toUpperCase())
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [submitGuess, deleteLetter, addLetter])

  const score = showComplete ? calcWordleScore(guessCount, tier, wordle.streak, gameStatus === 'won') : 0

  return (
    <div className="min-h-screen bg-[var(--bg)] flex flex-col">
      <Header
        title={`Wordle #${puzzleIndex}`}
        onHome={() => onNavigate('home')}
        onSettings={onSettings}
        showPoints
      />

      {ToastComponent}
      <ConfettiEffect active={gameStatus === 'won' && (puzzleIndex % 10 === 0)} />

      <main className="flex-1 flex flex-col items-center justify-between py-4 gap-4 max-w-lg mx-auto w-full px-4">
        <div className="text-xs text-[var(--text-secondary)] self-start">
          Tier {tier} · Puzzle {puzzleIndex}/100
        </div>

        <WordleGrid
          rows={rows}
          isShaking={isShaking && currentRow}
          isBouncing={isBouncing}
          currentRow={currentRow}
        />

        <WordleKeyboard
          keyboardMap={keyboardMap}
          onKey={addLetter}
          onDelete={deleteLetter}
          onEnter={submitGuess}
        />
      </main>

      {showComplete && (
        <PuzzleComplete
          won={gameStatus === 'won'}
          score={score}
          message={gameStatus === 'won'
            ? `Solved in ${guessCount} ${guessCount === 1 ? 'guess' : 'guesses'}!`
            : `The word was ${targetWord}`
          }
          onNext={() => { handleComplete(); onNavigate('home') }}
          onHome={() => { handleComplete(); onNavigate('home') }}
          canPlayNext={wordle.currentPuzzle < 100}
        />
      )}
    </div>
  )
}
