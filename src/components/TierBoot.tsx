'use client';

import { useLayoutEffect, useEffect } from 'react';
import { detectTier } from '@/lib/tier';
import { initMotionPref } from '@/lib/motion-pref';
const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

export function TierBoot() {
  useIsomorphicLayoutEffect(() => {
    document.documentElement.dataset.tier = detectTier();
    initMotionPref();
  }, []);

  return null;
}
