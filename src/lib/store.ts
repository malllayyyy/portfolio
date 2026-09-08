'use client';

import { useSyncExternalStore } from 'react';
import { detectTier, type Tier } from './tier';
import { subscribeMotion } from './motion-pref';

declare global {
  interface Window {
    __store?: {
      getSnapshot: () => StoreState;
    };
  }
}

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
  let nextT = partial.t ?? currentSnapshot.t;
  const nextTier = partial.tier ?? currentSnapshot.tier;
  const nextPanel = 'panel' in partial ? partial.panel! : currentSnapshot.panel;

  if (nextT < 0) nextT = 0;
  if (nextT > 1) nextT = 1;

  const tChanged =
    nextT !== currentSnapshot.t &&
    (Math.abs(nextT - currentSnapshot.t) >= 0.0001 || nextT === 0 || nextT === 1);

  if (!tChanged && nextTier === currentSnapshot.tier && nextPanel === currentSnapshot.panel) return;
  currentSnapshot = { t: nextT, tier: nextTier, panel: nextPanel };
  notify();
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
  if (typeof window !== 'undefined') {
    window.__store = { getSnapshot };
  }

  subscribeMotion(() => {
    if (typeof window !== 'undefined') {
      updateState({ tier: detectTier() });
    }
  });
  syncClientState();
}

if (typeof window !== 'undefined') {
  ensureListening();
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
