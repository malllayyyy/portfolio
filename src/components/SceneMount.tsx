'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { useTier } from '@/lib/store';

const Scene = dynamic(() => import('@/three'), { ssr: false });

interface WindowWithIdle {
  requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
  cancelIdleCallback?: (id: number) => void;
}

/**
 * Gated twice: `tier !== 'low'` so low tier fetches zero bytes of `three`,
 * and automatic post-FCP / interaction trigger so the chunk never competes with LCP text.
 */
export function SceneMount() {
  const [ready, setReady] = useState(false);
  const tier = useTier();

  useEffect(() => {
    if (document.documentElement.dataset.tier === 'low') return;

    if (window.scrollY > 0) {
      setReady(true);
      return;
    }

    let mounted = true;
    let observer: PerformanceObserver | null = null;
    let rafId1 = 0;
    let rafId2 = 0;
    let idleId = 0;
    let timeoutId: number | undefined = undefined;

    const cleanup = () => {
      mounted = false;
      events.forEach((evt) => {
        window.removeEventListener(evt, trigger);
      });
      if (observer) {
        try {
          observer.disconnect();
        } catch {
          // Ignore observer disconnect errors
        }
        observer = null;
      }
      if (rafId1) cancelAnimationFrame(rafId1);
      if (rafId2) cancelAnimationFrame(rafId2);

      const win = window as unknown as WindowWithIdle;
      if (idleId && win.cancelIdleCallback) {
        win.cancelIdleCallback(idleId);
        idleId = 0;
      }

      if (timeoutId !== undefined) {
        clearTimeout(timeoutId);
        timeoutId = undefined;
      }
    };

    const trigger = () => {
      if (!mounted) return;
      setReady(true);
      cleanup();
    };

    const events = ['scroll', 'wheel', 'touchstart', 'touchmove', 'keydown'] as const;
    events.forEach((evt) => {
      window.addEventListener(evt, trigger, { passive: true, once: true });
    });

    const scheduleMount = () => {
      if (!mounted) return;
      const win = window as unknown as WindowWithIdle;
      if (win.requestIdleCallback) {
        idleId = win.requestIdleCallback(() => trigger(), { timeout: 1000 });
      } else {
        rafId2 = requestAnimationFrame(() => trigger());
      }
    };

    // 1. Observe real paint signal (FCP or LCP)
    if (typeof PerformanceObserver !== 'undefined') {
      try {
        const supported = PerformanceObserver.supportedEntryTypes || [];
        const types = ['paint', 'largest-contentful-paint'].filter((t) => supported.includes(t));

        if (types.length > 0) {
          observer = new PerformanceObserver((entryList) => {
            const entries = entryList.getEntries();
            for (const entry of entries) {
              if (
                entry.entryType === 'largest-contentful-paint' ||
                (entry.entryType === 'paint' && entry.name === 'first-contentful-paint')
              ) {
                scheduleMount();
                break;
              }
            }
          });

          types.forEach((type) => {
            try {
              observer?.observe({ type, buffered: true });
            } catch {
              // Ignore unsupported observe options
            }
          });
        }
      } catch {
        // Fallback if PerformanceObserver initialization fails
      }
    }

    // 2. Double rAF fallback to guarantee paint frame boundary
    rafId1 = requestAnimationFrame(() => {
      rafId2 = requestAnimationFrame(() => {
        scheduleMount();
      });
    });

    // 3. Safety timeout if paint signals are delayed or unavailable
    timeoutId = window.setTimeout(() => {
      trigger();
    }, 1500);

    return cleanup;
  }, []);

  if (!ready || tier === 'low') return null;
  return <Scene />;
}
