# Game Projects Audit & Engine Fundamentals

## Search Audit & Original Source Repositories Status

A systematic search for Malay Chaudhary's older from-scratch game projects was conducted across the local filesystem using glob and regex patterns for C++ / SFML and Java RPG markers (`*.cpp`, `*SFML*`, `*pong*`, `*.sln`, `CMakeLists.txt`, `*.java`, `*RPG*`, `*.iml`, `pom.xml`, `build.gradle`, `*.tmx`, `tileset*`).

### Locations Searched:
1. `C:/Users/Malay/Documents/` — No `.cpp`, `.java`, `.sln`, `.iml`, `pom.xml`, or `build.gradle` found.
2. `C:/Users/Malay/Desktop/` — No game source code found.
3. `C:/Users/Malay/Downloads/` — Checked all `.zip` archives (`GameZone-main.zip`, `wetransfer_pro-acedamys-zip`, dataset zips). No SFML or Java RPG source code found.
4. `C:/Users/Malay/OneDrive/` — No C++ or Java game projects found.
5. `C:/Users/Malay/Saved Games/`, `Pictures/`, `Videos/`, `Music/` — No game code found.
6. `C:/Users/Malay/AppData/Roaming/Code/User/History/` — Inspected VS Code local history entries; no SFML or Java game source found.
7. `C:/dev/`, `C:/dev-archive/` (non-existent), `D:/` (non-existent).
8. `C:/switchboard/`, `C:/proacademys/`, `C:/Gamezone/` — Discovered `GameZone` Android Capacitor app Java entry point (`MainActivity.java`), but no standalone 2D Java RPG engine.
9. `C:/Minor/`, `C:/DS project/`, `C:/Cryptography/`, `C:/DL/`, `C:/CV/` — Academic labs and Python/C++ assignments; no SFML Pong or Java RPG.
10. `C:/$Recycle.Bin/` — Checked deleted items; contained `GameZone.apk`, `omp.exe`, web proxy repo. No SFML/Java RPG code.

### Status:
- **Original C++ SFML Pong**: **NOT FOUND** on local disk (likely hosted on an older remote Git repository or unbacked local directory).
- **Original Java 2D RPG**: **NOT FOUND** on local disk.

However, two active, complete from-scratch JavaScript/HTML5 Canvas game engines exist inside the portfolio web repository at `C:/portfolio website/games/` built for the gamified web portfolio. These are analyzed in detail below.

---

## 1. Pong Arcade (`games/pong.js`)

- **File Path**: `C:/portfolio website/games/pong.js`
- **Language / Signals**: ES Module JavaScript (HTML5 Canvas 2D API).
- **Build System**: Zero-build static web module (imported via `<script type="module">`).
- **Entry Point**: `export function initPong(canvas, onWin)` (Lines 1–305).
- **LOC Count**: 305 LOC.
- **File Count**: 1 file (`pong.js`).

### Engine Fundamentals & Technical Evidence

- **Game Loop Shape**: `requestAnimationFrame` unthrottled loop (variable frame rate without delta-time scaling).
  - **Evidence** (`C:/portfolio website/games/pong.js:283-288`):
    ```javascript
    function loop() {
      update();
      draw();
      animationFrameId = requestAnimationFrame(loop);
    }
    ```
- **Input Polling & Multi-Input Integration**:
  - Combined event-driven mouse tracking (`mousemove`), keyboard state polling (`keydown`/`keyup` mapped to `keys.Up`/`keys.Down`), and touch/pointer event handlers (`touchstart`/`touchend` for on-screen touch controls).
  - Mouse input directly updates paddle Y position (`C:/portfolio website/games/pong.js:46-51`).
  - Keyboard movement runs in `update()` with fixed velocity per tick: `const paddleSpeed = 7; if (keys.Up) playerY = Math.max(0, playerY - paddleSpeed);` (`C:/portfolio website/games/pong.js:120-123`).
- **Collision & Physics Mechanics**:
  - **Ball / Wall Bounding**: Axis-aligned clamping against `y <= 0` and `y >= HEIGHT` with velocity inversion (`ball.vy = -ball.vy`).
  - **Paddle Collision & Trigonometric Angle Deflection**: Checks AABB intersection between ball bounding box and paddle rectangle (`C:/portfolio website/games/pong.js:139-158`).
  - **Dynamic Acceleration**: On paddle hit, `ball.speed` increases by 3.5% (`ball.speed = Math.min(9, ball.speed * 1.035)`).
  - **Dynamic Bounce Angle**: Calculates `hitRatio` relative to paddle center: `const angle = hitRatio * (Math.PI / 3); ball.vx = ball.speed * Math.cos(angle); ball.vy = ball.speed * Math.sin(angle);` (`C:/portfolio website/games/pong.js:151-155`).
- **AI Opponent Tracking**:
  - Predictive AI tracking with deadzone buffer of 10px (`C:/portfolio website/games/pong.js:126-133`):
    ```javascript
    const aiCenter = aiY + PADDLE_HEIGHT / 2;
    const aiTarget = ball.y;
    const aiSpeed = 3.6;
    if (aiCenter < aiTarget - 10) {
      aiY = Math.min(HEIGHT - PADDLE_HEIGHT, aiY + aiSpeed);
    } else if (aiCenter > aiTarget + 10) {
      aiY = Math.max(0, aiY - aiSpeed);
    }
    ```
- **Rendering & Visual FX**:
  - HTML5 2D Canvas context rendering with custom glow effects (`ctx.shadowColor`, `ctx.shadowBlur = 8`), styled typography (`Press Start 2P`), dashed net drawing (`ctx.setLineDash([8, 8])`), and game over overlay. Double-buffering is handled natively by browser canvas compositor.
- **Sound / Sprites**:
  - Pure vector/canvas rendering (no external `.png`/`.wav` assets required).

### Portfolio Verdict
**Honest Verdict**: A clean, fully functional classic Arcade Pong engine with smooth trigonometric bounce reflection and multi-input support, though reliant on browser-managed requestAnimationFrame rather than a fixed timestep delta-time loop.

---

## 2. Pixel Quest — 2D RPG Room (`games/rpg.js`)

- **File Path**: `C:/portfolio website/games/rpg.js`
- **Language / Signals**: ES Module JavaScript (HTML5 Canvas 2D API).
- **Build System**: Zero-build static web module (imported via `<script type="module">`).
- **Entry Point**: `export function initRpg(canvas, onUnlockSkill)` (Lines 1–431).
- **LOC Count**: 431 LOC.
- **File Count**: 1 file (`rpg.js`).

### Engine Fundamentals & Technical Evidence

- **Game Loop Shape**: `requestAnimationFrame` loop (`C:/portfolio website/games/rpg.js:409-414`):
  ```javascript
  function loop() {
    update();
    draw();
    animationFrameId = requestAnimationFrame(loop);
  }
  ```
- **Input Polling & Diagonal Normalization**:
  - Event listeners capture `W`/`A`/`S`/`D` and Arrow keys into boolean state (`keys.up`, `keys.down`, `keys.left`, `keys.right`).
  - Diagonal movement speed normalized using vector scaling (`0.7071` multiplier) to prevent 1.414x diagonal speed exploit (`C:/portfolio website/games/rpg.js:192-195`):
    ```javascript
    if (dx !== 0 && dy !== 0) {
      dx *= 0.7071;
      dy *= 0.7071;
    }
    ```
- **Axis-Separated AABB Collision Detection**:
  - Movement and collision are evaluated independently along X and Y axes (`C:/portfolio website/games/rpg.js:198-214`).
  - Custom AABB bounding box collision helper (`C:/portfolio website/games/rpg.js:145-152`):
    ```javascript
    function checkCollision(rect1, rect2) {
      return (
        rect1.x < rect2.x + rect2.width &&
        rect1.x + rect1.width > rect2.x &&
        rect1.y < rect2.y + rect2.height &&
        rect1.y + rect1.height > rect2.y
      );
    }
    ```
- **NPC Dialogue & Text Wrapping Subsystem**:
  - Interactive NPC proximity detection (`NPC_INTERACT_MARGIN = 20px`).
  - Custom canvas string measurement and word-wrap function (`wrapText` at `C:/portfolio website/games/rpg.js:154-171`) that calculates dynamic box height and breaks dialogue strings into multiline text blocks (`C:/portfolio website/games/rpg.js:358-398`).
- **Collectibles & Floating Bobbing Animation**:
  - Interactive skill orbs (Docker, React, Payments, Game Dev) that trigger callbacks on pickup.
  - Trigonometric floating animation for collectibles: `const floatY = orb.y + Math.sin(orbAnimTime + orb.x) * 4;` (`C:/portfolio website/games/rpg.js:296`).
- **Rendering & Visual FX**:
  - Procedural grid layout canvas rendering (40x40 grid lines), shadow blur glow FX, custom direction-aware character sprite rendering (eye placements shift based on `player.dir` UP/DOWN/LEFT/RIGHT), interactive dialogue overlay box with semi-transparent background and neon green stroke.
- **Sound / Sprites**:
  - Procedurally rendered canvas primitives (no external image assets).

### Portfolio Verdict
**Honest Verdict**: A well-structured top-down 2D RPG room engine featuring axis-separated AABB collision, diagonal movement velocity normalization, dynamic multiline text wrapping, and interactive quest/dialogue triggers.

---

*Deviation note (2026-09-09): Pixel Quest was removed at the owner's explicit request. Pong remains as the sole playable Canvas 2D engine in the portfolio.*
