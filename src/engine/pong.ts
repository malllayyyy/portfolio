import { createLoop } from './loop';
import { SKIN } from './skin';

export type PongInstance = {
  start(): void;
  stop(): void;
  destroy(): void;
  setKeys(up: boolean, down: boolean): void;
  handleRestart(): void;
};

export function initPong(
  canvas: HTMLCanvasElement,
  onWin?: (winner: 'player' | 'ai') => void
): PongInstance {
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    // Fail loudly. A no-op instance here would let the visitor press Play and
    // get permanent silence with no explanation; GameMount catches this and
    // surfaces a real message instead.
    throw new Error('Pong: could not acquire a 2D canvas context.');
  }

  const WIDTH = 640;
  const HEIGHT = 400;

  const PADDLE_WIDTH = 12;
  const PADDLE_HEIGHT = 70;
  const BALL_SIZE = 10;
  const WINNING_SCORE = 7;

  // DPR backing store (§ 5.2)
  const dpr = Math.min(typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1, 2);
  canvas.width = WIDTH * dpr;
  canvas.height = HEIGHT * dpr;

  let playerY = (HEIGHT - PADDLE_HEIGHT) / 2;
  let aiY = (HEIGHT - PADDLE_HEIGHT) / 2;
  let playerScore = 0;
  let aiScore = 0;
  let gameState: 'RUNNING' | 'GAMEOVER' = 'RUNNING';

  let ball = {
    x: WIDTH / 2,
    y: HEIGHT / 2,
    vx: 3.5,
    vy: 2,
    speed: 4,
  };

  const prev = {
    playerY,
    aiY,
    ballX: ball.x,
    ballY: ball.y,
  };

  const keys = { Up: false, Down: false };

  function resetBall(scorer: 'player' | 'ai') {
    ball.x = WIDTH / 2;
    ball.y = HEIGHT / 2;
    ball.speed = 4;
    const angle = Math.random() * (Math.PI / 4) - Math.PI / 8;
    const dir = scorer === 'player' ? -1 : 1;
    ball.vx = dir * ball.speed * Math.cos(angle);
    ball.vy = ball.speed * Math.sin(angle);

    prev.ballX = ball.x;
    prev.ballY = ball.y;
  }

  function restartGame() {
    playerScore = 0;
    aiScore = 0;
    playerY = (HEIGHT - PADDLE_HEIGHT) / 2;
    aiY = (HEIGHT - PADDLE_HEIGHT) / 2;
    gameState = 'RUNNING';

    prev.playerY = playerY;
    prev.aiY = aiY;
    resetBall('player');
  }

  const updatePointerY = (clientY: number) => {
    const rect = canvas.getBoundingClientRect();
    if (!rect.height) return;
    const scaleY = HEIGHT / rect.height;
    const pointerY = (clientY - rect.top) * scaleY;
    playerY = Math.max(0, Math.min(HEIGHT - PADDLE_HEIGHT, pointerY - PADDLE_HEIGHT / 2));
  };

  const handleMouseMove = (e: MouseEvent) => updatePointerY(e.clientY);
  const handleTouchMove = (e: TouchEvent) => {
    if (e.touches.length > 0) {
      updatePointerY(e.touches[0].clientY);
    }
  };
  const handleClick = () => {
    if (gameState === 'GAMEOVER') {
      restartGame();
    }
  };

  canvas.addEventListener('mousemove', handleMouseMove);
  canvas.addEventListener('touchmove', handleTouchMove, { passive: true });
  canvas.addEventListener('touchstart', handleTouchMove, { passive: true });
  canvas.addEventListener('click', handleClick);

  function copyStateToPrev() {
    prev.playerY = playerY;
    prev.aiY = aiY;
    prev.ballX = ball.x;
    prev.ballY = ball.y;
  }

  function update() {
    if (gameState !== 'RUNNING') return;

    // Keyboard Movement (7 px/tick at 60 Hz)
    const paddleSpeed = 7;
    if (keys.Up) playerY = Math.max(0, playerY - paddleSpeed);
    if (keys.Down) playerY = Math.min(HEIGHT - PADDLE_HEIGHT, playerY + paddleSpeed);

    // AI Tracking (3.6 px/tick, 10 px deadzone)
    const aiCenter = aiY + PADDLE_HEIGHT / 2;
    const aiTarget = ball.y;
    const aiSpeed = 3.6;
    if (aiCenter < aiTarget - 10) {
      aiY = Math.min(HEIGHT - PADDLE_HEIGHT, aiY + aiSpeed);
    } else if (aiCenter > aiTarget + 10) {
      aiY = Math.max(0, aiY - aiSpeed);
    }

    // Ball Movement
    ball.x += ball.vx;
    ball.y += ball.vy;

    // Bounce Top & Bottom Walls
    if (ball.y - BALL_SIZE / 2 <= 0) {
      ball.y = BALL_SIZE / 2;
      ball.vy = -ball.vy;
    } else if (ball.y + BALL_SIZE / 2 >= HEIGHT) {
      ball.y = HEIGHT - BALL_SIZE / 2;
      ball.vy = -ball.vy;
    }

    // Player Paddle Collision
    const playerX = 20;
    if (
      ball.x - BALL_SIZE / 2 <= playerX + PADDLE_WIDTH &&
      ball.x + BALL_SIZE / 2 >= playerX &&
      ball.y >= playerY &&
      ball.y <= playerY + PADDLE_HEIGHT &&
      ball.vx < 0
    ) {
      ball.x = playerX + PADDLE_WIDTH + BALL_SIZE / 2;
      ball.speed = Math.min(9, ball.speed * 1.035);
      const hitRatio = (ball.y - (playerY + PADDLE_HEIGHT / 2)) / (PADDLE_HEIGHT / 2);
      const angle = hitRatio * (Math.PI / 3);
      ball.vx = ball.speed * Math.cos(angle);
      ball.vy = ball.speed * Math.sin(angle);
    }

    // AI Paddle Collision
    const aiX = WIDTH - 20 - PADDLE_WIDTH;
    if (
      ball.x + BALL_SIZE / 2 >= aiX &&
      ball.x - BALL_SIZE / 2 <= aiX + PADDLE_WIDTH &&
      ball.y >= aiY &&
      ball.y <= aiY + PADDLE_HEIGHT &&
      ball.vx > 0
    ) {
      ball.x = aiX - BALL_SIZE / 2;
      ball.speed = Math.min(9, ball.speed * 1.035);
      const hitRatio = (ball.y - (aiY + PADDLE_HEIGHT / 2)) / (PADDLE_HEIGHT / 2);
      const angle = hitRatio * (Math.PI / 3);
      ball.vx = -ball.speed * Math.cos(angle);
      ball.vy = ball.speed * Math.sin(angle);
    }

    // Scoring Check
    if (ball.x < 0) {
      aiScore++;
      if (aiScore >= WINNING_SCORE) {
        gameState = 'GAMEOVER';
      } else {
        resetBall('ai');
      }
    } else if (ball.x > WIDTH) {
      playerScore++;
      if (playerScore >= WINNING_SCORE) {
        gameState = 'GAMEOVER';
        onWin?.('player');
      } else {
        resetBall('player');
      }
    }
  }

  function draw(alpha: number) {
    if (!ctx) return;

    ctx.save();
    ctx.scale(dpr, dpr);

    // Clear Background
    ctx.fillStyle = SKIN.field;
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    // 1px Hairline Grid
    ctx.strokeStyle = SKIN.grid;
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let x = 40; x < WIDTH; x += 40) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x, HEIGHT);
    }
    for (let y = 40; y < HEIGHT; y += 40) {
      ctx.moveTo(0, y);
      ctx.lineTo(WIDTH, y);
    }
    ctx.stroke();

    // Dashed Net
    ctx.strokeStyle = SKIN.net;
    ctx.setLineDash(SKIN.netDash);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(WIDTH / 2, 0);
    ctx.lineTo(WIDTH / 2, HEIGHT);
    ctx.stroke();
    ctx.setLineDash([]);

    // Interpolated positions
    const renderPlayerY = prev.playerY + (playerY - prev.playerY) * alpha;
    const renderAiY = prev.aiY + (aiY - prev.aiY) * alpha;
    const renderBallX = prev.ballX + (ball.x - prev.ballX) * alpha;
    const renderBallY = prev.ballY + (ball.y - prev.ballY) * alpha;

    // Scores & Labels
    ctx.fillStyle = SKIN.text;
    ctx.font = SKIN.mono;
    if ('letterSpacing' in ctx) {
      const styledCtx = ctx as CanvasRenderingContext2D & { letterSpacing: string };
      styledCtx.letterSpacing = '0.04em';
    }
    ctx.textAlign = 'center';
    ctx.fillText(String(playerScore), WIDTH / 4, 45);
    ctx.fillText(String(aiScore), (3 * WIDTH) / 4, 45);

    ctx.fillStyle = '#8FA0B0';
    ctx.font = SKIN.mono;
    ctx.fillText('YOU', WIDTH / 4, 65);
    ctx.fillText('AI OPPONENT', (3 * WIDTH) / 4, 65);

    // Player Paddle (Accent, SKIN.accent)
    ctx.fillStyle = SKIN.accent;
    ctx.shadowBlur = 0;
    ctx.fillRect(20, renderPlayerY, PADDLE_WIDTH, PADDLE_HEIGHT);

    // AI Paddle (Light Text #EDF1F5)
    ctx.fillStyle = SKIN.text;
    ctx.shadowBlur = 0;
    ctx.fillRect(WIDTH - 20 - PADDLE_WIDTH, renderAiY, PADDLE_WIDTH, PADDLE_HEIGHT);

    // Ball (Accent, SKIN.accent, with 4px shadow)
    ctx.fillStyle = SKIN.accent;
    ctx.shadowColor = SKIN.accent;
    ctx.shadowBlur = SKIN.ballShadowBlur;
    ctx.beginPath();
    ctx.arc(renderBallX, renderBallY, BALL_SIZE / 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Game Over Overlay
    if (gameState === 'GAMEOVER') {
      ctx.fillStyle = 'rgba(14, 17, 22, 0.88)';
      ctx.fillRect(0, 0, WIDTH, HEIGHT);

      const panelW = 460;
      const panelH = 90;
      const panelX = (WIDTH - panelW) / 2;
      const panelY = (HEIGHT - panelH) / 2;

      ctx.fillStyle = SKIN.panel;
      ctx.fillRect(panelX, panelY, panelW, panelH);
      ctx.strokeStyle = SKIN.grid;
      ctx.lineWidth = 1;
      ctx.strokeRect(panelX, panelY, panelW, panelH);

      ctx.fillStyle = SKIN.text;
      ctx.font = SKIN.display;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(
        `Game over — ${playerScore}:${aiScore}. Space to play again.`,
        WIDTH / 2,
        HEIGHT / 2
      );
    }

    ctx.restore();
  }

  const loop = createLoop({ update, draw, copyStateToPrev });

  // Initial draw so canvas is not blank before starting loop
  draw(1);

  return {
    start() {
      loop.start();
    },
    stop() {
      loop.stop();
    },
    destroy() {
      loop.stop();
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('touchmove', handleTouchMove);
      canvas.removeEventListener('touchstart', handleTouchMove);
      canvas.removeEventListener('click', handleClick);
    },
    setKeys(up: boolean, down: boolean) {
      keys.Up = up;
      keys.Down = down;
    },
    handleRestart() {
      if (gameState === 'GAMEOVER') {
        restartGame();
      }
    },
  };
}
