'use client';

import { useRef, useEffect } from 'react';
import { useStoreSelector, subscribe, getSnapshot } from '@/lib/store';
import { depth, tOfDepth } from '@/three/depth';
import { LAYERS } from '@/content/layers';
import { getMotion } from '@/lib/motion-pref';
import type { Layer } from '@/content/types';

const STOPS = LAYERS.filter((l) => l.id !== 'bedrock');

function getLayer(y: number): Layer {
  const roundedY = Math.round(y);
  if (roundedY > -40) return STOPS[0];
  if (roundedY > -260) return STOPS[1];
  return STOPS[2];
}

function formatDepthReadout(y: number): string {
  const roundedY = Math.round(y);
  const layer = getLayer(y);
  if (roundedY >= 0) {
    return `0 m \u00b7 ${layer.name}`;
  }
  const absVal = Math.abs(roundedY);
  const padded = String(absVal).padStart(3, '0');
  return `\u2212${padded} m \u00b7 ${layer.name}`;
}

export function DepthGauge() {

  // Only re-render React component when active layer changes (0, -40, -120, -260 m)
  const activeLayerId = useStoreSelector((s) => getLayer(depth(s.t)).id);
  const activeLayer = STOPS.find((l) => l.id === activeLayerId) ?? STOPS[0];

  const readoutRef = useRef<HTMLSpanElement>(null);
  const readoutWrapRef = useRef<HTMLDivElement>(null);

  // Imperative DOM update for readout when integer meter changes.
  // `store.t` is only ever published by Rig.tsx's useFrame (single-subscription
  // invariant); with no 3D mounted (low tier) it never moves, so the readout would
  // freeze at its initial value and lie. Suppress it there instead of showing a
  // number the site cannot measure — the four jump buttons stay live regardless,
  // since they compute from scrollHeight directly.
  useEffect(() => {
    if (document.documentElement.dataset.tier === 'low') {
      if (readoutWrapRef.current) readoutWrapRef.current.style.display = 'none';
      return;
    }
    let lastMeter = Math.round(depth(getSnapshot().t));
    if (readoutRef.current) {
      readoutRef.current.textContent = formatDepthReadout(depth(getSnapshot().t));
    }
    return subscribe(() => {
      const y = depth(getSnapshot().t);
      const meter = Math.round(y);
      if (meter !== lastMeter) {
        lastMeter = meter;
        if (readoutRef.current) {
          readoutRef.current.textContent = formatDepthReadout(y);
        }
      }
    });
  }, []);

  // Keyboard navigation registered once
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.altKey || e.metaKey) return;

      const activeEl = document.activeElement;
      if (activeEl) {
        const tag = activeEl.tagName.toLowerCase();
        if (
          tag === 'input' ||
          tag === 'textarea' ||
          tag === 'select' ||
          activeEl.getAttribute('contenteditable') === 'true' ||
          activeEl.closest('[role="dialog"]')
        ) {
          return;
        }
      }

      const scrollHeight = document.documentElement.scrollHeight;
      const innerHeight = window.innerHeight;
      const S = Math.max(0, scrollHeight - innerHeight);
      if (S <= 0) return;

      const prefersReducedMotion = getMotion() === 'off';
      const behavior: ScrollBehavior = prefersReducedMotion ? 'auto' : 'smooth';

      const scrollToT = (targetT: number) => {
        window.scrollTo({
          top: targetT * S,
          behavior,
        });
      };

      const currentY = depth(getSnapshot().t);
      const scrollToY = (targetY: number) => {
        const clampedY = Math.max(-300, Math.min(0, targetY));
        const targetT = tOfDepth(clampedY);
        scrollToT(targetT);
      };

      switch (e.key) {
        case '1':
          e.preventDefault();
          scrollToT(tOfDepth(0));
          break;
        case '2':
          e.preventDefault();
          scrollToT(tOfDepth(-40));
          break;
        case '3':
          e.preventDefault();
          scrollToT(tOfDepth(-260));
          break;
        case 'Home':
          e.preventDefault();
          scrollToT(0);
          break;
        case 'End':
          e.preventDefault();
          scrollToT(1);
          break;
        case 'ArrowUp':
          e.preventDefault();
          scrollToY(currentY + 10);
          break;
        case 'ArrowDown':
          e.preventDefault();
          scrollToY(currentY - 10);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleClickDatum = (datumY: number) => {
    const scrollHeight = document.documentElement.scrollHeight;
    const innerHeight = window.innerHeight;
    const S = Math.max(0, scrollHeight - innerHeight);
    const targetT = tOfDepth(datumY);
    const prefersReducedMotion = getMotion() === 'off';
    window.scrollTo({
      top: targetT * S,
      behavior: prefersReducedMotion ? 'auto' : 'smooth',
    });
  };

  const initialY = depth(getSnapshot().t);

  return (
    <nav
      aria-label="Depth navigation"
      className="fixed inset-x-0 bottom-0 z-40 flex flex-row items-center justify-center gap-6 border-t border-hairline bg-field px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pointer-events-auto lg:inset-x-auto lg:bottom-auto lg:left-6 lg:top-1/2 lg:-translate-y-1/2 lg:flex-col lg:w-12 lg:gap-6 lg:border-t-0 lg:bg-transparent lg:px-0 lg:py-0"
    >
      <div
        ref={readoutWrapRef}
        aria-hidden="true"
        className="font-mono text-t-xs text-muted select-none whitespace-nowrap flex items-center justify-center tracking-wider lg:[writing-mode:vertical-lr] lg:rotate-180"
      >
        <span ref={readoutRef}>{formatDepthReadout(initialY)}</span>
      </div>

      <div className="relative flex flex-row items-center gap-4 px-2 lg:flex-col lg:py-2 lg:px-0">
        <div className="absolute inset-x-0 h-[1px] bg-hairline -z-10 lg:inset-x-auto lg:inset-y-0 lg:w-[1px] lg:h-auto" />

        {STOPS.map((layer) => {
          const isCurrent = activeLayer.id === layer.id;
          const formattedDatum =
            layer.datum === 0
              ? '0 m'
              : `\u2212${String(Math.abs(layer.datum)).padStart(3, '0')} m`;

          return (
            <button
              key={layer.id}
              type="button"
              onClick={() => handleClickDatum(layer.datum)}
              aria-label={`Jump to ${layer.name} (${formattedDatum})`}
              className={`relative group flex items-center justify-center w-11 h-11 lg:w-6 lg:h-6 rounded-full cursor-pointer transition-colors outline-[#8FD3FF] focus:outline-[#8FD3FF] focus-visible:outline-[#8FD3FF] focus:outline-2 focus-visible:outline-2 focus:outline-offset-[3px] focus-visible:outline-offset-[3px] ${
                isCurrent ? 'text-light' : 'text-muted hover:text-light'
              }`}
            >
              <span
                className={`block rounded-full transition-all duration-200 ${
                  isCurrent
                    ? 'w-3 h-3 bg-[var(--accent)] ring-2 ring-[var(--accent)]/30'
                    : 'w-2 h-2 bg-muted/40 group-hover:bg-muted'
                }`}
              />

              <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 lg:bottom-auto lg:left-full lg:top-1/2 lg:-translate-y-1/2 lg:translate-x-0 lg:ml-3 lg:mb-0 px-2 py-1 bg-strata border border-hairline rounded font-mono text-t-xs text-light whitespace-nowrap opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity pointer-events-none shadow-md">
                {layer.name} ({formattedDatum})
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}