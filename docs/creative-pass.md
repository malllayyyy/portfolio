# Creative pass — four features

Status: **plan only**. No code in this document is to be copy-pasted; every section names the
files an executing agent creates or modifies and the exact runtime source of every value.

Baseline: HEAD `3088020`, `main`. Measured § 8.1 headroom at the time of writing
(`scripts/measure-budget.mjs`, exit 0):

| Row | Measured | Limit | Headroom |
|---|---:|---:|---:|
| initial route (`out/index.html` `<script src>`) | 142.8 KB | 180 KB | 37.2 KB |
| deferred 3D chunk | 241.1 KB | 250 KB | 8.9 KB |
| full-descent visitor | 401.0 KB | 430 KB | 29.0 KB |
| font Satoshi | 20.5 KB | 28 KB | 7.5 KB |
| font JetBrains Mono | 18.0 KB | 28 KB | 10.0 KB |

**No budget number is changed by anything in this document.**

## Corrections to the brief, made against the repository

Two premises in the assignment do not match `HEAD`. Both change the work, so they are stated
here rather than silently designed around.

1. **There are two diagrams, not six.** `src/diagrams/` contains exactly
   `DeploymentPlatformDiagram.tsx` (314 lines) and `GameZoneDiagram.tsx` (441 lines). They are
   inline JSX `<svg>` trees inside React components, not `.svg` files. `src/components/ProjectArticle.tsx`
   selects between them on `p.presentation.component`. `design-spec.md` § 4.3 authorises exactly
   these two ("Presentation mode B — architecture diagram (deployment-platform, GameZone)"); the
   other four projects are mode A (ProAcademys screenshots), playable (Pong), and node-field
   (Switchboard). Feature 2 is therefore scoped to two diagrams.

2. **The owner's project source code is not in this workspace, and one repo is private.**
   `docs/projects.md` contains prose plus file-path evidence, not source listings. The
   *verbatim literal* fragments it does carry are the four SQLite pragmas, `BEGIN TRANSACTION … COMMIT`,
   `projects.current_deployment_id`, `deployments.bucket_path`, `BUILD_QUEUE_NAME`,
   `buildLogChannel`, `createRedisConnection`, `platform-build-sandbox` and `<project>/<deploymentId>`.
   `deployment-platform` is public (`https://github.com/malllayyyy/deployment-platform`,
   `src/content/projects/deployment-platform.ts:30`); **GameZone is private**
   (`src/content/projects/gamezone.ts:34`: "Private repo — it runs a real business"). Feature 2
   specifies exactly which nodes can carry real code and which cannot, and what the ones that
   cannot show instead. Nothing is reconstructed from memory.

---

# Feature 1 — The Reasoning layer reasons about the visitor's own visit

*Deviation note (2026-09-10 content cut pass): Feature 1's telemetry readout was trimmed from 15 rows to 9.*

## The problem, precisely

`src/three/NodeField.tsx:28` reads `const trace: TraceFixture | null = SWITCHBOARD_TRACE;` and
`src/content/site.ts:42` is `export const SWITCHBOARD_TRACE = null;`. `<TracePath>` is therefore
never mounted (`NodeField.tsx:246`), and the same null gates `TraceStepList` in
`src/components/ProjectArticle.tsx:12,76`. The 12 protocol nodes and 18 edges still render —
they are static and correct — but nothing at `-260 m` moves or says anything.

**`SWITCHBOARD_TRACE` stays `null` and `<TracePath>` stays unmounted.** This feature does not
fill the trace seam; a visit is not a Switchboard session, and dressing telemetry up in
`TraceFixture`'s `{ from, to, type, summary }` shape would be exactly the fabrication the owner
rejected. Telemetry is a *separate, adjacent* object with its own name.

## What the visitor sees and understands

Two surfaces, and the DOM one is the real one.

**A. DOM — "This visit" block, inside the Switchboard article.**
A `<dl>` of measured rows. Each row is `label · value · the API that produced it`. Example rows,
rendered in this order:

```
tier            high        detectTier() scored 7 — 8 cores, 8 GB, ≥1024px, fine pointer, DPR 1
cores           8           navigator.hardwareConcurrency
device memory   8 GB        navigator.deviceMemory
pixel ratio     1           window.devicePixelRatio
reduced motion  off         matchMedia('(prefers-reduced-motion: reduce)')
first paint     412 ms      PerformanceObserver 'paint' / first-contentful-paint
largest paint   980 ms      PerformanceObserver 'largest-contentful-paint'
3D chunk        241.4 KB    PerformanceResourceTiming.encodedBodySize
document        6.1 KB      PerformanceNavigationTiming.transferSize
frame mean      16.9 ms     rolling 120-frame rAF delta
layers crossed  4 of 4      deepest −278 m
this reading    taken 34 s into the visit
```

The visitor knows it is *their* visit and not decoration for three reasons, all of them
falsifiable in ten seconds and all of them stated on the page in one line:
*"Every number above was measured in your browser on this page load."*

- The **tier row names their own machine** — core count and memory are theirs, and the footer
  `TierToggle` (`src/components/TierToggle.tsx`, already shipped) changes the tier row on reload.
- The **3D chunk row flips to `served from cache`** on the second load, because
  `PerformanceResourceTiming.transferSize` is `0` for a cache hit while `encodedBodySize` is not.
- The **frame-mean row moves** when they drag the scrollbar hard, and the **layers-crossed row
  increments as they descend**. Nothing else on the site does that.

**B. 3D — a twelve-position readout cluster, mounted beside the protocol node field.**
New component `src/three/VisitField.tsx`, mounted from `src/three/layers/Reasoning.tsx` as a
sibling of the existing `<Exhibit slug="switchboard" depth={-278}>`, at `y ≈ -272`, `x` mirrored
opposite the protocol nodes. One `<points>` draw call plus one `<lineSegments>` draw call, the
same construction `NodeField.tsx` already uses (`bufferAttribute` + `vertexColors` +
`AdditiveBlending`, `layers.set(INTERIOR)` via the same `toInterior` idiom). Two extra draw calls
against the § 8.1 ceiling of 120 (`docs/measurements.md:117` records 3/4 today).

A node is **lit** when its signal is observable and **dark** (`#1B2430`, still drawn, still in the
buffer) when it is not. Lit nodes brighten in step with the DOM row they mirror. The cluster is
`aria-hidden` by inheritance — `src/three/index.tsx:66` sets `aria-hidden="true"` on the `<Canvas>` —
so it carries no information the `<dl>` does not.

## Exact runtime source for every value

`src/lib/visit.ts` (new, no dependencies, no React) is the single module that reads the browser.
It exposes one snapshot object and a `useSyncExternalStore`-compatible pair, in the same shape as
`src/three/exhibit-state.tsx` already uses. **It never writes to `src/lib/store.ts`.**

| # | Row | Exact source | Observable? |
|---:|---|---|---|
| 1 | tier | `detectTier()` — `src/lib/tier.ts:19` | always |
| 2 | tier score inputs | see "tier.ts change" below | always |
| 3 | cores | `navigator.hardwareConcurrency` | **dark where `undefined`** |
| 4 | device memory | `navigator.deviceMemory` | **dark in Firefox and Safari — the API is Chromium-only** |
| 5 | pixel ratio | `window.devicePixelRatio` | always |
| 6 | viewport / pointer | `matchMedia('(min-width: 1024px)')`, `matchMedia('(pointer: fine)')` | always |
| 7 | reduced motion | `getMotion()` — `src/lib/motion-pref.ts:20` | always |
| 8 | save-data | `navigator.connection?.saveData` | **dark outside Chromium** |
| 9 | first contentful paint | `PerformanceObserver`, `{ type: 'paint', buffered: true }`, entry `name === 'first-contentful-paint'` | **guard on `PerformanceObserver.supportedEntryTypes`** — `src/components/SceneMount.tsx:87` already does exactly this |
| 10 | largest contentful paint | `PerformanceObserver`, `{ type: 'largest-contentful-paint', buffered: true }` | **dark in Safari and Firefox** — same guard |
| 11 | document transfer | `performance.getEntriesByType('navigation')[0]` → `PerformanceNavigationTiming.transferSize` | always, same-origin |
| 12 | deferred-3D chunk bytes | `performance.getEntriesByType('resource')` filtered to `initiatorType === 'script'` and `name` containing `/_next/static/chunks/`, matched to the largest entry fetched **after** the navigation `domContentLoadedEventEnd` → `encodedBodySize`, with `transferSize === 0` rendered as `served from cache` | **dark at low tier — the chunk is never fetched, which is the point** |
| 13 | initial-route bytes | sum of `encodedBodySize` over `resource` entries whose `startTime < domContentLoadedEventEnd` | always, same-origin |
| 14 | frame mean | rolling 120-frame mean already computed by `FrameWatchdog` — `src/lib/watchdog.ts:20-64` (`buffer`, `sum`, `count`) | **dark at low tier and while a panel is open** (`frameloop` drops to `'demand'`, `src/three/index.tsx:71`) |
| 15 | layer boundaries crossed | mid/high: `depth(t)` from `src/three/depth.ts:19` over the store's `t`. **low tier: `IntersectionObserver` on the five `<section data-layer>` elements** | always, by two different paths |
| 16 | time on page | `performance.now()` at read | always |

### The three things this design will NOT claim

- **Frames per second.** The only quantity available is the interval between `requestAnimationFrame`
  callbacks, which `Rig.tsx:139` already receives as `delta` and hands to `FrameWatchdog.update()`.
  That is a rAF cadence, not a GPU frame time. The row is labelled `frame mean (rAF delta)` in
  milliseconds and never as "fps".
- **The GPU.** `WEBGL_debug_renderer_info` is gated or spoofed in current Firefox and Safari and is
  a fingerprinting surface. No GPU node. `webglSupported()` (`src/lib/tier.ts:6`) already tells us
  the only thing we need — that a context could be created.
- **Network speed.** `navigator.connection.downlink` / `effectiveType` are Chromium-only *and* are
  coarse estimates rather than a measurement of this page load. Not used. Byte counts from
  `PerformanceResourceTiming` are real; a derived "your connection is X Mbps" is not.

### Low-tier `t` — a real constraint found in the source

`src/lib/store.ts` never subscribes to `scroll`. `computeT()` runs once inside `syncClientState`'s
`queueMicrotask`; after that, the only caller of `setScrollT` is `Rig.tsx:181`, inside `useFrame`.
**At low tier there is no `Rig`, so `store.t` stays at its initial value forever.** Row 15
therefore cannot read the store at low tier. It uses `IntersectionObserver` on the five
`<section id data-layer>` elements that `src/app/page.tsx` already renders, and reports the deepest
`LAYERS` datum whose section has intersected. Depth in metres comes from `src/content/layers.ts`
(`datum: 0 / -40 / -120 / -260 / -300`), not from a derived number.

### The one change to `src/lib/tier.ts`

`detectTier()` computes `score` from six inputs and throws them away (`tier.ts:19-49`). Row 2
needs them. Add a module-level `let lastEvidence` assigned inside `detectTier()` and an exported
`getTierEvidence()` returning it. This is additive, does not change the returned tier, does not
re-run detection, and preserves the "runs ONCE, synchronously" contract in the file's own
docstring. **No other module's behaviour changes.**

## Files

**Create**
- `src/lib/visit.ts` — the readers above; snapshot + `subscribe`/`getSnapshot`; zero deps.
- `src/components/VisitReadout.tsx` — `'use client'`; renders the `<dl>`; hydrates a
  server-rendered fallback (below).
- `src/three/VisitField.tsx` — the 12-position cluster; imports `INTERIOR` from
  `./layers/Device` and reads `src/lib/visit.ts` only.

**Modify**
- `src/lib/tier.ts` — add `getTierEvidence()` as described.
- `src/components/ProjectArticle.tsx` — in the `presentation.kind === 'node-field'` branch
  (line 74-79), after `<ProtocolTable />`, render the **server-side static fallback** (a `<dl>`
  whose values read `measured on load`) wrapped so the client island can replace it. The
  existing `{trace && <TraceStepList …/>}` line is left untouched.
- `src/components/DeferredOverlays.tsx` — add `VisitReadout` to the `next/dynamic`,
  `ssr: false` group, so its JS lands in the deferred overlay chunk rather than the initial route.
- `src/three/layers/Reasoning.tsx` — mount `<VisitField />` as a sibling of the existing
  `<Exhibit slug="switchboard">`. **Coordinate with the sibling agent already editing this file**
  (see Ordering).

**Not touched:** `src/content/site.ts` (`SWITCHBOARD_TRACE` stays `null`),
`src/three/NodeField.tsx`, `src/lib/store.ts`, `src/three/depth.ts`, `src/three/PassThrough.tsx`.

## Bytes

| Item | Estimate | Basis | Row |
|---|---:|---|---|
| `src/lib/visit.ts` + `VisitReadout.tsx` | **~2.4 KB gz** | `docs/measurements.md:144` measures the whole `/` page chunk — `SceneMount` + `useStore` + imports — at 2.03 KB gz. This module is comparable in size (≈220 lines, no JSX beyond one `<dl>`, no dependencies). | **full-descent** (401.0 → ~403.4 / 430) |
| `src/three/VisitField.tsx` | **~0.9 KB gz** | `docs/measurements.md:228` measures all of `src/three/**` at 8.3 KB gz across 13 files ⇒ ~0.6 KB gz/file; this one is slightly larger than average and adds no `three` imports not already in the chunk. | **deferred 3D** (241.1 → ~242.0 / 250) |
| `getTierEvidence()` | **~0.1 KB gz** | one object literal and a getter, in a module already in the initial route. | **initial route** (142.8 → ~142.9 / 180) |
| server-rendered fallback `<dl>` | 0 KB JS | static HTML in `ProjectArticle`, a server component. `scripts/measure-budget.mjs` measures `<script src>` and font files only. | none |

Deferred-3D headroom after this feature: ~8.0 KB. That is the tightest row on the site and
Feature 1 is the only feature that touches it.

## Accessibility contract

- The `<dl>` is real, static, server-rendered DOM inside the existing `<article id="switchboard">`
  — § 9.1's "every single thing it shows exists in the DOM" holds, and it holds with JS off
  (values read `measured on load`, which is true and not a placeholder lie).
- **No new tab stop.** The block is text; there is no button. `ExhibitProxyNav` remains the single
  canonical tab stop and `ExhibitCard` remains `tabIndex={-1}`.
- Values update in place. The block is **not** an `aria-live` region — a screen reader being
  interrupted by a frame-time counter is a defect, not a feature. The one-shot announcement of the
  Switchboard panel title through the existing `#route-announcer` (`src/app/layout.tsx:80`) is
  unchanged.
- Dark rows render the literal text `not exposed by this browser` as the value, not an empty cell
  and not a dash. A screen reader reads a sentence.
- Contrast: values in `#EDF1F5`, labels in `#8FA0B0`, source column in `#8FA0B0`, dark-row values
  in `#8FA0B0`. All within the closed 10-token palette. No `box-shadow`, no `backdrop-filter`.

## Reduced motion

`getMotion() === 'off'` ⇒ the DOM values are read **once** on first intersection of the Switchboard
section and thereafter only when the visitor activates a `Re-read` `<button>` placed at the end of
the block (this is the one focusable element the feature adds, and it exists only under reduced
motion). No polling, no interval, no animated counters. `VisitField`'s nodes render at their final
brightness with no lerp — the same discipline `Reasoning.tsx`'s existing shader observes, and
consistent with `src/three/index.tsx:71` dropping `frameloop` to `'demand'`.

## Low tier

There is no 3D, so `VisitField` never loads (`SceneMount` returns `null` for
`tier === 'low'`, `src/components/SceneMount.tsx:135`). The `<dl>` is the entire feature and it
works: rows 1-8, 9, 11, 13 and 16 are all available without WebGL. Rows 12 and 14 render
`3D chunk never fetched — low tier ships zero bytes of Three.js` and `no render loop at this tier`
respectively. Those two sentences are the most honest thing on the page and should be treated as
copy, not as an error state. Row 15 uses the `IntersectionObserver` path.

## Acceptance check a reviewer can run

1. `npx next build && npx serve out`, open `/project/switchboard`, read the block: every row has a
   value or the words `not exposed by this browser`.
2. Reload once. The `3D chunk` row must change from a byte count to `served from cache` —
   `transferSize` is `0` on a cache hit while `encodedBodySize` is not. If both loads print the
   same byte count, the reader is looking at the wrong field.
3. Open devtools, set CPU throttling to 6×, scroll. The `frame mean` row must rise above 16.7 ms.
4. Footer `TierToggle` → `low`, reload. The 3D canvas is gone, the block still renders, and rows 12
   and 14 read their low-tier sentences.

---

# Feature 2 — Explorable architecture diagrams

*Deviation note (2026-09-10 content cut pass): Feature 2 (the explorable Architecture Node Index) was deleted entirely during the content cut pass. `snippets.ts`, `DiagramNodeIndex.tsx`, and `DiagramNodeLink.tsx` were deleted, and both architecture diagrams were de-activated to eliminate over-explaining.*

## Scope

Two diagrams (see Corrections, above): `src/diagrams/DeploymentPlatformDiagram.tsx` and
`src/diagrams/GameZoneDiagram.tsx`. Both are already rendered inside `<article>` DOM by
`src/components/ProjectArticle.tsx:69-74`, on every route, at every tier, with JS off.

## The interaction

Beneath each diagram, a **node index**: one `<details>` element per diagram node, in the order the
nodes appear in `design-spec.md` § 4.3's numbered list. `<summary>` is the node name plus the file
path that proves it. The open body is the real snippet in `<pre><code>` plus a one-line
"what this is" caption naming the repository and commit.

`<details>`/`<summary>` is the whole mechanism. It is native, keyboard-operable (Enter/Space),
screen-reader-announced as a disclosure with expanded state, works with JS disabled, works at low
tier, needs no ARIA, and costs zero bytes of JavaScript. Nothing here is built by hand.

**The SVG is progressive enhancement only.** Each node `<g>` in the two diagram components gets
`data-node="<id>"` and a `pointerup` handler (added by a ~15-line client island, not by adding
handlers to 12 elements) that sets `details.open = true` and calls `scrollIntoView()` on the
matching `<details>`. The SVG keeps `role="img"` with its existing `aria-labelledby` pointing at
`<title>`/`<desc>` (`GameZoneDiagram.tsx:6-8`, `DeploymentPlatformDiagram.tsx:6-8`). **No
`tabindex` is added to any SVG element** — SVG focus semantics vary across browsers and AT, and the
node index already provides the complete keyboard and screen-reader path. A mouse user gets a
shortcut; a keyboard user gets the canonical route. Neither is a second-class path.

## Which snippets are real, and which cannot be

`docs/projects.md` is prose and file paths. Source is only obtainable for the public repo.

**`deployment-platform` — public (`https://github.com/malllayyyy/deployment-platform`).**
The executing agent clones it, pins a commit SHA, and copies these regions **verbatim**. Nothing
is retyped, reformatted, or trimmed except by whole lines:

| Node | File in that repo (from `docs/projects.md:22-34`) | The claim the snippet must carry |
|---|---|---|
| `platform-build-sandbox` / isolation | `infra/docker/build.sh` | the `docker run` invocation and the throwaway container name |
| lockfile cache | `infra/docker/build.sh` + `apps/worker/src/build.js` | the lockfile hash, the bind-mounted cache path, the `skip npm install` branch |
| BullMQ queue | `packages/shared/` | the `BUILD_QUEUE_NAME` and `buildLogChannel` constant declarations and `createRedisConnection` |
| MinIO | `apps/worker/src/build.js` | the upload to `<project>/<deploymentId>` |
| **atomic swap** | `packages/db/queries` (`projects.js`) | **the single `UPDATE projects SET current_deployment_id = …`** — this is the diagram's focal point (`design-spec.md` § 4.3) and the one snippet that must be exact |
| proxy lookup | `apps/proxy/src/index.js` | host-header → `current_deployment_id` → `deployments.bucket_path` |

If a clone fails or a path has moved, **the node ships without a snippet**: `<summary>` and the
file path only, with the body reading `Source not reproduced here — see the linked file in the
public repository.` and a deep link to the file at the pinned SHA. It never ships an
approximation.

**GameZone — private repo, no source available.** Two of the requested nodes are different cases
and must be treated differently:

- **The SQLite pragmas: real, and already verbatim in the repository.** The four literal statements
  appear as literal text in `docs/projects.md:121`, in `src/content/projects/gamezone.ts:11`, and
  already rendered inside `GameZoneDiagram.tsx:271-289`:
  `PRAGMA journal_mode = WAL`, `PRAGMA synchronous = NORMAL`, `PRAGMA temp_store = MEMORY`,
  `PRAGMA cache_size = -10000`, plus `BEGIN TRANSACTION … COMMIT`. These are SQL statements, not a
  paraphrase of JavaScript, and they are the evidence. The `<details>` body carries the five
  statements, the file path `backend/database.js`, and one caption line: *"The pragmas are quoted;
  the surrounding JavaScript is in a private repository and is not reproduced."*
- **The mid-session rollover math: NOT reproducible.** `docs/projects.md:123` and
  `gamezone.ts:24-27` describe the `/api/sessions/add-game` behaviour — overage computed and
  deducted from the new activity's duration, occupancy unbroken — in prose. **There is no literal
  expression anywhere in this repository or in any public source.** Writing one would be
  fabricating the owner's code. That node's body carries the described rule as a four-step
  sequence in prose (the same four steps `GameZoneDiagram`'s inset strip already draws), the file
  path `backend/server.js`, and the line *"Described, not quoted — this repository is private."*
  **The plan does not pretend otherwise, and an executing agent that produces a code block here
  has failed the task.**

## Where snippets are stored, and why the initial route does not move

**Snippets are stored as static text in a server component and rendered into HTML — not into JS.**

Create `src/content/snippets.ts` exporting a plain `Record<string, { path: string; lang: string;
code: string | null; note: string }>`. It is imported **only** by `ProjectArticle.tsx`, which is a
server component (no `'use client'`; it is rendered by `src/app/page.tsx`, which is also a server
component — see its docstring at `src/app/page.tsx:16-21`). Server-component module code and data
are not shipped to the browser; only the rendered HTML is.

`scripts/measure-budget.mjs` measures three things and only three: gzip of the non-`noModule`
`<script src>` chunks in `out/index.html` (line 137-140), gzip of chunks referenced by no HTML
(line 165-186), and the two font files (line 190-193). **HTML bytes are in no budget row.**

So the cost of the snippets to the 180 KB initial-route row is **zero**, and the cost to the
250 KB and 430 KB rows is **zero**. What they do cost is page weight: roughly 8-10 KB of raw
markup across both diagrams, ~2.5 KB over the wire after gzip, added to a document that
`docs/measurements.md:171` measures at 141,509 bytes uncompressed. That is a ~2 % document growth
and it is the correct place to spend it, because it is also the no-JS path, the low-tier path and
the screen-reader path in one.

The only JavaScript is the SVG click-to-open island: `src/components/DiagramNodeLink.tsx`,
`'use client'`, one `useEffect`, one delegated `pointerup` listener on the `<figure>`, `document.getElementById`
+ `details.open = true`. **~0.4 KB gz**, basis: it is roughly one third the size of
`src/components/GameTrigger.tsx` (26 lines) which is inside the 2.03 KB gz page chunk measured at
`docs/measurements.md:144`. It is imported statically by `ProjectArticle` and therefore lands in
the **initial route** row: 142.8 → ~143.2 / 180.

## Files

**Create**
- `src/content/snippets.ts` — the snippet table; `code: null` for the two nodes above that have no
  reproducible source.
- `src/components/DiagramNodeIndex.tsx` — server component; renders the `<details>` list for a
  given diagram id from `snippets.ts`.
- `src/components/DiagramNodeLink.tsx` — the `'use client'` pointer island.

**Modify**
- `src/diagrams/DeploymentPlatformDiagram.tsx` — add `data-node="…"` to the twelve `<g>` node
  wrappers (N1-N12, lines 106-232). No structural change, no new elements, no `tabindex`.
- `src/diagrams/GameZoneDiagram.tsx` — same, on `node-m1` … `node-m6`, the pragma callout, and the
  four rollover strip boxes.
- `src/components/ProjectArticle.tsx` — render `<DiagramNodeIndex id="deployment-platform" />` /
  `id="gamezone"` and `<DiagramNodeLink />` immediately after each diagram, inside the existing
  `presentation.kind === 'diagram'` branches (lines 69-74).

## Accessibility contract

- The node index is a list of native disclosures. Each `<summary>` is a real tab stop **inside the
  project article** — the same class of focusable that `LinkRow` and `GameMount`'s Play button
  already contribute there (`ProjectArticle.tsx:64`, `:78`). `ExhibitProxyNav` remains the single
  canonical *exhibit* tab stop; it was never the site's only focusable element and this does not
  change that.
- Inside the detail panel, `DetailPanel`'s focus trap query
  (`src/components/DetailPanel.tsx:255-257`) already matches `[tabindex]:not([tabindex="-1"])` and
  `button` — `<summary>` is neither, so **the trap must be extended to include `summary`** or the
  last disclosure will not be reachable as the trap's `last`. This is a one-token change to that
  selector string and is the only change Feature 2 makes to `DetailPanel`. Modal semantics
  (`role="dialog"`, `aria-modal`, Esc, focus restore, `inert` siblings) are untouched.
- `<pre>` blocks get `tabindex="0"` **only if they scroll horizontally** — a scrollable region must
  be keyboard-scrollable (WCAG 2.1.1). Prefer wrapping long lines so they do not.
- No `aria-expanded` is authored; `<details>` provides it. No `role` is authored on `<summary>`.
- Nodes without source are announced as prose, never as an empty disclosure.

## Reduced motion / low tier

`<details>` has no animation to suppress; the browser's default disclosure has no transition and
none is added. Low tier is identical — the diagrams are inline SVG, not WebGL
(`design-spec.md` § 8.3: "same diagrams (the diagrams are inline SVG, not WebGL)"), and the node
index is server-rendered. This feature is byte-identical across all three tiers, which is exactly
what the § 8.3 tier-content-parity assertion (`scripts/assert-tier-parity.mjs`) requires.

## Acceptance check a reviewer can run

Load `/project/gamezone` **with JavaScript disabled**. Tab to the node index, press Enter on the
SQLite node, and read the four pragmas. Then open the rollover node and confirm it contains prose
and the words *"Described, not quoted"* — and **no code block**. If a code block appears there,
someone invented the owner's source and the change must be rejected.

---

# Feature 3 — The 404 page is a playable Pong

## What already exists

Everything except the wiring. `src/engine/pong.ts` (335 lines) survives Pixel Quest's removal with
its authored constants intact: `paddleSpeed = 7` (line 118), `aiSpeed = 3.6` (line 126),
`WINNING_SCORE = 7` (line 30), fixed timestep `TIMESTEP_MS = 1000/60` and `MAX_STEPS = 5`
(`src/engine/loop.ts:1-2`). `src/components/GameMount.tsx` renders the board, the control bar, the
`aria-live` region and the overlay Play button. `src/components/GameTrigger.tsx` dynamically
imports `PlayEngine` on click. `src/components/PlayEngine.ts` owns capture/release: Esc releases
and restores focus to the Play button (line 42-56, 88-91), Tab releases without stealing focus
(line 93-96), pointer-down outside releases, `visibilitychange` releases, canvas blur releases.
Touch is already handled — `touchmove`/`touchstart` → `updatePointerY` (`pong.ts:97-105`), the
drag-anywhere scheme `design-spec.md` § 5.5 specifies.

So the feature is: **render the existing `<GameMount game="pong" />` on the 404 route.** No new
engine, no new input code, no new component. That is the whole design.

## The page

`src/app/not-found.tsx` becomes, in this document order:

1. `404 · NOT FOUND` eyebrow, `This depth does not exist.` heading — unchanged.
2. One new line of copy: *"Nothing is here. The engine from −120 m is, though."*
3. **The mandatory exit, before the board**: the existing
   `<Link href="/">Return to Surface</Link>` (`not-found.tsx:14-16`), kept exactly as it is,
   above the game. It is the first focusable element on the page and it is a plain link with no JS
   dependency. A second identical link is added below the board so a visitor who has scrolled past
   the game does not have to scroll back. **The game is never the only exit and never the first
   thing in the tab order.**
4. `<GameMount game="pong" />`.
5. One line naming where the engine comes from, linking `/project/pong`.

**How it starts:** it does not start by itself. `GameTrigger` binds `click` on the Play button and
on the canvas; the button's label is already
`Play Pong — 7 points wins. Enter to start.` (`GameMount.tsx:9`). A keyboard visitor Tabs to it and
presses Enter — a `<button>` fires `click` on Enter natively. Nothing auto-plays, on any tier,
under any motion preference.

**Keyboard-only:** Tab → `Return to Surface`; Tab → Play; Enter starts and `PlayEngine` focuses
the canvas; `↑`/`↓` or `W`/`S` move; `Space`/`Enter` restart after game over; `Esc` exits and
returns focus to the Play button; `Tab` exits and moves on. All of this is existing, shipped
behaviour in `PlayEngine.ts:98-113` — the 404 inherits it rather than re-implementing it.

**Touch:** drag anywhere on the canvas. `pong.ts:99-105` maps `touchmove` to paddle Y with the
same maths as `mousemove`. The board is `aspect-[16/10] w-full` (`GameMount.tsx:56`) so it is
full-bleed on a phone.

**One defect to fix while here:** `PlayEngine.startInteractiveGame` sets
`document.body.style.overflow = 'hidden'` (line 79) and restores it in `release()` (line 38). On the
404 route the page is short and this is harmless, but if the visitor navigates away mid-capture the
lock leaks. The 404 page must not add a second lock; it relies on the existing `release()` paths,
which fire on `visibilitychange` and on canvas blur. No change to `PlayEngine` is required — this
is a note for the reviewer, not a task.

## Reduced motion

`getMotion() === 'off'` ⇒ the board renders, the Play button renders, **and nothing moves until
the visitor presses it**. That is already true unconditionally — nothing on this page auto-starts —
which is precisely what `design-spec.md` § 9.4 asks for ("games still available but never
auto-started"). In addition, under reduced motion the copy above the board changes to name the
game as optional in one line, and the `Return to Surface` link is rendered in the accent colour so
the exit is the visually dominant element rather than the board. No transition, no fade.

## Low tier

Identical. Pong is Canvas 2D, not WebGL — `design-spec.md` § 8.3: *"Pong is still playable — it is
Canvas 2D, not WebGL, and it costs nothing."* `initPong` throws a real error if
`getContext('2d')` returns null (`pong.ts:17-21`) and `PlayEngine.reportInitFailure` (line 58-68)
replaces the overlay with a readable sentence. The `Return to Surface` link is unaffected by any
of that because it is plain HTML above the board.

## Bytes, and an accounting effect the reviewer must expect

- **Initial route (180 KB): unchanged.** The gate measures `out/index.html` only
  (`scripts/measure-budget.mjs:29,105-127`). The 404 is `out/404.html`, a different document.
- **`out/404.html`'s own scripts** gain `GameMount` + `GameTrigger`, **~0.7 KB gz** — basis:
  `GameTrigger.tsx` is 26 lines and `GameMount.tsx` is 85 lines of mostly static JSX, against the
  2.03 KB gz page chunk at `docs/measurements.md:144` which contains `SceneMount` plus `useStore`
  plus imports. No budget row measures 404.html.
- **Full descent (430 KB): may go *down*, not up.** `fullDescent = initialRoute + every chunk
  referenced by no HTML page` (`measure-budget.mjs:107-115, 188`). `PlayEngine` and `engine/pong`
  are currently unreferenced chunks and are therefore counted in the 401.0 KB. Once 404.html
  statically references the `GameTrigger` page chunk, that chunk leaves the unreferenced set.
  `PlayEngine`/`pong` stay unreferenced (they are `import()`ed at runtime) and stay counted.
  **The expected net movement on the full-descent row is between −1 KB and 0.** A reviewer who
  sees that row fall after this change is looking at correct behaviour, not a mismeasurement.

## Accessibility contract

- The plain link out is present in the first HTML response, above the board, and is the first
  focusable element. It works with JS off and at every tier.
- `GameMount` already renders `<div aria-live="polite">` (`GameMount.tsx:38`), and `PlayEngine`
  writes `Pong active. Arrow keys to move. Escape to exit.` on capture and
  `Pong exited. Controls returned to page.` on release (lines 32-34, 70).
- No keyboard trap: `Tab` always releases (`PlayEngine.ts:93`), which is the § 5.3 rule.
- The canvas is `tabIndex={-1}` until captured and returns to `-1` on release
  (`PlayEngine.ts:22, 25`). It is never a stray tab stop.
- Heading order on the route stays `h1` → nothing; `GameMount` introduces no heading.

## Acceptance check a reviewer can run

Load `/does-not-exist` with a keyboard only. Press Tab once — focus must land on
`Return to Surface`, not on the game. Press Tab again, Enter, play a point with `↑`/`↓`, press
`Esc`, and confirm focus returns to the Play button. Then reload and press Tab-Tab-Enter-Tab and
confirm the game releases and focus continues into the page rather than cycling inside the canvas.

---

# Feature 4 — Cmd+K depth palette

## Constraint check first

`design-spec.md` § 9.2 currently reads: *"They are listed in a static 'Keyboard' block on the
Bedrock section — no modal, no `⌘K` palette (non-goal 9)."* The owner has explicitly approved this
feature, which supersedes that sentence. **The executing agent must update that line in
`design-spec.md` in the same change**, or the spec and the code disagree and the next reader
believes the spec. That is the only edit this feature makes to the spec.

## The design

`Cmd+K` (macOS) / `Ctrl+K` (everywhere else) opens a modal palette listing, in depth order:

```
   0 m   SURFACE · Web
  −2 m   deployment-platform
  −8 m   ProAcademys
 −40 m   DEVICE · App
 −52 m   GameZone
−120 m   ENGINE · Game
−124 m   Pong
−260 m   REASONING · Agentic AI
−278 m   Switchboard
−300 m   BEDROCK
```

*Deviation note (2026-09-10 content cut pass): Pong was removed as a descent exhibit at -124 m and as a project route (`/project/pong`). It now lives exclusively on the 404 page (`src/app/not-found.tsx`).*

Depths come from `src/content/layers.ts` (`datum`) and `src/content/projects/*.ts` (`depth`) — the
same two sources `DepthGauge` and `ExhibitProxyNav` already read. They are never recomputed and
never hard-coded in the palette. Formatting reuses the existing `−278 m` convention
(`exhibit-state.tsx:98-102`, `DepthGauge.tsx:20-28`).

Typing filters by substring over title and layer name. `↑`/`↓` move the highlighted row,
`Enter` activates, `Esc` closes.

## Routing — through the existing machinery, not around it

**There is no second scroll authority.** Activating a row calls exactly one of two functions that
already exist:

- **A layer row** → `scrollToExhibitDepth(layer.datum)` from `src/three/exhibit-state.tsx:110-124`.
  That function calls `tOfDepth()` from `src/three/depth.ts` and then `window.scrollTo`. Real
  document scroll. `Rig.tsx`'s `useFrame` reads `getT()` from the document and publishes it via
  `setScrollT` (line 181) exactly as it does for every other navigation. The store remains the
  rendered-camera truth and the palette never writes to it.
- **A project row** → `scrollToExhibitDepth(project.depth)` then `openExhibit(project.slug)`
  (`exhibit-state.tsx:129-134`), which is the same pair `ExhibitProxyNav` invokes on focus and
  click (lines 155-165). `openExhibit` calls `setPanel` and `history.pushState('/project/<slug>')`,
  so the deep-link machinery — `DetailPanel`'s `popstate` handler (line 232-245) and
  `store.syncClientState`'s route lookup (`store.ts:129-133`) — continues to work unchanged.

`scrollToExhibitDepth` already honours reduced motion internally
(`behavior: prefersReducedMotion ? 'auto' : 'smooth'`, line 121). Nothing is re-implemented.

## Not a second focus trap

Two rules, both mechanical:

1. **The palette refuses to open while a detail panel is open.** `DetailPanel` sets
   `document.documentElement.dataset.panel = openSlug` on open and deletes it on close
   (`DetailPanel.tsx:181, 213`). The palette's `keydown` handler returns early when
   `document.documentElement.dataset.panel` is present. Two modals can therefore never coexist,
   and the panel — which is the more important surface — always wins.
2. **The palette closes itself before it navigates.** On `Enter` it closes, restores focus, and
   *then* calls `scrollToExhibitDepth`/`openExhibit`. When the row was a project, the panel opens
   into a page with no other modal present and takes focus normally via its own
   `headingRef.current?.focus()` (`DetailPanel.tsx:199-201`).

Beyond that the palette is an ordinary dialog and carries the same contract § 9.3 requires of the
panel: `role="dialog"`, `aria-modal="true"`, `aria-labelledby` on its own heading, focus moved to
the text input on open, focus trapped between the input and the last visible row, `Esc` closes,
focus restored to `document.activeElement` captured at open, and `inert` applied to the same
direct children of `<body>` that `DetailPanel.tsx:186-196` marks.

## Full keyboard contract

| Key | Behaviour |
|---|---|
| `Cmd+K` / `Ctrl+K` | open. Suppressed if `data-panel` is set, if the active element is `input`/`textarea`/`select`/`[contenteditable]`, or if a game canvas has `data-captured="true"` |
| `Esc` | close, restore focus to the opener |
| `↑` / `↓` | move highlight; wraps at both ends |
| `Enter` | activate highlighted row |
| `Tab` | trapped within the dialog |
| any character | filter |

`Cmd+K` is intercepted with `e.preventDefault()` **only when the palette actually opens**, so
Firefox's `Ctrl+K` search-bar focus is not swallowed on a page where the palette is suppressed.
The Bedrock `KeyboardHelp` block (`src/components/KeyboardHelp.tsx:8`) gains one row —
`Cmd/Ctrl+K · jump to any layer or project by name` — because § 9.2 requires every shortcut to be
listed in that static block. `DepthGauge`'s existing `1`-`4`, `↑`/`↓`, `Home`/`End` bindings are
untouched; the palette adds no bare-key binding and therefore cannot collide with them.

## Low tier — there is no camera

The palette still opens and still shows depths in metres, because the depths are facts about the
site, not about the renderer. Activation takes the low-tier path that `store.ts:105-122` already
defines: `document.getElementById(anchorId)?.scrollIntoView()`, where `anchorId` is the layer id
for layer rows (`src/app/page.tsx` renders `<section id="bedrock">` and `LayerSection` renders the
others) and the project slug for project rows (`ProjectArticle` renders `<article id={p.slug}>`).
Project rows additionally call `openExhibit`, which works at low tier — `DetailPanel` is mounted at
every tier through `DeferredOverlays`. The palette is tier-agnostic by construction; it is the
*destination* that differs, exactly as it already does for `ExhibitProxyNav`.

## Files

**Create**
- `src/components/DepthPalette.tsx` — `'use client'`; the dialog. Reads `LAYERS` and a slim
  `{slug,title,depth}` projection of `PROJECTS` passed in as a prop, mirroring
  `ExhibitProxyNav`'s existing discipline of not pulling the full `PROJECTS` module into a client
  bundle (`exhibit-state.tsx:137-141`).
- `src/components/PaletteKey.tsx` — `'use client'`; ~30 lines. One `window.keydown` listener; on
  the first successful open it `import()`s `DepthPalette` and renders it. This is the only part
  that lives in the initial route.

**Modify**
- `src/app/page.tsx` — render `<PaletteKey exhibits={…} />` next to the existing
  `<ExhibitProxyNav>` (line 27-29), reusing the same `PROJECTS.map` projection.
- `src/components/KeyboardHelp.tsx` — add the one row.
- `docs/design-spec.md` § 9.2 — replace the "no modal, no ⌘K palette" clause.

## Bytes

| Item | Estimate | Basis | Row |
|---|---:|---|---|
| `PaletteKey.tsx` | **~0.5 KB gz** | ~30 lines, one listener, one dynamic import — comparable to `GameTrigger.tsx` (26 lines), which is part of the 2.03 KB gz page chunk at `docs/measurements.md:144` | **initial route** (142.8 → ~143.3 / 180) |
| `DepthPalette.tsx` | **~2.8 KB gz** | a filtered list dialog with a focus trap; `DetailPanel.tsx` is 345 lines and carries reparenting, view transitions and popstate handling, so a ~180-line dialog is roughly half of it. `docs/measurements.md:234` measured the whole overlay chunk at 43.5 KB gz when it still bundled `motion`; the app code in it is a small fraction of that. | **full-descent** (unreferenced chunk) |

Combined with Features 1-3 the full-descent row lands near **~406-407 KB / 430**. Still inside
budget, and still the row with the most slack.

## Accessibility contract

- Dialog semantics identical to `DetailPanel`'s (§ 9.3): `role="dialog"`, `aria-modal="true"`,
  `aria-labelledby`, focus in on open, focus restored on close, `inert` siblings, `Esc`.
- The rows are `<button>`s inside a `<ul>`; the highlighted row is tracked with
  `aria-activedescendant` on the input rather than by moving DOM focus, so typing and arrowing do
  not fight each other.
- The result count is announced through an `aria-live="polite"` element inside the dialog
  (`3 results`), debounced to the input's own rhythm — not per keystroke.
- **`ExhibitProxyNav` remains the single canonical tab stop for exhibits.** The palette adds no
  tab stop to the page: `PaletteKey` renders nothing until invoked, and everything focusable it
  creates lives inside a modal that did not exist a moment earlier.
- Focus ring `outline: 2px solid #8FD3FF; outline-offset: 3px`, per § 9.3. Palette surface
  `#10151C` at full opacity with a `#1B2430` hairline border. No `box-shadow`, no
  `backdrop-filter`.

## Reduced motion

No open/close transition at all under `prefers-reduced-motion` — the dialog appears and
disappears. Under normal motion it uses the same native CSS opacity transition the panel now uses
after `motion` was removed (`docs/measurements.md:254`). Navigation uses `behavior: 'auto'` under
reduced motion because `scrollToExhibitDepth` already decides that (`exhibit-state.tsx:121`).

## Acceptance check a reviewer can run

Open `/`, press `Ctrl+K`, type `game`, press Enter. The document must scroll to `−52 m`, the
GameZone panel must open, and the URL must read `/project/gamezone`. Then press `Ctrl+K` again
with the panel still open: **nothing must happen**. Close the panel with `Esc`, press `Ctrl+K`
again, and confirm it opens. Finally set the tier to `low` in the footer, reload, press `Ctrl+K`,
choose `ENGINE`, and confirm the page jumps to the Engine section with no canvas present.

---

# Ordering and file ownership

## In-flight work this plan must not fight

Three sibling agents are editing the tree right now. Their files are **off limits** to every agent
executing this document until they land:

| Sibling | Files | What it does |
|---|---|---|
| S1 | `src/components/SceneMount.tsx` | mount the scene after first paint instead of on first interaction |
| S2 | `src/three/Fog.tsx`, `src/three/layers/Engine.tsx`, `src/three/layers/Reasoning.tsx` | raise legibility at Engine/Reasoning to ~0.10 mean luminance; recentre Pong's play volume to `x = 0, y = -124` |
| S3 | `src/app/lab/`, `vercel.json`, `src/app/about/page.tsx`, `src/app/resume/page.tsx`, `src/content/site.ts` | remove the lab prototype, add clean-URL rewrites, make the two asset-blocked pages presentable |

Two consequences:

- **Feature 1 must not open `src/three/layers/Reasoning.tsx` until S2 has landed.** S2 is rewriting
  that file's lighting and S1's mount timing changes when the scene exists. Feature 1's edit there
  is a two-line sibling mount; it is trivially rebased and must be done last, not first.
- **Nobody may touch `src/content/site.ts`.** S3 owns it, and `SWITCHBOARD_TRACE = null` must stay
  exactly as it is regardless.

## Ownership

Four agents, disjoint file sets except where noted.

| Agent | Owns exclusively | Shared, by protocol |
|---|---|---|
| **A1 — Visit telemetry** | `src/lib/visit.ts`, `src/components/VisitReadout.tsx`, `src/three/VisitField.tsx`, `src/lib/tier.ts` | `src/components/ProjectArticle.tsx`, `src/components/DeferredOverlays.tsx`, `src/three/layers/Reasoning.tsx` |
| **A2 — Diagrams** | `src/content/snippets.ts`, `src/components/DiagramNodeIndex.tsx`, `src/components/DiagramNodeLink.tsx`, `src/diagrams/DeploymentPlatformDiagram.tsx`, `src/diagrams/GameZoneDiagram.tsx`, `src/components/DetailPanel.tsx` | `src/components/ProjectArticle.tsx` |
| **A3 — 404 Pong** | `src/app/not-found.tsx` | — |
| **A4 — Palette** | `src/components/DepthPalette.tsx`, `src/components/PaletteKey.tsx`, `src/components/KeyboardHelp.tsx`, `src/app/page.tsx`, `docs/design-spec.md` § 9.2 | — |


*Deviation note (2026-09-10 content cut pass): Workstream A2 (`snippets.ts`, `DiagramNodeIndex.tsx`, `DiagramNodeLink.tsx`) was deleted.*
`src/lib/store.ts`, `src/three/depth.ts`, `src/three/PassThrough.tsx`, `src/three/Rig.tsx`,
`src/three/exhibit-state.tsx`, `src/engine/**` and `scripts/measure-budget.mjs` are owned by
**nobody**. Every feature consumes them and none modifies them. If a feature appears to need an
edit there, that is a design error in this document, not a licence.

## Where serialization is genuinely unavoidable

Exactly two places. Everything else is parallel.

1. **`src/components/ProjectArticle.tsx` — A1 and A2 both edit it.** They edit different branches
   of the same JSX switch (A1: `kind === 'node-field'`, lines 74-79; A2: `kind === 'diagram'`,
   lines 69-74), so the *conflict is textual, not semantic* — but they are eight lines apart in an
   81-line file and a three-way merge will produce a mess. **A2 lands first, A1 rebases.** A2 is
   chosen first because its edit is larger and because Feature 2 is the one this plan recommends
   keeping under pressure (below).
2. **`src/three/layers/Reasoning.tsx` — A1 and sibling S2.** S2 must land first. This is a genuine
   dependency, not a merge inconvenience: A1's `<VisitField>` sits in a lighting environment S2 is
   actively changing, and mounting a new emissive cluster into a layer mid-rebalance means A1 would
   be tuning brightness against numbers that are about to move.

Everything that looks like it needs serializing but does not:

- **A3 is fully independent.** `src/app/not-found.tsx` is touched by nobody else, and the feature is
  "render an existing component". It can start and finish before anything else does. Start it first
  for the same reason.
- **A4 touches `src/app/page.tsx`, which nobody else touches.** Feature 1 and Feature 2 both work
  inside `ProjectArticle`, which `page.tsx` merely renders.
- **A2's `DetailPanel.tsx` edit is a one-token selector change** and nobody else opens that file.
- **The budget gate is run once, by the orchestrator, after all four land.** Four agents each
  running `next build` against a shared `out/` directory will produce four wrong answers. The
  per-feature byte estimates in this document are estimates; the single post-merge
  `node scripts/measure-budget.mjs` is the verdict.

## Suggested wall-clock order

```
now        A3 (404 Pong)            ── independent, smallest, ships first
now        A4 (palette)             ── independent
now        A2 (diagrams)            ── independent until it edits ProjectArticle
after A2   A1 DOM half              ── VisitReadout + visit.ts + tier.ts + ProjectArticle
after S2   A1 3D half               ── VisitField + Reasoning.tsx mount
then       orchestrator: tsc --noEmit, next build, measure-budget.mjs, tier parity
```

---

# What I would cut

The complaint is that the site reads as an architecture exhibit rather than something delightful.
That is a complaint about *tone*, and tone is not fixed by adding features — it is fixed by adding
things that behave unexpectedly well when a person pokes them. Judged only against that:

**Cut first: the Cmd+K depth palette.**

It is the feature least connected to the complaint and the one most likely to deepen it. A command
palette is the most conventional possible signal of "developer built this", it is what every
documentation site and every SaaS dashboard has, and it is *navigation* — the one thing this site
already does well four separate ways: the depth gauge's four stops and its `1`-`4` / `↑`/`↓` /
`Home`/`End` bindings (`DepthGauge.tsx:98-129`), `ExhibitProxyNav`'s focusable list in scroll order,
ten real deep-link URLs in `src/content/routes.ts`, and the scrollbar itself. A fifth way to go to
`−52 m` does not make anyone smile; it makes the site feel like an app. It also carries the most
accessibility risk per byte (a second dialog living beside the panel's trap, a new global key
binding, a spec sentence that has to be rewritten to permit it), and it is the only one of the four
that requires editing `docs/design-spec.md` to stop the spec from forbidding it. **Drop it and lose
nothing the site cannot already do.**

**Cut second, if pressure continues: the 3D half of Feature 1, not the feature.**

`VisitField` is ~0.9 KB into the tightest budget row on the site (8.9 KB of headroom, the only row
under 10 KB) and two more draw calls, to render twelve glowing dots that are `aria-hidden` and
whose entire content is duplicated in a `<dl>` two hundred pixels away. The `<dl>` is where the
delight actually lives: *"3D chunk — served from cache"* on a second load is a genuinely
surprising sentence to read on a portfolio, and it does not need a point cloud to land. Ship the
DOM block, leave `-260 m` visually as it is, and revisit the cluster when the deferred-3D row has
room.

**Keep, in this order of confidence:**

1. **The 404 Pong.** It is the highest delight-per-byte change available. Every line of it already
   exists and is tested (`src/engine/loop.test.ts`); the work is composition, not construction; it
   costs zero against the initial-route budget and may *reduce* the full-descent number; and
   finding a working game on a 404 is the single most reliably charming thing on the web. It is
   also the only one of the four that a non-technical visitor enjoys. If exactly one of these four
   ships, it is this one.
2. **The explorable diagrams.** They are the direct answer to "architecture exhibit" — they take
   the most exhibit-like artefacts on the site and turn them into something a reader operates.
   Zero JS bytes for the content, native `<details>`, works with JavaScript off. The honesty of the
   two nodes that say *"Described, not quoted — this repository is private"* is worth more than the
   ten that show code, because it is the thing nobody else's portfolio does.
3. **Feature 1's DOM block.** It is the only one that fixes the specific defect named — an empty
   climax at the deepest point of the descent — and it is the only feature that could not exist on
   any other website. Its risk is that a table of performance metrics is *more* architecture-exhibit,
   not less; the mitigation is the copy, not the code. If the block reads as a benchmark it has
   failed. It has to read as the room noticing you walked in.
