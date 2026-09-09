import { getMotion } from './motion-pref';

export type Tier = 'low' | 'mid' | 'high';

let cachedWebglSupported: boolean | null = null;

export function webglSupported(): boolean {
  if (typeof window === 'undefined') return false;
  if (cachedWebglSupported !== null) return cachedWebglSupported;
  try {
    const c = document.createElement('canvas');
    const ok = !!(c.getContext('webgl2') ?? c.getContext('webgl'));
    c.width = c.height = 0; // discard immediately
    cachedWebglSupported = ok;
    return ok;
  } catch {
    cachedWebglSupported = false;
    return false;
  }
}

export type TierEvidence = {
  score: number;
  cores: number | undefined;
  deviceMemory: number | undefined;
  minWidth1024: boolean;
  pointerFine: boolean;
  dpr: number;
  saveData: boolean | undefined;
  webgl: boolean;
  prefersReducedMotion: boolean;
  summary: string;
};

let lastEvidence: TierEvidence | null = null;

/** Runs ONCE, synchronously, before the 3D import decision. Never re-run on resize. */
export function detectTier(): Tier {
  if (typeof window === 'undefined') return 'low';

  const override = localStorage.getItem('substrate-tier');
  if (override === 'low' || override === 'mid' || override === 'high') return override;

  const nav = navigator as Navigator & {
    deviceMemory?: number;
    connection?: { saveData?: boolean };
  };
  // Single source of truth for this preference — see src/lib/motion-pref.ts.
  const prefersReducedMotion = getMotion() === 'off';

  let score = 0;
  const coresVal = nav.hardwareConcurrency;
  const cores = coresVal ?? 2;
  if (cores >= 8) score += 2; else if (cores >= 4) score += 1;
  const memVal = nav.deviceMemory;
  const mem = memVal ?? 2;
  if (mem >= 8) score += 2; else if (mem >= 4) score += 1;
  const minWidth = matchMedia('(min-width: 1024px)').matches;
  if (minWidth) score += 1;
  const pointerFine = matchMedia('(pointer: fine)').matches;
  if (pointerFine) score += 1;
  const dpr = devicePixelRatio;
  if (dpr <= 2) score += 1;
  const saveData = nav.connection?.saveData;
  if (saveData) score = -99;
  const webgl = webglSupported();
  if (!webgl) score = -99;
  if (prefersReducedMotion) score = Math.min(score, 3);

  const parts: string[] = [];
  if (coresVal !== undefined) parts.push(`${coresVal} cores`);
  if (memVal !== undefined) parts.push(`${memVal} GB`);
  if (minWidth) parts.push('≥1024px');
  if (pointerFine) parts.push('fine pointer');
  parts.push(`DPR ${dpr}`);

  lastEvidence = {
    score,
    cores: coresVal,
    deviceMemory: memVal,
    minWidth1024: minWidth,
    pointerFine,
    dpr,
    saveData,
    webgl,
    prefersReducedMotion,
    summary: `detectTier() scored ${score} — ${parts.join(', ')}`,
  };

  return score >= 6 ? 'high' : score >= 3 ? 'mid' : 'low';
}

export function getTierEvidence(): TierEvidence | null {
  if (!lastEvidence && typeof window !== 'undefined') {
    detectTier();
  }
  return lastEvidence;
}

export function setTierOverride(t: Tier): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('substrate-tier', t);
  location.reload();
}
