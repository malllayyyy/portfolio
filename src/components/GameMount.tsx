'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { getMotion, subscribeMotion, type MotionPref } from '@/lib/motion-pref';
import { detectTier } from '@/lib/tier';
import type { PongInstance } from '@/engine/pong';
import type { PixelQuestInstance } from '@/engine/pixel-quest';

type GameMountProps = {
  game: 'pong' | 'pixel-quest';
};

export function GameMount({ game }: GameMountProps) {
  const [isCaptured, setIsCaptured] = useState(false);
  const [announcement, setAnnouncement] = useState('');
  const [motion, setMotion] = useState<MotionPref>('on');
  const [isTouchOrLow, setIsTouchOrLow] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const triggerBtnRef = useRef<HTMLButtonElement>(null);

  const pongRef = useRef<PongInstance | null>(null);
  const questRef = useRef<PixelQuestInstance | null>(null);
  const keyStateRef = useRef({ up: false, down: false, left: false, right: false });

  // Motion & Tier subscription
  useEffect(() => {
    setMotion(getMotion());
    const isTouch =
      typeof window !== 'undefined' &&
      (window.matchMedia('(pointer: coarse)').matches || 'ontouchstart' in window);
    const isLow = detectTier() === 'low';
    setIsTouchOrLow(isTouch || isLow);

    return subscribeMotion(() => setMotion(getMotion()));
  }, []);

  // Cleanup engines on unmount
  useEffect(() => {
    return () => {
      pongRef.current?.destroy();
      pongRef.current = null;
      questRef.current?.destroy();
      questRef.current = null;
    };
  }, []);

  const release = useCallback(
    ({ focusTrigger = false }: { focusTrigger?: boolean } = {}) => {
      setIsCaptured(false);
      setAnnouncement(
        `${game === 'pong' ? 'Pong' : 'Pixel Quest'} exited. Controls returned to page.`
      );

      if (game === 'pong') {
        pongRef.current?.stop();
        pongRef.current?.setKeys(false, false);
      } else {
        questRef.current?.stop();
        keyStateRef.current = { up: false, down: false, left: false, right: false };
        questRef.current?.setKeys(false, false, false, false);
      }

      if (typeof document !== 'undefined') {
        document.body.style.overflow = '';
      }

      if (focusTrigger) {
        setTimeout(() => {
          triggerBtnRef.current?.focus();
        }, 0);
      }
    },
    [game]
  );

  const capture = useCallback(() => {
    setIsCaptured(true);
    if (game === 'pong') {
      setAnnouncement('Pong active. Arrow keys to move. Escape to exit.');
      if (pongRef.current) {
        pongRef.current.start();
      } else if (canvasRef.current) {
        import('@/engine/pong').then(({ initPong }) => {
          if (!canvasRef.current) return;
          const pong = initPong(canvasRef.current);
          pongRef.current = pong;
          pong.start();
        });
      }
    } else if (game === 'pixel-quest') {
      setAnnouncement('Pixel Quest active. WASD or Arrow keys to move. E to talk. Escape to exit.');
      if (questRef.current) {
        questRef.current.start();
      } else if (canvasRef.current) {
        import('@/engine/pixel-quest').then(({ initPixelQuest }) => {
          if (!canvasRef.current) return;
          const quest = initPixelQuest(canvasRef.current);
          questRef.current = quest;
          quest.start();
        });
      }
    }

    if (typeof document !== 'undefined') {
      document.body.style.overflow = 'hidden';
    }

    setTimeout(() => {
      canvasRef.current?.focus();
    }, 0);
  }, [game]);

  // Global listeners while captured (Escape, Tab passthrough, outside pointerdown, visibilitychange)
  useEffect(() => {
    if (!isCaptured) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        release({ focusTrigger: true });
        return;
      }

      if (e.key === 'Tab') {
        // Tab releases and performs normal focus move — do NOT preventDefault
        release({ focusTrigger: false });
        return;
      }

      const k = e.key;
      const code = e.code;

      if (game === 'pong') {
        const isGameKey =
          ['ArrowUp', 'ArrowDown', 'w', 'W', 's', 'S'].includes(k) ||
          ['ArrowUp', 'ArrowDown', 'KeyW', 'KeyS'].includes(code) ||
          k === ' ' ||
          code === 'Space' ||
          k === 'Enter';

        if (isGameKey) {
          e.preventDefault();
          if (['ArrowUp', 'w', 'W'].includes(k) || ['ArrowUp', 'KeyW'].includes(code)) {
            pongRef.current?.setKeys(true, false);
          } else if (['ArrowDown', 's', 'S'].includes(k) || ['ArrowDown', 'KeyS'].includes(code)) {
            pongRef.current?.setKeys(false, true);
          } else if (k === ' ' || code === 'Space' || k === 'Enter') {
            pongRef.current?.handleRestart();
          }
        }
      } else if (game === 'pixel-quest') {
        const isGameKey =
          ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'w', 'W', 's', 'S', 'a', 'A', 'd', 'D', 'e', 'E'].includes(
            k
          ) ||
          ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'KeyW', 'KeyS', 'KeyA', 'KeyD', 'KeyE'].includes(
            code
          ) ||
          k === ' ' ||
          code === 'Space';

        if (isGameKey) {
          e.preventDefault();
          const state = keyStateRef.current;
          if (['ArrowUp', 'w', 'W'].includes(k) || ['ArrowUp', 'KeyW'].includes(code)) state.up = true;
          if (['ArrowDown', 's', 'S'].includes(k) || ['ArrowDown', 'KeyS'].includes(code)) state.down = true;
          if (['ArrowLeft', 'a', 'A'].includes(k) || ['ArrowLeft', 'KeyA'].includes(code)) state.left = true;
          if (['ArrowRight', 'd', 'D'].includes(k) || ['ArrowRight', 'KeyD'].includes(code)) state.right = true;

          questRef.current?.setKeys(state.up, state.down, state.left, state.right);

          if (['e', 'E'].includes(k) || code === 'KeyE' || k === ' ' || code === 'Space') {
            questRef.current?.handleInteract();
          }
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const k = e.key;
      const code = e.code;

      if (game === 'pong') {
        if (['ArrowUp', 'w', 'W'].includes(k) || ['ArrowUp', 'KeyW'].includes(code)) {
          pongRef.current?.setKeys(false, false);
        } else if (['ArrowDown', 's', 'S'].includes(k) || ['ArrowDown', 'KeyS'].includes(code)) {
          pongRef.current?.setKeys(false, false);
        }
      } else if (game === 'pixel-quest') {
        const state = keyStateRef.current;
        if (['ArrowUp', 'w', 'W'].includes(k) || ['ArrowUp', 'KeyW'].includes(code)) state.up = false;
        if (['ArrowDown', 's', 'S'].includes(k) || ['ArrowDown', 'KeyS'].includes(code)) state.down = false;
        if (['ArrowLeft', 'a', 'A'].includes(k) || ['ArrowLeft', 'KeyA'].includes(code)) state.left = false;
        if (['ArrowRight', 'd', 'D'].includes(k) || ['ArrowRight', 'KeyD'].includes(code)) state.right = false;

        questRef.current?.setKeys(state.up, state.down, state.left, state.right);
      }
    };

    const handlePointerDownOutside = (e: PointerEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        release({ focusTrigger: true });
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        release({ focusTrigger: false });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('pointerdown', handlePointerDownOutside);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('pointerdown', handlePointerDownOutside);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isCaptured, release, game]);

  if (game === 'pixel-quest' && isTouchOrLow) {
    return (
      <div className="relative my-6 border border-hairline bg-strata rounded overflow-hidden p-4">
        <video
          muted
          loop
          playsInline
          poster="/video/pixel-quest-poster.avif"
          preload="none"
          controls
          className="w-full aspect-[16/10] bg-field border border-hairline rounded block"
        >
          <source src="/video/pixel-quest.mp4" type="video/mp4" />
          <source src="/video/pixel-quest.webm" type="video/webm" />
        </video>
        <p className="mt-3 font-mono text-t-xs text-muted">
          Not playable on touch — a WASD room needs a d-pad, and an on-screen d-pad at 390 px is worse than nothing. Here is 6 seconds of real play.
        </p>
        <p className="mt-2 font-mono text-t-xs text-muted border-t border-hairline pt-2">
          Mechanics: Top-down 2D RPG room in Canvas 2D. Axis-separated AABB collision (X/Y independent), diagonal velocity normalisation (× 0.7071), 3 wall obstacles, NPC proximity (20 px) with dynamic multiline word-wrap dialogue, and 4 bobbing skill orbs (Docker, React, Payments, Game Dev).
        </p>
      </div>
    );
  }

  const gameTitle = game === 'pong' ? 'PONG' : 'PIXEL QUEST';
  const gameButtonText =
    game === 'pong'
      ? 'Play Pong — 7 points wins. Enter to start.'
      : 'Play Pixel Quest — WASD / Arrows to move, E to talk. Enter to start.';

  return (
    <div
      ref={containerRef}
      className="relative my-6 border border-hairline bg-strata rounded overflow-hidden"
    >
      {/* Live region for accessibility announcements (§ 5.3) */}
      <div className="sr-only" aria-live="polite">
        {announcement}
      </div>

      {/* Control bar */}
      <div className="flex items-center justify-between border-b border-hairline bg-field px-4 py-2 text-t-xs text-muted font-mono">
        <span>{gameTitle} — FIXED TIMESTEP LOOP (60 HZ)</span>
        {isCaptured && (
          <button
            type="button"
            onClick={() => release({ focusTrigger: true })}
            className="px-2 py-1 border border-hairline bg-strata text-light hover:border-muted text-t-xs font-mono rounded cursor-pointer"
          >
            Exit (Esc)
          </button>
        )}
      </div>

      {/* Canvas container */}
      <div className="relative aspect-[16/10] w-full bg-field flex items-center justify-center">
        <canvas
          ref={canvasRef}
          data-game={game}
          data-captured={isCaptured ? 'true' : 'false'}
          tabIndex={isCaptured ? 0 : -1}
          aria-label={`${gameTitle} game canvas. Press Enter to start playing.`}
          onBlur={() => release({ focusTrigger: false })}
          onClick={() => {
            if (!isCaptured) capture();
          }}
          className="w-full h-full block cursor-pointer focus:outline-none"
        />

        {/* Uncaptured overlay */}
        {!isCaptured && (
          <div className="absolute inset-0 bg-field/80 flex flex-col items-center justify-center p-4 text-center">
            {motion === 'off' && (
              <p className="mb-2 font-mono text-t-xs text-device-accent">
                Playing this starts an animation
              </p>
            )}
            <button
              ref={triggerBtnRef}
              type="button"
              onClick={capture}
              className="border border-hairline bg-strata hover:border-surface-accent px-4 py-2 font-display text-t-sm text-light rounded cursor-pointer focus-visible:outline-2 focus-visible:outline-surface-accent"
            >
              {gameButtonText}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
