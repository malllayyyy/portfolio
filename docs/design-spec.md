# Substrate — Implementation Design Spec

**Owner:** Malay Chaudhary · B.Tech CSE, IIIT Naya Raipur
**Concept:** B — *Substrate* (LOCKED, see `docs/concepts.md` § "Concept B — Substrate")
**Deploy:** Vercel + custom domain (`malaychaudhary.dev`)
**Status of this document:** implementation-ready. Every number here is a build target, not a placeholder.

Contacts of record: `github.com/malllayyyy` · `linkedin.com/in/malay-chaudhary-959077328/` · `malayrc276@gmail.com`

---

## 1. Overview & non-goals

### 1.1 What this site is

One uncut Three.js camera descent through four depths of a computing stack. Scroll is depth. The camera never cuts, never loads, never returns to a menu. Each layer is causally responsible for the layer above it, and the projects that live at each depth are the evidence.

| Depth datum | Layer | Domain | Projects resident |
|---|---|---|---|
| 0 m | **Surface** | Web | `deployment-platform`, ProAcademys |
| −40 m | **Device** | App | GameZone |
| −120 m | **Engine** | Game | Pong, Pixel Quest (both playable in-page) |
| −260 m | **Reasoning** | Agentic AI | Switchboard |
| −300 m | **Bedrock** | — | About, résumé, contact; canvas unmounts |

The signature moment is the **screen pass-through** at −40 m: the camera descends into a monolithic phone whose screen is a live render target of the layer below; at the exact frame the camera crosses the screen plane, the render target *becomes* the scene. No cut, no loader, no dissolve. Section 2.6 specifies the mechanic precisely enough to build without invention.

Positioning: *a modern developer who builds games, websites, applications, and software* — argued structurally rather than asserted. Four domains presented as four depths of one stack reads as vertical integration, not scatter.

### 1.2 Non-goals — explicitly forbidden

Each of these is banned because it appears in the teardown of the reference set (`docs/concepts.md` § "Reference Teardown") or the anti-pattern list (`docs/concepts.md` § "Anti-patterns").

1. **No tech-logo wall / icon matrix.** No grid of 20–40 SVG brand marks. Technology is shown in context inside architecture diagrams and code-grounded copy or it is not shown.
2. **No bento grid.** No 3×3 rounded dark cards with noise texture, radial hover gradients, badge clouds, or `↗` corner arrows.
3. **No boot screen / fake terminal intro.** No `INITIALIZING MALAY.EXE`, no ASCII loader, no percentage counter, no "PRESS START" gate. The hero text is in the first HTML response.
4. **No GitHub contribution widget**, no star-count badges, no "Loading GitHub stats…" cards.
5. **No purple/pink gradient blobs, no glassmorphism spheres, no `backdrop-blur` cards.** All light in the scene originates from objects in the scene.
6. **No custom cursor trail.** The OS pointer is the pointer.
7. **No word-by-word or letter-by-letter scroll reveal on body copy.** Paragraphs render whole.
8. **No floating decorative torus / Spline mascot / ambient noise shader with no narrative job.** Every mesh in the scene belongs to a project or to the strata.
9. **No resemblance to the owner's previous site** (`https://malllayyyy-portfolio.vercel.app/`). Specifically banned by inheritance: pixel/arcade display type (Press Start 2P, Silkscreen), matrix-green `#00f5a0` on black, CRT scanline/bloom FX toggle, XP scroll bar, achievement toasts and unlock counters, `⌘K` command palette, rank labels (`BOSS LEVEL`, `S-RANK`), "Quest Board" contact naming, theme-colour switcher.
10. **No scrolljacking with a hijacked scrollbar.** Scroll position always maps 1:1 and monotonically to a real document scroll offset; the scrollbar is real and draggable.
11. **No auto-playing audio.** Ever.
12. **No "I turn complex problems into elegant solutions" class of copy.** Every claim in body text traces to a file path or a measured fact in `docs/projects.md`.

---

## 2. The descent — spatial spec

This is the load-bearing section. Coordinates, units, and the pass-through mechanic are all normative.

### 2.1 World conventions

- **Units:** 1 world unit = 1 metre.
- **Depth axis:** world **−Y**. Camera position is always `(x, y, z)` with `y ≤ +6`; `y` decreases monotonically with scroll. The site's depth readout displays `y` rounded to the metre, e.g. `−072 m · DEVICE`.
- **Camera orientation:** `PerspectiveCamera`, `fov 55`, `near 0.1`, `far 420`, `up = (0, 0, −1)`. It looks **straight down −Y** for the whole descent. Exhibits are therefore horizontal planes — literal strata — and read face-on without any tilt rig.
- **Lateral drift:** camera `x` and `z` are driven by a single Catmull-Rom curve sampled by the same scroll parameter, amplitude **±3.2 m**, so the descent has parallax and never feels like an elevator shaft. `x`/`z` are cosmetic only; nothing addressable depends on them.
- **Renderer:** `WebGLRenderer` `{ antialias: tier === 'high', powerPreference: 'high-performance', alpha: false }`, clear colour `#06080B`, `toneMapping = ACESFilmicToneMapping`, `toneMappingExposure = 1.05`, `outputColorSpace = SRGBColorSpace`.

### 2.2 Scroll → depth mapping

The document is **900 vh** tall. Scrollable range `S = scrollHeight − innerHeight` (= 800 vh at a 100 vh viewport). Normalised progress `t = scrollY / S`, clamped to `[0, 1]`.

`depth(t)` is a **monotonic piecewise-linear function** over the following control points. Piecewise-linear, not eased, because the segment gradient *is* the pacing device: shallow gradient = exhibit (slow, readable), steep gradient = transit (fast, cinematic).

| `t` | `camera.y` (m) | Segment rate (m per unit t) | What this point is |
|---:|---:|---:|---|
| 0.000 | **+6.0** | — | Above the surface plane. Hero DOM overlay at full opacity. |
| 0.030 | **0.0** | 200 | **Surface datum.** Crossing the plane. |
| 0.075 | −2.0 | 44 | `deployment-platform` plate (exhibit, slow) |
| 0.135 | −8.0 | 100 | ProAcademys plate (exhibit, slow) |
| 0.170 | −12.0 | 114 | Surface floor. Exhibits end. |
| 0.235 | −30.0 | 277 | **Transit.** Fog thickens, phone silhouette resolves. |
| 0.270 | −36.0 | 171 | Bezel enters frustum. Pass-through begins. |
| 0.300 | **−40.0** | 133 | **Screen plane. RENDER-TARGET SWAP FRAME.** Device datum. |
| 0.330 | −44.0 | 133 | Inside. Bezel now behind camera. |
| 0.400 | −52.0 | 114 | GameZone exhibit (slow) |
| 0.470 | −70.0 | 257 | Device floor. |
| 0.560 | −112.0 | 466 | **Transit.** Textures strip; wireframe unwrap. |
| 0.600 | **−120.0** | 200 | **Engine datum.** |
| 0.640 | −124.0 | 100 | Pong play volume (slowest segment on the site) |
| 0.690 | −134.0 | 200 | Pixel Quest play volume |
| 0.730 | −150.0 | 400 | Engine floor. |
| 0.830 | −248.0 | 980 | **Transit.** Fastest segment. Geometry dissolves into emitters. |
| 0.870 | **−260.0** | 300 | **Reasoning datum.** Node field opens. |
| 0.930 | −278.0 | 300 | Switchboard trace exhibit |
| 0.965 | −290.0 | 343 | Field floor. |
| 1.000 | **−300.0** | 286 | **Bedrock.** Solid plane. Canvas unmounts. |

Implementation: precompute the 21 control pairs into two `Float32Array`s at module load; `depth(t)` is a binary search plus one `lerp`. No allocation per frame. The inverse `t(depth)` is the same arrays searched on the other column — this is what deep links and the depth-gauge clicks use (§ 10.3).

`camera.position.y = depth(t)` is assigned once per frame inside `useFrame` via an exponential settle `p.t += (target - p.t) * (1 - Math.exp(-dt / tau))` with `tau ≈ 0.12 s`, using the real frame delta, so the camera lags the scrollbar by ~600 ms of critically damped catch-up. No spring, no overshoot.

### 2.3 Geometry per depth

Every mesh below belongs to a project or to the strata. Total scene budget: **≤ 180 k triangles resident**, **≤ 120 draw calls** on high tier (see § 8).

**Surface · y ∈ [0, −12]**
- **Strata ceiling** at `y = 0`: a single `PlaneGeometry(240, 240, 1, 1)` facing down, `MeshBasicMaterial` with an alpha-mapped hairline grid (2048² single-channel KTX2, 1 draw call). Seen from below it is the underside of daylight.
- **2 exhibit plates**: `BoxGeometry(18, 0.06, 26)` at `y = −2` (`deployment-platform`) and `y = −8` (ProAcademys), offset ±7 m in `x`. Material `MeshPhysicalMaterial { transmission: 0.9, thickness: 0.4, roughness: 0.08, ior: 1.45, color: #EDF1F5 }`. Each plate carries its exhibit surface as a second, coplanar unlit quad (§ 4).
- **Suspension lines**: 24 `LineSegments` from ceiling to plate corners, one merged buffer, 1 draw call.

**Device · y ∈ [−30, −70]**
- **The monolith**: the phone is rendered at architectural scale — body `BoxGeometry(6.2, 0.62, 13.4)` centred at `y = −40`, chamfered via a beveled GLTF (≤ 9 k tris, Draco). Material `MeshStandardMaterial { metalness: 0.95, roughness: 0.28, color: #7C8590 }` — brushed aluminium, no clearcoat.
- **The bezel ring**: separate mesh, inner aperture 5.6 × 12.4 m, thickness 0.3 m, sitting `y = −39.9 … −40.1`. This mesh is what the camera visibly passes; it is never hidden.
- **The screen quad**: `PlaneGeometry(5.6, 12.4)` at exactly `y = −40.0`, facing up, `ShaderMaterial` sampling the render target in screen space (§ 2.6).
- **Interior (below the screen plane), `y ∈ [−40, −70]`**: GameZone's exhibit. An emissive floor grid at `y = −70` in `#FFC46B` at 0.12 intensity, eight station-slab meshes (`BoxGeometry(2.4, 0.12, 1.6)`, instanced, 1 draw call) arranged as the POS station grid, and the architecture-diagram quad (§ 4.3).

**Engine · y ∈ [−112, −150]**
- Nothing here is textured. `MeshMatcapMaterial` (one shared 256² matcap) plus `WireframeGeometry` overlays in `#FF5F56`.
- **Visible frustum**: a `LineSegments` wireframe of a camera frustum, apex at `y = −150` pointing up, 1 draw call — the object that later turns out to be *emitted from below*.
- **Two play volumes**: open-topped boxes at `y = −124` (Pong) and `y = −134` (Pixel Quest), each 16 × 10 m, containing the 2D canvas surface as a `CanvasTexture` quad (§ 5).
- **Collider ghosts**: 40 instanced wireframe boxes drifting on a shared vertex-shader time uniform, 1 draw call.

**Reasoning · y ∈ [−248, −290]**
- **Node field**: a single `Points` object, **6 000 vertices** (high tier) / 2 400 (mid), `AdditiveBlending`, custom shader with `uTime`, `uAccent = #C8FF6A`. 1 draw call.
- **Edge field**: one `LineSegments`, 9 000 segments, additive, opacity 0.22. 1 draw call.
- **Trace path**: a `Line` of ≤ 60 vertices lit to full accent when a Switchboard trace step is selected. 1 draw call.
- **Bedrock**: `PlaneGeometry(400, 400)` at `y = −300`, `MeshStandardMaterial { color: #10151C, roughness: 1 }`.

### 2.4 Fog and light falloff

One `FogExp2` on the scene; its `color` and `density` are updated per frame via linear interpolation keyed to `t`. Visibility ≈ `3.0 / density` metres.

| Depth range | Fog colour | Density | Visibility |
|---|---|---:|---:|
| +6 … −12 (Surface) | `#1A2430` | 0.012 | ~250 m |
| −12 … −40 (approach) | `#171A1E` | 0.018 | ~167 m |
| −40 … −70 (Device) | `#1E1A12` | 0.022 | ~136 m |
| −70 … −150 (Engine) | `#14090A` | 0.028 | ~107 m |
| −150 … −260 (descent to Reasoning) | `#0A0C10` | 0.034 | ~88 m |
| −260 … −300 (Reasoning/Bedrock) | `#06080B` | 0.042 | ~71 m |

Interpolation is linear in `t` across the boundary segments, not stepped. Fog colour is also written to `renderer.setClearColor` each frame so the horizon and the void are the same value — no visible dome edge.

**Lights (3 total, always; never more):**
1. `DirectionalLight` from `(0, +60, 0)`, always above the camera, intensity ramping `2.4 → 0.15` linearly over `y ∈ [0, −150]` then `0.15 → 0` over `y ∈ [−150, −260]`. This is daylight dying as you descend, and it is why the lower layers must light themselves.
2. `PointLight` travelling with the camera at `y = camera.y − 3.0`, `distance 42`, `decay 2`. Intensity `6.0`. **Its colour is the layer accent** and is updated via per-frame `Color.lerp` (tuned to read as ~700 ms) at layer boundaries: `#8FD3FF → #FFC46B → #FF5F56 → #C8FF6A`. Depth is therefore legible from a single screenshot.
3. `AmbientLight` at `0.06`, colour = current fog colour. Prevents pure-black crush on the unlit sides of Engine geometry.

Below −260 m the directional light is at zero and **all** illumination comes from the additive node field itself. That is the point: the layer that decides is the layer that emits.

### 2.5 Layer boundaries and the depth gauge

A layer is `[datum, nextDatum)`. The gauge (fixed, left edge, `JetBrains Mono` 12 px) shows `−072 m · DEVICE` and a 4-stop tick rail. Clicking a stop calls `window.scrollTo({ top: t(datum) * S, behavior: prefersReducedMotion ? 'auto' : 'smooth' })` — real scrolling, real scrollbar, no synthetic camera flight. This is the entire reason `t(depth)` is invertible.

### 2.6 The screen pass-through — normative mechanic

**Problem being solved:** the camera must descend *through* a phone screen and end up inside the scene the screen was displaying, in one shot, with no visible discontinuity on any frame.

**The trick:** the interior scene and the exterior scene are the *same* Three.js scene, in the *same* world coordinates. There is no second world, no rebasing, no second camera. Separation is done with `THREE.Layers`, and the screen quad shows the interior sampled **in screen space**, which makes the quad's pixels identical to the pixels that would be there if the quad did not exist.

**Layer channel assignments** (`object.layers.set(n)`):

| Channel | Contents |
|---:|---|
| 0 | Shared: fog-independent helpers, the travelling point light |
| 1 | `EXTERIOR` — strata ceiling, Surface plates, phone body, bezel, screen quad |
| 2 | `INTERIOR` — everything at `y < −40`: Device interior, Engine, Reasoning, Bedrock |

**Per-frame render sequence while `camera.y ∈ (−36.0, −40.0]`** (the pass-through window, and only there):

```
1. camera.layers.set(2)                     // INTERIOR only
   renderer.setRenderTarget(rtInterior)
   renderer.render(scene, camera)           // pass A: the world below, from the real camera
2. renderer.setRenderTarget(null)
   camera.layers.set(1)                     // EXTERIOR only
   screenMaterial.uniforms.uMap = rtInterior.texture
   renderer.render(scene, camera)           // pass B: phone + strata, screen quad sampling pass A
```

Outside that window there is exactly **one** pass: above −36 m the camera renders channel 1 only (the interior is not visible anyway — the opaque phone body occludes it and the fog swallows the rest); at and below −40 m the camera renders channel 2 only.

**The screen material** (this is what makes the swap invisible):

```glsl
// fragment
uniform sampler2D uMap;
uniform vec2 uResolution;
void main() {
  vec2 uv = gl_FragCoord.xy / uResolution;   // screen-space, NOT the quad's UV
  gl_FragColor = texture2D(uMap, uv);
}
```

Because the sample is `gl_FragCoord`-based and pass A used the **same camera matrices** as pass B, every texel the quad shows is exactly the texel that pass A would have written to that pixel. The quad is a *window*, not a *screen*. Therefore:

- **On the swap frame** (`camera.y` first reaches ≤ −40.0), we stop pass B and render channel 2 directly to the canvas. The output is bit-identical to the previous frame's quad region, so the transition is invisible by construction, not by tuning.
- **The seam risk is zero inside the aperture** and confined to the bezel ring, which at that moment is at the frame edge and behind the near plane.

**Near-plane handling.** `near = 0.1`. The bezel inner aperture is 5.6 × 12.4 m and the camera passes through its centre with ±3.2 m of lateral drift, so the drift curve is **hard-clamped to ±1.6 m for `t ∈ [0.255, 0.345]`** to guarantee the camera never intersects bezel geometry. The bezel and phone body clip against the near plane naturally as they pass — that clipping *is* the sensation of entering, and it is why the bezel must be a real mesh rather than a fade. **Do not** animate `near`; changing it mid-descent shifts the depth-buffer distribution and causes z-fighting on the Engine wireframes 80 m later.

**What happens to the phone geometry after the swap.** Nothing is destroyed during the move. The phone body, bezel and screen quad remain mounted on channel 1 and simply fall behind the camera. They are disposed on the `t > 0.47` boundary (Device floor), by which point they are 30 m behind and fully fogged. Scrolling back up remounts them at `t < 0.47`; the mount is a single `Suspense`-free `useMemo` of already-loaded geometry, so the remount cost is one frame of nothing.

**Render-target spec.** `WebGLRenderTarget(w, h, { samples: tier === 'high' ? 4 : 0, depthBuffer: true, type: HalfFloatType })` where `w, h = canvasSize * min(devicePixelRatio, dprCap)`. `dprCap` = 2 high / 1.5 mid. The RT is allocated on entering `t > 0.24` and disposed on leaving `t ∉ [0.24, 0.31]` — it exists for roughly 7 % of the scroll and never costs memory outside it. On resize it is reallocated, debounced 200 ms.

**Reduced motion / low tier.** The pass-through does not exist. See § 7 and § 8.

**Verification criterion for the build.** Record the canvas at 60 fps across `t ∈ [0.29, 0.31]` and diff consecutive frames in the aperture region. Max per-pixel delta on the swap frame must be ≤ the delta between any two adjacent non-swap frames in the same window. If it is not, the screen material is sampling in UV space instead of screen space.

---

## 3. Layer content mapping

Every fact below traces to `docs/projects.md` or `docs/live-capture.md`. Nothing is invented.

### 3.1 Surface · 0 m · Web

**Thesis:** *The layer everyone sees is the one with the least of my code in it — and the most of other people's.*

**Resident: `deployment-platform`** — plate at `y = −2`.
- Self-hosted PaaS: takes a git URL, builds inside a throwaway Docker sandbox, uploads static output to MinIO, routes custom subdomains to versioned buckets, streams build logs over Socket.IO.
- Monorepo of 7 workspace packages: `@platform/api`, `worker`, `proxy`, `dashboard`, `db`, `shared`, `storage`.
- ~25 source JS/JSX files, ~2 200 LOC, 4 Postgres tables (`users`, `projects`, `deployments`, `build_logs`), 10 REST endpoints.
- Three verified engineering decisions used as exhibit copy:
  1. Containerised build isolation with lockfile-hash `node_modules` caching — `infra/docker/build.sh`, `apps/worker/src/build.js`.
  2. Zero-downtime atomic swap: the proxy resolves `<subdomain>` → `projects.current_deployment_id` → `deployments.bucket_path` per request; rollback is one SQL update — `apps/proxy/src/index.js`.
  3. scrypt hashing + HMAC-SHA256 signed base64url stateless session cookies on `node:crypto` alone, no session store — `apps/api/src/auth.js`.
- **Presentation: ARCHITECTURE DIAGRAM** (no screenshots exist in the repo; no public URL — it runs at `http://<project>.localhost:8080`). Diagram spec in § 4.3.
- **Links:** GitHub `https://github.com/malllayyyy/deployment-platform` (public, verified). No live-demo link.

**Resident: ProAcademys** — plate at `y = −8`.
- Full-stack MERN rewrite of a legacy PHP/Laravel 10 e-learning platform. React 19 + Vite + Tailwind v4 client; Express + Mongoose server; Razorpay payments; PDFKit certificates.
- ~100+ files, ~8 500 LOC, ~30 REST endpoints, **37 legacy MySQL tables → 20 Mongoose collections**.
- Three verified engineering decisions:
  1. MySQL→MongoDB ETL engine reading the 37-table production dump via `mysql2`, resolving legacy integer IDs to BSON ObjectIds, emitting a count-parity verification report — `server/scripts/migrate/run.js`, `server/scripts/migrate/transform/*`, `scripts/migrate/out/report.md`.
  2. Same-origin proxying in `client/vercel.json` to defeat `SameSite=Lax` cookie dropping between Vercel and Render, scoping the JWT cookie to the frontend origin.
  3. Strict `routes → controllers → services → repositories → models` tiering with reusable CRUD factories.
- **Presentation: SCREENSHOT-BASED**, using all 8 captures in `assets/raw/proacademys/` (§ 4.2).
- **Links:** live demo `https://proacademys-client.vercel.app/` only. **No code link** — `proacademys-client` is private (HTTP 404 on GitHub, `docs/live-capture.md`).

### 3.2 Device · −40 m · App

**Thesis:** *Software that has to run on a Windows 7 machine with a spinning disk is a harder constraint than any framework I've ever picked.*

**Resident: GameZone** — the interior, `y ∈ [−40, −70]`.
- Real-time gaming-cafe POS: station timer dashboard, session billing, cafeteria orders, packaged as a Capacitor 6 Android app (`com.gamezone.app`) *and* a desktop web app off the same React 18 + Vite build.
- ~30 source files, ~3 500 LOC, 7 SQLite tables (`stations`, `sessions`, `settings`, `activities`, `snacks`, `cafeteria_expenses`, `revenue_history`), ~15 REST endpoints.
- Three verified engineering decisions:
  1. Built for legacy low-spec hardware — Windows 7, spinning HDD, Node v13.14.0. `backend/database.js` sets `PRAGMA journal_mode = WAL`, `synchronous = NORMAL`, `temp_store = MEMORY`, `cache_size = -10000`, and wraps startup seeding in a single `BEGIN TRANSACTION … COMMIT` to eliminate disk wait cycles.
  2. One React codebase → native Android via Capacitor 6 (`frontend/capacitor.config.json`, `frontend/android/`) while staying a normal browser app; `Start-GameZone.bat` is the one-click launcher on the cafe's own machine.
  3. Mid-session activity rollover: `POST /api/sessions/add-game` lets a player switch Snooker → PS5 on the same station without resetting occupancy, computing played overage and deducting it from the new activity's duration — `backend/server.js`.
- **Presentation: ARCHITECTURE DIAGRAM** (no UI screenshots exist; only Android splash/launcher icons). Diagram spec in § 4.3. The launcher icon `assets/raw/gamezone/ic_launcher.png` is used once, at 96 px, as the exhibit's identity mark — not as a screenshot substitute.
- **Links: NONE.** `GameZone` is private (HTTP 404). No repo link, no demo link, no APK link. The exhibit says so in one line: *"Private repo — it runs a real business."*

### 3.3 Engine · −120 m · Game

**Thesis:** *Everything above this is a frame that can afford to be late. Down here it can't.*

**History, stated as history — not as an artifact.** The first two engines Malay wrote were a C++/SFML Pong and a Java 2D RPG. An inventory search (`docs/games.md`) searched local project directories including `C:/dev` and found neither — the original files were not found on disk. The layer says exactly that, in one sentence, with no link and no claim of proof: *"The C++/SFML and Java versions came first. They're gone — no repo, no backup. What's here is the third time I wrote them, in Canvas 2D."* Honesty is cheaper than a broken link.

**Resident: Pong** — play volume at `y = −124`.
- Existing engine `C:/portfolio website/games/pong.js`, 305 LOC, ES module, `export function initPong(canvas, onWin)`, 640 × 400 internal resolution, no external assets — everything is canvas primitives.
- Verified mechanics preserved by the port: AABB paddle intersection with trigonometric deflection (`hitRatio → angle = hitRatio * π/3`), 3.5 % ball acceleration per paddle hit clamped at speed 9, AI tracking at 3.6 px/tick with a 10 px deadzone, mouse + keyboard + touch input, `WINNING_SCORE = 7`.
- **Playable in-page. This is mandatory** (§ 5).

**Resident: Pixel Quest** — play volume at `y = −134`.
- Existing engine `C:/portfolio website/games/rpg.js`, 431 LOC, `export function initRpg(canvas, onUnlockSkill)`, 640 × 400.
- Verified mechanics preserved: axis-separated AABB resolution (X and Y solved independently), diagonal normalisation by `0.7071`, `player.speed = 3.2`, 3 wall colliders, NPC proximity interaction at 20 px, a custom `wrapText` canvas word-wrap with dynamically sized dialogue boxes, and bobbing collectible orbs via `Math.sin(orbAnimTime + orb.x) * 4`.
- Playable on desktop. On mobile it is a captioned looping video (§ 5.5).

**Both ports are upgraded from the unthrottled `requestAnimationFrame` loop** they ship with today (`pong.js:283-288`, `rpg.js:409-414` — `update(); draw(); requestAnimationFrame(loop)`, no delta scaling) to a fixed-timestep accumulator with render interpolation. That upgrade is itself exhibit copy at this layer, shown as a before/after code pair, because it is the one thing on the site where the reader can see the frame budget being taken seriously.

### 3.4 Reasoning · −260 m · Agentic AI

**Thesis:** *The layer that decides what the other three should do. It has no UI of its own — so I built one.*

**Resident: Switchboard** (`malllayyyy/swtchboard` — note the spelling; it is the real repo name).
- Real-time control switchboard and tactical dashboard for Oh My Pi (`@oh-my-pi/pi-coding-agent`) subagents. Bun + Express + `ws` server embedding the agent SDK in-process; React 18 + Vite + GSAP client; shared TypeScript WebSocket protocol.
- ~15 source TS/TSX files, ~1 800 LOC, **0 database tables** — it reads live in-memory session state and agent session transcripts.
- Protocol surface, used verbatim as the node-field taxonomy: 5 `ClientMessage` types (`prompt`, `set_model`, `spawn`, `list_sessions`, `switch_session`) and 7 `ServerMessage` types (`roster`, `models`, `session_event`, `session_messages`, `error`, `sessions`, `session_switched`).
- Three verified engineering decisions:
  1. Direct in-memory subagent steering — holds live `AgentSession` references via `AgentRegistry.global()` and calls `.steer()` / `.prompt()` on the target subagent, bypassing orchestrator turns entirely (`server/index.ts`, `server/agent-manager.ts`).
  2. Live in-flight model swapping — `AgentSession.setModel()` on an active session mid-conversation, over WebSocket, with no restart and no file edit (`server/agent-manager.ts`, `shared/protocol.ts`).
  3. Roster hydration across restarts — `registerPersistedSubagents` / `ensurePersistedRoster` periodically resync parked and background subagents from the `.jsonl` transcripts.
- **Presentation:** the node field *is* the exhibit. The 12 protocol message types are the node classes; selecting one lights the edges it can travel. A recorded trace replay is deferred (§ 12); a drop-in trace slot is designed for future integration. Not a live fake terminal.
- **Links:** GitHub `https://github.com/malllayyyy/swtchboard` (public, verified, 1 star, TypeScript).
- **The portrait photo lives here**, and only here: one image, 320 px, at `y = −286`, on the last surface before Bedrock, captioned with name, degree and institution. Placeholder until supplied (§ 12).

### 3.5 Bedrock · −300 m

Not a layer — the floor. The canvas unmounts (`renderer.dispose()`, `forceContextLoss()`) and pure DOM takes over: bio, résumé PDF, email, GitHub, LinkedIn. GPU memory is released before the visitor reaches the contact links, which is also why the contact section can never jank.

---

## 4. Project detail presentation

### 4.1 From world to detail

Three entry paths, all equivalent, all producing the same DOM:

1. **Scroll into range.** When `|camera.y − exhibit.y| < 6 m`, the exhibit's DOM proxy becomes the document's active landmark and a compact **card** (title, one-line thesis, `Open ⏎`) fades in at the right edge. It does not open by itself.
2. **Click the mesh.** Raycast on `pointerup` (not `pointerdown` — dragging the scrollbar must not select).
3. **Tab to it.** Every exhibit has a real focusable `<button>` in a visually-hidden-but-focusable list in scroll order. Focus scrolls the document to that exhibit's `t` and shows the card; `Enter` opens.

**Opening** pushes a route (`/project/<slug>`, § 10) and slides in the **detail panel**: desktop = grid columns 8–12, full viewport height, `overflow-y: auto`, `#10151C` at 100 % opacity (no blur, no transparency); mobile = full-width bottom sheet at 92 vh. Scroll on the document is locked while the panel is open (`overscroll-behavior: contain`, `inert` on the canvas), the camera holds at its current depth, and the rAF loop drops to **on-demand rendering only** — a panel-open reader costs zero continuous GPU.

**Closing** by `Esc`, the close button, or browser back. Focus returns to the trigger. The camera has not moved, so closing is not a transition.

### 4.2 Presentation mode A — screenshot-based (ProAcademys only)

The only project with real captured UI. All 8 shots in `assets/raw/proacademys/` are used; each earns its place by carrying a specific claim.

| Shot | Placement | The claim it carries |
|---|---|---|
| `desktop-home.png` | Exhibit surface on the plate (in-world, 1280×800 KTX2) | This is a finished product, not a demo |
| `desktop-catalog-courses.png` | Panel, position 1 | Real catalogue data — Power BI, Advanced Excel, Data Analyst — served live from Render |
| `desktop-course-detail.png` | Panel, position 2 | Real commerce: instructor, ₹5 999 price, enrolment CTA |
| `desktop-catalog.png` | Panel, position 3 | Catalogue chrome and navigation |
| `desktop-blog.png` | Panel, position 4 | Content surface beyond the course flow |
| `mobile-home.png`, `mobile-catalog.png`, `mobile-course-detail.png` | Panel, one 390×844 device-frame triptych | Responsive is implemented, not asserted — same routes, 390 px |

Panel structure, in order: title → one-line thesis → live-demo link → the three verified engineering decisions as three short prose blocks, each ending in the **file path** that proves it (`server/scripts/migrate/run.js` etc.) → scale numbers (37 → 20, ~8 500 LOC, ~30 endpoints) → shot sequence → the one honest limitation (pending DNS cutover to `proacademys.com` and live Razorpay keys).

Image delivery: AVIF with WebP fallback via `next/image`, `sizes` capped at the panel's 5-column width (max 640 px CSS), lazy except the first, `loading="eager"` only on panel-open position 1. The in-world plate texture is a separate KTX2 at 1024², loaded with the Surface layer chunk.

### 4.3 Presentation mode B — architecture diagram (deployment-platform, GameZone)

Neither project has UI screenshots, and neither will get fake ones. Each is presented as **one hand-authored SVG architecture diagram**, drawn to the site's own visual system, rendered as inline SVG in the panel (crisp, themeable, screen-reader-readable via `<title>`/`<desc>` on every node) and as a KTX2 bake on the in-world exhibit surface.

Diagram grammar, shared by both: rectangles = processes, cylinders = stores, solid arrow = synchronous call, dashed arrow = queue/stream, dotted boundary = isolation boundary. Labels in JetBrains Mono 11 px. Maximum **12 nodes** per diagram — a diagram you cannot read at a glance is a logo wall with lines.

**Diagram 1 — `deployment-platform`: "one deploy, end to end."** It must depict, in this order:
1. `git URL` → `@platform/api` (`POST /deploy`).
2. `@platform/api` → **BullMQ queue** (dashed) on Redis, using `BUILD_QUEUE_NAME` from `@platform/shared`.
3. `@platform/worker` consumes → spawns **`platform-build-sandbox`** Docker container, drawn inside a dotted isolation boundary. Annotated: *lockfile hash → host bind-mounted `node_modules` cache → skip `npm install` on hit* (`infra/docker/build.sh`).
4. Build output → **MinIO** (cylinder), written to the versioned path `<project>/<deploymentId>`.
5. Build logs → Redis pub/sub channel (`buildLogChannel`, dashed) → `@platform/api` → **Socket.IO** → `@platform/dashboard` (dashed, labelled *live*).
6. **Postgres** (cylinder) with the four tables; a highlighted single-field arrow `projects.current_deployment_id` — annotated *"success flips this. rollback flips it back. one UPDATE, zero downtime."*
7. Browser → `@platform/proxy`, host-header lookup against Postgres, stream from MinIO.
The `current_deployment_id` arrow is the diagram's focal point, in Surface accent `#8FD3FF`; everything else is `#8FA0B0`. The diagram exists to make one idea land: **the atomic swap is a single column.**

**Diagram 2 — GameZone: "a POS that assumes the disk is slow."** It must depict:
1. Two clients on the left — **Android app** (Capacitor 6 wrapper around the React build) and **desktop browser** — converging on one box labelled *same Vite bundle*.
2. → `backend/server.js` (Express, ~15 endpoints).
3. → **SQLite** (cylinder) with the 7 tables named.
4. A callout box on the SQLite cylinder listing the four literal pragmas: `journal_mode = WAL`, `synchronous = NORMAL`, `temp_store = MEMORY`, `cache_size = -10000`, plus `BEGIN TRANSACTION … COMMIT` seeding — annotated *"Windows 7. 5400 rpm. Node v13.14.0."*
5. A separate inset strip for the session-rollover rule: `station occupied → add-game → overage computed → deducted from new activity → occupancy unbroken`, four boxes, one line. This is the business logic, and it is the most interesting thing in the project.
Focal colour: Device accent `#FFC46B`.

Both panels close with the same honesty line pattern: *"No screenshots — this one never had a marketing surface. Private repo."* for GameZone; *"Runs on my machine and my machine only: `http://<project>.localhost:8080`. Code is public."* + GitHub link for `deployment-platform`.

### 4.4 Switchboard detail

Neither mode. The exhibit is the node field itself; the panel carries the protocol table (5 client / 7 server message types), the three engineering decisions with `server/agent-manager.ts` file-path evidence, and the recorded trace step list synchronised with the lit path in the scene. GitHub link present.

---

## 5. The playable Engine layer

### 5.1 Fixed-timestep accumulator

Both engines today run `update(); draw(); requestAnimationFrame(loop)` with per-frame constants (`paddleSpeed = 7` px/frame, `player.speed = 3.2` px/frame, `aiSpeed = 3.6` px/frame) and no delta scaling. On a 144 Hz display they run 2.4× fast; on a stuttering tab they run slow. The port fixes this **without retuning a single constant**, by making the tick rate exactly the rate the constants were authored for.

Normative loop, shared by both ports (one module, `engine/loop.ts`):

```
TIMESTEP_MS   = 1000 / 60      // 16.6667 ms — matches the authored constants exactly
MAX_STEPS     = 5              // clamp: at most 5 sim ticks per rAF callback (83.3 ms)
accumulator   = 0
prevTime      = performance.now()

frame(now):
  frameTime = min(now - prevTime, 250)   // hard ceiling: tab-restore never dumps 30 s of sim
  prevTime  = now
  accumulator += frameTime
  steps = 0
  while accumulator >= TIMESTEP_MS and steps < MAX_STEPS:
     copyStateToPrev()                   // shallow copy of the interpolated fields only
     update()                            // untouched game logic, still "per tick"
     accumulator -= TIMESTEP_MS
     steps++
  if steps == MAX_STEPS: accumulator = 0 // drop the backlog; never spiral
  alpha = accumulator / TIMESTEP_MS      // [0, 1)
  draw(alpha)
```

**Why `MAX_STEPS = 5` and not 3 or 10.** Below 5 a 30 fps device (33 ms frames, 2 ticks) has no headroom for a single hitch; above 5 a recovering tab spends >83 ms in `update()` and drops a visible frame to catch up on simulation nobody watched. 5 ticks is the largest catch-up that still fits inside two 30 fps frames.

**Interpolation.** `draw(alpha)` renders `prev + (curr − prev) * alpha` for exactly these fields, and nothing else:
- Pong: `ball.x`, `ball.y`, `playerY`, `aiY`.
- Pixel Quest: `player.x`, `player.y`, and `orbAnimTime` (so the `Math.sin` bob stays smooth).
Discrete state — scores, `gameState`, `player.dir`, dialogue index, orb collected flags — is **never** interpolated; it snaps. Interpolating a score is how you get `6.4`.

**Input** is sampled into the tick, not into the frame. Key state is written by listeners into a `keys` object (unchanged from today) and read inside `update()`; `mousemove` writes a *target* Y that `update()` clamps, so mouse control keeps the same feel with no per-frame divergence.

**Runnable check (required, and the only test on this project).** `engine/loop.test.ts`: drive `frame()` with a synthetic clock — 100 calls at 6.94 ms (144 Hz) and 100 calls at 16.67 ms (60 Hz) must produce tick counts within ±2 of each other for the same elapsed wall time; one call with `now` jumped by 30 000 ms must produce exactly `MAX_STEPS` ticks and leave `accumulator === 0`. Asserts only, no framework beyond the project's test runner.

### 5.2 Re-skin into the site's visual system

The engines' current look is the old arcade site's look and is banned by non-goal 9. The port keeps every line of *logic* and replaces only the draw-call constants:

| Old | New |
|---|---|
| `Press Start 2P` pixel type | **JetBrains Mono**, 14 px, letter-spacing `0.04em`, for score and dialogue |
| Matrix green `#00f5a0` | **Engine accent `#FF5F56`** for the ball, the player paddle, orbs and dialogue stroke |
| Neon glow `shadowBlur = 8` on everything | `shadowBlur = 0`; contrast comes from value, not bloom. One exception: the ball keeps a 4 px `#FF5F56` shadow because it is the only object the eye must track |
| Black `#050505` field | `#0E1116` field, `#1B2430` hairline grid at 1 px, dashed net `setLineDash([8, 8])` in `#3A4654` |
| Arcade "GAME OVER" overlay | Sentence-case `Game over — 7:4. Space to play again.` in Satoshi 20 px on a flat `#10151C` panel |

Canvas is 640 × 400 internal (unchanged), rendered to a DPR-aware backing store (`canvas.width = 640 * min(dpr, 2)` with a matching `ctx.scale`) so the hairlines stay crisp, and presented in-world as a `CanvasTexture` on the play-volume quad with `texture.needsUpdate = true` set **only when a frame was drawn** — a paused game costs no texture upload.

### 5.3 Input capture and release — no keyboard trap

The rule: **the game never takes keys it was not explicitly given, and always gives them back.**

- The play volume's DOM proxy is a `<button>` reading *"Play Pong — 7 points wins. Enter to start."* Tab reaches it in document order.
- **Capture** happens on explicit activation only: `Enter`/`Space` on the button, or a click/tap on the canvas. Never on hover, never on scroll-into-view, never on focus alone.
- While captured: `aria-live` announces *"Pong active. Arrow keys to move. Escape to exit."*; the canvas has `tabindex="0"` and holds focus; document scroll is locked; `keydown` calls `preventDefault()` **only** for `ArrowUp`, `ArrowDown`, `ArrowLeft`, `ArrowRight`, `KeyW/A/S/D`, and `Space`. Every other key — `Tab`, `Escape`, `Enter`, `/`, browser shortcuts, screen-reader keys — passes through untouched.
- **Release** on any of: `Escape`, `Tab` (which both releases *and* performs the normal focus move — no swallowed Tab, ever), `blur` on the canvas, pointer-down outside the canvas, the visible **Exit (Esc)** button rendered beside the canvas, or `document.visibilitychange` to hidden. On release the rAF loop stops, focus returns to the trigger button, and scroll unlocks.
- A visible focus ring (`2px #8FD3FF`, `outline-offset: 3px`) is on the canvas whenever it is captured. There is never a captured state without a visible indicator.

### 5.4 Camera behaviour while playing

Scroll is locked, so the camera is stationary at the play volume's depth. The travelling point light dims to `3.0` so the canvas is the brightest thing in frame. Nothing animates in the surrounding scene except the collider ghosts, whose shader is a single time uniform.

### 5.5 Mobile

- **Pong: playable.** It already has touch handlers (`touchstart`/`touchend`). The port replaces the two-button scheme with a single **drag-anywhere-on-canvas** control (`touchmove` → paddle Y, identical maths to `mousemove`, `touch-action: none` on the canvas only), which is the control scheme the game actually wants. Canvas is presented full-bleed at 16:10 in a DOM overlay rather than in-world, because reading a 640×400 texture on a perspective quad at 390 px is not a game.
- **Pixel Quest: not playable on touch.** A WASD-driven room with proximity dialogue needs a d-pad, and an on-screen d-pad over a 390 px viewport is worse than nothing. Mobile gets a **6-second silent looping MP4/WebM** of real play with a `poster` first frame, `playsinline`, click-to-play, plus the full mechanics copy in text. This is stated on the page in one line, not hidden.
- Low tier (§ 8) gets the same treatment as mobile regardless of viewport width.

---

## 6. Visual system

### 6.1 Typography

**Two families, no exceptions.**

**Satoshi** (Indian Type Foundry, via Fontshare) — display and body. Variable, weight axis 300–900. Verified available at `https://www.fontshare.com/fonts/satoshi` (HTTP 200). It is **not** on Google Fonts and there is **no** npm package; it is downloaded once and **self-hosted** from `/public/fonts/`. Licence: Fontshare's free-for-commercial licence — the licence file ships in `/public/fonts/` alongside the woff2.

**JetBrains Mono** — depth readout, coordinates, file paths, diagram labels, protocol names, game score. Installed as `@fontsource-variable/jetbrains-mono@5.3.0` (verified on the npm registry), self-hosted from the package's woff2, weight axis 100–800.

**Loading strategy:**
- Two files only: `Satoshi-Variable.subset.woff2` and `JetBrainsMono-Variable.subset.woff2`.
- **Subsetting** with `glyphhanger` against the built HTML: Latin basic + Latin-1 punctuation + `₹` (ProAcademys pricing) + `·` `—` `→` `↩` `⏎` (gauge, diagrams, key hints). Expected ~68–75 % byte reduction; **budget ≤ 28 KB each, ≤ 56 KB total**.
- `<link rel="preload" as="font" type="font/woff2" crossorigin>` on both, in the document head, before any CSS.
- `font-display: swap` on both.
- `@font-face` fallback metric overrides so swap causes **zero** layout shift: Satoshi falls back to `system-ui` with `size-adjust: 101%`, `ascent-override: 96%`, `descent-override: 24%`; JetBrains Mono falls back to `ui-monospace` with `size-adjust: 100%`. Verified by asserting CLS ≈ 0 in the Lighthouse run of § 8.
- **No FOIT.** The hero line is the LCP element and must paint in the fallback face if the woff2 is late.

### 6.2 Palette

| Hex | Token | Role |
|---|---|---|
| `#06080B` | `--void` | Renderer clear colour, page background, deepest fog |
| `#0E1116` | `--field` | Game canvas field, code-block background |
| `#10151C` | `--strata` | Panel fills, exhibit cards, bedrock plane |
| `#1B2430` | `--hairline` | 1 px borders, grid lines, diagram strokes, dividers |
| `#EDF1F5` | `--light` | Primary text, key light colour |
| `#8FA0B0` | `--muted` | Secondary text, labels, diagram non-focal nodes, captions |
| `#8FD3FF` | `--surface-accent` | **Web layer.** Cool glass. Also the global focus ring. |
| `#FFC46B` | `--device-accent` | **App layer.** Warm screen glow. |
| `#FF5F56` | `--engine-accent` | **Game layer.** Wireframe / collider red. |
| `#C8FF6A` | `--reasoning-accent` | **AI layer.** Activation green. |

**Accent roles are structural, not decorative.** The active layer accent drives, simultaneously: (a) the travelling point light's colour in the 3D scene, (b) `--accent` in CSS, which colours every link underline, focus ring on non-canvas controls, active gauge tick, panel rule, and diagram focal stroke within that layer. There is exactly **one** accent live at any depth. Nothing on the site is accented in a colour that does not correspond to where the camera is.

**Contrast, verified targets:** `--light` on `--void` = 16.1:1. `--muted` on `--strata` = 6.3:1. Every accent on `--strata` clears 4.5:1 (`#8FD3FF` 9.4:1, `#FFC46B` 9.9:1, `#FF5F56` 5.0:1, `#C8FF6A` 12.8:1). `#FF5F56` is the tightest and is therefore **never** used for body text — only for strokes, the ball, and ≥ 20 px headings, where 3:1 applies.

### 6.3 Type scale

Base 16 px, ratio 1.25 (major third), rounded to whole px.

| Token | px | Family / weight | Use |
|---|---:|---|---|
| `--t-xs` | 12 | Mono 400 | Depth gauge, diagram labels, captions |
| `--t-sm` | 14 | Mono 400 / Satoshi 400 | File paths, metadata, game score |
| `--t-base` | 16 | Satoshi 400, `line-height: 1.6` | Body copy |
| `--t-md` | 20 | Satoshi 500 | Panel section headings, one-line theses |
| `--t-lg` | 25 | Satoshi 600 | Project titles |
| `--t-xl` | 31 | Satoshi 600 | Layer names |
| `--t-2xl` | 49 | Satoshi 700, `line-height: 1.08`, `letter-spacing: -0.02em` | Hero, mobile |
| `--t-3xl` | 61 | Satoshi 700, `line-height: 1.04`, `letter-spacing: -0.025em` | Hero, ≥ 1024 px |

Measure is capped at **68ch** for body copy. Panel copy at 5 columns lands at ~54ch, which is the target.

### 6.4 Spacing and grid

- **Base unit 4 px.** The scale for component-internal spacing is `4, 8, 12, 16, 24, 32, 48, 64, 96, 128` (nothing else); page grid margins (`20 px`, `40 px`, `72 px`) are a deliberate documented exception.
- **Desktop ≥ 1024 px:** 12 columns, `72 px` page margin, `24 px` gutter. The DOM overlay panel occupies **columns 8–12**. The canvas is full-bleed behind it. The depth gauge is fixed at the **left** edge, `24 px` in, vertically centred, `48 px` wide.
- **Tablet 640–1023 px:** 8 columns, `40 px` margin. Panel = columns 4–8.
- **Mobile < 640 px:** single column, `20 px` margin. Panel = full-width bottom sheet, 92 vh, with a drag handle. Gauge moves to a **horizontal** rail pinned to the top edge, 32 px tall.
- Vertical rhythm inside panels: `24 px` between blocks, `48 px` between sections, `12 px` between a heading and its body.

### 6.5 Material language per layer

Restrained and physically motivated. One shared HDR environment (`.hdr` → `EquirectangularReflectionMapping`, **downscaled to 512 × 256**, ~180 KB as KTX2) for the whole site.

| Layer | Material | Concrete parameters |
|---|---|---|
| Surface | Thin frosted glass | `MeshPhysicalMaterial { transmission: 0.9, thickness: 0.4, roughness: 0.08, ior: 1.45 }`. Mid tier drops `transmission` → `MeshStandardMaterial { opacity: 0.55, transparent: true }` (transmission needs an extra scene render; not affordable below high tier). |
| Device | Brushed aluminium + emissive OLED | Body `{ metalness: 0.95, roughness: 0.28 }`; interior grid `MeshBasicMaterial` emissive-equivalent in `#FFC46B` |
| Engine | Untextured matcap + wireframe | `MeshMatcapMaterial` with one shared 256² matcap; `WireframeGeometry` in `#FF5F56`. Zero image textures at this layer, which is the point — the scene is showing its guts. |
| Reasoning | Additive points and thin lines | `PointsMaterial`/`ShaderMaterial` `{ blending: AdditiveBlending, depthWrite: false, transparent: true }` |

No `backdrop-filter` anywhere on the site. No box-shadow on any DOM element. Elevation is communicated by fill value and 1 px hairlines only.

---

## 7. Motion spec

Libraries: **Lenis 1.3.26** (scroll normalisation with `autoRaf: true`), **View Transitions API** (0 KB, native, panel routing). No others. `motion` (removed: replaced with native CSS transitions), `gsap`, `@gsap/react`, and `@react-three/drei` are explicitly absent.

| # | Element | Trigger | Library / mechanism | Duration & easing | `prefers-reduced-motion: reduce` fallback |
|---:|---|---|---|---|---|
| 1 | Camera descent (`camera.position.y`) | Document scroll | `useFrame` exponential settle (`tau ≈ 0.12 s`) | Scrubbed; catch-up ≈ 600 ms critically damped exponential settle | **Smoothing disabled.** Camera position `t` is assigned directly to target. Scroll becomes ordinary paging between 4 static views. |
| 2 | Lateral drift (`x`, `z`) | Document scroll | Same scroll target, Catmull-Rom sample | Scrubbed | Set to `(0, 0)` permanently |
| 3 | Scroll normalisation | Wheel / touch | Lenis (`autoRaf: true`), `lerp: 0.09`, `wheelMultiplier: 1` | — | **Lenis is never instantiated.** Native scroll only. |
| 4 | Screen pass-through | `camera.y ∈ (−36, −40]` | Render-target swap (§ 2.6) | Scrubbed with the camera | **Does not exist.** Hard cut from the Surface preset to the Device preset. |
| 5 | Fog colour + density | Scroll progress | Per-frame `scene.fog` lerp | Scrubbed, smooth across boundaries | Set instantly per preset |
| 6 | Layer light-temperature shift | Layer boundary crossing | Per-frame `Color.lerp` on `pointLight.color` | ~700 ms smooth lerp | Set instantly |
| 7 | Directional light decay | Scroll progress | Per-frame linear lerp on `intensity` | Scrubbed, linear | Set instantly per preset |
| 8 | Exhibit card in/out | `|camera.y − exhibit.y| < 6 m` | Native CSS transition, `opacity` + `translateY(8px → 0)` | 240 ms `easeOut` | Opacity only, 0 ms |
| 9 | Detail panel open/close | Click / `Enter` / route change | Native CSS transition (`opacity` + `translateX(24px → 0)` desktop, `translateY(24px → 0)` mobile); View Transitions for the route | 300 ms `easeOut` | Opacity only, 0 ms. View Transitions are skipped automatically by the browser. |
| 10 | Mesh hover highlight | Pointer raycast | Three.js emissive lerp, 120 ms | 120 ms linear | **Kept.** Pointer-driven and instant; it is feedback, not decoration. |
| 11 | Node-field pulse (Reasoning) | Continuous | Three.js shader `uTime` uniform | Continuous, 0.4 Hz | **rAF stopped.** One static frame, field frozen mid-pulse. |
| 12 | Collider-ghost drift (Engine) | Continuous | Vertex-shader time uniform | Continuous | Frozen |
| 13 | Trace path illumination | Trace step selected | Per-frame line material opacity lerp | 200 ms | Instant |
| 14 | Depth-gauge numerals | Every frame the depth changes | Direct `textContent` write, throttled to whole metres | — | **Kept.** It is a readout, not an animation. Never a count-up tween. |
| 15 | Game canvases | Explicit activation only | Own rAF, fixed timestep (§ 5.1) | 60 Hz sim | **Not auto-started; already true.** Playable if the user chooses — see note below. |
| 16 | Hero canvas fade-in under the hero text | `requestIdleCallback` after LCP | CSS `opacity` transition | 400 ms linear | 0 ms (or no canvas at all on low tier) |

**Deliberate deviation — Detail panel motion axis split.** The panel transition uses `translateX(24px)` on desktop (≥ 1024 px, 5-column side panel) and `translateY(24px)` on mobile (< 1024 px, 92 vh bottom sheet) at 300 ms `ease-out`. The original uniform horizontal translation was a defect; translating a mobile bottom-sheet panel vertically matches its slide-up positioning while preserving the 24 px spatial offset distance from desktop.

**Global reduced-motion behaviour.** One `matchMedia('(prefers-reduced-motion: reduce)')` check at boot sets `document.documentElement.dataset.motion = 'off'`, and it is **live** — the `change` listener re-applies without a reload. When off:

1. **The continuous rAF loop is killed entirely.** The renderer switches to **on-demand mode**: exactly one `renderer.render()` per state change (scroll settles onto a new preset, panel opens, hover changes). Idle GPU cost is zero. This fixes the accessibility requirement and the mobile-battery problem with a single switch.
2. Camera smoothing is disabled (target `t` applied directly per frame) and Lenis is not created. Scroll snaps between the four layer datums with native `scroll-snap-type: y mandatory` on a 4-panel container. One scroll event invalidates exactly one frame, keeping `frameloop="demand"` honest.
3. All Motion durations collapse to 0 (they read `data-motion`).
4. Every CSS transition and animation is zeroed by a single global rule under `@media (prefers-reduced-motion: reduce)`.
5. **The games are the deliberate exception.** They remain playable, because a game the user explicitly started is requested motion, not imposed motion. But they are never auto-started, the exhibit card reads *"Playing this starts an animation"*, and their rAF loop stops the instant the game is released (§ 5.3).

---

## 8. Performance budget & mobile tiering

### 8.1 Named targets

Measured on the reference device — **mid-range Android, 4× CPU throttle, Slow 4G (1.6 Mbps / 150 ms RTT)** — via Lighthouse mobile, and on a 2020 MacBook Air (M1) for the desktop column.

| Metric | Mobile (low tier) | Mobile (mid tier) | Desktop (high tier) |
|---|---:|---:|---:|
| **LCP** | ≤ 2600 ms * | ≤ 1.8 s | ≤ 1.2 s |
| **FCP** | ≤ 1.0 s | ≤ 1.2 s | ≤ 0.8 s |
| **TTI** | ≤ 2700 ms * | ≤ 3.0 s | ≤ 2.0 s |
| **CLS** | ≤ 0.01 | ≤ 0.01 | ≤ 0.01 |
| **INP** | ≤ 200 ms | ≤ 200 ms | ≤ 120 ms |
| **JS transferred, initial route** | ≤ 180 KB gz | ≤ 180 KB gz | ≤ 180 KB gz |
| **JS transferred, deferred 3D chunk** | **0 KB** | ≤ 250 KB gz | ≤ 250 KB gz |
| **Total JS, all chunks** | ≤ 180 KB gz | ≤ 430 KB gz | ≤ 430 KB gz |
| **Texture budget (GPU)** | 0 | ≤ 1.4 MB | ≤ 2.5 MB |
| **Scene asset transfer** | ≤ 380 KB (stills) | ≤ 1.6 MB | ≤ 2.8 MB |
| **Draw calls** | 0 | ≤ 60 | ≤ 120 |
| **Resident triangles** | 0 | ≤ 90 k | ≤ 180 k |
| **Target FPS** | n/a | **45 fps floor**, 60 target | **60 fps**, no frame > 20 ms |
| **Lighthouse Performance** | ≥ 98 | ≥ 90 | ≥ 95 |
| **Lighthouse Accessibility** | 100 | 100 | 100 |

* Measured Next 16 + React 19 framework floor under simulated Slow 4G for zero-client-component static export (see `docs/measurements.md`).

The initial-route budget of 180 KB gz is the *whole* first paint: Next runtime + React + the static DOM (measured at 173.3 KB gz in Phase 4 as the Next 16 + React 19 framework floor plus ~2 KB of initial app client JS, replacing the earlier 175 KB baseline to provide ~6.7 KB of slack for Phase 5/6 client features; real initial route JS measured at 143.4 KB gz after excluding 38.6 KB `noModule` core-js polyfills). **No Three.js, no Lenis is in it.** The 3D chunk is dynamically imported after `requestIdleCallback` and only on mid/high tier.

Enforcement: a `size-limit` (or `next build --analyze`) check in CI fails the build if the initial route exceeds 180 KB gz or the 3D chunk exceeds 250 KB gz. This is the one CI gate that matters.

### 8.2 Tier detection

Run once, synchronously, before the 3D import decision. Never re-run on resize.

```
score = 0
if (navigator.hardwareConcurrency ?? 2) >= 8        score += 2
else if (navigator.hardwareConcurrency ?? 2) >= 4   score += 1
if ((navigator.deviceMemory ?? 2) >= 8)             score += 2
else if ((navigator.deviceMemory ?? 2) >= 4)        score += 1
if (matchMedia('(min-width: 1024px)').matches)      score += 1
if (matchMedia('(pointer: fine)').matches)          score += 1
if (devicePixelRatio <= 2)                          score += 1
if (navigator.connection?.saveData)                 score  = -99
if (!webglSupported())                              score  = -99
if (prefersReducedMotion)                           score  = min(score, 3)

tier = score >= 6 ? 'high' : score >= 3 ? 'mid' : 'low'
```

- `webglSupported()` = a real `canvas.getContext('webgl2') ?? getContext('webgl')` probe on a 1×1 canvas, immediately discarded. Not a UA string. Never a UA string.
- `saveData` and no-WebGL both force low tier unconditionally.
- **Manual override:** a persistent link in the footer, *"Prefers the still version? Switch."*, writes `localStorage.substrate-tier` and reloads. The override is read before the score. Any visitor can escape any tier we guessed wrong.

**Tier deltas:**

| | low | mid | high |
|---|---|---|---|
| Three.js shipped | **no** | yes | yes |
| DPR cap | — | 1.5 | 2.0 |
| Antialias | — | off (FXAA-free; hairlines are geometry, not shaders) | MSAA 4× |
| Render target for pass-through | — | half resolution | full resolution |
| Glass transmission | — | replaced by opacity | on |
| Node-field points | — | 2 400 | 6 000 |
| Shadows | — | none | none (site-wide; no shadow maps at any tier) |
| Post-processing | — | none | none (site-wide) |

There is deliberately **no post-processing pass and no shadow map at any tier**. Both are how a WebGL portfolio ends up at 22 fps, and neither would add anything the fog and the accent lights are not already doing.

### 8.3 What low tier renders

**Zero bytes of Three.js.** The 3D chunk is behind a dynamic `import()` that low tier simply never reaches; the WebGL code is not in the initial bundle for anyone, so low tier's total JS is the 180 KB gz initial route and nothing else.

Low tier renders the **static path**: a vertical stack of five full-bleed sections (Surface, Device, Engine, Reasoning, Bedrock), each headed by a **pre-rendered still exported from the real scene** — so the page still looks like the site rather than a different site. Stills are baked at build time from the high-tier scene at the four datums plus one at −38 m (the phone from above, immediately before the pass-through, which is the single most legible frame in the whole descent). Five AVIF images, 1600 px wide, `≤ 70 KB` each, `≤ 380 KB` total, `loading="lazy"` past the first.

**The DOM content is byte-identical across all three tiers.** Same headings, same copy, same project panels, same diagrams (the diagrams are inline SVG, not WebGL), same links, same routes, same résumé, same contact. The only thing low tier loses is the travel. Pong is still playable — it is Canvas 2D, not WebGL, and it costs nothing. Pixel Quest falls back to its video (§ 5.5).

This is checked, not assumed: a build-time assertion diffs the rendered text content of the high-tier route tree against the low-tier route tree and fails on any difference.

---

## 9. Accessibility

Target: **WCAG 2.2 AA**, Lighthouse Accessibility 100 on every route and at every tier.

### 9.1 Static DOM mirror

The canvas is decorative — `aria-hidden="true"`, `role="presentation"`, `tabindex="-1"` — and **every single thing it shows exists in the DOM as real, readable, focusable content.** Not a summary of it. The content.

Structure: `<main>` contains five `<section>` landmarks (`aria-labelledby` on each layer's `<h2>`). Each section contains its exhibits as `<article>`s with the full detail-panel content — title, thesis, engineering decisions with file paths, scale numbers, links, and the architecture diagrams as inline `<svg role="img">` with `<title>` and `<desc>`. On mid/high tier this content is visually positioned as the panel (and hidden from sight only when the panel is closed, via `content-visibility` — never `display: none` on focusable descendants and never `aria-hidden`); on low tier it is the page.

Consequence: the site is fully usable, indexable, and readable with the canvas absent. That is the acceptance criterion, and it is testable by deleting the canvas element in devtools and re-running the whole flow.

### 9.2 Keyboard route through the descent

A visitor completes the entire site with `Tab` and `Enter`. No exceptions, no mouse-only affordances.

- **Tab order** = document order = depth order. Skip link → depth-gauge stops (4) → Surface exhibits (2) → Device exhibit (1) → Engine exhibits (2, each "Play …") → Reasoning exhibit + trace steps → Bedrock (résumé, email, GitHub, LinkedIn) → footer tier toggle.
- **Focusing any exhibit proxy scrolls the document to that exhibit's depth**, using `scroll-behavior: smooth` (or `auto` under reduced motion). Focus never lands somewhere the camera is not.
- **Shortcuts (single keys, active only when focus is on `<body>` or a non-input element):** `1`–`4` jump to layer datums, `↑`/`↓` step ±10 m, `Home`/`End` to Surface/Bedrock. All are additive; the site is complete without them. They are listed in a static "Keyboard" block on the Bedrock section — no modal, no `⌘K` palette (non-goal 9).
- **No key is ever swallowed** outside an explicitly captured game canvas (§ 5.3), and even there `Tab` and `Escape` always work.

### 9.3 Focus management

- Global focus ring: `outline: 2px solid #8FD3FF; outline-offset: 3px`. Never removed, never `outline: none` without a replacement of equal or better visibility. It is `--surface-accent` at every depth rather than the layer accent, because a focus ring that changes colour is a focus ring people stop recognising.
- Panel open: focus moves to the panel's `<h2>` (`tabindex="-1"`), the panel is `role="dialog" aria-modal="true"` with `aria-labelledby`, focus is trapped inside it, and the canvas + background sections get `inert`.
- Panel close (`Esc`, button, or browser back): focus returns to the exact trigger element.
- `:focus-visible` for pointer users, `:focus` semantics preserved for keyboard.
- Route changes announce the new page title into a polite live region, because App Router navigation does not move focus by itself.

### 9.4 Reduced motion

Full behaviour in § 7. Summary: continuous rAF killed, renderer on-demand, camera snapped to 4 presets, native scroll-snap paging, all DOM transitions 0 ms, games still available but never auto-started.

### 9.5 No-JS and no-WebGL

- **No JS:** the initial HTML response already contains the hero, all five sections, all project copy, all diagrams (inline SVG), all links, the résumé link, and the contact details. It is served static from Next's App Router with the descent as progressive enhancement. Without JS the site is a long, correct, readable document. Nothing is behind a click that is not also in the markup.
- **No WebGL / context creation failure:** `webglSupported()` returns false → tier `low` → the static path, which is that same document with the five pre-rendered stills. Additionally `renderer.domElement.addEventListener('webglcontextlost')` tears down the scene, restores document scroll, and swaps in the static path **without a reload** — a lost context degrades, it never blanks.
- **`<noscript>`** contains one line: a link to the résumé PDF and the email address. Everything else is already in the markup above it.

---

## 10. Information architecture & routing

### 10.1 URL structure

Next 16 App Router, statically rendered. Every URL below is a real, crawlable, server-rendered document.

| URL | Content |
|---|---|
| `/` | The descent, entered at `t = 0` (Surface) |
| `/layer/surface` | Descent, entered at `t = 0.030` (`y = 0`) |
| `/layer/device` | Descent, entered at `t = 0.300` (`y = −40`) |
| `/layer/engine` | Descent, entered at `t = 0.600` (`y = −120`) |
| `/layer/reasoning` | Descent, entered at `t = 0.870` (`y = −260`) |
| `/project/deployment-platform` | Surface depth `y = −2`, panel open |
| `/project/proacademys` | Surface depth `y = −8`, panel open |
| `/project/gamezone` | Device depth `y = −52`, panel open |
| `/project/pong` | Engine depth `y = −124`, panel open |
| `/project/pixel-quest` | Engine depth `y = −134`, panel open |
| `/project/switchboard` | Reasoning depth `y = −278`, panel open |
| `/about` | Bedrock content as a standalone document (bio, portrait, institution) |
| `/resume` | Résumé page: embedded PDF + a prominent direct download of `/malay-chaudhary-resume.pdf` |
| `/#contact` | Anchor on Bedrock. Not a route — contact is four links, not a page. |

Deliberately **not** routes: no `/projects` index (the descent is the index — a grid would reintroduce non-goal 2), no `/blog`, no `/uses`.

### 10.2 Deep-link load behaviour

Direct load of `/project/gamezone`:

1. Server returns the full static document with the GameZone `<article>` present and the panel in its open state. LCP is text, as always.
2. Tier detection runs.
3. **Low tier:** the page is already correct. Browser scrolls to the GameZone section anchor. Done. No further work.
4. **Mid/high tier:** the 3D chunk loads. On first frame the scroll position is set **without animation** to `t(−52) * S` and the camera is placed at `y = −52` directly. The visitor arrives *at* the depth; they never watch a 52-metre auto-flight they did not ask for.
5. Scrolling up from a deep link works normally and the pass-through plays in reverse, because `depth(t)` is a pure function of scroll and the render-target swap is symmetric (§ 2.6 — pass B is re-enabled on the way up at the same `y = −40` threshold).

Client-side navigation between layers/projects uses the View Transitions API for the panel morph and `window.scrollTo` for the depth change (smooth, or `auto` under reduced motion), so the camera follows via the same scroll target mechanism it always uses. **There is no separate "fly to" code path.** One mechanism, exercised by every entry point.

Scroll restoration is `manual`; the app restores from the route's `t` rather than from the browser's remembered pixel offset, because the document height depends on viewport height.

### 10.3 About / résumé / contact placement

- **About** lives at Bedrock (`−300 m`) and at `/about`. Same DOM, two entry points. It contains: name, *B.Tech CSE, IIIT Naya Raipur*, the portrait (used exactly once on the site, § 3.4), a short bio in prose, and the four-layer thesis restated in one paragraph.
- **Résumé** appears in three places, all pointing at the same static `/malay-chaudhary-resume.pdf`: the hero (a text link under the hero line, in the first HTML response), the Bedrock section, and `/resume`. Asset pending (§ 12).
- **Contact** is four links at Bedrock: `malayrc276@gmail.com`, `github.com/malllayyyy`, `linkedin.com/in/malay-chaudhary-959077328/`, and the résumé. **No contact form.** A form on a personal site is a mailto with extra steps and a spam surface.

### 10.4 SEO & OG metadata

- Per-route `generateMetadata` with a unique `<title>` and description for `/`, each `/layer/*`, each `/project/*`, `/about`, `/resume`.
- `<title>` pattern: `Malay Chaudhary — Substrate` on `/`; `deployment-platform — Malay Chaudhary` on project routes.
- Meta description on `/`: see § 13.2 (pending owner choice).
- **OG images:** one per route, generated at build time with Next's `ImageResponse` (`opengraph-image.tsx`), 1200 × 630, on `--void` with the route's layer accent, in Satoshi — a depth readout, the layer name, and the project title. Not screenshots; the site's own visual language. Six project cards + five layer cards + one root card.
- `twitter:card = summary_large_image`.
- **JSON-LD:** one `Person` on `/` (`name`, `alumniOf: IIIT Naya Raipur`, `sameAs: [GitHub, LinkedIn]`, `email`), and one `SoftwareSourceCode` per project route with `codeRepository` set only where a public repo exists (`deployment-platform`, `swtchboard`) — omitted, not faked, for the private ones.
- `sitemap.xml` and `robots.txt` generated from the route table above. Canonical URLs on every route.
- `theme-color: #06080B`.

---

## 11. Tech stack & dependencies

The owner already ships `three ^0.185.1` in `deployment-platform`'s dashboard (`apps/dashboard`), and `react ^19.2.8` + `vite` + `tailwindcss ^4.3.3` in the ProAcademys client. **Nothing in this stack is new to him except Lenis and Motion**, which are 4 KB and 18 KB respectively and have one API surface each. (`gsap`, `@gsap/react`, and `@react-three/drei` were removed during Phase 6 bundle budget optimization to ensure the 3D chunk stays strictly under 250 KB gz).

All versions below were resolved against the npm registry, not recalled.

| Package | Version | Cost (gz, tree-shaken) | Why |
|---|---|---:|---|
| `next` | 16.3.4 | — (in baseline) | Static rendering gives real HTML text as the LCP element with zero hydration dependency — the precondition for §§ 8, 9 |
| `react` / `react-dom` | 19.2.8 | ~88 KB (baseline, both) | Required by Next 16; also the version already used in the ProAcademys client |
| `three` | 0.185.1 | ~150 KB | The scene. Exact version already in `deployment-platform`. |
| `@react-three/fiber` | 9.7.0 | **76.5 KB** | Every 3D object becomes a React component with a paired DOM proxy. Note: R3F costs 76.5 KB gz because it bundles its own `react-reconciler` — a 46.5 KB underestimate that caused the 250 KB 3D-chunk budget breach until GSAP and Drei were dropped. |
| `lenis` | 1.3.26 | ~4.3 KB | Normalises wheel deltas across trackpads so a scrubbed camera does not stutter (`autoRaf: true`). Not created at all under reduced motion (§ 7). |
| `motion` | 13.2.0 | ~18 KB | DOM panels and cards only. Reads `data-motion` for the reduced-motion collapse. Never used for the camera. |
| `tailwindcss` | 4.3.3 | 0 KB runtime | The hairline/grid system. Same major version as the ProAcademys client. |
| `@fontsource-variable/jetbrains-mono` | 5.3.0 | 0 KB JS | Self-hosted woff2 + CSS; the file is subset at build time (§ 6.1) |
| Satoshi | Fontshare (self-hosted `.woff2`) | 0 KB JS | No npm package exists; downloaded once into `/public/fonts/`, licence file alongside |

**Initial route: ~180 KB gz** limit (real initial route JS measured at **143.4 KB gz** after excluding 38.6 KB `noModule` core-js polyfills). **Deferred 3D chunk: ~239.4 KB gz** (`three` 152.2 KB + `@react-three/fiber` 76.5 KB + `lenis` 4.3 KB + app `src/three/**` 8.3 KB + `RoomEnvironment` 1.1 KB), dynamically imported after `requestIdleCallback`, mid/high tier only.

**Assets:** GLTF with **Draco** compression (the phone body is the only GLTF on the site); textures as **KTX2/Basis**; one 512 × 256 HDR environment. Per-layer lazy loading keyed to `t`. Total scene assets ≤ 2.8 MB.

**Explicitly not used:** no `@react-three/postprocessing` (no post pass at any tier, § 8.2), no physics engine (nothing on the site simulates rigid bodies), no state-management library (the only global state is `t`, `tier` and the open panel — three values, `useSyncExternalStore` over one scroll subscription), no icon library (the site has fewer than ten icons; they are inline SVG), no UI component library, no analytics beyond Vercel's built-in Web Analytics.

**Hosting:** Vercel. Static output plus `ImageResponse` OG generation at build time. No serverless functions, no database, no runtime environment variables.

---

## 12. Content inventory & owner-supplied assets

Status legend: **✅ verified** (exists and is confirmed) · **✍ to write** (copy that must be authored against verified facts) · **🎨 to produce** (asset to be created during the build) · **⏳ owner** (blocked on Malay).

| # | Item | Source | Status |
|---:|---|---|---|
| 1 | Hero line | § 13.1, Candidate A chosen | ✅ decided |
| 2 | Meta description / positioning line | § 13.2, Candidates 2 & 3 chosen | ✅ decided |
| 3 | Name, degree, institution (IIIT Naya Raipur) | Locked decisions | ✅ verified |
| 4 | Email `malayrc276@gmail.com`, GitHub `malllayyyy`, LinkedIn `malay-chaudhary-959077328` | Locked decisions | ✅ verified |
| 5 | Custom domain | `malaychaudhary.dev` | ✅ decided |
| 6 | **Résumé PDF** → `/public/malay-chaudhary-resume.pdf` | Owner | ⏳ owner — **link slot built and live from Phase 1**; until the file lands the link points to `/resume`, which states plainly that the PDF is coming and gives the email. No dead link ships. |
| 7 | **Portrait photo**, 1 image, ≥ 1200 px square, used once at −286 m | Owner | ⏳ owner — until supplied, the slot renders as a flat `--strata` block with the name and institution set in Satoshi, which is a legitimate design, not a broken image |
| 8 | `deployment-platform` facts (7 packages, 4 tables, 10 endpoints, ~2 200 LOC, 3 decisions + file paths) | `docs/projects.md` § 1 | ✅ verified |
| 9 | ProAcademys facts (37 → 20 collections, ~8 500 LOC, ~30 endpoints, 3 decisions + file paths) | `docs/projects.md` § 3 | ✅ verified |
| 10 | GameZone facts (7 tables, ~15 endpoints, ~3 500 LOC, 4 pragmas, rollover rule) | `docs/projects.md` § 4 | ✅ verified |
| 11 | Switchboard facts (5 + 7 protocol types, ~1 800 LOC, 0 tables, 3 decisions + file paths) | `docs/projects.md` § 2 | ✅ verified |
| 12 | Pong engine facts (305 LOC, deflection maths, 3.5 % accel, AI deadzone, `WINNING_SCORE = 7`) | `C:/portfolio website/games/pong.js`, `docs/games.md` | ✅ verified |
| 13 | Pixel Quest engine facts (431 LOC, axis-separated AABB, `0.7071` normalisation, `wrapText`) | `C:/portfolio website/games/rpg.js`, `docs/games.md` | ✅ verified |
| 14 | 8 ProAcademys screenshots in `assets/raw/proacademys/` | `docs/live-capture.md` | ✅ verified |
| 15 | GameZone launcher icon `ic_launcher.png` | `docs/projects.md` § Required Asset Copy | ✅ verified |
| 16 | ProAcademys live URL `https://proacademys-client.vercel.app/` | `docs/live-capture.md` (fetched, 6 courses served) | ✅ verified |
| 17 | Public repo URLs (`deployment-platform`, `swtchboard`) | `docs/live-capture.md` | ✅ verified |
| 18 | Per-layer thesis lines (4) | § 3 | ✍ to write — drafted in § 3, needs a pass |
| 19 | Per-project panel copy (6 × ~200 words) | Facts in `docs/projects.md` | ✍ to write |
| 20 | The "engines are gone" history sentence | § 3.3 | ✍ to write — drafted |
| 21 | `deployment-platform` architecture SVG (≤ 12 nodes) | § 4.3 Diagram 1 | 🎨 to produce |
| 22 | GameZone architecture SVG (≤ 12 nodes) | § 4.3 Diagram 2 | 🎨 to produce |
| 23 | Phone body GLTF, Draco, ≤ 9 k tris | § 2.3 | 🎨 to produce |
| 24 | HDR environment, 512 × 256, KTX2 | § 6.5 | 🎨 to produce |
| 25 | 256² matcap for the Engine layer | § 6.5 | 🎨 to produce |
| 26 | 5 pre-rendered layer stills for low tier (AVIF, ≤ 70 KB each) | § 8.3 | 🎨 to produce — baked from the real scene, so blocked on Phase 4 |
| 27 | Pixel Quest gameplay clip, 6 s silent loop, MP4 + WebM + poster | § 5.5 | 🎨 to produce — recorded from the finished port |
| 28 | 12 OG images (1200 × 630) | § 10.4 | 🎨 to produce — generated at build |
| 29 | Subset `Satoshi-Variable.subset.woff2` + Fontshare licence file | § 6.1 | 🎨 to produce |
| 30 | Switchboard recorded trace (one real session) | DEFERRED — exhibit ships without trace replay | ⏳ DEFERRED |

Nothing on this list blocks Phase 1 or Phase 2. Items 6 and 7 are the only owner blockers, both have honest interim states, and neither can produce a broken link or a broken image.

---

## 13. Hero and positioning candidates

### 13.1 Three candidate hero lines

All three are set in Satoshi 700 at `--t-3xl`, static HTML in the first response, above the canvas, and are the LCP element. Each is followed by the same standing sub-line and the résumé link.

> **A. (CHOSEN)** *"I wrote the thing that deploys the thing. Then I went further down."*
> **Rationale:** leads with `deployment-platform` — the only project where the artefact is infrastructure other people's sites run on — and the second sentence *is* the site's mechanic, so the scroll cue needs no explanation. Grounded in `docs/projects.md` § 1.

> **B. (CHOSEN SUB-LINE)** *"Four layers of the same stack: a deploy platform, a 37-table migration, two game engines, and a control plane for AI agents."*
> **Rationale:** the most literal and the most defensible — every clause is a verified number or artefact (`deployment-platform`, ProAcademys' 37 MySQL tables → 20 collections, `pong.js` + `rpg.js`, `swtchboard`). It states the four-domain range without ever using the word "full-stack". Longest of the three; sets at three lines on desktop.

> **C. (RESERVED)** *"Web, app, game, agent. I don't switch between them — I stack them."*
> **Rationale:** shortest and the most quotable; states the positioning ("modern developer who builds games, websites, applications, software") and rejects the generalist read in the same breath. Weakest on evidence, strongest on recall — it works if the descent immediately supplies the proof, which it does within one screen.

**Decision:** Candidate **A** is **CHOSEN** for the main hero line, with candidate **B** as the sub-line beneath it. Candidate **C** is reserved for the LinkedIn headline and OG card only.

Standing sub-line under whichever is chosen (not itself pending): *"B.Tech CSE, IIIT Naya Raipur. Scroll to descend — four layers, one shot."* Plus: `Résumé (PDF)` · `GitHub` · `Email`.

### 13.2 Three candidate positioning / meta-description lines

Each ≤ 155 characters, for `<meta name="description">`, OG description, and the JSON-LD `description`.

> **1.** *"Malay Chaudhary — I build across four layers of the stack: web platforms, cross-platform apps, game engines, and control planes for AI agents."* (146 ch)
> **Rationale:** keyword-complete and literal. Best for search; weakest for a human reading a preview card.

> **2. (CHOSEN — Search / Meta)** *"Malay Chaudhary, B.Tech CSE at IIIT Naya Raipur. A self-hosted PaaS, a MERN rewrite of a legacy platform, two game engines, and an agent switchboard."* (150 ch)
> **Rationale:** every clause is a verified artefact; names the institution, which matters for a student portfolio. Best for a recruiter's preview card.

> **3. (CHOSEN — Social / OG)** *"Web, app, game, agent — four depths of one stack. Portfolio of Malay Chaudhary, told as a single uncut descent through the layers he builds on."* (145 ch)
> **Rationale:** the only one that also sells the site itself, which is the thing most likely to make someone click. Best for social sharing.

**Decision:** Candidate **2** is **CHOSEN** for `<meta name="description">` (search + recruiters), and candidate **3** is **CHOSEN** for the OG/Twitter description (social).

---

## 14. Risks & mitigations

| # | Risk | Why it is real | Mitigation | **Kill-switch** |
|---:|---|---|---|---|
| 1 | **The scene looks amateur.** A mediocre WebGL scene is worse than no WebGL, and this concept has no fallback identity. | Rated the top risk in `docs/concepts.md` § B.8. Lighting, material and pacing quality is not something a spec can guarantee. | Build the **Device layer and the pass-through first, in isolation** (Phase 3), before any other 3D work. Judge it as a standalone prototype on a real phone and a real laptop. | If the pass-through does not feel good as a standalone prototype, **stop and ship the low-tier static path as the whole site.** It is a complete, fast, accessible portfolio with identical DOM content (§ 8.3) — the fallback is already the product, not a consolation. |
| 2 | **The pass-through has a visible seam.** The single moment the entire concept is sold on. | Any mismatch between the RT camera and the main camera shows as a one-frame pop exactly where every viewer is looking. | The mechanic is seam-free *by construction*: one scene, one camera, `Layers` separation, screen-space `gl_FragCoord` sampling (§ 2.6). Plus the frame-diff verification criterion at the end of § 2.6, run in CI on a recorded canvas capture. | Replace the swap with a 180 ms `power2.in` fade-to-`--void`-and-back at `y = −40`. Costs the signature moment, keeps the descent. Decide by end of Phase 3, never later. |
| 3 | **Mobile thermals and memory.** Continuous rAF plus a render target on mid-range Android is a battery and jank hazard. | Flagged in `docs/concepts.md` § B.8. | Tiering (§ 8.2) with a hard 45 fps floor; RT allocated for only ~7 % of the scroll and disposed outside it; DPR capped at 1.5 on mid; zero post-processing and zero shadow maps at every tier; on-demand rendering whenever a panel is open or reduced motion is set. | A runtime watchdog: if the rolling 120-frame mean frame time exceeds **28 ms for 3 consecutive seconds**, drop mid → low **in place** (dispose the renderer, swap in the static path, no reload, no flash) and show the tier-toggle link. The site degrades under its own supervision rather than waiting for the user…
| 4 | **Effort overrun.** `docs/concepts.md` rates this L — 3–6 weeks of evenings — and recommended a different concept partly on that basis. | The concept is locked, so the schedule is the thing that gives. | Phases are ordered so that **every phase ends in something viewable and shippable** (§ 15). Phase 1 alone is a complete portfolio. There is no phase whose failure leaves a broken site. | Ship at whatever phase the calendar reaches. Phases 1, 2, 4, 5 and 6 are each independently deployable to the real domain. |
| 5 | **Two of six projects have no screenshots and no public repo** (GameZone, and `deployment-platform` has no public URL) — a third of the portfolio risks reading as unevidenced. | Verified in `docs/live-capture.md`: `proacademys-client` and `GameZone` return HTTP 404 on GitHub. | Architecture diagrams drawn from the *verified engineering decisions with file-path evidence* (§ 4.3) — a diagram of a real system with real pragma values in it is stronger proof of engineering than a screenshot of a CRUD table. State the privacy in one honest line rather than hiding it. | If the diagrams do not carry their weight, cut GameZone's exhibit to a single paragraph at the Device layer and let the pass-through be the Device layer's entire payload. The layer survives on the moment alone. |

---

## 15. Build phases

Each phase is independently verifiable, ends in something viewable in a browser at a real URL, and is deployable to production as-is.

### Phase 1 — The whole site, static, no WebGL
**Deliverable:** Next 16 App Router project, Tailwind 4, both fonts subset and self-hosted, the full route table (§ 10.1), and every word of content — hero, four layer sections, all six project articles with verified facts and file-path evidence, both architecture SVGs, about, résumé slot, contact. Plain vertical document. No canvas, no `three`, no `gsap`, no `lenis` in `package.json` yet.
**Verifiable by:** Lighthouse ≥ 98 / A11y 100 on mobile; full keyboard pass from skip link to footer; `view-source` contains every heading and every project fact; JS disabled → site still complete; deploy to Vercel and load it on a phone.
**This phase is the kill-switch for Risks 1 and 4.** After Phase 1 the portfolio exists.

### Phase 2 — Static stills, tiering, and the games
**Deliverable:** the tier detector (§ 8.2) with the manual override link; placeholder layer stills (replaced with real bakes in Phase 4); both game engines ported into the site with the fixed-timestep accumulator (§ 5.1), re-skinned (§ 5.2), with capture/release (§ 5.3) and the mobile touch story (§ 5.5); `engine/loop.test.ts` passing.
**Verifiable by:** the loop test (144 Hz vs 60 Hz tick parity, 30-second-jump clamp); play Pong to 7 points with keyboard only and exit with `Escape` and with `Tab`, confirming focus lands correctly both times; play Pong on a phone by dragging; confirm the low tier still ships zero `three`.

### Phase 3 — The pass-through prototype, in isolation
**Deliverable:** a standalone route `/lab/passthrough` containing only the phone monolith, the bezel, the screen quad, the two-pass render, and a scroll from `y = −30` to `y = −44`. Nothing else. No panels, no other layers.
**Verifiable by:** scroll it on a laptop and a mid-range Android; run the frame-diff criterion from § 2.6; hold 60 fps on desktop and 45 fps on the phone. **Go / no-go gate for the entire concept.** If it is not good here, invoke Risk 1's kill-switch and ship Phase 2.

### Phase 4 — The full descent
**Deliverable:** the complete scene — all geometry (§ 2.3), the `depth(t)` mapping (§ 2.2), fog and light falloff (§ 2.4), the exponential settle camera (`tau ≈ 0.12 s`), Lenis, the depth gauge, and the pass-through integrated at its real depth. Bake the five real layer stills from this scene and replace Phase 2's placeholders.
**Verifiable by:** scroll 0 → 1 and back with no stall and no visual discontinuity; depth gauge reads the correct metre at all four datums; `1`–`4` and `↑`/`↓` land exactly on datum depths; reduced-motion toggled mid-session snaps to presets and the rAF loop stops (verify in the performance profiler, not by eye); draw calls ≤ 120 in `renderer.info`.

### Phase 5 — Exhibits, panels, and deep links
**Deliverable:** exhibit meshes wired to their DOM proxies; cards and detail panels with View Transitions; all `/project/*` and `/layer/*` deep links resolving to the right depth with no auto-flight; games mounted at their real depths in the Engine layer; the Switchboard node field wired to the recorded trace.
**Verifiable by:** load every URL in the route table cold and confirm the camera arrives at the specified depth with the correct panel open; Tab through the whole descent and confirm focus and camera never disagree; open a panel and confirm the renderer goes to on-demand (zero GPU work at idle).

### Phase 6 — Budget, polish, domain
**Deliverable:** `size-limit` CI gate wired to the § 8.1 numbers; the frame-time watchdog (Risk 3 kill-switch); OG image generation; sitemap, robots, JSON-LD; the tier-content-parity build assertion (§ 8.3); custom domain cutover; résumé PDF and portrait dropped into their live slots.
**Verifiable by:** the § 8.1 table measured on the reference device and recorded in this document; OG cards previewed in a real link unfurl; content-parity assertion green; every link on the site clicked once, including the two that must *not* exist (GameZone code, GameZone demo).

---

## RESOLVED DECISIONS

**Custom domain — `malaychaudhary.dev`.** Cutover occurs in Phase 6; the site runs on the `.vercel.app` subdomain until then.

**Hero line and positioning copy.** Candidate **A** ("*I wrote the thing that deploys the thing. Then I went further down.*") is chosen for the main hero line, with candidate **B** as the sub-line beneath it. Candidate **2** is chosen for `<meta name="description">` (search) and candidate **3** is chosen for OG/Twitter description (social). Candidate **C** is reserved for the owner's LinkedIn headline and is not used on the site.

**Switchboard trace data — DEFERRED.** The owner is actively building Switchboard. The Reasoning exhibit ships with the 12 protocol message types (5 client + 7 server) as the exhibit. A trace-replay slot must be designed now as a clean drop-in so that a real recorded session can be added later without rework. Synthesised, mocked, or approximated trace data is strictly prohibited — no fake data anywhere in the Reasoning layer.

**Pixel Quest touch controls.** Accepted as specced: Pixel Quest is video-only on touch devices. No on-screen d-pad will be built.

**Reduced-motion default for first-time mobile visitors.** Accepted as specced: first-time mobile visitors start in the descent, relying on the frame-time watchdog to demote to the static path if frame rates drop.
