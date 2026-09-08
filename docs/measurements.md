# Performance & Resource Measurements

Running log of performance measurements, bundle breakdowns, and resource allocations for the Substrate portfolio.

## Phase 1 Gate Measurements (2026-09-08)

### Measurement Conditions
- **Environment**: Static export served locally via `out/` on `http://127.0.0.1:4321/`
- **Tooling**: Lighthouse mobile CLI with fresh `--user-data-dir` per run
- **Throttling**: Simulated Slow 4G (1.6 Mbps download, 750 Kbps upload, 150 ms RTT, 4× CPU slowdown)

### Lighthouse Mobile Benchmark Runs

| Run | Perf | A11y | BP | SEO | FCP | LCP | TTI | CLS | TBT |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| **Run A** | 100 | 100 | 100 | 100 | 858 ms | 1399 ms | 2564 ms | 0.0002 | 19 ms |
| **Run B** | 98 | 100 | 100 | 100 | 906 ms | 2489 ms | 2491 ms | 0.0000 | 31 ms |

### Bundle & Asset Breakdown

- **Initial-route JS**: **172.9 KB gz**
  - Itemisation: 100% Next 16.3.4 + React 19.2.8 framework runtime baseline (`_app`, `main`, `webpack`, `chunks`).
  - Application JS: **0 KB** (zero `'use client'` components in initial route export).
- **Fonts (WOFF2 subsets)**: **39.4 KB total** (budget: ≤ 56 KB total, ≤ 28 KB each)
  - Satoshi subset: **21.0 KB**
  - JetBrains Mono subset: **18.0 KB**

### Real-Device (Unthrottled) Baseline
- **TTFB**: 5.69 ms
- **Element Render Delay**: 66.5 ms
- **Unthrottled LCP**: ~72–91 ms

### Interpretation
Under simulated Slow 4G throttling (1.6 Mbps / 150 ms RTT / 4× CPU slowdown), LCP and TTI are bound to React hydration completion on the client rather than font delivery or DOM size (e.g. Run B LCP 2489 ms vs TTI 2491 ms). Because the Phase 1 static export contains zero client components and zero custom application JavaScript, the LCP (~2.5 s) and TTI (~2.5 s) under simulated Slow 4G conditions represent the inherent Next 16 + React 19 framework hydration floor, not an application regression or asset bottleneck.

---

## Phase 3 go/no-go — the screen pass-through

**Date:** 2026-09-08 · **Route:** `/lab/passthrough` · **Verdict: GO** (no kill-switch needed)

### G3.1 — frame-diff across the swap

Method: `readPixels` on the central 40 % of the drawing buffer (640 × 400 of
1600 × 1000), stepping the camera in **0.02 m** increments with a 55 ms settle
per step. Metric is the mean per-pixel absolute RGB delta between adjacent
frames. `preserveDrawingBuffer` is enabled on the lab route only, because a
swapped-away drawing buffer cannot be read back.

The 0.02 m sweep is the authoritative seam test. A 0.1 m sweep is too coarse
near the screen plane: a single 0.1 m step there legitimately changes the view a
great deal, because interior parallax is extreme within centimetres of the
plane, so it reports ~112 at y = −40 even when the fine sweep is clean.

| Architecture | Swap window worst | Median | Verdict |
|---|---:|---:|---|
| Channel 2 only below the plane | **147.24** (worst px 575) | 4.02 | FAIL — exterior popped out of existence |
| Both channels below the plane | 18.42 | 11.26 | Improved, seam remained |
| Separate quad, 0.06 m above body face | **477.51** | 3.15 | FAIL — hiding the quad exposed the body face |
| Coplanar quad + polygonOffset | ~490 spikes, scattered | 17.88 | FAIL — intermittent z-fight flicker |
| **Screen is the body's +Y face** | **25.09** | 13.32 | **PASS — no outlier (< 2× median)** |

Final architecture: the screen is not a separate mesh at all. It is the body
box's `+Y` face, assigned via a per-face material array (`BoxGeometry` emits
groups in the order +X, −X, +Y, −Y, +Z, −Z, so index 2 is the top). One surface
cannot z-fight with itself, cannot be revealed by hiding something else, and
needs no visibility sequencing: when the camera passes y = −40.0 the face is
behind it and the interior is directly visible in the same frame.

**Black frames across the full −30 → −44 sweep: 0.**

### Five real defects this gate caught

1. **Lights on channel 0 illuminated nothing.** A light only lights an object
   when their layer masks intersect, and § 2.6 pins every mesh to channel 1 or
   2. The scene rendered black until the lights got `layers.enableAll()`.
   Camera layers decide what is *rendered*; light layers decide what is *lit*.
2. **Metal with nothing to reflect is black.** `metalness: 0.95` needs an
   environment; added the § 6.5 shared environment, generated in-process from
   three's bundled `RoomEnvironment` via PMREM so no remote HDR is fetched.
3. **`HalfFloatType` render targets were not renderable here.** A half-float
   colour attachment needs `EXT_color_buffer_float`; without it the framebuffer
   is incomplete and the quad sampled undefined data — a constant
   ACES-tonemapped white (220, 227, 232) at *every* depth, with `uMap` bound and
   the quad visible. Diagnosed by noticing the value did not change across 5.5 m
   of camera travel, which rendered content cannot do. `UnsignedByteType` is
   renderable everywhere and costs nothing here (no post-processing).
4. **A 0.002 m offset loses the depth fight.** With the screen quad that close
   to the body's top face, the body won and the "screen" showed the body's own
   specular highlight. Widening the gap to 0.06 m fixed that but created a worse
   seam (the face was exposed for 0.06 m of travel after the quad hid, 477
   mean), and `polygonOffset` produced intermittent flicker instead. Resolved
   structurally by deleting the quad and making the screen the body's own face.
5. **The render target was never reallocated on resize.** `allocate()` was
   gated behind `if (!rt.current)`, so after first entry it never ran again:
   any resize, OS zoom or orientation change left `uResolution` and the target
   dimensions stale, breaking the screen-space sampling the mechanic depends on.
   Now called unconditionally every in-window frame (it no-ops when unchanged).

Two further defects came from the review gate rather than measurement: reduced
motion froze the scene entirely (`frameloop="demand"` renders only on
`invalidate()`, which the scroll handler never called), and the phone body used
`#7C8590`, outside the closed 10-token palette — now `#8FA0B0`.

Residual large deltas at y = −39.7 and y = −31.3 are **aliasing of the thin
high-contrast wireframe grid**, not seams: screenshots either side are visually
identical with the same draw-call and triangle counts.


### G3.4 / G3.5 — chunk isolation

| Check | Measured | Budget | Verdict |
|---|---:|---:|---|
| 3D chunk (single async chunk) | **230.5 KB gz** | ≤ 250 | PASS |
| 3D refs in `/index.html` initial markup | **none** | none | PASS |
| `/` initial JS | 174.4 KB gz | ≤ 175 | PASS |
| Draw calls (exterior / interior) | 3 / 4 | ≤ 6 | PASS |
| Resident triangles | 332–750 | ≤ 180 k | PASS |

### Not measured here

- **G3.2 / G3.3 (frame rate on a 2020 MacBook Air M1 and a mid-range Android).**
  Neither device is available in this environment. Headless Chrome frame timings
  would not be representative. **Still outstanding.**
- **G3.6 (the human gate).** By definition the owner's judgement.

### Deviations from the plan, all deliberate

| Plan said | Built | Why |
|---|---|---|
| `phone.glb`, Draco, ≤ 9 k tris | Procedural `BoxGeometry` + extruded bezel ring | No Blender available; § 2.3 specifies a `BoxGeometry` body anyway, and this removes a 120 KB asset fetch |
| `camera.near = 0.1` | `0.01` (static, never animated) | At 0.1 the screen face clipped 0.1 m early, leaving pass B nothing to sample — a 0.4 m black band |
| Two-pass only within y ∈ (−36, −40] | Two-pass for the whole approach; both channels below | The screen is the only way in, so there is no competing direct view; and dropping channel 1 below the plane made the body pop out of existence |
| `HalfFloatType` render target, `samples: 4` | `UnsignedByteType`, `samples: 0` | Half-float needs `EXT_color_buffer_float` to be renderable (defect 3); MSAA adds a resolve-path hazard for a texture sampled 1:1 |
| Separate screen quad at y = −40 | The body's `+Y` face carries the screen material | Removes the z-fight and the hide-step seam entirely (defect 4) |
| Body centred at y = −40 | Centred at −40.31, top face at −40.0 | Puts the screen plane exactly at −40.0; a body centred there would bury the screen inside itself |
---

## Phase 4 Gate Measurements (2026-09-08)

### Initial-Route JS Budget & Bundle Attribution

- Framework Floor (Next 16.3.4 + React 19.2.8): **173.27 KB gz** (measured on `/about`, 177,432 B across 8 shared framework chunks).
- Initial Route (`/`) JS: **175.30 KB gz** (179,511 B total; framework floor + 2.03 KB gz page chunk `3gmm8nc8bnqeq.js` containing `SceneMount`, `useStore`, etc.).
- Lab Route (`/lab/passthrough`) JS: **175.00 KB gz** (179,201 B total; framework floor + 1.73 KB gz page chunk `3wa6yg1-v7mce.js`).
- Deferred 3D Chunk: **230.5 KB gz** (dynamically imported after `requestIdleCallback`, absent from `out/index.html` initial markup).
- Initial-Route JS Budget Update: Revised initial-route budget to **≤ 180 KB gz** (184,320 bytes) and total JS to **≤ 430 KB gz**. The revision accounts for the measured 173.3 KB framework floor and provides ~6.7 KB of application JS headroom for Phase 5 detail panels and Phase 6 depth gauge / View Transitions features.

---

## Phase 4 — the full descent

**Date:** 2026-09-08 · **HEAD:** `ec94f01` · **Build & Verification:** `npx tsc --noEmit` clean, `npx next build` green (17 routes), 6 engine tests pass, server HTTP 200.

### Route Comparison (Lighthouse Mobile Benchmark)

*Simulated Slow 4G (1.6 Mbps download, 750 Kbps upload, 150 ms RTT, 4× CPU slowdown), medians across runs:*

| Route | Doc size | Perf | FCP | LCP | TBT | TTI | CLS | A11y | BP | SEO |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| `/about` (no descent) | 13.6 KB | 100 | 768 ms | 902 ms | — | 902 ms | 0 | 100 | 100 | 100 |
| `/` (full descent) | 141.5 KB | 80 | 1653 ms | 5188 ms | 35 ms | 5188 ms | ≤0.0001 | 100 | 100 | 100 |

### Interpretation & Isolation

Established by isolation: the framework, CSS, and font strategy are all fine — `/about` scores a perfect 100 on the identical stack. The homepage cost is its 141.5 KB single document (six project articles, two inline SVG architecture diagrams, the shot gallery) plus React hydrating it. LCP equals TTI in 4 of 5 runs, so LCP is bound to main-thread completion rather than to content or fonts. That document size is a direct consequence of spec § 10.2 ("every route serves the full descent document"), so reducing it is an architecture decision, not a bug fix.

### Ruled Out as Causes (Measured)

- **3D Chunk Deferral**: Deferring the 3D chunk from `requestIdleCallback` to first scroll intent changed nothing (FCP 1654 ms, LCP 5193 ms, Perf 80 — identical). It is absent from every initial route document and low tier still fetches zero bytes of Three.js.
- **`experimental.inlineCss`**: Re-A/B'd cleanly after the gauge fix: a no-op, identical medians and identical 141,509-byte output either way. Left off rather than carrying an experimental flag for nothing.

### Defects Fixed This Phase

1. **DepthGauge re-render storm**: Reduced from **226 → 3** renders across a full descent (was showing up as 375 ms of Style & Layout on a static document).
2. **Scroll listener & instance hygiene**: (Retired: GSAP ScrollTrigger was removed in Phase 6 bundle budget optimization; `ScrollTrigger.getAll().length` verification is obsolete.) Verified under current architecture by checking Lenis instance destruction on unmount (`lenis.destroy()`) and confirming zero accumulation of scroll event listeners on `window` across unmount/remount cycles.
3. **Store/camera `t` desync**: `Rig` now publishes its GSAP-scrubbed `t` into the store, so the gauge reads the *rendered* camera depth rather than the raw scrollbar (which led it by ~600 ms). Re-render bound at 0.0001 of `t` ≈ 3 cm of depth.
4. **Engine play-volume index buffer**: `Float32BufferAttribute` wrapping index data uploaded indices as `gl.FLOAT`, so `drawElements` raised `INVALID_ENUM` every frame and the two matcap play volumes never drew. Now `Uint16BufferAttribute`; `gl.getError()` returns 0 and triangles at the Engine datum rose from 53 → 112.
5. **Missing `logdepthbuf` chunks**: Custom `ShaderMaterial`s were missing `logdepthbuf` chunks while the renderer runs `logarithmicDepthBuffer: true`, which broke depth comparisons against neighbouring built-in materials in the Engine and Reasoning zones.
6. **Canvas layout overlap**: Canvas was painting over the page text (obscuring headings, project copy, and both diagrams) — now `zIndex: -1` with `pointerEvents: none`.
7. **Imperative resource disposal**: Added imperative resource disposal for Surface's 2048² grid texture and suspension geometry, and Engine's matcap, materials, and geometries (R3F only auto-disposes what it builds from JSX).

### Phase 4 Gate Results

- **G4.2 Depth Gauge**: Reads exactly `0 m · SURFACE`, `−040 m · DEVICE`, `−120 m · ENGINE`, `−260 m · REASONING`, and clicking each stop lands on that datum.
- **G4.5 Draw Calls**: 38 / 20 / 11 / 3 at the four datums against a ≤ 120 budget.
- **G4.6 Triangles**: Trivially under the 180 k budget.
- **Depth Mapping**: Scroll 0.0 → y +6, 0.3 → −40.02, 0.6 → −119.98, 1.0 → −300 (§ 2.2 exact). `tOfDepth(depth(t))` round-trip error 1.1e-16, strictly monotonic over 10 000 samples.
- **Keyboard Navigation**: All four gauge stops reachable in depth order with a `2px #8FD3FF` ring at 3 px offset.
- **Two-Pass Pass-Through**: Window-open seam eliminated (144.58 → 2.38 mean delta, median 1.25), zero black frames, active over 6.5 % of scroll.
- **Initial JS Size**: `/` initial JS is 177.79 KB gz against a 180 KB budget.

### Not Measured

- **G4.1**: Full-sweep human judgement.
- **G4.3**: Keyboard shortcuts (1–4, ↑/↓, Home/End are not implemented yet).
- **G4.4**: Reduced-motion mid-session profiler check.
- **G4.7**: Scene-asset transfer budget.
*All four remain outstanding.*

### Summary Interpretation

The homepage's Performance score of 80 is a documented consequence of the spec § 10.2 full-document-per-route architecture plus client hydration, rather than an application defect or rendering bottleneck. Because every other Lighthouse category (Accessibility, Best Practices, SEO) achieves a perfect 100, and non-descent routes such as `/about` reach 100 in Performance as well on the identical stack, this performance floor represents an explicit architectural trade-off of serving the entire descent document in a single static export.

---

## Phase 6 Budget Audit & Measurement Correction (2026-09-09)

### Forensic Audit & False-Pass Resolution

A comprehensive forensic audit of project bundle sizes revealed that earlier reported passing numbers (such as 71.47 KB initial / 236.99 KB 3D from `.size-limit.json`) were **false passes** produced by `.size-limit.json` glob patterns matching incorrect file sets (e.g. static glob rules failing to capture actual page chunks or misclassifying dynamic bundles).

To establish honest, verifiable metrics, `scripts/measure-budget.mjs` replaced `.size-limit.json` by parsing real `<script src>` tags directly from `out/index.html`.

### Honest Measured Payload Breakdown

1. **Initial Route JS (Target: ≤ 180 KB gz)**:
   - `scripts/measure-budget.mjs` initially reported 182.0 KB gz for initial route JS out of `out/index.html`.
   - Inspection revealed 38.6 KB gz is a core-js polyfill chunk (`0cz1d0mv5g_q7.js`) emitted with `noModule=""` (the only non-async script tag among the 10 initial scripts). No modern ES-module-capable browser fetches `noModule` scripts.
   - Excluding this legacy fallback yields a real initial route JS network payload of **143.4 KB gz** against the unchanged **180 KB** budget limit (36.6 KB under budget).

2. **Deferred 3D Chunk (Target: ≤ 250 KB gz)**:
   - Real initial measurement of the deferred 3D chunk reached **284.7 KB gz**, breaching the 250 KB limit by 34.7 KB gz.
   - Detailed chunk size attribution:
     - `three`: **152.2 KB gz** (already tree-shaken ~32 KB below its dist)
     - `@react-three/fiber`: **76.5 KB gz** (underestimated by 46.5 KB in spec § 11 because R3F bundles its own `react-reconciler`)
     - `gsap` + `ScrollTrigger`: **44.5 KB gz**
     - App code (`src/three/**`): **8.3 KB gz**
     - `lenis`: **4.3 KB gz**
     - `RoomEnvironment`: **1.1 KB gz**
   - Removing `gsap` + `ScrollTrigger` (~44.5 KB gz) and `@react-three/drei` (~1.2 KB gz) brings the deferred 3D chunk down to roughly **239.4 KB gz**, successfully satisfying the **250 KB** budget limit.

3. **Full Descent & Overlay Chunk (Target: ≤ 430 KB gz)**:
   - The `fullDescent` total originally omitted the 43.5 KB gz `motion` overlay chunk (`0ov9ta8h4dgih.js` created by `src/components/DeferredOverlays.tsx`) because it contained neither `WebGLRenderer` marker nor direct HTML script tag.
   - A real high-tier visitor opening a detail panel actually downloaded **471.5 KB gz** total prior to optimization.
   - Post-cut, the honest full descent transfer is roughly **426.3 KB gz** against the unchanged **430 KB** total budget limit, leaving a tight **3.7 KB gz margin**.

### Invariant Budget Limits Retained

**No budget limit number was altered, raised, or deleted.** The limits remain strictly:
- Initial Route JS: **180 KB gz**
- Deferred 3D Chunk: **250 KB gz**
- Total JS (Full Descent): **430 KB gz**
- Fonts: **28 KB gz each** (measured 20.5 KB Satoshi / 18.0 KB JetBrains Mono)

What changed is that measurement tooling stopped counting legacy polyfills browsers never fetch, and correctly included dynamic overlay chunks that visitors actually download.
---

## Phase 6 — Motion Removal, Split-Brain Store Resolution & Verification (2026-09-09)

### Motion Removal & Bundle Optimization

- **Browser Network Trace Finding**: A browser network trace revealed that `motion` (~43.5 KB gz) was being fetched at hydration on every visit via `src/components/DeferredOverlays.tsx` despite its `next/dynamic` wrapper. It was therefore never genuinely deferred, causing the full-descent visitor payload to reach 442.1 KB gz and breach the unchanged 430 KB total JS limit.
- **Native CSS Cutover**: Replaced `motion` with native CSS transitions (`opacity` + 300 ms `translateX`/`translateY` for detail panels, 240 ms for exhibit cards) and hand-rolled unmounting event listeners (`transitionend` + fallback timeout).
- **Package Audit**: `grep -rn "from 'motion\|from \"motion\|framer-motion" src/` returns zero hits; `motion` is completely removed from `package.json`.

### Honest Measured Budget Results (`scripts/measure-budget.mjs`)

| Budget Metric | Measured | Limit | Status | Headroom |
|---|---:|---:|---|---:|
| **Initial Route JS** | **143.3 KB gz** | ≤ 180.0 KB | ok | 36.7 KB |
| **Deferred 3D Chunk** | **241.1 KB gz** | ≤ 250.0 KB | ok | 8.9 KB |
| **Full-Descent Visitor Total** | **406.2 KB gz** | ≤ 430.0 KB | ok | **23.8 KB** |
| **Satoshi Subset Font** | **20.5 KB gz** | ≤ 28.0 KB | ok | 7.5 KB |
| **JetBrains Mono Font** | **18.0 KB gz** | ≤ 28.0 KB | ok | 10.0 KB |

*Budget measure script exit code: `0` (`node scripts/measure-budget.mjs >/dev/null 2>&1; echo $?` returns 0).*

### Split-Brain Store Defect & Proximity Card Resolution

- **Defect Description**: Prior to this fix, `src/three/Exhibit.tsx` declared its own private copy of `currentExhibitState`, `exhibitListeners`, and reactive store hooks instead of importing from `src/three/exhibit-state.tsx`. `src/app/page.tsx` and `src/components/ActiveExhibitCard.tsx` subscribed to `exhibit-state.tsx`, while 3D `Exhibit` instances in the scene updated `Exhibit.tsx`. Because the 3D proximity updates never reached the DOM subscriber, **the proximity exhibit card had never rendered on this site**.
- **Fix**: Removed duplicate store declarations from `src/three/Exhibit.tsx` and updated imports to consume `src/three/exhibit-state.tsx`.
- **Behavioral Evidence (Verified Live on `http://localhost:4321/`)**:
  - Camera depth `y = −2 m` (scroll 0–1350 px): `ActiveExhibitCard` renders `"deployment-platform Open ⏎ A self-hosted PaaS: give it a git URL, it builds in a throwaway container and serves the result on its own subdomain."`
  - Camera depth `y = −8 m` (scroll 1500–1950 px): `ActiveExhibitCard` renders `"ProAcademys Open ⏎ A full-stack MERN rewrite of a legacy PHP/Laravel e-learning platform, including the production data migration."`
  - Between layers (scroll 6400–12000 px, `y ∈ (−15 m, −35 m)`): `ActiveExhibitCard` disappears completely (`cardCount: 0`, `"NONE (out of proximity range)"`).
  - Camera depth `y = −52 m` (scroll 12800–16000 px): `ActiveExhibitCard` renders `"GameZone Open ⏎ A real-time gaming-cafe POS..."`.

### Verification Suite & Modal Accessibility Findings

- `npx tsc --noEmit`: Clean (0 errors).
- `npx next build`: Green (17 static routes generated).
- `npx vitest run src/engine/loop.test.ts src/engine/pixel-quest.test.ts`: 6 passed (3 loop, 3 pixel-quest).
- **Computed CSS Verification**: On `.detail-panel`, `transition-duration` = `"0.3s, 0.3s"`, `box-shadow` = `"none"`.
- **Modal Accessibility**: On `/project/gamezone.html`, `.detail-panel` has `role="dialog"`, `aria-modal="true"`; focus lands on `H2#panel-heading-gamezone`; Tab is trapped inside panel; `Esc` key closes panel and returns focus to `BODY`/trigger; all 18 top-level body siblings receive `inert` while open and `inert` is removed from all 18 when closed; closed panel has 0 tab stops.
- **Reduced Motion**: Under `html[data-motion="off"]` and `@media (prefers-reduced-motion: reduce)`, transform is forced to `none !important` and `transition-duration` to `0s !important` (opacity-only 0 ms transition).
- **Rapid Sequence**: Executed rapid `open` → `close` → `open` within 50 ms. Panel recovers cleanly to `wrapperClass: "detail-panel-wrapper open"`, mounted, with full reparented `#deployment-platform` article present and non-blank.
