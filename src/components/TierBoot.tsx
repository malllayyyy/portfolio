'use client';

import { useLayoutEffect, useEffect } from 'react';
import { detectTier } from '@/lib/tier';

const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

export function TierBoot() {
  useIsomorphicLayoutEffect(() => {
    const tier = detectTier();
    document.documentElement.dataset.tier = tier;
  }, []);

  return null;
}
