'use client';
import { useEffect } from 'react';
import { GameTrigger } from './GameTrigger';

type GameMountProps = {
  game: 'pong';
};

export function GameMount({ game }: GameMountProps) {
  const gameTitle = 'PONG';
  const gameButtonText = 'Play Pong — 7 points wins. Enter to start.';

  const containerId = `game-mount-${game}`;

  const handleStart = () => {
    const canvas = document.getElementById(`${containerId}-canvas`) as HTMLCanvasElement | null;
    if (canvas) {
      import('@/components/PlayEngine').then((m) => m.startInteractiveGame(game, canvas));
    }
  };

  useEffect(() => {
    const container = document.getElementById(containerId);
    if (!container) return;
    const onWheel = (e: WheelEvent) => {
      const canvas = document.getElementById(`${containerId}-canvas`);
      if (canvas?.getAttribute('data-captured') === 'true') {
        e.preventDefault();
      }
    };
    container.addEventListener('wheel', onWheel, { passive: false });
    return () => {
      container.removeEventListener('wheel', onWheel);
    };
  }, [containerId]);

  return (
    <div
      id={containerId}
      data-game-container={game}
      className="relative my-6 border border-hairline bg-strata rounded overflow-hidden"
    >
      {/* Live region for accessibility announcements (§ 5.3) */}
      <div id={`${containerId}-aria`} className="sr-only" aria-live="polite" />

      {/* Control bar */}
      <div className="flex items-center justify-between border-b border-hairline bg-field px-4 py-2 text-t-xs text-muted font-mono">
        <span>{gameTitle}</span>
        <button
          id={`${containerId}-exit`}
          type="button"
          tabIndex={-1}
          style={{ display: 'none' }}
          className="px-2 py-1 border border-hairline bg-strata text-light hover:border-muted text-t-xs font-mono rounded cursor-pointer"
        >
          Exit (Esc)
        </button>
      </div>

      {/* Canvas container */}
      <div id={`${containerId}-main`} className="relative aspect-[16/10] w-full bg-field flex items-center justify-center">
        <canvas
          id={`${containerId}-canvas`}
          data-game={game}
          data-captured="false"
          tabIndex={-1}
          aria-label={`${gameTitle} game canvas. Press Enter to start playing.`}
          className="w-full h-full block cursor-pointer focus:outline-none"
          onClick={handleStart}
        />

        {/* Uncaptured overlay */}
        <div
          id={`${containerId}-overlay`}
          className="absolute inset-0 bg-field/80 flex flex-col items-center justify-center p-4 text-center"
        >
          <button
            id={`${containerId}-btn`}
            type="button"
            className="border border-hairline bg-strata hover:border-surface-accent px-4 py-2 font-display text-t-sm text-light rounded cursor-pointer focus-visible:outline-2 focus-visible:outline-surface-accent"
            onClick={handleStart}
          >
            {gameButtonText}
          </button>
        </div>
      </div>

      {/* Client trigger for game loading */}
      <GameTrigger game={game} />
    </div>
  );
}
