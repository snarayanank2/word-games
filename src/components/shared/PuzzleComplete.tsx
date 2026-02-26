import React from 'react'
import { Modal } from './Modal'

interface PuzzleCompleteProps {
  won: boolean
  score: number
  message: string
  onNext: () => void
  onHome: () => void
  canPlayNext: boolean
  extraLines?: string[]
}

export function PuzzleComplete({ won, score, message, onNext, onHome, canPlayNext, extraLines }: PuzzleCompleteProps) {
  return (
    <Modal isOpen title={won ? '🎉 Solved!' : '😔 Not this time'}>
      <div className="flex flex-col items-center gap-4 text-center">
        <p className="text-[var(--text-secondary)]">{message}</p>

        {score > 0 && (
          <div className="px-6 py-3 bg-[var(--bg)] rounded-xl border border-[var(--border)]">
            <p className="text-3xl font-bold text-[var(--text)]">+{score}</p>
            <p className="text-xs text-[var(--text-secondary)]">points earned</p>
          </div>
        )}

        {extraLines?.map((line, i) => (
          <p key={i} className="text-sm text-[var(--text-secondary)]">{line}</p>
        ))}

        <div className="flex gap-3 w-full mt-2">
          <button
            onClick={onHome}
            className="flex-1 py-2.5 rounded-xl border border-[var(--border)] text-[var(--text)] font-medium text-sm hover:bg-[var(--bg)] transition-colors"
          >
            Home
          </button>
          {canPlayNext && (
            <button
              onClick={onNext}
              className="flex-1 py-2.5 rounded-xl bg-[var(--accent)] text-[var(--accent-text)] font-semibold text-sm hover:opacity-90 transition-opacity"
            >
              Next Puzzle →
            </button>
          )}
        </div>
      </div>
    </Modal>
  )
}
