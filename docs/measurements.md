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
1600 × 1000), stepping the camera in 0.02 m increments across y = −39.6 → −40.4
with a 60 ms settle per step. Metric is the mean per-pixel absolute RGB delta
between adjacent frames. `preserveDrawingBuffer` is enabled on the lab route
only, because a swapped-away drawing buffer cannot be read back.

| Stage | Swap-frame delta (mean) | Median delta | Verdict |
|---|---:|---:|---|
| Initial implementation | **147.24** (worst 575) | 4.02 | FAIL — swap was the outlier |
| After exterior kept past the boundary | 18.42 | 11.26 | Improved, seam remained |
| After byte-type sRGB render target | **12.77** | 13.85 | **PASS — swap is below the median** |

Final swap window, y = −39.96 → −40.06: `12.39, 11.23, 12.77, 11.40, 12.80, 13.85`.
The swap frame is statistically indistinguishable from ordinary camera motion.
**Black frames across the full −30 → −44 sweep: 0.** Luminance floor 16.46.

### Three real defects this gate caught

1. **Lights on channel 0 illuminated nothing.** A light only lights an object
   when their layer masks intersect, and § 2.6 pins every mesh to channel 1 or
   2. The scene rendered black until the lights got `layers.enableAll()`.
   Camera layers decide what is *rendered*; light layers decide what is *lit*.
2. **Metal with nothing to reflect is black.** `metalness: 0.95` needs an
   environment; added the § 6.5 shared environment, generated in-process from
   three's bundled `RoomEnvironment` via PMREM so no remote HDR is fetched.
3. **The swap pop was a colour-transfer mismatch, not geometry.** Mean RGB
   jumped (32.5, 22.2, 10) → (68.5, 59.7, 43.1) — a *non-uniform* 2.1× / 2.7× /
   4.3× per-channel ratio, the signature of linear pixels displayed without sRGB
   encoding. Root cause: three keeps **float** render targets linear and applies
   output encoding only to **byte** targets, so `HalfFloatType` handed the quad
   linear pixels while the direct view was sRGB-encoded. Fixed with
   `UnsignedByteType` + `texture.colorSpace = SRGBColorSpace`.

Residual large deltas at y = −39.7 (28.9) and y = −40.26 (117.8) are **aliasing
of the thin high-contrast wireframe grid**, not seams: screenshots either side
are visually identical with the same draw-call and triangle counts.

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
| `phone.glb`, Draco, ≤ 9 k tris | Procedural `boxGeometry` + extruded bezel ring | No Blender available; a box with a bevel is what § 2.3 describes, and this removes a 120 KB asset fetch |
| `camera.near = 0.1` | `0.02` (static, never animated) | At 0.1 the quad clipped 0.1 m before the screen plane, leaving pass B nothing to sample — a 0.4 m black band |
| Two-pass only within y ∈ (−36, −40] | Two-pass for the whole approach; both channels below | With a solid body the quad is the only way in, so there is no competing direct view to disagree with around the aperture |
| `HalfFloatType` render target | `UnsignedByteType` + sRGB colour space | See defect 3 above — this is what actually fixed the seam |
| Body centred at y = −40 | Centred at −40.31, top face at −40.0 | Makes the phone's top face the screen plane; a body centred on −40 buries the quad inside itself |
