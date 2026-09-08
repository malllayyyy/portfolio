import type { PongInstance } from '@/engine/pong';

let activePong: PongInstance | null = null;
let isCaptured = false;

export function startInteractiveGame(game: 'pong', canvas: HTMLCanvasElement) {
  // Re-entrancy guard: Pong is mouse-controlled, so clicks land on the canvas
  // during play. Without this, every click re-registered a fresh set of global
  // listeners that were never removed.
  if (isCaptured || canvas.getAttribute('data-captured') === 'true') return;

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
      aria.textContent = 'Pong exited. Controls returned to page.';
    }

    if (activePong) {
      activePong.stop();
      activePong.setKeys(false, false);
    }

    document.body.style.overflow = '';

    window.removeEventListener('keydown', handleKeyDown);
    window.removeEventListener('keyup', handleKeyUp);
    window.removeEventListener('pointerdown', handlePointerDownOutside);
    document.removeEventListener('visibilitychange', handleVisibilityChange);
    exitBtn?.removeEventListener('click', handleExitClick);
    canvas?.removeEventListener('blur', handleCanvasBlur);

    if (focusTrigger) {
      setTimeout(() => {
        const btn = document.getElementById(`${containerId}-btn`);
        btn?.focus();
      }, 0);
    }
  }

  function reportInitFailure(err: unknown) {
    console.error(err);
    release(true);
    if (overlay) {
      overlay.style.display = 'flex';
      overlay.textContent =
        'This browser could not open a 2D canvas, so the game cannot run here. The mechanics are described above.';
    }
  }

  if (aria) aria.textContent = 'Pong active. Arrow keys to move. Escape to exit.';
  if (activePong) {
    activePong.start();
  } else {
    import('@/engine/pong')
      .then(({ initPong }) => {
        activePong = initPong(canvas);
        activePong.start();
      })
      .catch(reportInitFailure);
  }

  document.body.style.overflow = 'hidden';
  setTimeout(() => canvas.focus(), 0);

  const handleKeyDown = (e: KeyboardEvent) => {
    if (!isCaptured) return;

    if (e.key === 'Escape') {
      release(true);
      return;
    }
    if (e.key === 'Tab') {
      release(false);
      return;
    }

    const k = e.key;
    const code = e.code;

    const isUp = k === 'ArrowUp' || k === 'w' || k === 'W' || code === 'ArrowUp' || code === 'KeyW';
    const isDown = k === 'ArrowDown' || k === 's' || k === 'S' || code === 'ArrowDown' || code === 'KeyS';
    const isReset = k === ' ' || code === 'Space' || k === 'Enter';

    if (isUp || isDown) {
      e.preventDefault();
      if (isUp) activePong?.setKeys(true, false);
      else activePong?.setKeys(false, true);
    } else if (isReset) {
      if (k === ' ' || code === 'Space') e.preventDefault();
      activePong?.handleRestart();
    }
  };

  const handleKeyUp = (e: KeyboardEvent) => {
    if (!isCaptured) return;
    const k = e.key;
    const code = e.code;

    const isUp = k === 'ArrowUp' || k === 'w' || k === 'W' || code === 'ArrowUp' || code === 'KeyW';
    const isDown = k === 'ArrowDown' || k === 's' || k === 'S' || code === 'ArrowDown' || code === 'KeyS';
    if (isUp || isDown) activePong?.setKeys(false, false);
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
