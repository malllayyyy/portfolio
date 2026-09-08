import { DEPTH_TABLE } from '../content/depth-table';

const LEN = DEPTH_TABLE.length;

const T_ARR = new Float64Array(LEN);
const Y_ARR = new Float64Array(LEN);

for (let i = 0; i < LEN; i++) {
  T_ARR[i] = DEPTH_TABLE[i][0];
  Y_ARR[i] = DEPTH_TABLE[i][1];
}

/**
 * § 2.2 — Scroll progress t ∈ [0, 1] to camera depth y (m).
 * Monotonic piecewise-linear function over 21 control points.
 * No allocation per frame.
 */
export function depth(t: number): number {
  if (t <= T_ARR[0]) return Y_ARR[0];
  if (t >= T_ARR[LEN - 1]) return Y_ARR[LEN - 1];

  let low = 0;
  let high = LEN - 1;

  while (low <= high) {
    const mid = (low + high) >> 1;
    if (T_ARR[mid] <= t) {
      low = mid + 1;
    } else {
      high = mid - 1;
    }
  }

  const i = high;
  const t0 = T_ARR[i];
  const t1 = T_ARR[i + 1];
  const y0 = Y_ARR[i];
  const y1 = Y_ARR[i + 1];

  const ratio = (t - t0) / (t1 - t0);
  return y0 + ratio * (y1 - y0);
}

/**
 * § 2.2 — Inverse mapping: camera depth y (m) to scroll progress t ∈ [0, 1].
 * Used by deep links and depth-gauge click navigation.
 * Searches the same precomputed arrays on the y column.
 * No allocation per frame.
 */
export function tOfDepth(y: number): number {
  if (y >= Y_ARR[0]) return T_ARR[0];
  if (y <= Y_ARR[LEN - 1]) return T_ARR[LEN - 1];

  let low = 0;
  let high = LEN - 1;

  while (low <= high) {
    const mid = (low + high) >> 1;
    if (Y_ARR[mid] >= y) {
      low = mid + 1;
    } else {
      high = mid - 1;
    }
  }

  const i = high;
  const y0 = Y_ARR[i];
  const y1 = Y_ARR[i + 1];
  const t0 = T_ARR[i];
  const t1 = T_ARR[i + 1];

  const ratio = (y - y0) / (y1 - y0);
  return t0 + ratio * (t1 - t0);
}
