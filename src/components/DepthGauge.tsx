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
  if (roundedY > -120) return STOPS[1];
  if (roundedY > -260) return STOPS[2];
  return STOPS[3];
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

  // Imperative DOM update for readout when integer meter changes
  useEffect(() => {
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
          scrollToT(tOfDepth(-120));
          break;
        case '4':
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
      className="fixed left-6 top-1/2 -translate-y-1/2 z-40 hidden lg:flex flex-col items-center w-12 gap-6 pointer-events-auto"
    >
      <div
        aria-hidden="true"
        className="font-mono text-t-xs text-muted select-none whitespace-nowrap [writing-mode:vertical-lr] rotate-180 flex items-center justify-center tracking-wider"
      >
        <span ref={readoutRef}>{formatDepthReadout(initialY)}</span>
      </div>

      <div className="relative flex flex-col items-center gap-4 py-2">
        <div className="absolute top-0 bottom-0 w-[1px] bg-hairline -z-10" />

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
              className={`relative group flex items-center justify-center w-6 h-6 rounded-full cursor-pointer transition-colors outline-[#8FD3FF] focus:outline-[#8FD3FF] focus-visible:outline-[#8FD3FF] focus:outline-2 focus-visible:outline-2 focus:outline-offset-[3px] focus-visible:outline-offset-[3px] ${
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

              <span className="absolute left-full ml-3 px-2 py-1 bg-strata border border-hairline rounded font-mono text-t-xs text-light whitespace-nowrap opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity pointer-events-none shadow-md">
                {layer.name} ({formattedDatum})
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}