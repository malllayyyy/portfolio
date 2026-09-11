/**
 * § 2.2. Monotonic piecewise-linear. 16 control points, t ascending, y descending.
 * The four layer-datum control points ([0.1022,0.0], [0.4629,-40.0], [0.7060,-260.0],
 * [1.000,-300.0]) are pinned to the measured scroll fraction at which each layer's
 * section actually renders (`document — Step 4 recalibration after Engine removal`),
 * so `t` genuinely is where the DOM puts that layer, not an assumption about it.
 */
export const DEPTH_TABLE: readonly (readonly [t: number, y: number])[] = [
  [0.0000,   +6.0], [0.1022,    0.0], [0.1623,   -2.0], [0.2425,   -8.0],
  [0.2892,  -12.0], [0.3761,  -30.0], [0.4228,  -36.0], [0.4629,  -40.0],
  [0.4757,  -44.0], [0.5056,  -52.0], [0.5354,  -70.0], [0.6889, -248.0],
  [0.7060, -260.0], [0.8417, -278.0], [0.9208, -290.0], [1.0000, -300.0],
] as const;
