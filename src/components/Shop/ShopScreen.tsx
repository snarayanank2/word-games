import React, { useState } from 'react'
import { useGame } from '../../context/GameContext'
import { Header } from '../Layout/Header'
import shopItemsData from '../../data/shop-items.json'
import type { ThemeItem, AvatarItem } from '../../types'
import type { Screen } from '../../App'

interface ShopScreenProps {
  onNavigate: (screen: Screen) => void
}

export function ShopScreen({ onNavigate }: ShopScreenProps) {
  const { state, dispatch, spendPoints } = useGame()
  const { shop, points, wordle, crossword } = state
  const [tab, setTab] = useState<'themes' | 'avatars'>('themes')

  const themes = shopItemsData.themes as ThemeItem[]
  const avatars = shopItemsData.avatars as AvatarItem[]

  const isAvatarUnlocked = (avatar: AvatarItem): boolean => {
    if (!avatar.unlockCondition) return true
    if (avatar.unlockCondition === 'all-wordle') return wordle.currentPuzzle > 100
    if (avatar.unlockCondition === 'all-crossword') return crossword.currentPuzzle > 100
    if (avatar.unlockCondition === 'all-puzzles') return wordle.currentPuzzle > 100 && crossword.currentPuzzle > 100
    return true
  }

  const handleBuyTheme = (theme: ThemeItem) => {
    if (shop.ownedThemes.includes(theme.id)) {
      dispatch({ type: 'SET_SHOP', shop: { activeTheme: theme.id } })
      return
    }
    if (points.balance < theme.cost) return
    spendPoints(theme.cost)
    dispatch({ type: 'SET_SHOP', shop: { ownedThemes: [...shop.ownedThemes, theme.id], activeTheme: theme.id } })
  }

  const handleBuyAvatar = (avatar: AvatarItem) => {
    if (!isAvatarUnlocked(avatar)) return
    if (shop.ownedAvatars.includes(avatar.id)) {
      dispatch({ type: 'SET_SHOP', shop: { activeAvatar: avatar.id } })
      return
    }
    if (points.balance < avatar.cost) return
    spendPoints(avatar.cost)
    dispatch({ type: 'SET_SHOP', shop: { ownedAvatars: [...shop.ownedAvatars, avatar.id], activeAvatar: avatar.id } })
  }

  return (
    <div className="min-h-screen bg-[var(--bg)] flex flex-col">
      <Header title="Shop" onHome={() => onNavigate('home')} showPoints />

      <main className="flex-1 max-w-xl mx-auto w-full px-4 py-6">
        {/* Balance */}
        <div className="text-center mb-6">
          <p className="text-3xl font-bold text-[var(--text)]">⭐ {points.balance.toLocaleString()}</p>
          <p className="text-sm text-[var(--text-secondary)]">points available</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {(['themes', 'avatars'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-2 rounded-lg font-medium text-sm transition-colors capitalize
                ${tab === t
                  ? 'bg-[var(--accent)] text-[var(--accent-text)]'
                  : 'bg-[var(--bg-secondary)] text-[var(--text)] border border-[var(--border)] hover:bg-[var(--border)]'
                }`}
            >
              {t === 'themes' ? '🎨 Themes' : '🐾 Avatars'}
            </button>
          ))}
        </div>

        {tab === 'themes' && (
          <div className="grid grid-cols-2 gap-3">
            {themes.map(theme => {
              const owned = shop.ownedThemes.includes(theme.id)
              const active = shop.activeTheme === theme.id
              const canAfford = points.balance >= theme.cost
              return (
                <div key={theme.id} className={`bg-[var(--bg-secondary)] border rounded-xl p-4 flex flex-col gap-2 ${active ? 'border-[var(--accent)]' : 'border-[var(--border)]'}`}>
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-[var(--text)]">{theme.name}</p>
                    {active && <span className="text-xs bg-[var(--accent)] text-[var(--accent-text)] px-2 py-0.5 rounded-full">Active</span>}
                  </div>
                  <p className="text-xs text-[var(--text-secondary)] leading-snug">{theme.description}</p>
                  <button
                    onClick={() => handleBuyTheme(theme)}
                    disabled={!owned && !canAfford}
                    className={`mt-auto py-1.5 rounded-lg text-sm font-medium transition-colors
                      ${active ? 'bg-[var(--border)] text-[var(--text-secondary)] cursor-default'
                        : owned ? 'bg-[var(--accent)] text-[var(--accent-text)] hover:opacity-90'
                        : canAfford ? 'bg-[var(--accent)] text-[var(--accent-text)] hover:opacity-90'
                        : 'bg-[var(--border)] text-[var(--text-secondary)] cursor-not-allowed'}`}
                  >
                    {active ? '✓ Equipped' : owned ? 'Equip' : theme.cost === 0 ? 'Free' : `⭐ ${theme.cost}`}
                  </button>
                </div>
              )
            })}
          </div>
        )}

        {tab === 'avatars' && (
          <div className="grid grid-cols-2 gap-3">
            {avatars.map(avatar => {
              const owned = shop.ownedAvatars.includes(avatar.id)
              const active = shop.activeAvatar === avatar.id
              const unlocked = isAvatarUnlocked(avatar)
              const canAfford = points.balance >= avatar.cost
              return (
                <div key={avatar.id} className={`bg-[var(--bg-secondary)] border rounded-xl p-4 flex flex-col items-center gap-2 text-center ${active ? 'border-[var(--accent)]' : 'border-[var(--border)]'}`}>
                  <span className="text-4xl">{avatar.emoji}</span>
                  <p className="font-semibold text-[var(--text)]">{avatar.name}</p>
                  {!unlocked && (
                    <p className="text-xs text-[var(--text-secondary)]">
                      🔒 {avatar.unlockCondition === 'all-wordle' ? 'Complete all Wordle' : 'Complete all puzzles'}
                    </p>
                  )}
                  <button
                    onClick={() => handleBuyAvatar(avatar)}
                    disabled={!unlocked || (!owned && !canAfford)}
                    className={`w-full py-1.5 rounded-lg text-sm font-medium transition-colors
                      ${!unlocked ? 'bg-[var(--border)] text-[var(--text-secondary)] cursor-not-allowed'
                        : active ? 'bg-[var(--border)] text-[var(--text-secondary)] cursor-default'
                        : owned ? 'bg-[var(--accent)] text-[var(--accent-text)] hover:opacity-90'
                        : canAfford ? 'bg-[var(--accent)] text-[var(--accent-text)] hover:opacity-90'
                        : 'bg-[var(--border)] text-[var(--text-secondary)] cursor-not-allowed'}`}
                  >
                    {active ? '✓ Equipped' : owned ? 'Equip' : avatar.cost === 0 ? 'Free' : `⭐ ${avatar.cost}`}
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
