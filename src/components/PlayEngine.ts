import type { PongInstance } from '@/engine/pong';
import type { PixelQuestInstance } from '@/engine/pixel-quest';

let activePong: PongInstance | null = null;
let activeQuest: PixelQuestInstance | null = null;
let keyState = { up: false, down: false, left: false, right: false };
let isCaptured = false;

export function startInteractiveGame(game: 'pong' | 'pixel-quest', canvas: HTMLCanvasElement) {
  const containerId = `game-mount-${game}`;
  const container = document.getElementById(containerId);
  const overlay = document.getElementById(`${containerId}-overlay`);
  const exitBtn = document.getElementById(`${containerId}-exit`);
  const aria = document.getElementById(`${containerId}-aria`);

  isCaptured = true;
  canvas.setAttribute('data-captured', 'true');
  canvas.setAttribute('tabIndex', '0');
  if (overlay) overlay.style.display = 'none';
  if (exitBtn) exitBtn.style.display = 'block';

  function release(focusTrigger = false) {
    isCaptured = false;
    canvas.setAttribute('data-captured', 'false');
    canvas.setAttribute('tabIndex', '-1');
    if (overlay) overlay.style.display = 'flex';
    if (exitBtn) exitBtn.style.display = 'none';
    if (aria) {
      aria.textContent = `${game === 'pong' ? 'Pong' : 'Pixel Quest'} exited. Controls returned to page.`;
    }

    if (game === 'pong' && activePong) {
      activePong.stop();
      activePong.setKeys(false, false);
    } else if (game === 'pixel-quest' && activeQuest) {
      activeQuest.stop();
      keyState = { up: false, down: false, left: false, right: false };
      activeQuest.setKeys(false, false, false, false);
    }

    document.body.style.overflow = '';

    if (focusTrigger) {
      setTimeout(() => {
        const btn = document.getElementById(`${containerId}-btn`);
        btn?.focus();
      }, 0);
    }
  }

  if (game === 'pong') {
    if (aria) aria.textContent = 'Pong active. Arrow keys to move. Escape to exit.';
    if (activePong) {
      activePong.start();
    } else {
      import('@/engine/pong').then(({ initPong }) => {
        activePong = initPong(canvas);
        activePong.start();
      });
    }
  } else if (game === 'pixel-quest') {
    if (aria) aria.textContent = 'Pixel Quest active. WASD or Arrow keys to move. E to talk. Escape to exit.';
    if (activeQuest) {
      activeQuest.start();
    } else {
      import('@/engine/pixel-quest').then(({ initPixelQuest }) => {
        activeQuest = initPixelQuest(canvas);
        activeQuest.start();
      });
    }
  }

  document.body.style.overflow = 'hidden';
  setTimeout(() => canvas.focus(), 0);

  const handleKeyDown = (e: KeyboardEvent) => {
    if (!isCaptured) return;

    if (e.key === 'Escape') {
      e.preventDefault();
      release(true);
      return;
    }
    if (e.key === 'Tab') {
      release(false);
      return;
    }

    const k = e.key;
    const code = e.code;

    if (game === 'pong') {
      const isUp = k === 'ArrowUp' || k === 'w' || k === 'W' || code === 'ArrowUp' || code === 'KeyW';
      const isDown = k === 'ArrowDown' || k === 's' || k === 'S' || code === 'ArrowDown' || code === 'KeyS';
      const isReset = k === ' ' || code === 'Space' || k === 'Enter';

      if (isUp || isDown || isReset) {
        e.preventDefault();
        if (isUp) activePong?.setKeys(true, false);
        else if (isDown) activePong?.setKeys(false, true);
        else if (isReset) activePong?.handleRestart();
      }
    } else if (game === 'pixel-quest') {
      const isUp = k === 'ArrowUp' || k === 'w' || k === 'W' || code === 'ArrowUp' || code === 'KeyW';
      const isDown = k === 'ArrowDown' || k === 's' || k === 'S' || code === 'ArrowDown' || code === 'KeyS';
      const isLeft = k === 'ArrowLeft' || k === 'a' || k === 'A' || code === 'ArrowLeft' || code === 'KeyA';
      const isRight = k === 'ArrowRight' || k === 'd' || k === 'D' || code === 'ArrowRight' || code === 'KeyD';
      const isAct = k === 'e' || k === 'E' || code === 'KeyE' || k === ' ' || code === 'Space';

      if (isUp || isDown || isLeft || isRight || isAct) {
        e.preventDefault();
        if (isUp) keyState.up = true;
        if (isDown) keyState.down = true;
        if (isLeft) keyState.left = true;
        if (isRight) keyState.right = true;
        activeQuest?.setKeys(keyState.up, keyState.down, keyState.left, keyState.right);
        if (isAct) activeQuest?.handleInteract();
      }
    }
  };

  const handleKeyUp = (e: KeyboardEvent) => {
    if (!isCaptured) return;
    const k = e.key;
    const code = e.code;

    if (game === 'pong') {
      const isUp = k === 'ArrowUp' || k === 'w' || k === 'W' || code === 'ArrowUp' || code === 'KeyW';
      const isDown = k === 'ArrowDown' || k === 's' || k === 'S' || code === 'ArrowDown' || code === 'KeyS';
      if (isUp || isDown) activePong?.setKeys(false, false);
    } else if (game === 'pixel-quest') {
      if (['ArrowUp', 'w', 'W'].includes(k) || ['ArrowUp', 'KeyW'].includes(code)) keyState.up = false;
      if (['ArrowDown', 's', 'S'].includes(k) || ['ArrowDown', 'KeyS'].includes(code)) keyState.down = false;
      if (['ArrowLeft', 'a', 'A'].includes(k) || ['ArrowLeft', 'KeyA'].includes(code)) keyState.left = false;
      if (['ArrowRight', 'd', 'D'].includes(k) || ['ArrowRight', 'KeyD'].includes(code)) keyState.right = false;
      activeQuest?.setKeys(keyState.up, keyState.down, keyState.left, keyState.right);
    }
  };

  const handlePointerDownOutside = (e: PointerEvent) => {
    if (isCaptured && container && !container.contains(e.target as Node)) {
      release(true);
    }
  };

  const handleVisibilityChange = () => {
    if (document.hidden && isCaptured) release(false);
  };

  const handleExitClick = () => release(true);
  const handleCanvasBlur = () => {
    if (isCaptured) release(false);
  };

  window.addEventListener('keydown', handleKeyDown);
  window.addEventListener('keyup', handleKeyUp);
  window.addEventListener('pointerdown', handlePointerDownOutside);
  document.addEventListener('visibilitychange', handleVisibilityChange);

  exitBtn?.addEventListener('click', handleExitClick);
  canvas?.addEventListener('blur', handleCanvasBlur);
}
