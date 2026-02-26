import { useState, useCallback } from 'react'

export function useStorage<T>(key: string, defaultValue: T): [T, (val: T | ((prev: T) => T)) => void] {
  const [state, setStateRaw] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(key)
      return raw ? (JSON.parse(raw) as T) : defaultValue
    } catch {
      return defaultValue
    }
  })

  const setState = useCallback(
    (val: T | ((prev: T) => T)) => {
      setStateRaw(prev => {
        const next = typeof val === 'function' ? (val as (p: T) => T)(prev) : val
        try { localStorage.setItem(key, JSON.stringify(next)) } catch { /* quota exceeded */ }
        return next
      })
    },
    [key],
  )

  return [state, setState]
}
