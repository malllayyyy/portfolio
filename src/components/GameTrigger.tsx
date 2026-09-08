'use client';

import { useEffect } from 'react';

export function GameTrigger({ game }: { game: 'pong' | 'pixel-quest' }) {
  useEffect(() => {
    const id = `game-mount-${game}`;
    const btn = document.getElementById(`${id}-btn`);
    const canvas = document.getElementById(`${id}-canvas`) as HTMLCanvasElement | null;
    const isTouch =
      typeof window !== 'undefined' &&
      (window.matchMedia('(pointer: coarse)').matches || 'ontouchstart' in window);
    const isLow = document.documentElement.dataset.tier === 'low';

    if (game === 'pixel-quest' && (isTouch || isLow)) {
      const tf = document.getElementById(`${id}-touch-fallback`);
      const main = document.getElementById(`${id}-main`);
      if (tf) tf.style.display = 'block';
      if (main) main.style.display = 'none';
      return;
    }

    const start = () => {
      if (canvas) {
        import('./PlayEngine').then((m) => m.startInteractiveGame(game, canvas));
      }
    };

    btn?.addEventListener('click', start);
    canvas?.addEventListener('click', start);
    return () => {
      btn?.removeEventListener('click', start);
      canvas?.removeEventListener('click', start);
    };
  }, [game]);

  return null;
}
