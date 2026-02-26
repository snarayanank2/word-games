import React from 'react'
import type { KeyboardMap } from '../../hooks/useWordle'
import type { LetterState } from '../../types'

const ROWS = [
  ['Q','W','E','R','T','Y','U','I','O','P'],
  ['A','S','D','F','G','H','J','K','L'],
  ['ENTER','Z','X','C','V','B','N','M','⌫'],
]

const KEY_STATE_CLASSES: Record<LetterState, string> = {
  correct: 'bg-[var(--tile-correct)] text-white border-[var(--tile-correct)]',
  present: 'bg-[var(--tile-present)] text-white border-[var(--tile-present)]',
  absent:  'bg-[var(--tile-absent)]  text-white border-[var(--tile-absent)]',
  empty:   'bg-[var(--key-bg)] text-[var(--key-text)] border-[var(--border)]',
  tbd:     'bg-[var(--key-bg)] text-[var(--key-text)] border-[var(--border)]',
}

interface WordleKeyboardProps {
  keyboardMap: KeyboardMap
  onKey: (letter: string) => void
  onDelete: () => void
  onEnter: () => void
}

export function WordleKeyboard({ keyboardMap, onKey, onDelete, onEnter }: WordleKeyboardProps) {
  return (
    <div className="flex flex-col items-center gap-1 w-full px-1">
      {ROWS.map((row, ri) => (
        <div key={ri} className="flex gap-1 w-full justify-center">
          {row.map(key => {
            const state = keyboardMap[key] ?? 'empty'
            const isWide = key === 'ENTER' || key === '⌫'

            return (
              <button
                key={key}
                onClick={() => {
                  if (key === '⌫') onDelete()
                  else if (key === 'ENTER') onEnter()
                  else onKey(key)
                }}
                className={`
                  h-12 rounded font-bold text-sm border select-none
                  active:scale-95 transition-transform
                  ${isWide ? 'px-1 flex-[1.5] text-xs' : 'flex-1'}
                  ${KEY_STATE_CLASSES[state as LetterState] ?? KEY_STATE_CLASSES.empty}
                `}
              >
                {key}
              </button>
            )
          })}
        </div>
      ))}
    </div>
  )
}
