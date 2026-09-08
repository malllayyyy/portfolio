'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

const Scene = dynamic(() => import('@/three'), { ssr: false });
/**
 * Gated twice: `tier !== 'low'` so low tier fetches zero bytes of `three`,
 * and first scroll intent so the chunk never competes with LCP text.
 */
export function SceneMount() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (document.documentElement.dataset.tier === 'low') return;

    if (window.scrollY > 0) {
      setReady(true);
      return;
    }

    const events = ['scroll', 'wheel', 'touchstart', 'touchmove', 'keydown'] as const;

    const cleanup = () => {
      events.forEach((evt) => {
        window.removeEventListener(evt, trigger);
      });
    };

    const trigger = () => {
      setReady(true);
      cleanup();
    };

    events.forEach((evt) => {
      window.addEventListener(evt, trigger, { passive: true, once: true });
    });

    return cleanup;
  }, []);

  if (!ready) return null;
  return <Scene />;
}
