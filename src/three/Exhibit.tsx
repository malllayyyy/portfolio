'use client';

import React, { useCallback, useEffect, useRef } from 'react';
import { useFrame, type ThreeEvent } from '@react-three/fiber';
import type { Group, MeshPhysicalMaterial, MeshStandardMaterial } from 'three';
import {
  getExhibitSnapshot,
  openExhibit,
  setExhibitState,
  type ExhibitSlug,
} from './exhibit-state';

// Re-exported so existing `@/three/Exhibit` importers keep working. The DOM-side
// state, hooks and proxy nav now live in `./exhibit-state`, which has no
// `@react-three/fiber` dependency — see that file's header for why.
export {
  getExhibitSnapshot,
  subscribeExhibit,
  setExhibitState,
  useActiveExhibit,
  scrollToExhibitDepth,
  openExhibit,
  ExhibitProxyNav,
} from './exhibit-state';
export type {
  ExhibitSlug,
  ExhibitState,
  ExhibitProxyNavProps,
  ExhibitNavItem,
} from './exhibit-state';

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
    const snap = getExhibitSnapshot();

    if (inRange) {
      if (
        snap.activeSlug !== slug ||
        Math.abs(snap.activeDistance - dist) > 0.1
      ) {
        setExhibitState({ activeSlug: slug, activeDistance: dist });
        onCardSignalRef.current?.(slug, true);
      }
    } else if (snap.activeSlug === slug) {
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
