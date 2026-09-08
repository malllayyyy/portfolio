'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

const Scene = dynamic(() => import('@/three'), { ssr: false });

/**
 * The only place the 3D chunk is ever requested (§ 8.1, § 8.3).
 *
 * Gated twice: `tier !== 'low'` so low tier fetches zero bytes of `three`,
 * and `requestIdleCallback` so the chunk never competes with the LCP text.
 */
export function SceneMount() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (document.documentElement.dataset.tier === 'low') return;

    const idle =
      window.requestIdleCallback ??
      ((cb: IdleRequestCallback) => window.setTimeout(() => cb({} as IdleDeadline), 200));
    const handle = idle(() => setReady(true));

    return () => {
      if (window.cancelIdleCallback && typeof handle === 'number') {
        window.cancelIdleCallback(handle);
      }
    };
  }, []);

  if (!ready) return null;
  return <Scene />;
}
