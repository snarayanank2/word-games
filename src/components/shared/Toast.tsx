import React, { useEffect, useState } from 'react'

interface ToastProps {
  message: string
  duration?: number
  onDone?: () => void
}

export function Toast({ message, duration = 2000, onDone }: ToastProps) {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const t = setTimeout(() => { setVisible(false); onDone?.() }, duration)
    return () => clearTimeout(t)
  }, [duration, onDone])

  if (!message || !visible) return null

  return (
    <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-lg bg-[var(--text)] text-[var(--accent-text)] text-sm font-semibold shadow-lg pointer-events-none animate-fade-in">
      {message}
    </div>
  )
}

interface ToastState {
  message: string
  id: number
}

export function useToast() {
  const [toast, setToast] = useState<ToastState | null>(null)

  const showToast = (message: string) => {
    setToast({ message, id: Date.now() })
  }

  const ToastComponent = toast ? (
    <Toast key={toast.id} message={toast.message} onDone={() => setToast(null)} />
  ) : null

  return { showToast, ToastComponent }
}
