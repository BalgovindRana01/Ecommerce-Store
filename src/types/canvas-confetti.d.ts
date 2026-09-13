declare module 'canvas-confetti' {
  interface ConfettiOptions {
    particleCount?: number;
    spread?: number;
    startVelocity?: number;
    scalar?: number;
    ticks?: number;
    gravity?: number;
    drift?: number;
    origin?: { x?: number; y?: number };
    colors?: string[];
    shapes?: string[];
    disableForReducedMotion?: boolean;
  }

  interface ConfettiFunction {
    (options?: ConfettiOptions): boolean;
  }

  const confetti: ConfettiFunction;
  export default confetti;
}
