export type MotionPref = 'on' | 'off';

const QUERY = '(prefers-reduced-motion: reduce)';

const listeners = new Set<() => void>();
let mql: MediaQueryList | null = null;
let isListening = false;

function getMql(): MediaQueryList | null {
  if (typeof window === 'undefined') return null;
  if (!mql) {
    mql = window.matchMedia(QUERY);
  }
  return mql;
}

export function getMotion(): MotionPref {
  const media = getMql();
  return media?.matches ? 'off' : 'on';
}

export function getServerMotion(): MotionPref {
  return 'on';
}

export function updateMotionDOM(motion = getMotion()): void {
  if (typeof document !== 'undefined') {
    document.documentElement.dataset.motion = motion;
  }
}

function handleChange(e?: MediaQueryListEvent | MediaQueryList): void {
  const isReduced = e ? e.matches : (getMql()?.matches ?? false);
  const motion: MotionPref = isReduced ? 'off' : 'on';
  updateMotionDOM(motion);
  listeners.forEach((cb) => cb());
}

function ensureListening(): void {
  const media = getMql();
  if (media && !isListening) {
    if ('addEventListener' in media) {
      media.addEventListener('change', handleChange);
    } else {
      (media as MediaQueryList).addListener(handleChange);
    }
    isListening = true;
  }
}

export function subscribeMotion(callback: () => void): () => void {
  if (typeof window === 'undefined') return () => {};

  ensureListening();
  listeners.add(callback);

  return () => {
    listeners.delete(callback);
  };
}

export function initMotionPref(): () => void {
  if (typeof window === 'undefined') return () => {};
  updateMotionDOM();
  ensureListening();
  return () => {};
}
