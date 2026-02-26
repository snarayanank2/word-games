let ctx: AudioContext | null = null

function getCtx(): AudioContext {
  if (!ctx) ctx = new AudioContext()
  return ctx
}

function playTone(frequency: number, duration: number, type: OscillatorType = 'sine', volume = 0.3) {
  try {
    const audioCtx = getCtx()
    const osc = audioCtx.createOscillator()
    const gain = audioCtx.createGain()
    osc.connect(gain)
    gain.connect(audioCtx.destination)
    osc.type = type
    osc.frequency.setValueAtTime(frequency, audioCtx.currentTime)
    gain.gain.setValueAtTime(volume, audioCtx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration)
    osc.start(audioCtx.currentTime)
    osc.stop(audioCtx.currentTime + duration)
  } catch {
    // Silently fail if audio not available
  }
}

export const audio = {
  keyClick() { playTone(800, 0.05, 'square', 0.15) },
  correct()  { playTone(523, 0.15, 'sine', 0.3); setTimeout(() => playTone(659, 0.2, 'sine', 0.3), 100) },
  present()  { playTone(440, 0.15, 'sine', 0.25) },
  absent()   { playTone(220, 0.15, 'sine', 0.2) },
  invalid()  { playTone(180, 0.3, 'square', 0.2) },
  win()      {
    [523, 659, 784, 1047].forEach((f, i) =>
      setTimeout(() => playTone(f, 0.25, 'sine', 0.3), i * 120)
    )
  },
  lose()     { playTone(200, 0.5, 'sawtooth', 0.2) },
  purchase() { playTone(880, 0.1, 'sine', 0.3); setTimeout(() => playTone(1108, 0.2, 'sine', 0.3), 80) },
}
