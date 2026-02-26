import React from 'react'
import { useGame } from '../../context/GameContext'
import type { Screen } from '../../App'

interface HomeScreenProps {
  onNavigate: (screen: Screen) => void
}

export function HomeScreen({ onNavigate }: HomeScreenProps) {
  const { state } = useGame()
  const { player, points, wordle, crossword, shop } = state

  const wordleComplete = wordle.currentPuzzle > 100
  const crosswordComplete = crossword.currentPuzzle > 100

  return (
    <div className="min-h-screen bg-[var(--bg)] flex flex-col">
      {/* Header bar */}
      <header className="border-b border-[var(--border)] px-6 py-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[var(--text)]" style={{ fontFamily: 'Georgia, serif' }}>
          Puzzle Quest
        </h1>
        <button
          onClick={() => onNavigate('settings')}
          className="text-[var(--text-secondary)] hover:text-[var(--text)] transition-colors text-lg"
          aria-label="Settings"
        >
          ⚙️
        </button>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-6 py-8 gap-8">
        {/* Player card */}
        <div className="flex flex-col items-center gap-2">
          <div className="text-6xl">{getAvatarEmoji(shop.activeAvatar)}</div>
          <p className="text-lg font-semibold text-[var(--text)]">{player.name || 'Player'}</p>
          <div className="flex items-center gap-2 px-4 py-1.5 bg-[var(--bg-secondary)] rounded-full shadow-sm border border-[var(--border)]">
            <span className="text-yellow-500">⭐</span>
            <span className="font-bold text-[var(--text)]">{points.balance.toLocaleString()}</span>
            <span className="text-[var(--text-secondary)] text-sm">points</span>
          </div>
        </div>

        {/* Game cards */}
        <div className="flex gap-4 flex-wrap justify-center w-full max-w-lg">
          <GameCard
            title="WORDLE"
            emoji="🔤"
            progress={Math.min(wordle.currentPuzzle - 1, 100)}
            total={100}
            streak={wordle.streak}
            tier={wordle.currentTier}
            complete={wordleComplete}
            onPlay={() => onNavigate('wordle')}
          />
          <GameCard
            title="CROSSWORD"
            emoji="✏️"
            progress={Math.min(crossword.currentPuzzle - 1, 100)}
            total={100}
            streak={crossword.streak}
            tier={crossword.currentTier}
            complete={crosswordComplete}
            onPlay={() => onNavigate('crossword')}
          />
        </div>

        {/* Bottom actions */}
        <div className="flex gap-4">
          <NavButton emoji="🏪" label="Shop" onClick={() => onNavigate('shop')} />
          <NavButton emoji="📊" label="Stats" onClick={() => onNavigate('stats')} />
        </div>
      </main>

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

function GameCard({
  title, emoji, progress, total, streak, tier, complete, onPlay,
}: {
  title: string; emoji: string; progress: number; total: number;
  streak: number; tier: number; complete: boolean; onPlay: () => void
}) {
  const pct = Math.round((progress / total) * 100)
  const tierLabel = ['', 'Easy', 'Medium', 'Hard'][tier]

  return (
    <div className="bg-[var(--bg-secondary)] rounded-2xl border border-[var(--border)] shadow-[var(--card-shadow)] p-5 flex flex-col gap-3 w-44 flex-shrink-0">
      <div className="flex items-center justify-between">
        <span className="text-2xl">{emoji}</span>
        <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--border)] text-[var(--text-secondary)] font-medium">
          {tierLabel}
        </span>
      </div>
      <div>
        <p className="text-sm font-bold text-[var(--text)] tracking-widest">{title}</p>
        <p className="text-xs text-[var(--text-secondary)] mt-0.5">{progress}/{total} puzzles</p>
      </div>
      {/* Progress bar */}
      <div className="h-1.5 bg-[var(--border)] rounded-full overflow-hidden">
        <div
          className="h-full bg-[var(--tile-correct)] rounded-full transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
      {streak > 0 && (
        <p className="text-xs text-[var(--text-secondary)]">🔥 {streak} streak</p>
      )}
      <button
        onClick={onPlay}
        disabled={complete}
        className="mt-auto w-full py-2 rounded-lg bg-[var(--accent)] text-[var(--accent-text)] text-sm font-semibold hover:opacity-90 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {complete ? '✓ Done!' : '▸ Play'}
      </button>
    </div>
  )
}

function NavButton({ emoji, label, onClick }: { emoji: string; label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 px-5 py-2.5 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl hover:border-[var(--text-secondary)] text-[var(--text)] font-medium text-sm transition-all shadow-sm"
    >
      <span>{emoji}</span>
      <span>{label}</span>
    </button>
  )
}

const AVATARS: Record<string, string> = {
  smiley: '😊', fox: '🦊', cat: '🐱', owl: '🦉',
  butterfly: '🦋', dolphin: '🐬', unicorn: '🦄',
  dragon: '🐉', trophy: '🏆', crown: '👑',
}
function getAvatarEmoji(id: string) { return AVATARS[id] ?? '😊' }
