import React, { useState } from 'react'
import { useGame } from '../../context/GameContext'

interface OnboardingScreenProps {
  onDone: () => void
}

export function OnboardingScreen({ onDone }: OnboardingScreenProps) {
  const { dispatch } = useGame()
  const [name, setName] = useState('')

  const handleStart = () => {
    const playerName = name.trim() || 'Player'
    dispatch({
      type: 'SET_PLAYER',
      player: { name: playerName, createdAt: new Date().toISOString() },
    })
    onDone()
  }

  return (
    <div className="min-h-screen bg-[var(--bg)] flex flex-col px-6">
      <div className="flex-1 flex items-center justify-center">
      <div className="max-w-sm w-full text-center flex flex-col gap-8">
        <div>
          <h1 className="text-4xl font-bold text-[var(--text)] mb-2" style={{ fontFamily: 'Georgia, serif' }}>
            Puzzle Quest
          </h1>
          <p className="text-[var(--text-secondary)]">
            Wordle &amp; Mini Crossword — 200 puzzles to conquer!
          </p>
        </div>

        <div className="flex gap-8 justify-center text-4xl">
          <span>🔤</span>
          <span>✏️</span>
        </div>

        <div className="flex flex-col gap-3">
          <label className="text-sm font-medium text-[var(--text)] text-left">
            What's your name?
          </label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleStart()}
            placeholder="Enter your name..."
            maxLength={20}
            autoFocus
            className="w-full px-4 py-3 rounded-xl border-2 border-[var(--border)] bg-[var(--bg-secondary)] text-[var(--text)] text-base outline-none focus:border-[var(--accent)] transition-colors"
          />
          <button
            onClick={handleStart}
            className="w-full py-3 rounded-xl bg-[var(--accent)] text-[var(--accent-text)] font-bold text-base hover:opacity-90 active:scale-95 transition-all"
          >
            Start Playing →
          </button>
        </div>
      </div>
      </div>

      <footer className="text-center py-4 text-xs text-[var(--text-secondary)]">
        Made by Siva &nbsp;·&nbsp;{' '}
        <a
          href="https://github.com/snarayanank2/word-games"
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-2 hover:text-[var(--text)] transition-colors"
        >
          GitHub
        </a>
      </footer>
    </div>
  )
}
