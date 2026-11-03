declare module 'canvas-confetti' {
  interface ConfettiOptions {
    particleCount?: number
    angle?: number
    spread?: number
    startVelocity?: number
    decay?: number
    gravity?: number
    origin?: { x?: number; y?: number }
    colors?: string[]
    shapes?: ('square' | 'circle')[]
    scalar?: number
    ticks?: number
    zIndex?: number
    disableForReducedMotion?: boolean
  }

  const confetti: (options?: ConfettiOptions) => void
  export default confetti
}
