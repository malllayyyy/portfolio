'use client';

/**
 * DOM-side exhibit state: the external store, the deep-link helpers and the
 * focusable proxy nav. **Nothing in this module imports `@react-three/fiber` or
 * `three`**, so `src/app/page.tsx` can consume it without pulling the 3D graph
 * into the initial route bundle. The R3F `<Exhibit>` mesh wrapper lives in
 * `./Exhibit`, which is only reachable through the dynamically-imported
 * `@/three` chunk.
 */

import { useCallback, useSyncExternalStore } from 'react';
import { tOfDepth } from './depth';
import { getMotion } from '@/lib/motion-pref';
import { setPanel } from '@/lib/store';

export type ExhibitSlug =
  | 'deployment-platform'
  | 'proacademys'
  | 'gamezone'
  | 'pong'
  | 'pixel-quest'
  | 'switchboard';

export interface ExhibitState {
  /** The slug of the exhibit currently active (within 6m camera range or focused) */
  activeSlug: ExhibitSlug | null;
  /** Distance in metres from camera to active exhibit */
  activeDistance: number;
}

// Module-level external store for exhibit state
let currentExhibitState: ExhibitState = {
  activeSlug: null,
  activeDistance: Infinity,
};
const exhibitListeners = new Set<() => void>();

export function getExhibitSnapshot(): ExhibitState {
  return currentExhibitState;
}

export function subscribeExhibit(callback: () => void): () => void {
  exhibitListeners.add(callback);
  return () => {
    exhibitListeners.delete(callback);
  };
}

export function setExhibitState(next: Partial<ExhibitState>): void {
  currentExhibitState = { ...currentExhibitState, ...next };
  exhibitListeners.forEach((cb) => cb());
}

/**
 * Hook to consume active exhibit state across components (cards, panels, HUD).
 */
export function useActiveExhibit(): ExhibitState {
  return useSyncExternalStore(
    subscribeExhibit,
    getExhibitSnapshot,
    () => ({ activeSlug: null, activeDistance: Infinity })
  );
}

/**
 * Scroll document to exhibit depth using tOfDepth.
 */
export function scrollToExhibitDepth(y: number): void {
  if (typeof window === 'undefined') return;
  const targetT = tOfDepth(y);
  const scrollHeight = document.documentElement.scrollHeight;
  const innerHeight = window.innerHeight;
  const S = Math.max(0, scrollHeight - innerHeight);
  const prefersReducedMotion = getMotion() === 'off';

  window.scrollTo({
    top: targetT * S,
    behavior: prefersReducedMotion ? 'auto' : 'smooth',
  });
}

/**
 * Open exhibit panel and update browser route.
 */
export function openExhibit(slug: ExhibitSlug): void {
  setPanel(slug);
  if (typeof window !== 'undefined') {
    window.history.pushState(null, '', `/project/${slug}`);
  }
}

function formatDepthReadout(y: number): string {
  const absY = Math.abs(Math.round(y));
  const padY = String(absY).padStart(3, '0');
  return `−${padY} m`;
}

/** Slim projection of a project — the only fields the proxy nav needs. Passed
 *  in from the server component so the client bundle never pulls the full
 *  `PROJECTS` module (decision prose, evidence, scale tables) just to render a
 *  list of depth + title. `PROJECTS` stays the single source. */
export type ExhibitNavItem = { slug: ExhibitSlug; title: string; depth: number };

export interface ExhibitProxyNavProps {
  /** Exhibits in scroll order, `{ slug, title, depth }` from `PROJECTS`. */
  exhibits: ExhibitNavItem[];
  /** Optional callback when an exhibit is selected via keyboard focus or click */
  onSelectExhibit?: (slug: ExhibitSlug) => void;
  /** Optional extra CSS class name for container */
  className?: string;
}

/**
 * § 4.1, § 9.1 — Visually-hidden-but-focusable DOM proxy list in SCROLL ORDER.
 * Keyboard path:
 * 1. Every exhibit gets a focusable <button> in depth order.
 * 2. Focus scrolls document to exhibit's t via tOfDepth.
 * 3. Enter opens the exhibit.
 * Critical § 9.1 rule: clip/offset techniques — NEVER display: none, NEVER visibility: hidden, NEVER aria-hidden.
 */
export function ExhibitProxyNav({ exhibits, onSelectExhibit, className = '' }: ExhibitProxyNavProps) {
  const handleFocus = useCallback((depth: number, slug: ExhibitSlug) => {
    scrollToExhibitDepth(depth);
    setExhibitState({ activeSlug: slug, activeDistance: 0 });
  }, []);

  const handleClick = useCallback(
    (slug: ExhibitSlug) => {
      openExhibit(slug);
      onSelectExhibit?.(slug);
    },
    [onSelectExhibit]
  );

  return (
    <nav
      aria-label="Exhibits navigation"
      className={`sr-only focus-within:not-sr-only focus-within:fixed focus-within:top-4 focus-within:left-4 focus-within:z-50 focus-within:p-4 focus-within:bg-strata focus-within:border focus-within:border-hairline focus-within:rounded focus-within:outline-2 focus-within:outline-[#8FD3FF] ${className}`}
    >
      <h2 className="font-mono text-t-xs text-muted mb-2 uppercase tracking-wider">
        Exhibits (Scroll Order)
      </h2>
      <ol className="flex flex-col gap-1.5 m-0 p-0 list-none">
        {exhibits.map((project) => (
          <li key={project.slug}>
            <button
              type="button"
              className="w-full text-left font-mono text-t-sm px-3 py-1.5 rounded text-muted hover:text-light focus:text-accent focus:bg-field focus:outline-none focus:ring-1 focus:ring-accent transition-colors"
              onFocus={() => handleFocus(project.depth, project.slug)}
              onClick={() => handleClick(project.slug)}
            >
              <span className="text-accent font-semibold mr-3 font-mono">
                {formatDepthReadout(project.depth)}
              </span>
              <span className="text-light font-medium">{project.title}</span>
            </button>
          </li>
        ))}
      </ol>
    </nav>
  );
}
