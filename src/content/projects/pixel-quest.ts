import type { Project } from '../types';

export const pixelQuest: Project = {
  slug: 'pixel-quest',
  title: 'Pixel Quest',
  layer: 'engine',
  depth: -134,
  thesis: 'A top-down Canvas 2D room with collision, NPC dialogue and collectibles — also no libraries, also no assets.',
  decisions: [
    {
      body: 'Collision is resolved axis-separated: X is moved and resolved, then Y is moved and resolved, independently. That is what stops the player catching on wall corners, and it is three lines shorter than the swept-AABB version that does the same job here.',
      evidence: ['games/rpg.js:145-152', 'games/rpg.js:198-214'],
    },
    {
      body: 'Diagonal input is normalised by 0.7071 so moving on both axes is not 1.414× faster than moving on one. Player speed is 3.2 px per tick against 3 wall colliders; NPC interaction triggers at 20 px proximity.',
      evidence: ['games/rpg.js:192-195'],
    },
    {
      body: 'Dialogue boxes are sized by a hand-written `wrapText` that measures the string against the canvas context and grows the box height to fit the wrapped lines. Collectible orbs bob on `Math.sin(orbAnimTime + orb.x) * 4` — the `orb.x` term is what keeps them from pulsing in unison.',
      evidence: ['games/rpg.js:154-171', 'games/rpg.js:296'],
    },
  ],
  scale: [
    { label: 'LOC',        value: '431' },
    { label: 'entry',      value: 'export function initRpg(canvas, onUnlockSkill)' },
    { label: 'resolution', value: '640 × 400 internal' },
    { label: 'colliders',  value: '3 walls, axis-separated AABB' },
  ],
  links: [],
  honesty: 'Not playable on touch. A WASD room with proximity dialogue needs a d-pad, and an on-screen d-pad over a 390 px viewport is worse than nothing — so mobile gets a 6-second clip of real play and the full mechanics in text.',
  presentation: { kind: 'playable', game: 'pixel-quest' },
};
