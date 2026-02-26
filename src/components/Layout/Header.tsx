import React from 'react'
import { useGame } from '../../context/GameContext'

interface HeaderProps {
  title: string
  onHome?: () => void
  onSettings?: () => void
  showPoints?: boolean
}

export function Header({ title, onHome, onSettings, showPoints = false }: HeaderProps) {
  const { state } = useGame()

  return (
    <header className="w-full border-b border-[var(--border)] bg-[var(--bg)] px-4 py-3 flex items-center justify-between">
      {onHome ? (
        <button onClick={onHome} className="text-[var(--text-secondary)] hover:text-[var(--text)] text-sm font-medium transition-colors">
          ← Home
        </button>
      ) : <div className="w-16" />}

      <h1 className="text-xl font-bold text-[var(--text)] tracking-wide" style={{ fontFamily: 'Georgia, serif' }}>
        {title}
      </h1>

      <div className="flex items-center gap-3">
        {showPoints && (
          <span className="text-sm font-semibold text-[var(--text-secondary)]">
            ⭐ {state.points.balance.toLocaleString()}
          </span>
        )}
        {onSettings && (
          <button onClick={onSettings} className="text-[var(--text-secondary)] hover:text-[var(--text)] text-lg transition-colors">
            ⚙️
          </button>
        )}
      </div>
    </header>
  )
}
