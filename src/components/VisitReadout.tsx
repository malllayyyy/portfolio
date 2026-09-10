'use client';

import { useEffect, useState, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';
import {
  getVisitSnapshot,
  getVisitServerSnapshot,
  subscribeVisit,
  refreshVisitSnapshot,
  type MetricRow,
} from '@/lib/visit';
import { getMotion } from '@/lib/motion-pref';

export function VisitReadout() {
  const snapshot = useSyncExternalStore(
    subscribeVisit,
    getVisitSnapshot,
    getVisitServerSnapshot
  );

  const [containerEl, setContainerEl] = useState<HTMLElement | null>(null);

  useEffect(() => {
    const el = document.getElementById('visit-telemetry-root');
    if (el) {
      el.innerHTML = ''; // clear static fallback
      setContainerEl(el);
    }
  }, []);

  if (!containerEl) return null;

  const isReducedMotion = getMotion() === 'off';

  return createPortal(
    <div className="mt-8 border-t border-hairline pt-6">
      <h4 className="font-mono text-t-xs text-muted m-0 uppercase tracking-wider">
        This Visit Telemetry · Live Browser Measurements
      </h4>
      <dl className="mt-4 space-y-3 p-0 m-0 font-mono text-t-xs">
        {snapshot.rows.map((row: MetricRow) => (
          <div
            key={row.label}
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-hairline/40 pb-2"
          >
            <dt className="text-muted shrink-0 w-36 uppercase tracking-wider">{row.label}</dt>
            <dd
              className={`font-semibold shrink-0 sm:text-right ${
                row.dark ? 'text-muted font-normal italic' : 'text-light'
              }`}
            >
              {row.value}
            </dd>
            <dd className="text-muted truncate text-right text-t-xs">{row.source}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-4 font-display text-t-xs text-muted italic m-0">
        Every number above was measured in your browser on this page load.
      </p>
      {isReducedMotion && (
        <div className="mt-4">
          <button
            type="button"
            onClick={refreshVisitSnapshot}
            className="font-mono text-t-xs text-accent border border-hairline hover:border-accent/40 bg-surface px-3 py-1.5 cursor-pointer"
          >
            Re-read
          </button>
        </div>
      )}
    </div>,
    containerEl
  );
}
