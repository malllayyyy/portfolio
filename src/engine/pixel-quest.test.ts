import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { initPixelQuest } from './pixel-quest';

describe('Pixel Quest engine mechanics', () => {
  let origRaf: typeof globalThis.requestAnimationFrame;
  let origCaf: typeof globalThis.cancelAnimationFrame;
  let origPerf: typeof globalThis.performance;
  let mockTime = 1000;
  let activeRafs = new Map<number, FrameRequestCallback>();
  let nextRafId = 1;

  beforeEach(() => {
    origRaf = globalThis.requestAnimationFrame;
    origCaf = globalThis.cancelAnimationFrame;
    origPerf = globalThis.performance;
    mockTime = 1000;
    activeRafs.clear();
    nextRafId = 1;

    globalThis.performance = {
      now: () => mockTime,
    } as unknown as Performance;

    globalThis.requestAnimationFrame = (cb: FrameRequestCallback) => {
      const id = nextRafId++;
      activeRafs.set(id, cb);
      return id;
    };

    globalThis.cancelAnimationFrame = (id: number) => {
      activeRafs.delete(id);
    };
  });

  afterEach(() => {
    globalThis.requestAnimationFrame = origRaf;
    globalThis.cancelAnimationFrame = origCaf;
    globalThis.performance = origPerf;
  });

  function setupTestHarness() {
    let playerPos = { x: 309, y: 320 };
    let harnessRafId: number | null = null;

    const dummyCtx = {
      save: () => {},
      restore: () => {},
      scale: () => {},
      fillRect: (x: number, y: number, w: number, h: number) => {
        if (w === 22 && h === 22) {
          playerPos = { x, y };
        }
      },
      strokeRect: () => {},
      beginPath: () => {},
      moveTo: () => {},
      lineTo: () => {},
      stroke: () => {},
      arc: () => {},
      fill: () => {},
      fillText: () => {},
      measureText: (text: string) => ({ width: text.length * 8 }),
      fillStyle: '',
      strokeStyle: '',
      lineWidth: 1,
      font: '',
      textAlign: '',
    };

    const canvas = {
      width: 0,
      height: 0,
      getContext: (type: string) => (type === '2d' ? dummyCtx : null),
    } as unknown as HTMLCanvasElement;

    const baseReq = globalThis.requestAnimationFrame;
    globalThis.requestAnimationFrame = (cb: FrameRequestCallback) => {
      const id = baseReq(cb);
      harnessRafId = id;
      return id;
    };

    const game = initPixelQuest(canvas);
    game.start();
    globalThis.requestAnimationFrame = baseReq;

    const tick = () => {
      mockTime += 1000 / 60;
      if (harnessRafId !== null && activeRafs.has(harnessRafId)) {
        const id = harnessRafId;
        const cb = activeRafs.get(id)!;
        activeRafs.delete(id);
        harnessRafId = null;

        globalThis.requestAnimationFrame = (nextCb: FrameRequestCallback) => {
          const nextId = baseReq(nextCb);
          harnessRafId = nextId;
          return nextId;
        };

        cb(mockTime);

        globalThis.requestAnimationFrame = baseReq;
      }
    };

    const stepTicks = (count: number) => {
      for (let i = 0; i < count; i++) {
        tick();
      }
    };

    return {
      game,
      tick,
      stepTicks,
      getPos: () => ({ ...playerPos }),
    };
  }

  it('1. Diagonal normalisation — moves player by speed * 0.7071 per axis, matching cardinal displacement magnitude', () => {
    // Measure cardinal displacement for 1 steady-state tick (speed = 3.2)
    const cardinalHarness = setupTestHarness();
    cardinalHarness.game.setKeys(false, false, false, true); // RIGHT
    cardinalHarness.stepTicks(2);
    const cardinalPos1 = cardinalHarness.getPos();
    cardinalHarness.stepTicks(1);
    const cardinalPos2 = cardinalHarness.getPos();
    const cardinalDisplacement = Math.hypot(cardinalPos2.x - cardinalPos1.x, cardinalPos2.y - cardinalPos1.y);
    cardinalHarness.game.stop();

    // Measure diagonal displacement (DOWN + RIGHT) for 1 steady-state tick
    const diagHarness = setupTestHarness();
    diagHarness.game.setKeys(false, true, false, true); // DOWN + RIGHT
    diagHarness.stepTicks(2);
    const diagPos1 = diagHarness.getPos();
    diagHarness.stepTicks(1);
    const diagPos2 = diagHarness.getPos();

    const dx = Math.abs(diagPos2.x - diagPos1.x);
    const dy = Math.abs(diagPos2.y - diagPos1.y);
    const diagDisplacement = Math.hypot(dx, dy);
    diagHarness.game.stop();

    // Each axis moves speed * 0.7071 = 3.2 * 0.7071 = 2.26272 per tick
    expect(dx).toBeCloseTo(3.2 * 0.7071, 4);
    expect(dy).toBeCloseTo(3.2 * 0.7071, 4);

    // Total diagonal displacement magnitude matches cardinal displacement magnitude (3.2) within small epsilon (0.01)
    expect(Math.abs(diagDisplacement - cardinalDisplacement)).toBeLessThan(0.01);

    // Breaking change caught: Would fail if diagonal normalisation (dx *= 0.7071; dy *= 0.7071) was removed,
    // yielding unnormalized diagonal displacement of ~4.5255 per tick (1.414x faster).
  });

  it('2. Axis-separated AABB collision — permits wall sliding when one axis is blocked and stops head-on collision without tunneling', () => {
    // A. Head-on collision into outer bottom wall (y = 363)
    const headOnHarness = setupTestHarness();
    headOnHarness.game.setKeys(false, true, false, false); // DOWN
    headOnHarness.stepTicks(20);
    const stoppedPos = headOnHarness.getPos();

    expect(stoppedPos.y).toBeLessThanOrEqual(363);
    headOnHarness.stepTicks(10);
    expect(headOnHarness.getPos().y).toEqual(stoppedPos.y);
    headOnHarness.game.stop();

    // B. Y blocked, X slides RIGHT at outer bottom wall
    const slideYHarness = setupTestHarness();
    slideYHarness.game.setKeys(false, true, false, false); // DOWN to outer bottom wall
    slideYHarness.stepTicks(20);
    const atWallY = slideYHarness.getPos();

    slideYHarness.game.setKeys(false, true, false, true); // DOWN + RIGHT
    slideYHarness.stepTicks(3);
    const afterSlideY = slideYHarness.getPos();

    // Y is blocked by bottom wall (y <= 363)
    expect(afterSlideY.y).toBeLessThanOrEqual(363);
    // X is permitted to slide RIGHT (x increases)
    expect(afterSlideY.x).toBeGreaterThan(atWallY.x);
    slideYHarness.game.stop();

    // C. X blocked, Y slides UP at outer left wall
    const slideXHarness = setupTestHarness();
    slideXHarness.game.setKeys(false, false, true, false); // LEFT to outer left wall (x = 15)
    slideXHarness.stepTicks(100);
    const atWallX = slideXHarness.getPos();

    expect(atWallX.x).toBeLessThanOrEqual(18);

    slideXHarness.game.setKeys(true, false, true, false); // UP + LEFT
    slideXHarness.stepTicks(3);
    const afterSlideX = slideXHarness.getPos();

    // X remains blocked at outer left wall boundary (x <= 18)
    expect(afterSlideX.x).toBeLessThanOrEqual(18);
    // Y is permitted to slide UP (y decreases)
    expect(afterSlideX.y).toBeLessThan(atWallX.y);
    slideXHarness.game.stop();

    // Breaking change caught: Would fail if collision logic zeroed both axes simultaneously upon any collision
    // or if collision detection was missing (permitting wall tunneling).
  });

  it('3. Per-frame speed — player.speed = 3.2 produces exactly 3.2 units of displacement per 60 Hz tick', () => {
    const harness = setupTestHarness();
    harness.game.setKeys(false, false, false, true); // RIGHT
    harness.stepTicks(2);
    const pos1 = harness.getPos();
    harness.stepTicks(1);
    const pos2 = harness.getPos();

    // Displacement per tick in steady state is exactly 3.2 units
    expect(pos2.x - pos1.x).toBeCloseTo(3.2, 5);
    expect(pos2.y).toEqual(pos1.y);

    harness.stepTicks(4);
    const pos6 = harness.getPos();
    expect(pos6.x - pos1.x).toBeCloseTo(5 * 3.2, 5);
    harness.game.stop();

    // Breaking change caught: Would fail if player.speed constant was changed or timestep rate was uncalibrated.
  });
});
