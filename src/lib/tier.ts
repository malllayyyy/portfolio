export type Tier = 'low' | 'mid' | 'high';

export function webglSupported(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const c = document.createElement('canvas');
    const ok = !!(c.getContext('webgl2') ?? c.getContext('webgl'));
    c.width = c.height = 0; // discard immediately
    return ok;
  } catch {
    return false;
  }
}

/** Runs ONCE, synchronously, before the 3D import decision. Never re-run on resize. */
export function detectTier(): Tier {
  if (typeof window === 'undefined') return 'low';

  const override = localStorage.getItem('substrate-tier');
  if (override === 'low' || override === 'mid' || override === 'high') return override;

  const nav = navigator as Navigator & {
    deviceMemory?: number;
    connection?: { saveData?: boolean };
  };
  const prefersReducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

  let score = 0;
  const cores = nav.hardwareConcurrency ?? 2;
  if (cores >= 8) score += 2; else if (cores >= 4) score += 1;
  const mem = nav.deviceMemory ?? 2;
  if (mem >= 8) score += 2; else if (mem >= 4) score += 1;
  if (matchMedia('(min-width: 1024px)').matches) score += 1;
  if (matchMedia('(pointer: fine)').matches) score += 1;
  if (devicePixelRatio <= 2) score += 1;
  if (nav.connection?.saveData) score = -99;
  if (!webglSupported()) score = -99;
  if (prefersReducedMotion) score = Math.min(score, 3);

  return score >= 6 ? 'high' : score >= 3 ? 'mid' : 'low';
}

export function setTierOverride(t: Tier): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('substrate-tier', t);
  location.reload();
}
