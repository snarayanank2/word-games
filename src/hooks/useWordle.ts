import { useState, useCallback, useEffect, useRef } from 'react'
import type { LetterState, Tier } from '../types'
import wordleData from '../data/wordle-words.json'

export interface TileState {
  letter: string
  state: LetterState
}

export type KeyboardMap = Record<string, LetterState>

export interface UseWordleReturn {
  rows: TileState[][]
  currentRow: number
  currentInput: string
  keyboardMap: KeyboardMap
  gameStatus: 'playing' | 'won' | 'lost'
  isShaking: boolean
  isBouncing: boolean
  errorMessage: string
  submitGuess: () => void
  addLetter: (letter: string) => void
  deleteLetter: () => void
  targetWord: string
  guessCount: number
}

const MAX_GUESSES = 6
const WORD_LENGTH = 5

function getWord(puzzleIndex: number, tier: Tier): string {
  const puzzle = (wordleData as { puzzles: Array<{ puzzleIndex: number; words: Record<string, string> }> })
    .puzzles.find(p => p.puzzleIndex === puzzleIndex)
  return puzzle?.words[String(tier)] ?? 'HAPPY'
}

function isValidWord(word: string): boolean {
  const data = wordleData as {
    puzzles: Array<{ words: Record<string, string> }>
    validGuesses: string[]
  }
  const allPuzzleWords = data.puzzles.flatMap(p => Object.values(p.words))
  return (
    data.validGuesses.includes(word.toUpperCase()) ||
    allPuzzleWords.includes(word.toUpperCase())
  )
}

function evaluateGuess(guess: string, target: string): LetterState[] {
  const result: LetterState[] = Array(WORD_LENGTH).fill('absent')
  const targetArr = target.split('')
  const guessArr = guess.split('')
  const used = Array(WORD_LENGTH).fill(false)

  // First pass: correct positions
  for (let i = 0; i < WORD_LENGTH; i++) {
    if (guessArr[i] === targetArr[i]) {
      result[i] = 'correct'
      used[i] = true
    }
  }

  // Second pass: present (wrong position)
  for (let i = 0; i < WORD_LENGTH; i++) {
    if (result[i] === 'correct') continue
    for (let j = 0; j < WORD_LENGTH; j++) {
      if (!used[j] && guessArr[i] === targetArr[j]) {
        result[i] = 'present'
        used[j] = true
        break
      }
    }
  }

  return result
}

const SAVE_KEY_PREFIX = 'pq_wordle_progress_'

function loadProgress(puzzleKey: string) {
  try {
    const raw = localStorage.getItem(SAVE_KEY_PREFIX + puzzleKey)
    return raw ? JSON.parse(raw) : null
  } catch { return null }
}

function saveProgress(puzzleKey: string, data: unknown) {
  try { localStorage.setItem(SAVE_KEY_PREFIX + puzzleKey, JSON.stringify(data)) } catch { /* quota */ }
}

export function useWordle(puzzleIndex: number, tier: Tier): UseWordleReturn {
  const targetWord = getWord(puzzleIndex, tier)
  const puzzleKey = `${puzzleIndex}_${tier}`

  const emptyRows = (): TileState[][] =>
    Array(MAX_GUESSES).fill(null).map(() =>
      Array(WORD_LENGTH).fill(null).map(() => ({ letter: '', state: 'empty' as LetterState }))
    )

  const [rows, setRows] = useState<TileState[][]>(() => {
    const saved = loadProgress(puzzleKey)
    return saved?.rows ?? emptyRows()
  })
  const [currentRow, setCurrentRow] = useState<number>(() => loadProgress(puzzleKey)?.currentRow ?? 0)
  const [currentInput, setCurrentInput] = useState('')
  const [keyboardMap, setKeyboardMap] = useState<KeyboardMap>(() => loadProgress(puzzleKey)?.keyboardMap ?? {})
  const [gameStatus, setGameStatus] = useState<'playing' | 'won' | 'lost'>(() => loadProgress(puzzleKey)?.gameStatus ?? 'playing')
  const [isShaking, setIsShaking] = useState(false)
  const [isBouncing, setIsBouncing] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const revealingRef = useRef(false)

  // Auto-save on state change
  useEffect(() => {
    if (gameStatus !== 'playing' || currentRow > 0) {
      saveProgress(puzzleKey, { rows, currentRow, keyboardMap, gameStatus })
    }
  }, [rows, currentRow, keyboardMap, gameStatus, puzzleKey])

  const showError = useCallback((msg: string) => {
    setErrorMessage(msg)
    setTimeout(() => setErrorMessage(''), 2000)
  }, [])

  const addLetter = useCallback((letter: string) => {
    if (gameStatus !== 'playing' || revealingRef.current) return
    setCurrentInput(prev => prev.length < WORD_LENGTH ? prev + letter : prev)
  }, [gameStatus])

  const deleteLetter = useCallback(() => {
    if (gameStatus !== 'playing') return
    setCurrentInput(prev => prev.slice(0, -1))
  }, [gameStatus])

  const submitGuess = useCallback(() => {
    if (gameStatus !== 'playing' || revealingRef.current) return

    if (currentInput.length < WORD_LENGTH) {
      setIsShaking(true)
      setTimeout(() => setIsShaking(false), 400)
      showError('Not enough letters')
      return
    }

    if (!isValidWord(currentInput)) {
      setIsShaking(true)
      setTimeout(() => setIsShaking(false), 400)
      showError('Not in word list')
      return
    }

    const evaluation = evaluateGuess(currentInput, targetWord)
    revealingRef.current = true

    setRows(prev => {
      const next = prev.map(r => [...r])
      for (let i = 0; i < WORD_LENGTH; i++) {
        next[currentRow][i] = { letter: currentInput[i], state: 'tbd' }
      }
      return next
    })

    // Staggered reveal
    setTimeout(() => {
      setRows(prev => {
        const next = prev.map(r => [...r])
        for (let i = 0; i < WORD_LENGTH; i++) {
          next[currentRow][i] = { letter: currentInput[i], state: evaluation[i] }
        }
        return next
      })

      setKeyboardMap(prev => {
        const next = { ...prev }
        const priority: Record<LetterState, number> = { correct: 3, present: 2, absent: 1, empty: 0, tbd: 0 }
        for (let i = 0; i < WORD_LENGTH; i++) {
          const letter = currentInput[i]
          const current = next[letter]
          if (!current || priority[evaluation[i]] > priority[current]) {
            next[letter] = evaluation[i]
          }
        }
        return next
      })

      const won = evaluation.every(s => s === 'correct')
      const nextRow = currentRow + 1
      const lost = !won && nextRow >= MAX_GUESSES

      if (won) {
        // Wait for all tile flips to finish before bouncing and marking won.
        // Last tile (index 4) starts flipping at delay 1200ms and takes 500ms → 1700ms total.
        const flipDone = (WORD_LENGTH - 1) * 300 + 500 + 50 // ~1750ms
        setTimeout(() => {
          setIsBouncing(true)
          setTimeout(() => setIsBouncing(false), 1000)
          setGameStatus('won')
        }, flipDone)
      } else if (lost) {
        setGameStatus('lost')
      } else {
        setCurrentRow(nextRow)
      }

      setCurrentInput('')
      revealingRef.current = false
    }, WORD_LENGTH * 300 + 100)
  }, [gameStatus, currentInput, currentRow, targetWord, showError])

  // Show current input in the current row
  const displayRows = rows.map((row, ri) => {
    if (ri !== currentRow || gameStatus !== 'playing') return row
    return row.map((cell, ci) => ({
      letter: currentInput[ci] ?? '',
      state: (currentInput[ci] ? 'tbd' : 'empty') as LetterState,
    }))
  })

  return {
    rows: displayRows,
    currentRow,
    currentInput,
    keyboardMap,
    gameStatus,
    isShaking,
    isBouncing,
    errorMessage,
    submitGuess,
    addLetter,
    deleteLetter,
    targetWord,
    guessCount: currentRow + (gameStatus !== 'playing' && rows[currentRow]?.some(t => t.letter) ? 1 : 0),
  }
}
