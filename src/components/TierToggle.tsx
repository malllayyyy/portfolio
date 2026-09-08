'use client';

import { useState, useEffect } from 'react';
import { detectTier, setTierOverride, type Tier } from '@/lib/tier';

export function TierToggle() {
  const [tier, setTier] = useState<Tier>('high');

  useEffect(() => {
    setTier(detectTier());
  }, []);

  const isLow = tier === 'low';
  const label = isLow
    ? 'Prefers the interactive version? Switch.'
    : 'Prefers the still version? Switch.';

  const handleClick = () => {
    const nextTier: Tier = isLow ? 'high' : 'low';
    setTierOverride(nextTier);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className="text-muted hover:text-light focus-visible:outline-2 focus-visible:outline-[var(--accent)] cursor-pointer text-t-xs underline decoration-muted/40 underline-offset-4 transition-colors font-mono"
    >
      {label}
    </button>
  );
}
