import React, { useState } from 'react'
import { useGame } from '../../context/GameContext'
import { Header } from '../Layout/Header'
import { tierLabel } from '../../utils/difficulty'
import type { Screen } from '../../App'

interface StatsScreenProps {
  onNavigate: (screen: Screen) => void
}

export function StatsScreen({ onNavigate }: StatsScreenProps) {
  const { state } = useGame()
  const { wordle, crossword, points, shop } = state
  const [tab, setTab] = useState<'wordle' | 'crossword' | 'global'>('wordle')

  return (
    <div className="min-h-screen bg-[var(--bg)] flex flex-col">
      <Header title="Stats" onHome={() => onNavigate('home')} />

      <main className="flex-1 max-w-xl mx-auto w-full px-4 py-6">
        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {(['wordle', 'crossword', 'global'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-2 rounded-lg font-medium text-sm transition-colors capitalize
                ${tab === t
                  ? 'bg-[var(--accent)] text-[var(--accent-text)]'
                  : 'bg-[var(--bg-secondary)] text-[var(--text)] border border-[var(--border)]'
                }`}
            >
              {t === 'wordle' ? '🔤 Wordle' : t === 'crossword' ? '✏️ Crossword' : '🌐 Global'}
            </button>
          ))}
        </div>

        {tab === 'wordle' && <WordleStats wordle={wordle} />}
        {tab === 'crossword' && <CrosswordStats crossword={crossword} />}
        {tab === 'global' && <GlobalStats points={points} wordle={wordle} crossword={crossword} shop={shop} />}
      </main>
    </div>
  )
}

function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl p-4 text-center">
      <p className="text-2xl font-bold text-[var(--text)]">{value}</p>
      <p className="text-xs text-[var(--text-secondary)] mt-0.5 font-medium uppercase tracking-wide">{label}</p>
      {sub && <p className="text-xs text-[var(--text-secondary)] mt-0.5">{sub}</p>}
    </div>
  )
}

function WordleStats({ wordle }: { wordle: ReturnType<typeof useGame>['state']['wordle'] }) {
  const history = wordle.history
  const solved = history.filter(h => h.solved)
  const avgScore = solved.length ? Math.round(solved.reduce((s, h) => s + h.score, 0) / solved.length) : 0

  // Guess distribution
  const dist = [1,2,3,4,5,6].map(n => solved.filter(h => h.guesses === n).length)
  const maxDist = Math.max(...dist, 1)

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-3">
        <StatCard label="Completed" value={`${Math.min(wordle.currentPuzzle - 1, 100)}/100`} />
        <StatCard label="Current Streak" value={wordle.streak} sub={`Best: ${wordle.bestStreak}`} />
        <StatCard label="Avg Score" value={avgScore} />
        <StatCard label="Difficulty" value={`Tier ${wordle.currentTier}`} sub={tierLabel(wordle.currentTier)} />
      </div>

      <div>
        <h3 className="font-bold text-[var(--text)] mb-3 text-sm uppercase tracking-wider">Guess Distribution</h3>
        <div className="flex flex-col gap-1.5">
          {dist.map((count, i) => (
            <div key={i} className="flex items-center gap-2 text-sm">
              <span className="w-4 text-[var(--text-secondary)] font-medium text-right">{i + 1}</span>
              <div className="flex-1 h-6 bg-[var(--border)] rounded overflow-hidden">
                <div
                  className="h-full bg-[var(--tile-correct)] rounded flex items-center justify-end pr-2 transition-all"
                  style={{ width: `${(count / maxDist) * 100}%`, minWidth: count > 0 ? '24px' : '0' }}
                >
                  {count > 0 && <span className="text-white text-xs font-bold">{count}</span>}
                </div>
              </div>
            </div>
          ))}
          <div className="flex items-center gap-2 text-sm">
            <span className="w-4 text-[var(--text-secondary)] font-medium text-right">✗</span>
            <div className="flex-1 h-6 bg-[var(--border)] rounded overflow-hidden">
              <div
                className="h-full bg-[var(--tile-absent)] rounded flex items-center justify-end pr-2"
                style={{ width: `${(history.filter(h => !h.solved).length / maxDist) * 100}%`, minWidth: history.filter(h=>!h.solved).length > 0 ? '24px' : '0' }}
              >
                {history.filter(h=>!h.solved).length > 0 && (
                  <span className="text-white text-xs font-bold">{history.filter(h=>!h.solved).length}</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function CrosswordStats({ crossword }: { crossword: ReturnType<typeof useGame>['state']['crossword'] }) {
  const history = crossword.history.filter(h => h.completed)
  const avgScore = history.length ? Math.round(history.reduce((s, h) => s + h.score, 0) / history.length) : 0
  const avgTime = history.length ? Math.round(history.reduce((s, h) => s + h.timeSeconds, 0) / history.length) : 0
  const fmtTime = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`

  return (
    <div className="grid grid-cols-2 gap-3">
      <StatCard label="Completed" value={`${Math.min(crossword.currentPuzzle - 1, 100)}/100`} />
      <StatCard label="Current Streak" value={crossword.streak} sub={`Best: ${crossword.bestStreak}`} />
      <StatCard label="Avg Score" value={avgScore} />
      <StatCard label="Avg Time" value={history.length ? fmtTime(avgTime) : '—'} />
      <StatCard label="Difficulty" value={`Tier ${crossword.currentTier}`} sub={tierLabel(crossword.currentTier)} />
      <StatCard label="Total Points" value={history.reduce((s, h) => s + h.score, 0).toLocaleString()} />
    </div>
  )
}

function GlobalStats({
  points, wordle, crossword, shop,
}: {
  points: ReturnType<typeof useGame>['state']['points']
  wordle: ReturnType<typeof useGame>['state']['wordle']
  crossword: ReturnType<typeof useGame>['state']['crossword']
  shop: ReturnType<typeof useGame>['state']['shop']
}) {
  const totalComplete = Math.min(wordle.currentPuzzle - 1, 100) + Math.min(crossword.currentPuzzle - 1, 100)

  return (
    <div className="grid grid-cols-2 gap-3">
      <StatCard label="Total Points" value={points.earned.toLocaleString()} />
      <StatCard label="Balance" value={points.balance.toLocaleString()} />
      <StatCard label="Points Spent" value={points.spent.toLocaleString()} />
      <StatCard label="Overall Progress" value={`${totalComplete}/200`} />
      <StatCard label="Themes Owned" value={shop.ownedThemes.length} />
      <StatCard label="Avatars Owned" value={shop.ownedAvatars.length} />
    </div>
  )
}
