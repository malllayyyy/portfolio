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
  it('enforces render interpolation contract: alpha in [0, 1) and discrete fields unblended', () => {
    let state = { x: 0, score: 0 };
    let prev = { x: 0, score: 0 };
    const alphas: number[] = [];
    const drawRecords: Array<{
      alpha: number;
      prevScore: number;
      currScore: number;
      discreteVal: number;
      lerpedX: number;
      prevX: number;
      currX: number;
    }> = [];

    const loop = createLoop({
      update: () => {
        state.x += 10;
        state.score += 1;
      },
      copyStateToPrev: () => {
        prev = { ...state };
      },
      draw: (alpha) => {
        alphas.push(alpha);
        const discreteVal = state.score;
        const lerpedX = prev.x + (state.x - prev.x) * alpha;
        drawRecords.push({
          alpha,
          prevScore: prev.score,
          currScore: state.score,
          discreteVal,
          lerpedX,
          prevX: prev.x,
          currX: state.x,
        });
      },
    });

    loop.frame(0);
    const frameDeltas = [
      0, 2, 5.5, 10, 16.6667, 20, 33.333, 50, 80, 249, 250, 500, 30_000, 1, 0.1, 16.6667
    ];
    let t = 0;
    for (const dt of frameDeltas) {
      t += dt;
      loop.frame(t);
    }

    expect(alphas.length).toBeGreaterThan(0);
    for (const alpha of alphas) {
      expect(alpha).toBeGreaterThanOrEqual(0);
      expect(alpha).toBeLessThan(1);
    }

    for (const rec of drawRecords) {
      expect(rec.discreteVal === rec.prevScore || rec.discreteVal === rec.currScore).toBe(true);
      expect(Number.isInteger(rec.discreteVal)).toBe(true);
      if (rec.alpha > 0 && rec.prevScore !== rec.currScore) {
        const blended = rec.prevScore + (rec.currScore - rec.prevScore) * rec.alpha;
        expect(rec.discreteVal).not.toBe(blended);
      }
      if (rec.prevX !== rec.currX) {
        expect(rec.lerpedX).toBeGreaterThanOrEqual(rec.prevX);
        expect(rec.lerpedX).toBeLessThan(rec.currX);
      }
    }
  });
});
