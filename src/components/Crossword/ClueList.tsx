import React from 'react'
import type { CrosswordPuzzleData, CrosswordClue } from '../../types'
import type { SelectedCell, Direction } from '../../hooks/useCrossword'

interface ClueListProps {
  puzzle: CrosswordPuzzleData
  selectedCell: SelectedCell | null
  activeClueNumbers: { across: number | null; down: number | null }
  onSelectClue: (clue: CrosswordClue, direction: Direction) => void
}

export function ClueList({ puzzle, selectedCell, activeClueNumbers, onSelectClue }: ClueListProps) {
  return (
    <div className="flex gap-6 flex-1 min-w-0 text-sm">
      <ClueSection
        title="Across"
        clues={puzzle.clues.across}
        activeNumber={activeClueNumbers.across}
        activeDirection={selectedCell?.direction ?? null}
        section="across"
        onSelect={clue => onSelectClue(clue, 'across')}
      />
      <ClueSection
        title="Down"
        clues={puzzle.clues.down}
        activeNumber={activeClueNumbers.down}
        activeDirection={selectedCell?.direction ?? null}
        section="down"
        onSelect={clue => onSelectClue(clue, 'down')}
      />
    </div>
  )
}

function ClueSection({
  title, clues, activeNumber, activeDirection, section, onSelect,
}: {
  title: string
  clues: CrosswordClue[]
  activeNumber: number | null
  activeDirection: Direction | null
  section: Direction
  onSelect: (clue: CrosswordClue) => void
}) {
  return (
    <div className="flex-1 min-w-0">
      <h3 className="font-bold text-[var(--text)] mb-2 text-xs uppercase tracking-wider">
        {title}
      </h3>
      <ul className="flex flex-col gap-0.5">
        {clues.map(clue => {
          const isActive = clue.number === activeNumber && activeDirection === section
          return (
            <li key={clue.number}>
              <button
                onClick={() => onSelect(clue)}
                className={`
                  text-left w-full px-2 py-1 rounded text-xs leading-snug transition-colors
                  ${isActive
                    ? 'bg-[var(--accent)] text-[var(--accent-text)]'
                    : 'text-[var(--text)] hover:bg-[var(--border)]'}
                `}
              >
                <span className="font-bold mr-1">{clue.number}.</span>
                {clue.clue}
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
