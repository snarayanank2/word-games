import React, { useState } from 'react'
import { useGame } from '../../context/GameContext'
import { Header } from '../Layout/Header'
import { Modal } from './Modal'
import type { Screen } from '../../App'

interface SettingsScreenProps {
  onNavigate: (screen: Screen) => void
}

export function SettingsScreen({ onNavigate }: SettingsScreenProps) {
  const { state, dispatch } = useGame()
  const { player, settings } = state
  const [name, setName] = useState(player.name)
  const [showResetConfirm, setShowResetConfirm] = useState(false)

  const saveName = () => {
    if (name.trim()) {
      dispatch({ type: 'SET_PLAYER', player: { ...player, name: name.trim() } })
    }
  }

  const handleReset = () => {
    dispatch({ type: 'RESET' })
    setShowResetConfirm(false)
    onNavigate('home')
  }

  return (
    <div className="min-h-screen bg-[var(--bg)] flex flex-col">
      <Header title="Settings" onHome={() => onNavigate('home')} />

      <main className="flex-1 max-w-sm mx-auto w-full px-4 py-8 flex flex-col gap-6">
        {/* Player name */}
        <section className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl p-5">
          <h2 className="font-bold text-[var(--text)] mb-3">Player Name</h2>
          <div className="flex gap-2">
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && saveName()}
              maxLength={20}
              className="flex-1 px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--bg)] text-[var(--text)] text-sm outline-none focus:border-[var(--accent)]"
              placeholder="Enter name..."
            />
            <button
              onClick={saveName}
              className="px-4 py-2 rounded-lg bg-[var(--accent)] text-[var(--accent-text)] text-sm font-medium hover:opacity-90"
            >
              Save
            </button>
          </div>
        </section>

        {/* Sound */}
        <section className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl p-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-bold text-[var(--text)]">Sound Effects</h2>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">Key clicks and feedback tones</p>
            </div>
            <button
              onClick={() => dispatch({ type: 'SET_SETTINGS', settings: { soundEnabled: !settings.soundEnabled } })}
              className={`w-12 h-6 rounded-full transition-colors ${settings.soundEnabled ? 'bg-[var(--accent)]' : 'bg-[var(--border)]'}`}
            >
              <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform mx-0.5 ${settings.soundEnabled ? 'translate-x-6' : 'translate-x-0'}`} />
            </button>
          </div>
        </section>

        {/* Reset */}
        <section className="bg-[var(--bg-secondary)] border border-red-200 rounded-xl p-5">
          <h2 className="font-bold text-[var(--text)] mb-1">Reset Progress</h2>
          <p className="text-xs text-[var(--text-secondary)] mb-3">
            This will delete all puzzles, points, and unlocks. This cannot be undone.
          </p>
          <button
            onClick={() => setShowResetConfirm(true)}
            className="w-full py-2.5 rounded-lg bg-red-500 text-white font-medium text-sm hover:bg-red-600 transition-colors"
          >
            Reset All Progress
          </button>
        </section>
      </main>

      <Modal isOpen={showResetConfirm} onClose={() => setShowResetConfirm(false)} title="Reset Progress?">
        <p className="text-[var(--text-secondary)] text-sm text-center mb-4">
          All your puzzles, points, streaks, and shop items will be lost forever.
        </p>
        <div className="flex gap-3">
          <button
            onClick={() => setShowResetConfirm(false)}
            className="flex-1 py-2.5 rounded-xl border border-[var(--border)] text-[var(--text)] font-medium text-sm"
          >
            Cancel
          </button>
          <button
            onClick={handleReset}
            className="flex-1 py-2.5 rounded-xl bg-red-500 text-white font-semibold text-sm hover:bg-red-600"
          >
            Reset
          </button>
        </div>
      </Modal>
    </div>
  )
}
