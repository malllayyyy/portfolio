'use client';

import React, { useCallback, useEffect, useRef, useSyncExternalStore } from 'react';
import { useFrame, type ThreeEvent } from '@react-three/fiber';
import type { Group, MeshPhysicalMaterial, MeshStandardMaterial } from 'three';
import { tOfDepth } from './depth';
import { getMotion } from '@/lib/motion-pref';
import { setPanel } from '@/lib/store';
import { PROJECTS } from '@/content/projects';

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

export interface ExhibitProps {
  /** Project slug identifying this exhibit */
  slug: ExhibitSlug;
  /** Y depth coordinate in world space (metres) */
  depth: number;
  /** Position override in 3D world space [x, y, z] */
  position?: [number, number, number];
  /** Optional target material ref for emissive hover highlight */
  materialRef?: React.RefObject<MeshStandardMaterial | MeshPhysicalMaterial | null>;
  /** Callback when exhibit range proximity changes (|camera.y - exhibit.y| < 6m) */
  onCardSignal?: (slug: ExhibitSlug, active: boolean) => void;
  /** Callback when exhibit is activated/opened */
  onOpen?: (slug: ExhibitSlug) => void;
  /** 3D mesh / children to render inside the exhibit group */
  children?: React.ReactNode;
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

/**
 * Helper to update emissive intensity on a target material or group without allocation.
 */
function updateEmissiveIntensity(
  target: MeshStandardMaterial | MeshPhysicalMaterial | Group | null,
  intensity: number
): void {
  if (!target) return;
  if ('emissiveIntensity' in target) {
    (target as MeshStandardMaterial).emissiveIntensity = intensity * 0.4;
  } else if ('isGroup' in target || 'traverse' in target) {
    (target as Group).traverse((child) => {
      if ('material' in child && child.material) {
        const mat = child.material as MeshStandardMaterial;
        if ('emissiveIntensity' in mat) {
          mat.emissiveIntensity = intensity * 0.4;
        }
      }
    });
  }
}

/**
 * § 4.1, § 9.1 — Exhibit 3D mesh wrapper component.
 * Handles:
 * 1. Range check (|camera.y - exhibit.y| < 6 m) -> signals active card (does NOT auto-open).
 * 2. Mesh click -> raycasts on pointerup (NOT pointerdown) to avoid drag selection.
 * 3. Pointer hover emissive lerp over 120 ms (KEPT under reduced motion).
 * Zero allocation per frame in useFrame.
 */
export function Exhibit({
  slug,
  depth,
  position = [0, depth, 0],
  materialRef,
  onCardSignal,
  onOpen,
  children,
}: ExhibitProps) {
  const groupRef = useRef<Group | null>(null);
  const isHoveredRef = useRef(false);
  const hoverFactorRef = useRef(0);
  const pointerDownRef = useRef({ x: 0, y: 0, time: 0 });

  const onCardSignalRef = useRef(onCardSignal);
  const onOpenRef = useRef(onOpen);

  useEffect(() => {
    onCardSignalRef.current = onCardSignal;
    onOpenRef.current = onOpen;
  }, [onCardSignal, onOpen]);

  useFrame((state, delta) => {
    // 1. Pointer hover emissive lerp over 120 ms (kept under reduced motion)
    const targetHover = isHoveredRef.current ? 1 : 0;
    const currentHover = hoverFactorRef.current;

    if (currentHover !== targetHover) {
      const step = delta / 0.120;
      let nextHover = currentHover;
      if (targetHover > currentHover) {
        nextHover = Math.min(targetHover, currentHover + step);
      } else {
        nextHover = Math.max(targetHover, currentHover - step);
      }
      hoverFactorRef.current = nextHover;

      if (materialRef?.current) {
        updateEmissiveIntensity(materialRef.current, nextHover);
      } else if (groupRef.current) {
        updateEmissiveIntensity(groupRef.current, nextHover);
      }
    }

    // 2. Proximity range check (|camera.y - exhibit.y| < 6 m)
    const cameraY = state.camera.position.y;
    const dist = Math.abs(cameraY - depth);
    const inRange = dist < 6.0;

    if (inRange) {
      if (
        currentExhibitState.activeSlug !== slug ||
        Math.abs(currentExhibitState.activeDistance - dist) > 0.1
      ) {
        setExhibitState({ activeSlug: slug, activeDistance: dist });
        onCardSignalRef.current?.(slug, true);
      }
    } else if (currentExhibitState.activeSlug === slug) {
      setExhibitState({ activeSlug: null, activeDistance: Infinity });
      onCardSignalRef.current?.(slug, false);
    }
  });

  const handlePointerDown = useCallback((e: ThreeEvent<PointerEvent>) => {
    pointerDownRef.current.x = e.clientX;
    pointerDownRef.current.y = e.clientY;
    pointerDownRef.current.time = performance.now();
  }, []);

  const handlePointerUp = useCallback(
    (e: ThreeEvent<PointerEvent>) => {
      // Raycast on pointerup only — check distance to ensure it was a click, not a scrollbar drag
      const dx = e.clientX - pointerDownRef.current.x;
      const dy = e.clientY - pointerDownRef.current.y;
      const dist = Math.hypot(dx, dy);

      if (dist < 6) {
        e.stopPropagation();
        if (onOpenRef.current) {
          onOpenRef.current(slug);
        } else {
          openExhibit(slug);
        }
      }
    },
    [slug]
  );

  const handlePointerOver = useCallback((e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    isHoveredRef.current = true;
    if (typeof document !== 'undefined') {
      document.body.style.cursor = 'pointer';
    }
  }, []);

  const handlePointerOut = useCallback(() => {
    isHoveredRef.current = false;
    if (typeof document !== 'undefined') {
      document.body.style.cursor = 'auto';
    }
  }, []);

  return (
    <group
      ref={groupRef}
      position={position}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
    >
      {children}
    </group>
  );
}

function formatDepthReadout(y: number): string {
  const absY = Math.abs(Math.round(y));
  const padY = String(absY).padStart(3, '0');
  return `−${padY} m`;
}

export interface ExhibitProxyNavProps {
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
export function ExhibitProxyNav({ onSelectExhibit, className = '' }: ExhibitProxyNavProps) {
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
      className={`sr-only focus-within:not-sr-only focus-within:fixed focus-within:top-4 focus-within:left-4 focus-within:z-50 focus-within:p-4 focus-within:bg-strata focus-within:border focus-within:border-hairline focus-within:rounded focus-within:shadow-xl ${className}`}
    >
      <h2 className="font-mono text-t-xs text-muted mb-2 uppercase tracking-wider">
        Exhibits (Scroll Order)
      </h2>
      <ol className="flex flex-col gap-1.5 m-0 p-0 list-none">
        {PROJECTS.map((project) => (
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
