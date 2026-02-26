import React, { useEffect, useRef } from 'react'

export function ConfettiEffect({ active }: { active: boolean }) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!active || !ref.current) return
    const el = ref.current
    const colors = ['#6AAA64', '#C9B458', '#4A90E2', '#E8763A', '#C030A0', '#F0D060']
    const pieces: HTMLDivElement[] = []

    for (let i = 0; i < 60; i++) {
      const div = document.createElement('div')
      const color = colors[Math.floor(Math.random() * colors.length)]
      const size = Math.random() * 8 + 6
      div.style.cssText = `
        position:absolute;width:${size}px;height:${size}px;background:${color};
        left:${Math.random() * 100}%;top:-10px;border-radius:${Math.random() > 0.5 ? '50%' : '2px'};
        animation:confetti-fall ${Math.random() * 2 + 1.5}s ease-in forwards;
        animation-delay:${Math.random() * 0.5}s;
        transform:rotate(${Math.random() * 360}deg);
      `
      el.appendChild(div)
      pieces.push(div)
    }

    const cleanup = setTimeout(() => pieces.forEach(p => p.remove()), 4000)
    return () => {
      clearTimeout(cleanup)
      pieces.forEach(p => p.remove())
    }
  }, [active])

  return (
    <div
      ref={ref}
      className="fixed inset-0 pointer-events-none overflow-hidden z-40"
    />
  )
}
