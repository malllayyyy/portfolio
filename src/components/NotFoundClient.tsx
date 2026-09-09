'use client';

import Link from 'next/link';
import { useSyncExternalStore } from 'react';
import { getMotion, getServerMotion, subscribeMotion } from '@/lib/motion-pref';

export function NotFoundMessage() {
  const motion = useSyncExternalStore(subscribeMotion, getMotion, getServerMotion);
  const prefersReduced = motion === 'off';

  return (
    <>
      <p className="mt-3 font-display text-t-base text-muted">
        {prefersReduced
          ? 'Nothing is here. Playing Pong below is optional and never auto-starts.'
          : 'Nothing is here. The engine from −120 m is, though.'}
      </p>
      <p className="mt-6 font-mono text-t-sm">
        <Link
          href="/"
          className={`underline decoration-[var(--accent)] ${
            prefersReduced ? 'text-[var(--accent)] font-semibold' : 'text-light'
          }`}
        >
          Return to Surface
        </Link>
      </p>
    </>
  );
}

export function NotFoundExitLink() {
  const motion = useSyncExternalStore(subscribeMotion, getMotion, getServerMotion);
  const prefersReduced = motion === 'off';

  return (
    <p className="mt-6 font-mono text-t-sm">
      <Link
        href="/"
        className={`underline decoration-[var(--accent)] ${
          prefersReduced ? 'text-[var(--accent)] font-semibold' : 'text-light'
        }`}
      >
        Return to Surface
      </Link>
    </p>
  );
}
