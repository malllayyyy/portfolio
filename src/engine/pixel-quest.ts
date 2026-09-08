import { createLoop } from './loop';
import { SKIN } from './skin';

type NPC = {
  id: number;
  name: string;
  title: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  text: string;
};

export type PixelQuestInstance = {
  start(): void;
  stop(): void;
  destroy(): void;
  setKeys(up: boolean, down: boolean, left: boolean, right: boolean): void;
  handleInteract(): void;
};

export function initPixelQuest(
  canvas: HTMLCanvasElement,
  onUnlockSkill?: (skill: string) => void
): PixelQuestInstance {
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    return {
      start() {},
      stop() {},
      destroy() {},
      setKeys() {},
      handleInteract() {},
    };
  }

  const WIDTH = 640;
  const HEIGHT = 400;
  const NPC_INTERACT_MARGIN = 20;

  const dpr = Math.min(typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1, 2);
  canvas.width = WIDTH * dpr;
  canvas.height = HEIGHT * dpr;

  const player = {
    x: 309,
    y: 320,
    width: 22,
    height: 22,
    speed: 3.2,
    dir: 'UP' as 'UP' | 'DOWN' | 'LEFT' | 'RIGHT',
  };

  const prev = {
    playerX: 309,
    playerY: 320,
    orbAnimTime: 0,
  };

  const keys = {
    up: false,
    down: false,
    left: false,
    right: false,
  };

  const walls = [
    { x: 120, y: 160, width: 140, height: 20 },
    { x: 380, y: 160, width: 140, height: 20 },
    { x: 280, y: 230, width: 80, height: 20 },
  ];

  const npcs: NPC[] = [
    {
      id: 1,
      name: 'Deployment Platform',
      title: 'The Forge Master',
      x: 140,
      y: 90,
      width: 24,
      height: 24,
      color: '#FFC46B',
      text: 'Behold the grand engine! I forged this deployment citadel from scratch—no borrowed magic, zero auth libraries. It channels both the blazing light of frontend realms and the deep, rumbling power of backend servers into a single mighty forge. Offer your sacred repository to the flames, traveler, and I shall handle the rest!',
    },
    {
      id: 2,
      name: 'ProAcademys',
      title: 'The Grand Archivist',
      x: 480,
      y: 90,
      width: 24,
      height: 24,
      color: '#FFC46B',
      text: "Hush now, the scholars are studying! I have completely restored and redesigned the academy's grand archives, purging every last corrupted spell and lingering bug from its halls. I now stand as its eternal guardian, actively maintaining its enchantments to ensure the knowledge flows uninterrupted!",
    },
    {
      id: 3,
      name: 'GameZone',
      title: 'The Station Master',
      x: 309,
      y: 128,
      width: 24,
      height: 24,
      color: '#FFC46B',
      text: 'Halt, traveler! Before you sit at the grand tables, know that my Android artifact sees all. It meticulously tracks every gaming station in the realm, calculating your session gold down to the very minute. There is no free playtime in this tavern!',
    },
  ];

  const skillOrbs = [
    { id: 'docker', name: 'Docker', x: 70, y: 290, radius: 10, collected: false },
    { id: 'react', name: 'React', x: 570, y: 290, radius: 10, collected: false },
    { id: 'payments', name: 'Payments', x: 320, y: 80, radius: 10, collected: false },
    { id: 'gamedev', name: 'Game Dev', x: 550, y: 80, radius: 10, collected: false },
  ];

  let currentDialogue: { name: string; title: string; text: string } | null = null;
  let activeNearNpcId: number | null = null;
  let orbAnimTime = 0;

  function checkCollision(
    rect1: { x: number; y: number; width: number; height: number },
    rect2: { x: number; y: number; width: number; height: number }
  ) {
    return (
      rect1.x < rect2.x + rect2.width &&
      rect1.x + rect1.width > rect2.x &&
      rect1.y < rect2.y + rect2.height &&
      rect1.y + rect1.height > rect2.y
    );
  }

  function wrapText(text: string, maxWidth: number): string[] {
    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = '';

    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      const testLine = currentLine ? currentLine + ' ' + word : word;
      if (ctx!.measureText(testLine).width > maxWidth && currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }
    if (currentLine) {
      lines.push(currentLine);
    }
    return lines;
  }

  function handleInteract() {
    if (activeNearNpcId === null) return;
    const npc = npcs.find((n) => n.id === activeNearNpcId);
    if (!npc) return;
    if (currentDialogue && currentDialogue.name === npc.name) {
      currentDialogue = null;
    } else {
      currentDialogue = { name: npc.name, title: npc.title, text: npc.text };
    }
  }

  function copyStateToPrev() {
    prev.playerX = player.x;
    prev.playerY = player.y;
    prev.orbAnimTime = orbAnimTime;
  }

  function update() {
    let dx = 0;
    let dy = 0;

    if (keys.up) {
      dy -= player.speed;
      player.dir = 'UP';
    }
    if (keys.down) {
      dy += player.speed;
      player.dir = 'DOWN';
    }
    if (keys.left) {
      dx -= player.speed;
      player.dir = 'LEFT';
    }
    if (keys.right) {
      dx += player.speed;
      player.dir = 'RIGHT';
    }

    if (dx !== 0 && dy !== 0) {
      dx *= 0.7071;
      dy *= 0.7071;
    }

    // Move along X (axis-separated AABB)
    const nextX = player.x + dx;
    const playerRectX = { x: nextX, y: player.y, width: player.width, height: player.height };

    let collideX = false;
    if (nextX < 15 || nextX + player.width > WIDTH - 15) collideX = true;
    walls.forEach((w) => {
      if (checkCollision(playerRectX, w)) collideX = true;
    });
    npcs.forEach((n) => {
      if (checkCollision(playerRectX, n)) collideX = true;
    });

    if (!collideX) player.x = nextX;

    // Move along Y (axis-separated AABB)
    const nextY = player.y + dy;
    const playerRectY = { x: player.x, y: nextY, width: player.width, height: player.height };

    let collideY = false;
    if (nextY < 15 || nextY + player.height > HEIGHT - 15) collideY = true;
    walls.forEach((w) => {
      if (checkCollision(playerRectY, w)) collideY = true;
    });
    npcs.forEach((n) => {
      if (checkCollision(playerRectY, n)) collideY = true;
    });
    let nearNpc: NPC | null = null;
    for (const npc of npcs) {
      const nearRect = {
        x: npc.x - NPC_INTERACT_MARGIN,
        y: npc.y - NPC_INTERACT_MARGIN,
        width: npc.width + NPC_INTERACT_MARGIN * 2,
        height: npc.height + NPC_INTERACT_MARGIN * 2,
      };
      if (checkCollision(player, nearRect)) {
        nearNpc = npc;
      }
    }

    if (nearNpc) {
      if (activeNearNpcId !== nearNpc.id) {
        activeNearNpcId = nearNpc.id;
      }
    } else if (activeNearNpcId !== null) {
      activeNearNpcId = null;
      currentDialogue = null;
    }

    // Skill Orb Pickups
    orbAnimTime += 0.05;
    skillOrbs.forEach((orb) => {
      if (!orb.collected) {
        const orbRect = {
          x: orb.x - orb.radius,
          y: orb.y - orb.radius,
          width: orb.radius * 2,
          height: orb.radius * 2,
        };
        if (checkCollision(player, orbRect)) {
          orb.collected = true;
          if (typeof onUnlockSkill === 'function') {
            onUnlockSkill(`+ Skill: ${orb.name}`);
          }
        }
      }
    });
  }

  function draw(alpha: number) {
    ctx!.save();
    ctx!.scale(dpr, dpr);

    const drawX = prev.playerX + (player.x - prev.playerX) * alpha;
    const drawY = prev.playerY + (player.y - prev.playerY) * alpha;
    const drawOrbTime = prev.orbAnimTime + (orbAnimTime - prev.orbAnimTime) * alpha;

    // Floor
    ctx!.fillStyle = SKIN.field;
    ctx!.fillRect(0, 0, WIDTH, HEIGHT);

    // Floor Grid lines (40px, 1px SKIN.grid)
    ctx!.strokeStyle = SKIN.grid;
    ctx!.lineWidth = 1;
    for (let x = 0; x < WIDTH; x += 40) {
      ctx!.beginPath();
      ctx!.moveTo(x, 0);
      ctx!.lineTo(x, HEIGHT);
      ctx!.stroke();
    }
    for (let y = 0; y < HEIGHT; y += 40) {
      ctx!.beginPath();
      ctx!.moveTo(0, y);
      ctx!.lineTo(WIDTH, y);
      ctx!.stroke();
    }

    // Outer Room Wall Border
    ctx!.strokeStyle = SKIN.accent;
    ctx!.lineWidth = 2;
    ctx!.strokeRect(10, 10, WIDTH - 20, HEIGHT - 20);

    // Inner Obstacle Walls
    walls.forEach((w) => {
      ctx!.fillStyle = SKIN.panel;
      ctx!.fillRect(w.x, w.y, w.width, w.height);
      ctx!.strokeStyle = SKIN.accent;
      ctx!.lineWidth = 1.5;
      ctx!.strokeRect(w.x, w.y, w.width, w.height);
    });

    // Skill Orbs
    skillOrbs.forEach((orb) => {
      if (!orb.collected) {
        const floatY = orb.y + Math.sin(drawOrbTime + orb.x) * 4;

        ctx!.fillStyle = SKIN.accent;
        ctx!.beginPath();
        ctx!.arc(orb.x, floatY, orb.radius, 0, Math.PI * 2);
        ctx!.fill();

        ctx!.fillStyle = SKIN.text;
        ctx!.font = '10px "JetBrains Mono", ui-monospace, monospace';
        ctx!.textAlign = 'center';
        ctx!.fillText(orb.name, orb.x, floatY - 14);
      }
    });

    // NPCs
    npcs.forEach((npc) => {
      ctx!.fillStyle = npc.color;
      ctx!.fillRect(npc.x, npc.y, npc.width, npc.height);

      // Eyes
      ctx!.fillStyle = '#06080B';
      ctx!.fillRect(npc.x + 4, npc.y + 6, 4, 4);
      ctx!.fillRect(npc.x + 16, npc.y + 6, 4, 4);

      // Label
      ctx!.fillStyle = SKIN.text;
      ctx!.font = '10px "JetBrains Mono", ui-monospace, monospace';
      ctx!.textAlign = 'center';
      ctx!.fillText(npc.name, npc.x + npc.width / 2, npc.y - 8);

      // Interaction prompt
      const nearRect = {
        x: npc.x - NPC_INTERACT_MARGIN,
        y: npc.y - NPC_INTERACT_MARGIN,
        width: npc.width + NPC_INTERACT_MARGIN * 2,
        height: npc.height + NPC_INTERACT_MARGIN * 2,
      };
      if (checkCollision(player, nearRect)) {
        ctx!.fillStyle = SKIN.accent;
        ctx!.font = '10px "JetBrains Mono", ui-monospace, monospace';
        ctx!.fillText('[E] TALK', npc.x + npc.width / 2, npc.y + npc.height + 14);
      }
    });

    // Player Hero Square
    ctx!.fillStyle = SKIN.accent;
    ctx!.fillRect(drawX, drawY, player.width, player.height);

    // Player Eyes / Direction
    ctx!.fillStyle = '#06080B';
    if (player.dir === 'UP') {
      ctx!.fillRect(drawX + 4, drawY + 4, 4, 4);
      ctx!.fillRect(drawX + 14, drawY + 4, 4, 4);
    } else if (player.dir === 'DOWN') {
      ctx!.fillRect(drawX + 4, drawY + 14, 4, 4);
      ctx!.fillRect(drawX + 14, drawY + 14, 4, 4);
    } else if (player.dir === 'LEFT') {
      ctx!.fillRect(drawX + 4, drawY + 4, 4, 4);
      ctx!.fillRect(drawX + 4, drawY + 14, 4, 4);
    } else if (player.dir === 'RIGHT') {
      ctx!.fillRect(drawX + 14, drawY + 4, 4, 4);
      ctx!.fillRect(drawX + 14, drawY + 14, 4, 4);
    }

    // Dialogue Box Overlay
    if (currentDialogue) {
      ctx!.font = '12px "JetBrains Mono", ui-monospace, monospace';
      const paddingX = 15;
      const boxX = 30;
      const boxWidth = WIDTH - 60;
      const maxTextWidth = boxWidth - paddingX * 2;
      const lines = wrapText(currentDialogue.text, maxTextWidth);

      const titleHeight = 16;
      const lineHeight = 18;
      const footerHeight = 16;
      const verticalPadding = 12;

      const boxHeight = Math.max(
        75,
        verticalPadding + titleHeight + lines.length * lineHeight + footerHeight + verticalPadding
      );
      const boxY = HEIGHT - boxHeight - 15;

      ctx!.fillStyle = 'rgba(16, 21, 28, 0.95)';
      ctx!.strokeStyle = SKIN.accent;
      ctx!.lineWidth = 2;
      ctx!.fillRect(boxX, boxY, boxWidth, boxHeight);
      ctx!.strokeRect(boxX, boxY, boxWidth, boxHeight);

      ctx!.fillStyle = SKIN.accent;
      ctx!.font = '11px "JetBrains Mono", ui-monospace, monospace';
      ctx!.textAlign = 'left';
      ctx!.fillText(
        `💬 ${currentDialogue.title} — ${currentDialogue.name}:`,
        boxX + paddingX,
        boxY + verticalPadding + 10
      );

      ctx!.fillStyle = SKIN.text;
      ctx!.font = '12px "JetBrains Mono", ui-monospace, monospace';
      let lineY = boxY + verticalPadding + titleHeight + 12;
      lines.forEach((line) => {
        ctx!.fillText(line, boxX + paddingX, lineY);
        lineY += lineHeight;
      });

      ctx!.fillStyle = '#8FA0B0';
      ctx!.font = '10px "JetBrains Mono", ui-monospace, monospace';
      ctx!.textAlign = 'right';
      ctx!.fillText('[Press E or Walk Away]', boxX + boxWidth - paddingX, boxY + boxHeight - 10);
    }

    ctx!.restore();
  }

  const loop = createLoop({ update, draw, copyStateToPrev });

  // Initial draw
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
    },
    setKeys(up: boolean, down: boolean, left: boolean, right: boolean) {
      keys.up = up;
      keys.down = down;
      keys.left = left;
      keys.right = right;
    },
    handleInteract,
  };
}
