import React, { useEffect, useCallback, useRef } from 'react'
import { useGame } from '../../context/GameContext'
import { useCrossword } from '../../hooks/useCrossword'
import { calcCrosswordScore } from '../../utils/scoring'
import { calcNextTier } from '../../utils/difficulty'
import { Header } from '../Layout/Header'
import { CrosswordGrid } from './CrosswordGrid'
import { ClueList } from './ClueList'
import { PuzzleComplete } from '../shared/PuzzleComplete'
import { useToast } from '../shared/Toast'
import { ConfettiEffect } from '../shared/ConfettiEffect'
import type { Screen } from '../../App'

interface CrosswordGameProps {
  onNavigate: (screen: Screen) => void
  onSettings: () => void
}

export function CrosswordGame({ onNavigate, onSettings }: CrosswordGameProps) {
  const { state, dispatch, addPoints, spendPoints } = useGame()
  const { crossword } = state
  const puzzleIndex = Math.min(crossword.currentPuzzle, 100)
  const tier = crossword.currentTier

  const {
    puzzle, grid, selectedCell, gameStatus, errors, hintsUsed, timeSeconds,
    selectCell, selectClue, inputLetter, deleteLetter, revealHint, activeClueNumbers,
  } = useCrossword(puzzleIndex, tier)

  const { showToast, ToastComponent } = useToast()
  const inputRef = useRef<HTMLInputElement>(null)

  // Focus hidden input when a cell is selected to trigger mobile keyboard
  useEffect(() => {
    if (selectedCell) {
      inputRef.current?.focus()
    }
  }, [selectedCell])

  const handleComplete = useCallback(() => {
    const score = calcCrosswordScore(errors, timeSeconds, hintsUsed, tier, crossword.streak, true)
    const newStreak = crossword.streak + 1
    const bestStreak = Math.max(crossword.bestStreak, newStreak)

    const newHistory = [
      ...crossword.history,
      { puzzle: puzzleIndex, tier, errors, timeSeconds, hintsUsed, score, completed: true },
    ]

    const { tier: nextTier, changed, direction } = calcNextTier(tier, newHistory, 'crossword')

    dispatch({
      type: 'SET_CROSSWORD',
      crossword: {
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
  }, [errors, timeSeconds, hintsUsed, tier, crossword, puzzleIndex, dispatch, addPoints, showToast])

  // Keyboard
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return
      if (e.key === 'Backspace') { e.preventDefault(); deleteLetter() }
      else if (/^[a-zA-Z]$/.test(e.key)) inputLetter(e.key.toUpperCase())
      else if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
        if (selectedCell) selectCell(selectedCell.row, selectedCell.col)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [deleteLetter, inputLetter, selectCell, selectedCell])

  const handleHint = () => {
    if (!selectedCell) { showToast('Select a cell first'); return }
    if (hintsUsed > 0 && state.points.balance < 10) { showToast('Not enough points!'); return }
    if (hintsUsed > 0) spendPoints(10)
    revealHint()
  }

  const score = gameStatus === 'complete'
    ? calcCrosswordScore(errors, timeSeconds, hintsUsed, tier, crossword.streak, true)
    : 0

  const fmtTime = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`

  return (
    <div className="min-h-screen bg-[var(--bg)] flex flex-col">
      {/* Hidden input to trigger mobile keyboard when a cell is selected */}
      <input
        ref={inputRef}
        className="sr-only"
        inputMode="text"
        autoCapitalize="none"
        autoComplete="off"
        autoCorrect="off"
        spellCheck={false}
        value=""
        onChange={e => {
          const val = e.target.value
          if (/^[a-zA-Z]$/.test(val)) inputLetter(val.toUpperCase())
        }}
        onKeyDown={e => {
          if (e.key === 'Backspace') { e.preventDefault(); deleteLetter() }
          else if (e.key === 'Enter') { e.preventDefault() }
        }}
      />
      <Header
        title={`Crossword #${puzzleIndex}`}
        onHome={() => onNavigate('home')}
        onSettings={onSettings}
        showPoints
      />

      {ToastComponent}
      <ConfettiEffect active={gameStatus === 'complete' && puzzleIndex % 10 === 0} />

      <main className="flex-1 flex flex-col lg:flex-row items-start justify-center gap-6 p-4 max-w-3xl mx-auto w-full">
        {/* Left: grid + actions */}
        <div className="flex flex-col items-center gap-4">
          <div className="flex items-center justify-between w-full text-xs text-[var(--text-secondary)]">
            <span>Tier {tier} · Puzzle {puzzleIndex}/100</span>
            <span>⏱ {fmtTime(timeSeconds)}</span>
          </div>

          {puzzle && (
            <CrosswordGrid
              puzzle={puzzle}
              grid={grid}
              selectedCell={selectedCell}
              activeClueNumbers={activeClueNumbers}
              onCellClick={selectCell}
            />
          )}

          <div className="flex gap-3">
            <button
              onClick={handleHint}
              disabled={gameStatus !== 'playing'}
              className="px-4 py-2 text-sm font-medium border border-[var(--border)] rounded-lg text-[var(--text)] hover:bg-[var(--bg-secondary)] transition-colors disabled:opacity-50"
            >
              💡 Hint {hintsUsed === 0 ? '(free)' : `(-10 pts)`}
            </button>
            {errors > 0 && (
              <span className="px-3 py-2 text-sm text-red-500 font-medium">
                {errors} error{errors !== 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>

        {/* Right: clues */}
        {puzzle && (
          <ClueList
            puzzle={puzzle}
            selectedCell={selectedCell}
            activeClueNumbers={activeClueNumbers}
            onSelectClue={selectClue}
          />
        )}
      </main>

      {gameStatus === 'complete' && (
        <PuzzleComplete
          won={true}
          score={score}
          message={`Finished in ${fmtTime(timeSeconds)} with ${errors} error${errors !== 1 ? 's' : ''}`}
          extraLines={hintsUsed > 0 ? [`${hintsUsed} hint${hintsUsed !== 1 ? 's' : ''} used`] : []}
          onNext={() => { handleComplete(); onNavigate('home') }}
          onHome={() => { handleComplete(); onNavigate('home') }}
          canPlayNext={crossword.currentPuzzle < 100}
        />
      )}
    </div>
  )
}
