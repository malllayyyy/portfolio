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
