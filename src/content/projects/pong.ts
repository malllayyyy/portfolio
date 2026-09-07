import type { Project } from '../types';

export const pong: Project = {
  slug: 'pong',
  title: 'Pong',
  layer: 'engine',
  depth: -124,
  thesis: 'Canvas 2D Pong, no libraries and no assets — every pixel is a canvas primitive.',
  decisions: [
    {
      body: 'Paddle collision is an AABB intersection, and the bounce angle comes out of where on the paddle the ball landed: `hitRatio` against the paddle centre becomes `angle = hitRatio * PI/3`, then `vx = speed * cos(angle)`, `vy = speed * sin(angle)`.',
      evidence: ['games/pong.js:139-158'],
    },
    {
      body: 'The ball accelerates 3.5 % on every paddle hit, clamped at speed 9. The AI tracks the ball at 3.6 px per tick with a 10 px deadzone, which is what stops it oscillating on centre and what makes it beatable.',
      evidence: ['games/pong.js:126-133'],
    },
    {
      body: 'It shipped on an unthrottled `requestAnimationFrame` loop with per-frame constants and no delta scaling, so it ran 2.4× fast on a 144 Hz display. The port puts it on a fixed-timestep accumulator at 1000/60 ms with render interpolation — and retunes not one constant, because the tick rate is now exactly the rate they were authored for.',
      evidence: ['games/pong.js:283-288', 'src/engine/loop.ts'],
    },
  ],
  scale: [
    { label: 'LOC',        value: '305' },
    { label: 'entry',      value: 'export function initPong(canvas, onWin)' },
    { label: 'resolution', value: '640 × 400 internal' },
    { label: 'assets',     value: 'none — canvas primitives only' },
    { label: 'win',        value: 'WINNING_SCORE = 7' },
  ],
  links: [],
  honesty: 'The C++/SFML and Java versions came first. They\u2019re gone — no repo, no backup. What\u2019s here is the third time I wrote them, in Canvas 2D.',
  presentation: { kind: 'playable', game: 'pong' },
};
