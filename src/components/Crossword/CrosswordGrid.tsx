import React from 'react'
import type { CrosswordPuzzleData, CrosswordClue } from '../../types'
import type { CellGrid, SelectedCell, Direction } from '../../hooks/useCrossword'

interface CrosswordGridProps {
  puzzle: CrosswordPuzzleData
  grid: CellGrid
  selectedCell: SelectedCell | null
  activeClueNumbers: { across: number | null; down: number | null }
  onCellClick: (row: number, col: number) => void
}

// Build a map of cell → clue number (for rendering numbers in cells)
function buildNumberMap(puzzle: CrosswordPuzzleData): Record<string, number> {
  const map: Record<string, number> = {}
  for (const clue of [...puzzle.clues.across, ...puzzle.clues.down]) {
    map[`${clue.row},${clue.col}`] = clue.number
  }
  return map
}

// Determine which cells are highlighted (part of active word)
function getHighlightedCells(selectedCell: SelectedCell | null, puzzle: CrosswordPuzzleData): Set<string> {
  const highlighted = new Set<string>()
  if (!selectedCell || !selectedCell.clue) return highlighted
  const { clue, direction } = selectedCell
  for (let i = 0; i < clue.length; i++) {
    const r = direction === 'across' ? clue.row : clue.row + i
    const c = direction === 'across' ? clue.col + i : clue.col
    highlighted.add(`${r},${c}`)
  }
  return highlighted
}

export function CrosswordGrid({ puzzle, grid, selectedCell, onCellClick }: CrosswordGridProps) {
  const numberMap = buildNumberMap(puzzle)
  const highlighted = getHighlightedCells(selectedCell, puzzle)

  return (
    <div
      className="inline-grid border-2 border-[var(--text)] rounded-sm overflow-hidden"
      style={{ gridTemplateColumns: 'repeat(5, 1fr)' }}
    >
      {grid.map((row, ri) =>
        row.map((cell, ci) => {
          const key = `${ri},${ci}`
          const isBlack = puzzle.grid[ri][ci] === '#'
          const isSelected = selectedCell?.row === ri && selectedCell?.col === ci
          const isHighlighted = highlighted.has(key)
          const num = numberMap[key]

          if (isBlack) {
            return <div key={key} className="w-12 h-12 bg-[var(--text)]" />
          }

          let bg = 'bg-[var(--bg-secondary)]'
          if (isSelected) bg = 'bg-blue-200'
          else if (isHighlighted) bg = 'bg-blue-50'
          if (cell.locked) bg = 'bg-[var(--tile-correct)]/20'

          return (
            <div
              key={key}
              onClick={() => onCellClick(ri, ci)}
              className={`
                w-12 h-12 border border-[var(--border)] relative cursor-pointer
                flex items-center justify-center select-none
                ${bg} transition-colors
              `}
            >
              {num !== undefined && (
                <span className="absolute top-0.5 left-0.5 text-[8px] text-[var(--text-secondary)] leading-none font-medium">
                  {num}
                </span>
              )}
              <span
                className={`text-base font-bold ${
                  cell.locked
                    ? 'text-[var(--tile-correct)]'
                    : cell.error
                    ? 'text-red-500'
                    : 'text-[var(--text)]'
                }`}
              >
                {cell.letter}
              </span>
            </div>
          )
        })
      )}
    </div>
  )
}
