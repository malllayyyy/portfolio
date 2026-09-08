'use client';

import { useEffect } from 'react';

export function GameTrigger({ game }: { game: 'pong' }) {
  useEffect(() => {
    const id = `game-mount-${game}`;
    const btn = document.getElementById(`${id}-btn`);
    const canvas = document.getElementById(`${id}-canvas`) as HTMLCanvasElement | null;

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
