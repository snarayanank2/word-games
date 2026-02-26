import React from 'react'

interface ModalProps {
  isOpen: boolean
  onClose?: () => void
  children: React.ReactNode
  title?: string
}

export function Modal({ isOpen, onClose, children, title }: ModalProps) {
  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onClose}
    >
      <div
        className="bg-[var(--bg-secondary)] rounded-2xl shadow-2xl p-6 max-w-sm w-full mx-4 relative"
        onClick={e => e.stopPropagation()}
      >
        {title && (
          <h2 className="text-xl font-bold text-[var(--text)] mb-4 text-center" style={{ fontFamily: 'Georgia, serif' }}>
            {title}
          </h2>
        )}
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-[var(--text-secondary)] hover:text-[var(--text)] text-xl leading-none"
          >
            ✕
          </button>
        )}
        {children}
      </div>
    </div>
  )
}
