import { GameTrigger } from './GameTrigger';

type GameMountProps = {
  game: 'pong' | 'pixel-quest';
};

export function GameMount({ game }: GameMountProps) {
  const gameTitle = game === 'pong' ? 'PONG' : 'PIXEL QUEST';
  const gameButtonText =
    game === 'pong'
      ? 'Play Pong — 7 points wins. Enter to start.'
      : 'Play Pixel Quest — WASD / Arrows to move, E to talk. Enter to start.';

  const containerId = `game-mount-${game}`;

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
        <span>{gameTitle} — FIXED TIMESTEP LOOP (60 HZ)</span>
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
          >
            {gameButtonText}
          </button>
        </div>
      </div>

      {/* Touch / low-tier fallback notice for Pixel Quest */}
      {game === 'pixel-quest' && (
        <div
          id={`${containerId}-touch-fallback`}
          style={{ display: 'none' }}
          className="p-4 bg-strata"
        >
          <img
            src="/video/pixel-quest-poster.png"
            alt="Pixel Quest gameplay poster frame"
            className="w-full aspect-[16/10] bg-field border border-hairline rounded block object-cover"
          />
          <p className="mt-3 font-mono text-t-xs text-muted">
            Not playable on touch — a WASD room needs a d-pad, and an on-screen d-pad at 390 px is worse than nothing. Gameplay recording pending.
          </p>
          <p className="mt-2 font-mono text-t-xs text-muted border-t border-hairline pt-2">
            Mechanics: Top-down 2D RPG room in Canvas 2D. Axis-separated AABB collision (X/Y independent), diagonal velocity normalisation (× 0.7071), 3 wall obstacles, NPC proximity (20 px) with dynamic multiline word-wrap dialogue, and 4 bobbing skill orbs (Docker, React, Payments, Game Dev).
          </p>
        </div>
      )}

      {/* Client trigger for game loading */}
      <GameTrigger game={game} />
    </div>
  );
}
