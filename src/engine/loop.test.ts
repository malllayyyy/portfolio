import { describe, it, expect } from 'vitest';
import { createLoop, MAX_STEPS, TIMESTEP_MS } from './loop';

const mk = () => {
  let ticks = 0;
  const loop = createLoop({ update: () => { ticks++; }, draw: () => {}, copyStateToPrev: () => {} });
  return { loop, ticks: () => ticks };
};

describe('fixed-timestep accumulator', () => {
  it('runs the same number of ticks for the same wall time at 144 Hz and 60 Hz', () => {
    const a = mk(); let t = 0;
    a.loop.frame(0);
    for (let i = 0; i < 100; i++) { t += 1000 / 144; a.loop.frame(t); }

    const b = mk(); let u = 0;
    b.loop.frame(0);
    for (let i = 0; i < 100; i++) { u += 1000 / 60; b.loop.frame(u); }

    // 100 frames at 144 Hz = 694 ms ≈ 41 ticks; 100 frames at 60 Hz = 1667 ms ≈ 100 ticks.
    // Normalise by elapsed wall time: ticks per second must agree.
    const rateA = a.ticks() / (t / 1000);
    const rateB = b.ticks() / (u / 1000);
    expect(Math.abs(rateA - rateB)).toBeLessThanOrEqual(2);
  });

  it('clamps a 30-second tab-restore jump to MAX_STEPS and drops the backlog', () => {
    const { loop, ticks } = mk();
    loop.frame(0);
    const ran = loop.frame(30_000);
    expect(ran).toBe(MAX_STEPS);
    expect(ticks()).toBe(MAX_STEPS);
    // accumulator must be zeroed, so the very next normal frame runs at most one tick
    expect(loop.frame(30_000 + TIMESTEP_MS)).toBe(1);
  });
});
