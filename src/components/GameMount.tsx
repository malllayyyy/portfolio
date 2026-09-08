'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { getMotion, subscribeMotion, type MotionPref } from '@/lib/motion-pref';
import { initPong, type PongInstance } from '@/engine/pong';

type GameMountProps = {
  game: 'pong' | 'pixel-quest';
};

export function GameMount({ game }: GameMountProps) {
  const [isCaptured, setIsCaptured] = useState(false);
  const [announcement, setAnnouncement] = useState('');
  const [motion, setMotion] = useState<MotionPref>('on');

  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const triggerBtnRef = useRef<HTMLButtonElement>(null);
  const pongRef = useRef<PongInstance | null>(null);

  // Motion preference subscription
  useEffect(() => {
    setMotion(getMotion());
    return subscribeMotion(() => setMotion(getMotion()));
  }, []);

  // Initialize engine
  useEffect(() => {
    if (game === 'pong' && canvasRef.current) {
      const pong = initPong(canvasRef.current);
      pongRef.current = pong;
      return () => {
        pong.destroy();
        pongRef.current = null;
      };
    }
  }, [game]);

  const release = useCallback(({ focusTrigger = false }: { focusTrigger?: boolean } = {}) => {
    setIsCaptured(false);
    setAnnouncement('Pong exited. Controls returned to page.');
    pongRef.current?.stop();
    pongRef.current?.setKeys(false, false);
    if (typeof document !== 'undefined') {
      document.body.style.overflow = '';
    }

    if (focusTrigger) {
      setTimeout(() => {
        triggerBtnRef.current?.focus();
      }, 0);
    }
  }, []);

  const capture = useCallback(() => {
    setIsCaptured(true);
    setAnnouncement('Pong active. Arrow keys to move. Escape to exit.');
    pongRef.current?.start();
    if (typeof document !== 'undefined') {
      document.body.style.overflow = 'hidden';
    }

    setTimeout(() => {
      canvasRef.current?.focus();
    }, 0);
  }, []);

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

      const isGameKey =
        ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'KeyW', 'KeyA', 'KeyS', 'KeyD', 'w', 'W', 's', 'S'].includes(
          e.code
        ) ||
        ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'w', 'W', 's', 'S'].includes(e.key) ||
        e.key === ' ' ||
        e.code === 'Space';

      if (isGameKey) {
        e.preventDefault();
        if (['ArrowUp', 'KeyW', 'w', 'W'].includes(e.key) || ['ArrowUp', 'KeyW'].includes(e.code)) {
          pongRef.current?.setKeys(true, false);
        } else if (
          ['ArrowDown', 'KeyS', 's', 'S'].includes(e.key) ||
          ['ArrowDown', 'KeyS'].includes(e.code)
        ) {
          pongRef.current?.setKeys(false, true);
        } else if (e.key === ' ' || e.code === 'Space' || e.key === 'Enter') {
          pongRef.current?.handleRestart();
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (['ArrowUp', 'KeyW', 'w', 'W'].includes(e.key) || ['ArrowUp', 'KeyW'].includes(e.code)) {
        pongRef.current?.setKeys(false, false);
      } else if (
        ['ArrowDown', 'KeyS', 's', 'S'].includes(e.key) ||
        ['ArrowDown', 'KeyS'].includes(e.code)
      ) {
        pongRef.current?.setKeys(false, false);
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
  }, [isCaptured, release]);

  if (game === 'pixel-quest') {
    return (
      <div className="my-6 border border-hairline bg-strata rounded p-6 text-t-sm text-muted font-mono">
        Pixel Quest port placeholder (Task 2.7)
      </div>
    );
  }

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
        <span>PONG — FIXED TIMESTEP LOOP (60 HZ)</span>
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
          data-game="pong"
          data-captured={isCaptured ? 'true' : 'false'}
          tabIndex={isCaptured ? 0 : -1}
          aria-label="Pong game canvas. Press Enter to start playing."
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
              Play Pong — 7 points wins. Enter to start.
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
