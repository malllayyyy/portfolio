# Creative pass 2 — two moments, no more words

**Status:** plan only. No code in this document is to be pasted; nothing here has been
executed. Written read-only against HEAD `8ca4212`, branch `main`.

*Deviation note (2026-09-11 Engine removal): Proposal 1 in this document — the Pong-court
converge built into `src/three/layers/Engine.tsx`'s ghost shader (`aTarget`/`uFocus`,
40 targets at `y = −124`) — was deleted along with the rest of the Engine layer at the
owner's explicit instruction to remove the Engine/Game descent section entirely. Pong
itself is unaffected: it continues to run exactly where the 2026-09-10 content-cut pass
put it, on the 404 page only (`src/app/not-found.tsx`, `src/engine/pong.ts`), which was
never part of this document's proposal.*

## The brief, as I read it

The content cut removed ~69 % of body copy. Anything proposed here that adds paragraphs
is the wrong answer to the complaint that produced that cut. So the rule for this pass is
narrower than "add something creative":

> **A moment that rewards attention, costing zero new sentences.**

Two of the five proposals below add exactly **zero words** to the rendered document. One
adds a wordless drawing. The two that add prose or a tab stop are the two I reject.

## Budget as measured at HEAD (§ 8.1 gate exits 0)

| Row | Measured | Limit | Headroom |
|---|---:|---:|---:|
| initial route | 144.9 KB gz | 180 | 35.1 KB |
| deferred 3D chunk | 240.9 KB gz | 250 | **9.1 KB** |
| full-descent visitor | 403.7 KB gz | 430 | 26.3 KB |
| font Satoshi | 20.5 KB | 28 | 7.5 KB |
| font JetBrains Mono | 18.0 KB | 28 | 10.0 KB |

**No budget limit number is changed by anything in this document.**

### The two bases every byte estimate in this document uses

1. **3D code compresses ~9:1 here.** `docs/measurements.md:228` measures all of
   `src/three/**` at **8.3 KB gz**. That directory currently holds 15 modules totalling
   **74.8 KB raw** (`exhibit-state` 5.5, `index` 3.1, `PassThrough` 5.4, `VisitField` 4.5,
   `Fog` 4.4, `Rig` 5.4, `Exhibit` 5.9, `NodeField` 8.1, `depth` 1.7, `ScreenMaterial` 2.0,
   `Scene` 0.98, `layers/Engine` 8.2, `layers/Reasoning` 5.9, `layers/Device` 7.0,
   `layers/Surface` 6.7). 74.8 / 8.3 ≈ **9.0:1** — high, because these files are dominated by
   GLSL string literals and repeated JSX. Every 3D estimate below is `raw bytes ÷ 9`.
2. **HTML is in no budget row.** `scripts/measure-budget.mjs` measures exactly three things:
   gzip of non-`noModule` `<script src>` chunks in `out/index.html` (lines 70-74, 138), gzip of
   chunks referenced by no HTML (lines 129-140), and `statSync` of the two WOFF2 files
   (lines 132-135, 141). Markup rendered by a server component costs **0 KB on all three
   JS rows**, and only real over-the-wire document bytes.

## Ground verified before designing

Every path below was opened at HEAD.

- `src/three/depth.ts` — `depth(t)` / `tOfDepth(y)`, binary search over two `Float64Array`s
  built from `src/content/depth-table.ts`. That table now has **20** control points, not 21:
  **the `[0.640, -124.0]` Pong row is gone.** The Engine layer's interior is therefore one
  straight segment `t 0.600 → 0.690`, `y −120 → −134`, at 155 m per unit `t` — about **72 vh
  of scrolling with nothing in it**, then `0.690 → 0.730` down to the −150 floor. That is the
  hole the owner's agent reported, and it is measurable, not impressionistic.
- `src/three/layers/Engine.tsx` — one `lineSegments` frustum (apex `[0,−150,0]`, base at
  `y = −174`) plus **one `instancedMesh` of 40 wireframe collider ghosts**, scattered over
  `y ∈ [−115, −145]`, `x ±18`, `z ±12`, drifting on a shared `uTime` uniform in a custom
  `ShaderMaterial` with `aOffset` / `aScale` / `aSpeed` instanced attributes. **Two draw calls
  total, and one existing `useFrame`.**
- `src/three/PassThrough.tsx` — `renderPriority: 1`, sole `gl.render` caller. The window is
  keyed purely on `camera.position.y` (`WINDOW_TOP = -30`, `WINDOW_BOTTOM = -40`), so it is
  already symmetric: scrolling **back up** re-runs the pass-through unchanged. Nothing needs
  building to make the trick two-way; it already is.
- `src/three/Fog.tsx` — the three lights, all `layers.enableAll()`. `DirectionalLight`
  intensity at `y = −124` is `0.9 + (−124/−120)·(0.50−0.9)` clamped by the `y >= -120` branch
  → the `−260` branch, ≈ **0.49**. `PointLight` colour at Engine is `#FF5F56`. Anything I add
  in the Engine layer either reuses those or is unlit.
- `src/three/index.tsx:66-71` — `<Canvas aria-hidden="true" role="presentation" tabIndex={-1}>`
  and `frameloop={reduced ? 'demand' : 'always'}`, where `reduced` is
  `data-motion === 'off' || data-panel` present. **Nothing added to the canvas can carry
  information**, and under reduced motion there is no continuous loop — only frames forced by
  `Rig`'s `invalidate()` on `scroll` (`Rig.tsx`, `handleScroll`).
- `src/lib/store.ts` — never subscribes to `scroll`. `setScrollT` has exactly one caller,
  `Rig.tsx`'s `useFrame`. **At low tier there is no `Rig`, so `store.t` is frozen at 0 forever.**
  Any proposal that reads depth on the DOM side must answer for that.
- `src/components/LayerSection.tsx` — renders `LAYER_STILLS` through
  `src/components/LayerStill.tsx`, which is `<div class="border border-hairline bg-field">`
  wrapping an `<img>` at `aspect-[16/10] object-cover`. Device has **two** stills, Engine
  **one**, Reasoning and Bedrock none. That is the shape of the reported empty boxes and it is
  a different agent's ticket; I only note it because **it makes the low-tier answer to every
  proposal below currently untrustworthy** (see "A standing caveat").
- `src/content/layers.ts` — the four datums `0 / −40 / −120 / −260` plus bedrock `−300`, and
  the Engine thesis: *"This is where I started — a Pong I wrote in Canvas 2D to learn game dev,
  and a C++/SFML one and a Java one before it that I no longer have. The Pong still runs; it
  lives on the 404 page."* **Proposal 1 exists to give that sentence something to point at.**
- `src/components/DepthGauge.tsx` — owns `1`-`4`, `↑`/`↓`, `Home`/`End`, and an imperative
  readout updated only when the integer metre changes. `src/components/KeyboardHelp.tsx`
  currently lists two rows (`Tab`, `Cmd/Ctrl+K`).
- `src/three/NodeField.tsx:28` — `const trace: TraceFixture | null = SWITCHBOARD_TRACE;`,
  and `SWITCHBOARD_TRACE` is `null`. **No proposal here touches it, fills it, or synthesises it.**
- `src/three/VisitField.tsx` and `src/components/VisitReadout.tsx` exist and ship — the
  telemetry feature from creative pass 1 landed. Nothing here duplicates it.

### A standing caveat that applies to every proposal

`public/stills/*.avif` are known-bad near-black placeholders (three failed bake attempts).
Low tier renders those stills as its entire visual. **So the honest low-tier answer to every
proposal below is "low tier sees the DOM sentence and a broken still", and that is true today,
independent of this pass.** No proposal here may claim a still shows anything. Re-baking the
stills is a separate ticket and is a prerequisite for low tier being good, not for any of this
being correct.

---

# Proposal 1 — The room assembles the game it lost, then loses it again

**Engine, −120 … −134 m. Recommended, build this first.**

## What the visitor experiences

You drop out of the Device interior into the darkest, emptiest part of the descent. Forty
red wireframe boxes are drifting around you at random, the way they have been drifting since
the layer began — visual noise, debris. As you keep scrolling toward −124 m the drift stops
being random: the boxes slide into place and, for about fifteen metres of travel, they *are*
a Pong court. Two paddle columns, a dashed centre line, a rectangular boundary, and one box
sitting alone between the paddles. You keep scrolling and it comes apart again, back into
drifting debris, and you are past it. Nobody tells you it happened. The one sentence already
on the page beside it says *"a Pong I wrote in Canvas 2D to learn game dev, and a C++/SFML one
and a Java one before it that I no longer have."* The layer about learning briefly holds the
shape of the thing that was learned, and then does not.

That is the entire feature. **It adds zero words, zero DOM, zero tab stops, zero draw calls
and zero files.**

## Files

**Modify — one file, and nothing else in the repository.**
- `src/three/layers/Engine.tsx`
  - `GHOST_VERTEX_SHADER`: add `attribute vec3 aTarget;` and `uniform float uFocus;`. The
    existing drift term becomes `pos += drift * (1.0 - uFocus)` so the court does not jitter.
    After `vec4 worldPosition = instanceMatrix * vec4(pos, 1.0);`, mix the world position
    toward the target: `worldPosition.xyz = mix(worldPosition.xyz, aTarget + position * 0.5, uFocus);`
    — the `position * 0.5` term keeps each ghost a box rather than collapsing it to a point,
    and drops the per-instance rotation baked into `instanceMatrix` as `uFocus` rises, so the
    assembled court is axis-aligned.
  - `ghostMaterial`: add `uFocus: { value: 0 }` to `uniforms`. No new material, no new mesh.
  - `ghostGeometry`: add one `Float32BufferAttribute(targets, 3)` as `aTarget`, built in the
    same `useMemo` that already builds `aOffset`/`aScale`/`aSpeed`.
  - the existing `useFrame((state) => …)`: it already reads `state`. Add
    `ghostMaterialRef.current.uniforms.uFocus.value = f`, where `f` is computed from
    `state.camera.position.y` with no allocation.

**Create:** nothing. **Delete:** nothing.

## The exact geometry, and where it comes from

40 targets, laid out in the plane `y = −124`, inside a **16 m × 10 m** rectangle. That
rectangle is not invented: `docs/design-spec.md` § 2.3 specifies the Engine play volumes as
*"open-topped boxes at `y = −124` (Pong) and `y = −134` (Pixel Quest), each 16 × 10 m"*, and
`−124 m` is the depth the Pong exhibit occupied in § 2.2's table before the content cut
removed the control point. The court is the site's own retired coordinates, reoccupied.

Allocation of the 40 existing ghosts, computed arithmetically in the `useMemo` (a loop, not a
literal table):

| Count | Role | Placement |
|---:|---|---|
| 5 | left paddle | `x = −7.2`, `z = −2.0 … 2.0` in steps of 1.0 |
| 5 | right paddle | `x = +7.2`, same `z` |
| 7 | centre line | `x = 0`, `z = −4.2 … 4.2` in steps of 1.4 |
| 22 | court boundary | evenly spaced around the 16 × 10 rectangle |
| 1 | the ball | `x = 2.4, z = −1.1` — off centre, between the paddles, not mid-serve |

The ball is a **single static box**, not a simulation. No import of `src/engine/pong.ts` into
the 3D chunk, no physics in the render loop, no second engine. The Pong that runs is on the
404 page and stays there; this is its outline, not a copy of it.

`uFocus`, computed per frame from camera depth only:

```
d = abs(cameraY + 124)
motion on  : uFocus = 1 - clamp((d - 2) / 8, 0, 1)     // full 122…126 m, gone by 134 m
motion off : uFocus = d < 8 ? 1 : 0                     // a step, no interpolation
```

Because `uFocus` is a **function of scroll position, not of `uTime`**, it behaves correctly
under `frameloop: 'demand'` without any special case: `Rig`'s `handleScroll` already calls
`invalidate()` when motion is off, so the state is repainted exactly when the visitor moves
and never otherwise.

## Bytes

| Item | Estimate | Basis | Row |
|---|---:|---|---|
| `Engine.tsx` shader + uniform + target loop | **~0.2 KB gz** | ~50 added lines ≈ 1.6 KB raw at the measured 9.0:1 ratio for `src/three/**` (`docs/measurements.md:228`). GLSL text and a numeric loop are the most compressible content in the file. | **deferred 3D**: 240.9 → **~241.1 / 250** |

**Draw calls: unchanged** — still one `instancedMesh` and one `lineSegments` in this layer,
against the 3 exterior / 4 interior recorded at `docs/measurements.md:117` and the § 8.1
ceiling of 120. **Resident triangles: unchanged** — the same 40 instances of the same
geometry. **Lights: unchanged at three** — the ghost material is a custom `ShaderMaterial`
that outputs `vec4(uColor, 0.85)` and consumes no light at all.

## Accessibility contract

- The canvas is `aria-hidden="true" role="presentation" tabIndex={-1}` (`src/three/index.tsx:66-68`).
  This proposal adds nothing to the DOM, so § 9.1's "everything the canvas shows exists in
  the DOM" holds trivially: what the court shows is *"a Pong I wrote in Canvas 2D to learn
  game dev … The Pong still runs; it lives on the 404 page"*, which is already rendered by
  `LayerSection` from `src/content/layers.ts`.
- **No new tab stop.** `ExhibitProxyNav` remains the single canonical exhibit tab stop;
  `ExhibitCard` remains `tabIndex={-1}`.
- No `aria-live`, no announcement, no focus movement, no colour outside `#FF5F56`.
- Contrast: not applicable — no text is added anywhere.

## Reduced motion

`uFocus` becomes a hard step at `|y + 124| = 8`, so there is no easing, no lerp and no
transition; the court is simply present in a depth band and absent outside it, the same way
the fog band is. The existing `uTime` drift is already effectively frozen under
`frameloop: 'demand'`, and this change additionally multiplies that drift by `(1 - uFocus)`,
so the assembled court is **more** still under reduced motion than the current layer is, not
less.

## Low tier

Zero bytes of Three.js are shipped, so this does not exist. Low tier gets the Engine section's
`<h2>`, its datum line, and the thesis sentence — byte-identical DOM to high tier, which is
what `scripts/assert-tier-parity.mjs` requires and what this proposal preserves *by adding no
DOM at all*. See the standing caveat about `public/stills/engine.avif` above; that image is
broken today and is not this proposal's to fix or to claim.

## Acceptance check

Serve `out/`, open `127.0.0.1:4321`, scroll until `window.__rig.cameraY` reads between −123
and −125 (published every frame by `Rig.tsx`). The 40 ghosts must read as a rectangle with two
paddle columns and a dashed centre line. Scroll to `cameraY ≈ −140`: they must be scattered
again. Then set `document.documentElement.dataset.motion = 'off'` and repeat: the court must
appear and disappear as a **step** with nothing easing in between.

---

# Proposal 2 — Bedrock draws the descent you just made

**Bedrock, −300 m. Recommended, build this second. Costs nothing on any budget row.**

## What the visitor experiences

You have scrolled 900 vh. At the bottom, above the contact links, there is a small drawing
about the width of a paragraph: a single line falling from left to right, with four notches on
it. It is not an illustration of a descent — it *is* the descent. The line is the actual
`depth(t)` function the camera was flying, plotted straight out of its own 20 control points:
the flat shelves where you slowed down to read something, the four steep drops where the site
threw you between layers, the long steepest fall from −150 to −248 that felt like the floor
had gone. Four notches, labelled `SURFACE / DEVICE / ENGINE / REASONING`, sit at the depths
you stopped at. You get one glance and understand the shape of the ride you just took, and
there is no paragraph explaining it, because the drawing is the explanation.

## Files

**Create**
- `src/components/DescentProfile.tsx` — a **server component** (no `'use client'`). Imports
  `DEPTH_TABLE` from `@/content/depth-table` and `LAYERS` from `@/content/layers`, maps the
  20 `[t, y]` pairs to an SVG `points` string, and returns one inline `<svg role="img">` with
  `<title>` and `<desc>`. No state, no effect, no listener.

**Modify**
- `src/app/page.tsx` — one line inside the existing `<section id="bedrock">`, placed after the
  `Contact` / `KeyboardHelp` grid: `<DescentProfile />`.

**Not touched:** `src/three/depth.ts`, `src/content/depth-table.ts`, `src/lib/store.ts`,
everything in `src/three/`.

## The exact data

`src/content/depth-table.ts` — the 20 `readonly [t, y]` pairs, verbatim, no recomputation and
no hard-coded coordinates. `x = t · width`, `y = (−depth / 300) · height`. Both axes come from
the table's own extremes (`t ∈ [0, 1]`, `y ∈ [+6, −300]`); there is no magic number in the
component except the viewBox.

The four notches come from `LAYERS`' `datum` and `name` fields (`0 / −40 / −120 / −260`) —
the same source `DepthGauge` and `ExhibitProxyNav` already read. Bedrock's `datum: -300` is
the end of the line and is not notched separately.

Palette: line `var(--color-muted)` `#8FA0B0`, notches and their labels `var(--accent)` (which
`[data-layer="bedrock"]` already resolves to `#8FD3FF` in `src/app/globals.css:83`), frame
`var(--color-hairline)`. Labels in `var(--font-mono)` at `var(--text-t-xs)`. No `box-shadow`,
no `backdrop-filter`, nothing outside the ten tokens.

## Bytes

| Item | Estimate | Basis | Row |
|---|---:|---|---|
| `DescentProfile.tsx` | **0 KB gz** | server component; its module code is never shipped. `scripts/measure-budget.mjs` measures `<script src>` chunks (lines 70-74, 138-140) and two font files (132-135) and nothing else. | **none** |
| rendered markup | **~0.5 KB over the wire** | one `<polyline>` with 20 point pairs (~180 chars), 4 `<line>` + 4 `<text>` notches, `<title>` + `<desc>` ≈ 1.2 KB raw markup, gzipped against a document `docs/measurements.md:172` records at 141,509 bytes of output. **~0.35 % document growth.** | **none** |

This is the only proposal in this document that consumes none of the 9.1 KB of deferred-3D
headroom, and it is the reason it is second on the list rather than fourth.

## Accessibility contract

- `<svg role="img" aria-labelledby>` pointing at its own `<title>` and `<desc>` — exactly the
  pattern the two architecture diagrams used and the pattern § 9.1 already blesses for inline
  SVG. `<title>`: *"The descent profile."* `<desc>`: one sentence naming the four datums in
  metres, so a screen reader gets the same four facts a sighted reader gets from the notches.
  Those four numbers are already elsewhere in the document (`DepthGauge`, `LayerSection`), so
  this adds no new information and no new claim.
- **No tab stop, no `tabindex`, no interactivity.** It is a picture. `ExhibitProxyNav` remains
  the single canonical exhibit tab stop.
- Text labels are `#8FD3FF` on `#06080B` — contrast 12.3:1, well past AA. The plotted line is
  `#8FA0B0` on `#06080B` at 7.4:1, and it is decorative geometry rather than text.
- Renders identically with JavaScript disabled, because it is in the first HTML response.

## Reduced motion and low tier

Nothing animates, at any tier, under any preference — there is no transition, no `useFrame`,
no CSS animation and no client JS. **Low tier is byte-identical to high tier**, which is what
`scripts/assert-tier-parity.mjs` asserts; this proposal is the only one here that strengthens
that assertion rather than merely not weakening it. It is also the only reward at the bottom
of the descent that a low-tier visitor, who never saw the camera move at all, can receive in
full.

## Acceptance check

`node scripts/measure-budget.mjs` after the change: **all three JS rows must be unchanged to
the tenth of a kilobyte.** If any moved, something was made a client component by accident.
Then load `/` with JavaScript disabled, scroll to the bottom, and confirm the drawing is
present, the four labels read `SURFACE / DEVICE / ENGINE / REASONING`, and the line's steepest
segment is the one between `t = 0.730` and `t = 0.830`.

---

# Proposal 3 — The court, built properly, as its own object

**Engine, −124 m. The literal version of Proposal 1. Not recommended — see the ranking.**

## What the visitor experiences

Same moment as Proposal 1, but built as a real object rather than borrowed from the debris:
at −124 m a `#FF5F56` wireframe court is drawn — boundary, centre line, two paddles — and a
single emissive point travels between the paddles, bouncing off the walls forever, with
nobody playing. The court is always there rather than assembling out of the room, and the
ball actually moves.

## Files

**Create**
- `src/three/layers/EngineCourt.tsx` — one `lineSegments` (court, ~40 static vertices built at
  module load into a `Float32Array`) plus one `points` of a single vertex (the ball). Both
  `layers.set(INTERIOR)` via the same `toInterior` idiom `Engine.tsx` and `Reasoning.tsx`
  already use. `MeshBasicMaterial` / `LineBasicMaterial` / `PointsMaterial` — all unlit,
  so the three-light rig is untouched.

**Modify**
- `src/three/layers/Engine.tsx` — mount `<EngineCourt />` inside the existing `<group>`.

## The geometry and the ball

Court: the 16 × 10 m rectangle at `y = −124` from `docs/design-spec.md` § 2.3, as above.

The ball: **one `position.set` per frame inside the component's own `useFrame`**, with the
bounce computed by reflecting a linear parameter — `x = tri(clock.elapsedTime · 0.18) · 7.2`,
`z = tri(clock.elapsedTime · 0.11) · 4.2`, where `tri` is a triangle wave. Zero allocation.
**It does not import `src/engine/pong.ts` and does not reuse its `paddleSpeed`, `aiSpeed` or
`WINNING_SCORE` constants** — a decorative light tracing a Lissajous-ish path is not a Pong
simulation and must not be presented as one.

That is precisely this proposal's weakness, and it is stated here rather than hidden: the ball
is a moving dot pretending to be a game. Proposal 1's still ball, assembled out of the room's
own debris, claims less and means more.

## Bytes

| Item | Estimate | Basis | Row |
|---|---:|---|---|
| `EngineCourt.tsx` | **~0.4 KB gz** | ~110 lines ≈ 3.4 KB raw at the measured 9.0:1 ratio; comparable to `Scene.tsx` (0.98 KB raw) plus a static vertex loop, and below the ~0.55 KB gz per-file average across the 15 modules in `src/three/**`. | **deferred 3D**: 240.9 → **~241.3 / 250** |
| mount line in `Engine.tsx` | ~0.02 KB gz | one JSX element | same |

**Draw calls: +2** (one `lineSegments`, one `points`) against 3/4 today and a ceiling of 120.
Lights unchanged at three.

## Accessibility contract

Identical to Proposal 1: canvas is `aria-hidden`, no DOM added, no tab stop, no live region,
no text. The DOM sentence at `src/content/layers.ts` remains the only statement about the
Engine layer.

## Reduced motion

The ball is driven by `clock.elapsedTime`, which means it **must be explicitly frozen** under
reduced motion — read `document.documentElement.dataset.motion` and pin the ball at a fixed
`(2.4, −1.1)` when it is `off`. This is a special case Proposal 1 does not need, because
Proposal 1's state is a function of scroll position rather than of time. One more branch, one
more thing to get wrong.

## Low tier

No 3D at all; DOM unchanged; see the standing caveat about the Engine still.

## Acceptance check

At `window.__rig.cameraY ≈ −124` a court outline and one travelling `#FF5F56` point are
visible. Set `data-motion="off"` and confirm the point stops dead and stays visible — if it
disappears or keeps drifting, the freeze branch is wrong.

---

# Proposal 4 — The threshold lights up as you cross it

**Device, −40 m. Cheapest thing in this document. Low delight.**

## What the visitor experiences

The pass-through is the site's most expensive engineering and it goes by in about 6.5 % of the
scroll. Today the bezel ring you fly through is brushed aluminium lit only by a directional
light that is already dimming and a point light that is turning orange — so the single most
important frame on the site is also one of its dimmest. This proposal gives the bezel a
`#FFC46B` emissive rim that comes up only while the camera is inside the pass-through window
(`y ∈ (−40, −30]`) and is dark everywhere else. You get a lit doorframe for exactly as long as
you are in the doorway. It marks the threshold *as* a threshold.

## Files

**Modify — one file.**
- `src/three/layers/Device.tsx` — the bezel `<mesh>`'s `meshStandardMaterial` gains
  `emissive="#FFC46B"` with `emissiveIntensity={0}`, a `useRef` on the material, and one
  `useFrame` that sets `emissiveIntensity` from `camera.position.y`. `Device.tsx` currently has
  no `useFrame`, so this adds one import from `@react-three/fiber` — already in the chunk.

**Explicitly not touched:** `src/three/PassThrough.tsx`. The window bounds are duplicated as a
read-only constant, not imported, because importing them would tempt someone to change them;
`PassThrough` remains the only thing that decides what renders when, and the only `gl.render`
caller.

## The exact mapping

`emissiveIntensity = 0.6 · clamp((−30 − y) / 4, 0, 1)` for `y ∈ (−40, −30]`, else `0`. Peak
brightness is reached at `y = −34`, four metres before the screen plane, so the rim is at full
strength for the frames that matter and the ramp itself is invisible.

Emissive needs no light — the three-light rig is untouched, and this is the reason emissive is
the cheap lever in a scene where a fourth light is forbidden.

## Bytes

| Item | Estimate | Basis | Row |
|---|---:|---|---|
| `Device.tsx` ref + `useFrame` + two props | **~0.1 KB gz** | ~15 added lines ≈ 0.5 KB raw at the measured 9.0:1 ratio. Rounded up to 0.1 KB rather than the computed 0.06 KB. | **deferred 3D**: 240.9 → **~241.0 / 250** |

Draw calls unchanged. Materials unchanged in count. Lights unchanged at three.

## Accessibility contract

No DOM, no text, no tab stop. `#FFC46B` is already the Device accent in the closed palette and
is already the point-light colour at this depth (`src/three/Fog.tsx`, `ACCENT_COLORS[1]`), so
this introduces no new colour.

## Reduced motion

The value is a pure function of camera depth, so under `frameloop: 'demand'` it updates on
scroll and is otherwise static — same discipline as Proposal 1. There is no time term to
freeze. Optionally clamp to a step at `y = −34`, but the ramp spans four metres of the
`t 0.235 → 0.270` segment, which the depth table crosses at 171 m per unit `t` — about 19 vh
of scrolling. It is a slow, scroll-driven state change rather than a flourish, and I would
ship the ramp.

## Low tier

Does not exist; DOM unchanged. Low tier's pass-through still is
`public/stills/device-approach.avif` — see the standing caveat.

## Acceptance check

Scroll until `window.__rig.cameraY` reads −34: the bezel ring must be visibly brighter than
the phone body around it. At `cameraY = −44` (past the screen plane, bezel behind the camera)
and at `cameraY = −20`, it must be indistinguishable from today.

---

# Proposal 5 — Your depth in the browser tab

**Site-wide. Costed here so the rejection is grounded. Do not build.**

## What the visitor experiences

The tab title tracks the descent — `Substrate · −124 m · ENGINE` — so the site is still telling
you where you are when it is in a background tab.

## Files

**Modify**
- `src/components/DepthGauge.tsx` — it already subscribes to the store and already computes
  `formatDepthReadout(y)` only when the integer metre changes. One extra line in the same
  callback writes `document.title`.

## Bytes

| Item | Estimate | Basis | Row |
|---|---:|---|---|
| one line in an existing client island | **~0.05 KB gz** | `GameTrigger.tsx` is 711 B raw and lives inside the 2.03 KB gz page chunk measured at `docs/measurements.md:144`; a single statement is a small fraction of that. | **initial route**: 144.9 → **~145.0 / 180** |

## Why this is disqualified rather than merely deprioritised

1. **Accessibility.** `document.title` is what assistive technology announces as a page
   identity. Rewriting it continuously while a person scrolls produces a screen reader that
   announces a new page several times per second. § 9.2's rule is *"no key is ever swallowed"*
   and § 9.1's is *"every single thing it shows exists in the DOM"* — but the operative
   failure here is simpler: it makes the site actively worse to use for the exact audience the
   Accessibility-100 invariant exists to protect. Throttling to the four layer boundaries
   reduces the frequency and does not change the kind of defect.
2. **It is wrong at low tier and cannot be made right.** `src/lib/store.ts` never subscribes to
   `scroll`; `setScrollT` is called only by `Rig.tsx`'s `useFrame`, and low tier has no `Rig`.
   The title would freeze at `0 m · SURFACE` for every low-tier visitor while they scroll the
   whole document — a readout that is confidently, permanently wrong.
3. **It is information, not delight.** The depth gauge already shows this, in the corner of
   the eye, at every metre.

**Verdict: rejected on accessibility grounds. Included only because it is the obvious cheap
idea and someone will suggest it.**

---

# Ranking, and what I would build

Judged against the owner's actual complaint — *"add something more creative"*, said one pass
after approving the deletion of 69 % of the body copy — the ranking criterion is
**delight per word added**, with **delight per byte** as the tiebreak.

| # | Proposal | Words added | Gz cost | Row | Risk |
|---:|---|---:|---:|---|---|
| **1** | **The room assembles the game it lost** | **0** | ~0.2 KB | deferred 3D | shader tuning |
| **2** | **Bedrock draws the descent** | **0 prose** (one `<title>`/`<desc>`) | **0 KB** | none | reads as an infographic |
| 3 | The court as its own object | 0 | ~0.4 KB | deferred 3D | a moving dot pretending to be a game |
| 4 | The threshold lights up | 0 | ~0.1 KB | deferred 3D | too subtle to notice |
| 5 | Depth in the tab title | 0 | ~0.05 KB | initial route | **breaks screen readers; rejected** |

## Build these two: Proposal 1, then Proposal 2

**Proposal 1 first**, and if only one thing ships, it is this one.

- It is the answer to the most thematically loaded hole on the site. The Engine layer is empty
  *because the artefacts were lost* — that is the literal content of the sentence already
  printed beside it. A layer that briefly holds the shape of the lost thing and then lets go
  of it is not decoration; it is the only place on this site where the 3D says something the
  prose cannot say in fewer words.
- It adds **zero DOM, zero words, zero files, zero draw calls, zero lights** and one uniform.
  Every frozen invariant is untouched by construction rather than by care: `PassThrough` still
  owns `gl.render`, `depth.ts` is still the only depth mapping, `Rig` is still the only scroll
  subscription, `SWITCHBOARD_TRACE` is still `null`, and the ghost material has never consumed
  a light.
- It costs ~0.2 KB of the 9.1 KB deferred-3D headroom — about 2 % of the tightest row on the
  site, for the largest visible change available at that price.
- It rewards attention rather than demanding it. There is no button, no prompt, no hint and no
  caption. A visitor who scrolls past quickly sees drifting debris, exactly as today. A
  visitor who slows down at −124 m gets the whole thing, and nothing tells them to.

**Proposal 2 second**, because it is free and because it is the only reward at the bottom that
a low-tier visitor — who never saw the camera move at all — receives in full. It is also the
only proposal that costs nothing on any budget row, which means it can ship even if the
deferred-3D row later tightens.

Its one real risk is that a plotted line reads as *more* architecture exhibit rather than
less. The mitigation is discipline, not code: **four notch labels and nothing else.** No
axis titles, no metre grid, no legend, no caption, no explanatory sentence underneath. If an
executing agent adds a paragraph explaining the drawing, the drawing has failed and should be
reverted rather than annotated.

## Why not 3, 4 or 5

- **3** gets the same moment as **1** for twice the bytes, two extra draw calls, an extra
  file, and an extra reduced-motion branch, and it claims more than it can support: a dot
  travelling on a triangle wave is not the Pong the sentence is talking about. Proposal 1's
  ball is *still*, because the game is over and the players are gone — which is both cheaper
  and truer.
- **4** is nearly free and genuinely improves the site's signature frame, but the honest
  assessment is that it is a lighting tweak. It does not produce a moment; it makes an
  existing moment slightly more legible. **Hold it as a follow-on to ship alongside whichever
  agent next opens `src/three/layers/Device.tsx` for another reason.** It is not worth a
  dedicated pass, a review cycle, and a merge.
- **5** is disqualified on accessibility and is permanently wrong at low tier. See above.

# Considered and rejected before costing

- **Anything that re-adds cut content** — the node index, the screenshots, the stat blocks,
  the Pong article, the fourth decision paragraph. `docs/content-cut.md` named each of these
  and gave the reason. Re-introducing any of them under a "creative" banner is the same
  mistake wearing a different hat.
- **A fifth navigation affordance** (a minimap, a scrubber, a table of contents). Creative
  pass 1 already cut the Cmd+K palette for exactly this reason before the owner reinstated it,
  and the site now has five ways to reach −52 m. A sixth does not make anyone smile.
- **A fourth light anywhere.** Frozen invariant: exactly three lights, all `layers.enableAll()`
  (`src/three/Fog.tsx`). This is why every proposal above that adds visible brightness does it
  with an emissive or unlit material instead.
- **Bloom / any post-processing on the Engine accent.** `docs/design-spec.md` § 8.2:
  *"There is deliberately no post-processing pass and no shadow map at any tier. Both are how
  a WebGL portfolio ends up at 22 fps."* Not a budget question — a spec prohibition.
- **Audio on the descent** (a low tone deepening with depth). No new dependency is needed —
  `AudioContext` is native — but autoplay policy means it needs a control, a control needs a
  tab stop and a label, reduced-motion visitors reasonably expect audio suppressed too, and
  the whole thing is decoration that demands consent before it can delight. Wrong trade.
- **A visitor counter, guestbook, or "you are the Nth person to reach bedrock".** The site is
  a static export with no backend, so any number here would be fabricated or client-only and
  meaningless. The existing `VisitReadout` already occupies the honest version of this idea.
- **Confetti / an achievement / a "you made it" badge at bedrock.** Conventional, and it
  demands to be noticed. Proposal 2 rewards the same arrival by showing the visitor something
  true about the thing they just did.
- **Scroll-linked parallax or reveal animations on the DOM layer sections.** The most
  conventional possible move, hostile to reduced motion, and it would fight the one scroll
  subscription `Rig` publishes into the store.
- **Making the pass-through two-way.** Already is: `PassThrough.tsx` keys the window purely on
  `camera.position.y`, so scrolling back up re-enters through the screen with no change.
  Nothing to build; worth knowing before someone budgets for it.
- **Filling `SWITCHBOARD_TRACE`.** Frozen: it stays `null` and nothing may be synthesised.

---

# File ownership — executing this alongside the three bug fixes

Three sibling agents will be in the tree concurrently:

| Sibling | Owns |
|---|---|
| **B1 — portrait** | `src/components/PortraitSlot.tsx` + the portrait image assets under `public/` |
| **B2 — empty blocks** | whichever component turns out to render the empty bordered boxes. On the evidence — `src/components/LayerStill.tsx` renders `<div class="border border-hairline bg-field">` around an `<img>` at `aspect-[16/10]`, and `src/components/LayerSection.tsx` maps `LAYER_STILLS` with **two** entries for `device` and **one** for `engine`, matching boxes at −048 / −090 / −132 — that is almost certainly `LayerStill.tsx` and/or the `LAYER_STILLS` table in `LayerSection.tsx`. `VisualDiag` owns the verdict; this is context, not a finding. |
| **B3 — text contrast** | text-contrast fixes across the layer sections — most likely `src/components/LayerSection.tsx` and/or `src/app/globals.css` |

## What my recommendation needs

| Agent | Proposal | Files |
|---|---|---|
| **C1** | Proposal 1 | **modifies `src/three/layers/Engine.tsx`** — that file only |
| **C2** | Proposal 2 | **creates `src/components/DescentProfile.tsx`**; **modifies `src/app/page.tsx`** (one line) |

## Collisions

- **C1 collides with nobody.** No sibling touches `src/three/**`. Neither the portrait fix, nor
  the empty-block fix, nor the contrast fix has any reason to open a WebGL layer component, and
  none of the three empty boxes is rendered by the canvas. **C1 can start immediately and in
  parallel with all three.**
- **C2's new file collides with nobody.** `src/components/DescentProfile.tsx` does not exist.
- **C2's one-line edit to `src/app/page.tsx` is the only contact point in this plan, and it is
  adjacent to B1 and possibly to B3.** `page.tsx` renders `<PortraitSlot />` inside the bedrock
  section's `<div class="mt-12 flex flex-col gap-12 lg:flex-row lg:gap-24">`. B1 owns
  `PortraitSlot.tsx`, not `page.tsx` — but changing the portrait from a 320 × 320 square to
  another aspect may well require touching that flex row's classes, which live in `page.tsx`.
  B3 could plausibly reach into `page.tsx` for the bedrock copy's colours as well.

  **Protocol:** C2 inserts a single self-contained `<DescentProfile />` element **after** the
  `mt-24 grid … gap-24` block that holds `<Contact />` and `<KeyboardHelp />` — roughly fifteen
  lines below the portrait row and outside it. That makes any three-way merge a clean insert at
  a different hunk. If B1 or B3 announces they are editing `src/app/page.tsx`, **C2 lands last**
  and rebases; C2's edit is one line and is trivially reapplied, while a portrait layout change
  is not.

- **Nobody owns, and nobody in this plan modifies:** `src/lib/store.ts`, `src/three/depth.ts`,
  `src/content/depth-table.ts`, `src/three/PassThrough.tsx`, `src/three/Rig.tsx`,
  `src/three/Fog.tsx`, `src/content/site.ts`, `src/content/layers.ts`, `scripts/measure-budget.mjs`.
  Proposal 2 *imports* `depth-table.ts` and `layers.ts` and modifies neither. If an executing
  agent believes it needs an edit in any of these, that is a design error in this document, not
  a licence.

## Order

```
now         C1 (Engine ghosts)   ── independent of everything; nothing else opens src/three/**
now         B1, B2, B3           ── the three bug fixes, in parallel
after B1/B3 C2 (descent profile) ── only if either announced a src/app/page.tsx edit; otherwise now
then        orchestrator         ── npx tsc --noEmit, npx next build, node scripts/measure-budget.mjs,
                                    node scripts/assert-tier-parity.mjs, engine tests
```

**The budget gate is run once, by the orchestrator, after everything lands.** Four agents each
running `next build` against a shared `out/` produce four wrong answers. The per-proposal
estimates above are estimates; the single post-merge `measure-budget.mjs` run is the verdict.
Expected movement: deferred 3D 240.9 → ~241.1 KB / 250, everything else unchanged.
