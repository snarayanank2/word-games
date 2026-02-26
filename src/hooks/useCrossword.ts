import { useState, useCallback, useEffect, useRef } from 'react'
import type { CrosswordPuzzleData, CrosswordClue, Tier } from '../types'
import crosswordsData from '../data/crosswords.json'

export type CellGrid = { letter: string; locked: boolean; error: boolean }[][]
export type Direction = 'across' | 'down'

export interface SelectedCell {
  row: number
  col: number
  direction: Direction
  clue: CrosswordClue | null
}

export interface UseCrosswordReturn {
  puzzle: CrosswordPuzzleData | null
  grid: CellGrid
  selectedCell: SelectedCell | null
  gameStatus: 'playing' | 'complete'
  errors: number
  hintsUsed: number
  timeSeconds: number
  selectCell: (row: number, col: number) => void
  selectClue: (clue: CrosswordClue, direction: Direction) => void
  inputLetter: (letter: string) => void
  deleteLetter: () => void
  revealHint: () => void
  activeClueNumbers: { across: number | null; down: number | null }
}

function getPuzzle(puzzleIndex: number, tier: Tier): CrosswordPuzzleData | null {
  const all = crosswordsData as CrosswordPuzzleData[]
  return all.find(p => p.puzzleIndex === puzzleIndex && p.difficulty === tier) ?? all[0] ?? null
}

function initGrid(puzzle: CrosswordPuzzleData): CellGrid {
  return puzzle.grid.map(row =>
    row.map(cell => ({ letter: cell === '#' ? '#' : '', locked: false, error: false }))
  )
}

const SAVE_KEY_PREFIX = 'pq_crossword_progress_'

function buildClueMap(puzzle: CrosswordPuzzleData) {
  const map: Record<string, { clue: CrosswordClue; direction: Direction; cells: [number, number][] }> = {}
  for (const clue of puzzle.clues.across) {
    const cells: [number, number][] = []
    for (let c = clue.col; c < clue.col + clue.length; c++) cells.push([clue.row, c])
    map[`${clue.number}-across`] = { clue, direction: 'across', cells }
  }
  for (const clue of puzzle.clues.down) {
    const cells: [number, number][] = []
    for (let r = clue.row; r < clue.row + clue.length; r++) cells.push([r, clue.col])
    map[`${clue.number}-down`] = { clue, direction: 'down', cells }
  }
  return map
}

function findClueForCell(row: number, col: number, direction: Direction, puzzle: CrosswordPuzzleData): CrosswordClue | null {
  const clues = direction === 'across' ? puzzle.clues.across : puzzle.clues.down
  for (const clue of clues) {
    if (direction === 'across' && clue.row === row && col >= clue.col && col < clue.col + clue.length) return clue
    if (direction === 'down' && clue.col === col && row >= clue.row && row < clue.row + clue.length) return clue
  }
  return null
}

function nextCell(row: number, col: number, direction: Direction, puzzle: CrosswordPuzzleData): [number, number] | null {
  const grid = puzzle.grid
  if (direction === 'across') {
    for (let c = col + 1; c < 5; c++) if (grid[row][c] !== '#') return [row, c]
  } else {
    for (let r = row + 1; r < 5; r++) if (grid[r][col] !== '#') return [r, col]
  }
  return null
}

function prevCell(row: number, col: number, direction: Direction, puzzle: CrosswordPuzzleData): [number, number] | null {
  const grid = puzzle.grid
  if (direction === 'across') {
    for (let c = col - 1; c >= 0; c--) if (grid[row][c] !== '#') return [row, c]
  } else {
    for (let r = row - 1; r >= 0; r--) if (grid[r][col] !== '#') return [r, col]
  }
  return null
}

export function useCrossword(puzzleIndex: number, tier: Tier): UseCrosswordReturn {
  const puzzle = getPuzzle(puzzleIndex, tier)
  const puzzleKey = `${puzzleIndex}_${tier}`

  const [grid, setGrid] = useState<CellGrid>(() => {
    if (!puzzle) return []
    try {
      const saved = localStorage.getItem(SAVE_KEY_PREFIX + puzzleKey)
      return saved ? JSON.parse(saved).grid : initGrid(puzzle)
    } catch { return initGrid(puzzle) }
  })
  const [selectedCell, setSelectedCell] = useState<SelectedCell | null>(null)
  const [gameStatus, setGameStatus] = useState<'playing' | 'complete'>('playing')
  const [errors, setErrors] = useState(0)
  const [hintsUsed, setHintsUsed] = useState(0)
  const [timeSeconds, setTimeSeconds] = useState(0)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const startTimeRef = useRef(Date.now())

  // Timer
  useEffect(() => {
    if (gameStatus !== 'playing') {
      if (timerRef.current) clearInterval(timerRef.current)
      return
    }
    timerRef.current = setInterval(() => {
      setTimeSeconds(Math.floor((Date.now() - startTimeRef.current) / 1000))
    }, 1000)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [gameStatus])

  // Auto-save grid
  useEffect(() => {
    try { localStorage.setItem(SAVE_KEY_PREFIX + puzzleKey, JSON.stringify({ grid })) } catch { /* quota */ }
  }, [grid, puzzleKey])

  // Check completion
  const checkComplete = useCallback((g: CellGrid) => {
    if (!puzzle) return
    for (let r = 0; r < 5; r++) {
      for (let c = 0; c < 5; c++) {
        if (puzzle.grid[r][c] === '#') continue
        if (g[r][c].letter !== puzzle.grid[r][c]) return
      }
    }
    setGameStatus('complete')
  }, [puzzle])

  const selectCell = useCallback((row: number, col: number) => {
    if (!puzzle || puzzle.grid[row][col] === '#') return
    setSelectedCell(prev => {
      const sameCell = prev?.row === row && prev?.col === col
      const newDirection: Direction = sameCell
        ? (prev!.direction === 'across' ? 'down' : 'across')
        : (prev?.direction ?? 'across')
      const validDir = findClueForCell(row, col, newDirection, puzzle)
        ? newDirection
        : (newDirection === 'across' ? 'down' : 'across')
      const clue = findClueForCell(row, col, validDir, puzzle)
      return { row, col, direction: validDir, clue }
    })
  }, [puzzle])

  const selectClue = useCallback((clue: CrosswordClue, direction: Direction) => {
    setSelectedCell({ row: clue.row, col: clue.col, direction, clue })
  }, [])

  const inputLetter = useCallback((letter: string) => {
    if (!puzzle || !selectedCell || gameStatus !== 'playing') return
    const { row, col, direction } = selectedCell

    setGrid(prev => {
      const next = prev.map(r => r.map(c => ({ ...c })))
      const cell = next[row][col]
      if (cell.locked) return prev

      const correct = puzzle.grid[row][col]
      const isError = letter !== correct && !cell.error && cell.letter !== '' && cell.letter !== letter
      if (isError) setErrors(e => e + 1)

      cell.letter = letter
      cell.error = letter !== correct

      // Auto-lock word if correct
      const clue = findClueForCell(row, col, direction, puzzle)
      if (clue) {
        const wordCorrect = clue.answer.split('').every((ch, i) => {
          const r = direction === 'across' ? clue.row : clue.row + i
          const c = direction === 'across' ? clue.col + i : clue.col
          return next[r][c].letter === ch
        })
        if (wordCorrect) {
          clue.answer.split('').forEach((_, i) => {
            const r = direction === 'across' ? clue.row : clue.row + i
            const c = direction === 'across' ? clue.col + i : clue.col
            next[r][c].locked = true
            next[r][c].error = false
          })
        }
      }

      checkComplete(next)
      return next
    })

    // Advance to next cell
    const next = nextCell(row, col, direction, puzzle)
    if (next) {
      const [nr, nc] = next
      const clue = findClueForCell(nr, nc, direction, puzzle)
      setSelectedCell({ row: nr, col: nc, direction, clue })
    }
  }, [puzzle, selectedCell, gameStatus, checkComplete])

  const deleteLetter = useCallback(() => {
    if (!puzzle || !selectedCell || gameStatus !== 'playing') return
    const { row, col, direction } = selectedCell
    const cell = grid[row][col]
    if (cell.locked) return

    if (cell.letter) {
      setGrid(prev => {
        const next = prev.map(r => r.map(c => ({ ...c })))
        next[row][col].letter = ''
        next[row][col].error = false
        return next
      })
    } else {
      const prev = prevCell(row, col, direction, puzzle)
      if (prev) {
        const [pr, pc] = prev
        if (!grid[pr][pc].locked) {
          setGrid(g => {
            const next = g.map(r => r.map(c => ({ ...c })))
            next[pr][pc].letter = ''
            next[pr][pc].error = false
            return next
          })
          const clue = findClueForCell(pr, pc, direction, puzzle)
          setSelectedCell({ row: pr, col: pc, direction, clue })
        }
      }
    }
  }, [puzzle, selectedCell, gameStatus, grid])

  const revealHint = useCallback(() => {
    if (!puzzle || !selectedCell || gameStatus !== 'playing') return
    const { row, col } = selectedCell
    const correct = puzzle.grid[row][col]
    if (!correct || correct === '#') return

    setGrid(prev => {
      const next = prev.map(r => r.map(c => ({ ...c })))
      next[row][col].letter = correct
      next[row][col].error = false
      next[row][col].locked = true
      checkComplete(next)
      return next
    })
    setHintsUsed(h => h + 1)
  }, [puzzle, selectedCell, gameStatus, checkComplete])

  const clueMap = puzzle ? buildClueMap(puzzle) : {}
  const activeClueNumbers = { across: null as number | null, down: null as number | null }
  if (selectedCell && puzzle) {
    const ac = findClueForCell(selectedCell.row, selectedCell.col, 'across', puzzle)
    const dc = findClueForCell(selectedCell.row, selectedCell.col, 'down', puzzle)
    activeClueNumbers.across = ac?.number ?? null
    activeClueNumbers.down = dc?.number ?? null
  }
  void clueMap

  return {
    puzzle,
    grid,
    selectedCell,
    gameStatus,
    errors,
    hintsUsed,
    timeSeconds,
    selectCell,
    selectClue,
    inputLetter,
    deleteLetter,
    revealHint,
    activeClueNumbers,
  }
}
