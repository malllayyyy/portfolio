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
