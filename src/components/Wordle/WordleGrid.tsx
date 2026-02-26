import React from 'react'
import type { TileState } from '../../hooks/useWordle'

interface WordleGridProps {
  rows: TileState[][]
  isShaking: number | boolean
  isBouncing: boolean
  currentRow: number
}

const STATE_CLASSES: Record<string, string> = {
  correct: 'bg-[var(--tile-correct)] border-[var(--tile-correct)] text-white',
  present: 'bg-[var(--tile-present)] border-[var(--tile-present)] text-white',
  absent:  'bg-[var(--tile-absent)]  border-[var(--tile-absent)]  text-white',
  empty:   'bg-[var(--tile-empty-bg)] border-[var(--tile-empty-border)] text-[var(--text)]',
  tbd:     'bg-[var(--tile-empty-bg)] border-[var(--text)] text-[var(--text)]',
}

export function WordleGrid({ rows, isShaking, isBouncing, currentRow }: WordleGridProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {rows.map((row, ri) => (
        <div
          key={ri}
          className={`flex gap-1.5 ${isShaking === ri ? 'animate-shake' : ''}`}
        >
          {row.map((tile, ci) => (
            <Tile
              key={ci}
              tile={tile}
              delay={ci * 300}
              bounce={isBouncing && ri === currentRow - 1}
              bounceDelay={ci * 100}
            />
          ))}
        </div>
      ))}
    </div>
  )
}

function Tile({ tile, delay, bounce, bounceDelay }: {
  tile: TileState; delay: number; bounce: boolean; bounceDelay: number
}) {
  const isRevealing = tile.state !== 'empty' && tile.state !== 'tbd' && tile.letter

  return (
    <div
      className={`
        w-14 h-14 flex items-center justify-center text-2xl font-bold border-2 rounded select-none
        transition-transform
        ${tile.letter && tile.state === 'tbd' ? 'animate-pop' : ''}
        ${bounce ? 'animate-bounce-tile' : ''}
        ${isRevealing ? 'animate-flip' : ''}
        ${STATE_CLASSES[tile.state] ?? STATE_CLASSES.empty}
      `}
      style={{
        animationDelay: isRevealing ? `${delay}ms` : bounce ? `${bounceDelay}ms` : '0ms',
      }}
    >
      {tile.letter}
    </div>
  )
}
