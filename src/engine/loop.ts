export const TIMESTEP_MS = 1000 / 60;   // 16.6667 ms — the rate the constants were authored for
export const MAX_STEPS = 5;             // largest catch-up that still fits inside two 30 fps frames
const MAX_FRAME_MS = 250;               // tab restore never dumps 30 s of simulation

export type Loop = { start(): void; stop(): void; frame(now: number): number };

export function createLoop(opts: {
  update: () => void;
  draw: (alpha: number) => void;
  copyStateToPrev: () => void;
}): Loop {
  let accumulator = 0;
  let prevTime = 0;
  let raf = 0;
  let running = false;

  function frame(now: number): number {
    const frameTime = Math.min(now - prevTime, MAX_FRAME_MS);
    prevTime = now;
    accumulator += frameTime;
    let steps = 0;
    while (accumulator >= TIMESTEP_MS && steps < MAX_STEPS) {
      opts.copyStateToPrev();
      opts.update();
      accumulator -= TIMESTEP_MS;
      steps++;
    }
    if (steps === MAX_STEPS) accumulator = 0;   // drop the backlog; never spiral
    opts.draw(accumulator / TIMESTEP_MS);
    return steps;
  }

  function tick(now: number) { frame(now); if (running) raf = requestAnimationFrame(tick); }

  return {
    start() { if (running) return; running = true; prevTime = performance.now(); accumulator = 0; raf = requestAnimationFrame(tick); },
    stop()  { running = false; cancelAnimationFrame(raf); },
    frame,
  };
}
