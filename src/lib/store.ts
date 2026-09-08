'use client';

import { useSyncExternalStore } from 'react';
import { detectTier, type Tier } from './tier';
import { subscribeMotion } from './motion-pref';

export type StoreState = {
  t: number;
  tier: Tier;
  panel: string | null;
};

const SERVER_SNAPSHOT: StoreState = {
  t: 0,
  tier: 'low',
  panel: null,
};

let currentSnapshot: StoreState = SERVER_SNAPSHOT;
const listeners = new Set<() => void>();
let isListening = false;

function notify(): void {
  listeners.forEach((cb) => cb());
}

function computeT(): number {
  if (typeof window === 'undefined') return 0;
  const doc = document.documentElement;
  const maxScroll = doc.scrollHeight - window.innerHeight;
  if (maxScroll <= 0) return 0;
  const rawT = window.scrollY / maxScroll;
  return rawT < 0 ? 0 : rawT > 1 ? 1 : rawT;
}

function updateState(partial: Partial<StoreState>): void {
  const nextT = partial.t ?? currentSnapshot.t;
  const nextTier = partial.tier ?? currentSnapshot.tier;
  const nextPanel = 'panel' in partial ? partial.panel! : currentSnapshot.panel;

  if (nextT === currentSnapshot.t && nextTier === currentSnapshot.tier && nextPanel === currentSnapshot.panel) return;
  currentSnapshot = { t: nextT, tier: nextTier, panel: nextPanel };
  notify();
}

function handleScroll(): void {
  const nextT = computeT();
  if (nextT !== currentSnapshot.t) {
    updateState({ t: nextT });
  }
}

function syncClientState(): void {
  if (typeof window === 'undefined') return;
  const nextT = computeT();
  const nextTier = detectTier();
  updateState({ t: nextT, tier: nextTier });
}

function ensureListening(): void {
  if (typeof window === 'undefined' || isListening) return;
  isListening = true;

  window.addEventListener('scroll', handleScroll, { passive: true });
  window.addEventListener('resize', handleScroll, { passive: true });

  subscribeMotion(() => {
    if (typeof window !== 'undefined') {
      updateState({ tier: detectTier() });
    }
  });

  syncClientState();
}

export function subscribe(callback: () => void): () => void {
  if (typeof window === 'undefined') {
    return () => {};
  }
  ensureListening();
  listeners.add(callback);
  return () => {
    listeners.delete(callback);
  };
}

export function getSnapshot(): StoreState {
  return currentSnapshot;
}

export function getServerSnapshot(): StoreState {
  return SERVER_SNAPSHOT;
}

export function setPanel(panel: string | null): void {
  updateState({ panel });
}

export function setScrollT(t: number): void {
  updateState({ t });
}

export function setTier(tier: Tier): void {
  updateState({ tier });
}

export function useStore(): StoreState {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export function useStoreSelector<T>(selector: (state: StoreState) => T): T {
  return useSyncExternalStore(
    subscribe,
    () => selector(getSnapshot()),
    () => selector(getServerSnapshot())
  );
}

export function useScrollT(): number {
  return useStoreSelector((s) => s.t);
}

export function useTier(): Tier {
  return useStoreSelector((s) => s.tier);
}

export function useOpenPanel(): string | null {
  return useStoreSelector((s) => s.panel);
}
