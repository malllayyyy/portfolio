# Improve pass — the Engine decision, an honest critique, and what to build

**Status:** plan only. No code in this document has been executed; nothing outside this
file was modified. Written read-only starting from HEAD `78b74e0`, branch `main`.

The sibling `KillTelemetry` landed mid-pass as `43a7a8f` — *"Remove visit-telemetry
feature (owner rejected)"* — deleting `src/components/VisitReadout.tsx`,
`src/lib/visit.ts` and `src/three/VisitField.tsx`, and editing
`src/components/ProjectArticle.tsx`, `src/three/layers/Reasoning.tsx` and
`src/components/DeferredOverlays.tsx`. Everything below was re-verified against
`43a7a8f`; the three deleted paths appear only where the deletion itself is the subject.
**`ProjectArticle.tsx` is therefore no longer contended, and Proposals 4 and 7 are
unblocked.**

## Budget as reported at `78b74e0` (pre-`43a7a8f`)

| Row | Measured | Limit | Headroom |
|---|---:|---:|---:|
| initial route | 144.9 KB gz | 180 | 35.1 KB |
| deferred 3D chunk | 241.2 KB gz | 250 | **8.8 KB** |
| full-descent visitor | 404.0 KB gz | 430 | 26.0 KB |
| font Satoshi | 20.5 KB | 28 | 7.5 KB |
| font JetBrains Mono | 18.0 KB | 28 | 10.0 KB |

**No limit number is changed by anything in this document.** Every proposal below is
0.0 KB or fractions of a kilobyte, and most are negative.

### The two bases every byte estimate uses

1. **HTML is in no budget row.** `scripts/measure-budget.mjs` measures exactly three
   things: gzip of non-`noModule` `<script src>` chunks in `out/index.html`, gzip of
   chunks referenced by no HTML, and `statSync` of the two WOFF2 files (`LIMITS`,
   `measure-budget.mjs:36-41`). Markup emitted by a server component costs **0 KB on
   all three JS rows**. `Hero.tsx`, `LayerSection.tsx`, `ProjectArticle.tsx`,
   `DescentProfile.tsx` and `page.tsx` are all server components — none carries
   `'use client'`.
2. **3D code compresses ~9:1 here.** `docs/measurements.md` measures all of
   `src/three/**` at **8.3 KB gz** against ~75 KB raw. Any estimate touching the
   deferred 3D row below is `raw bytes / 9`. Tailwind class strings inside an
   already-bundled client module do **not** compress at that ratio; those are estimated
   at ~3:1, which is conservative.

### A free windfall, not claimed by any proposal

`43a7a8f` removed `src/lib/visit.ts` (13.0 KB raw) and
`src/components/VisitReadout.tsx` (2.3 KB raw) from the initial route, and
`src/three/VisitField.tsx` (4.5 KB raw) from the 3D chunk. `[INFERENCE]`
that is roughly 1–2 KB gz back on the initial row and ~0.5 KB gz back on the deferred 3D
row — **not measured here**, because measuring means a full build and this pass writes no
code. Nothing below depends on it; the orchestrator should re-measure rather than assume
it.

---

# 1. The Engine-layer decision

The instruction is *"remove engine game section too. like just keep the pong game in 404
page."* Two readings. Both costed against files opened at HEAD.

## Reading A — delete the Engine layer entirely

The descent becomes three layers plus bedrock.

**Files, tables and constants that change:**

| Path | Change |
|---|---|
| `src/content/layers.ts:14-18` | delete the `engine` entry; `LAYERS` 5 → 4 |
| `src/content/types.ts:1` | `LayerId` union drops `'engine'` |
| `src/content/routes.ts:10` | delete `/layer/engine`; `ROUTES` 11 → 10 |
| `src/content/depth-table.ts` | four of twenty control points (`[0.560,-112]`, `[0.600,-120]`, `[0.690,-134]`, `[0.730,-150]`) exist only to pace the Engine band |
| `src/app/sitemap.ts:8` | maps `ROUTES` 1:1 → `out/sitemap.xml` 11 → 10 URLs |
| `src/app/layer/[slug]/page.tsx:6-8` | derives from `LAYERS`, so no edit — but `/layer/engine` stops being generated; build route count 14 → 13 |
| `src/app/layer/[slug]/opengraph-image.tsx:11` | `engine: '#FF5F56'` key; type-errors if the record is keyed by the narrowed `LayerId` |
| `src/app/project/[slug]/opengraph-image.tsx:12` | same key, same break |
| `src/app/globals.css:13,81` | `--color-engine-accent` and `[data-layer="engine"]` become dead; the closed ten-token palette becomes nine |
| `src/components/ExhibitCard.tsx:137-138` | the `engine` accent branch becomes unreachable |
| `src/components/LayerSection.tsx:10` | `LAYER_STILLS.engine`; `public/stills/engine.avif` orphaned |
| `src/components/DescentProfile.tsx:57` | the `<desc>` names "Engine at -120 metres" verbatim; must be rewritten |
| `src/components/DepthGauge.tsx` | `getLayer()`'s `-120` threshold, and the `1`–`4` key cases — Reasoning becomes `3`, `4` is removed |
| `src/components/DepthPalette.tsx:55` | iterates `LAYERS`; auto-shrinks, no edit |
| `src/three/Scene.tsx:8,32` | remove the `Engine` import and `<Engine />` |
| `src/three/layers/Engine.tsx` | **deleted** — 10.7 KB raw, ≈1.2 KB gz off the deferred 3D row, including the Pong-court converge from `49aba41` |
| `src/three/Fog.tsx` | the `{y:-150}` fog stop, `ACCENT_COLORS[2]`, and `getLayerIndex`'s `y > -150` band |
| `scripts/assert-tier-parity.mjs:15,26` | `'ENGINE'` in `REQUIRED_PHRASES` **and** `out/layer/engine.html` in `ROUTES` — miss either and the gate exits 1; count 11 → 10 |
| `scripts/bake-stills.mjs:56` | the `{ name: 'engine', depth: -120 }` bake target |

**What breaks that is not on that list.** Three of the four hero-level strings are
literally about the number four:

- `src/content/site.ts` `heroSub` — *"Four layers of the same stack"*
- `src/content/site.ts` `ogDescription` — *"Web, app, game, agent — four depths of one stack"*
- `src/app/page.tsx:64-68` and the duplicate in `src/app/about/page.tsx` — *"Four
  domains, four depths of one stack"*

Reading A forces a rewrite of the site's highest-stakes copy, which the owner has already
iterated on twice.

**Does the depth table need re-deriving?** Yes, and this is the expensive part. Removing
the layer without touching the table leaves **190 m of descent with no geometry in it**:
Device's deepest object and Reasoning's shallowest are separated by the entire Engine
band, and that band currently owns `t` 0.600 → 0.870 — **27 % of the scroll**. A visitor
would fall through a quarter of the site through empty fog. Avoiding that means
collapsing those four control points and re-spreading `t` across the surviving three
layers, which changes the `t` field on every entry in `LAYERS`, redraws `DescentProfile`,
and moves the landing point of every deep link (`src/lib/store.ts:126-129` computes
initial scroll through `tOfDepth`). Depths stay valid; the scroll positions that reach
them all move.

**What happens to the Pong-court moment.** It is deleted. `src/three/layers/Engine.tsx`
is the only file that contains it — the `aTarget` attribute, the `uFocus` uniform, the
40-target layout at `y = -124` and the `useFrame` focus ramp all live there and nowhere
else. There is no other depth it could move to; the court is positioned by absolute world
coordinates inside the Engine band.

**Total cost of Reading A:** ~17 files, one gate script, one bake script, a depth-table
re-derivation, a hero/OG/about/résumé copy rewrite, and the deletion of the newest
creative moment on the site.

## Reading B — keep the depth and the geometry, remove the game content

| Path | Change |
|---|---|
| `src/content/layers.ts:17` | the `thesis` string — the only sentence on the site that names Pong outside the 404 |
| `src/content/routes.ts:10` | `description` — *"Where I started: a Canvas 2D Pong written to learn game dev"* |
| `src/three/layers/Engine.tsx` | **optional.** If "game section" includes the court, delete the `aTarget` attribute, the `uFocus` uniform and the 40-target block — ~90 lines, ≈0.1 KB gz back on the deferred 3D row. The frustum and the 40 drifting ghosts survive either way. |

Nothing else. Depth table untouched, `LAYERS` untouched in shape, 14 build routes,
parity 11, all five OG maps, the palette, the fog table, the gauge stops, the `1`–`4`
shortcuts and the Cmd+K entries all unchanged.

**One trap.** `src/app/resume/page.tsx:93` prints `{layer.thesis}` **unguarded**, while
`src/components/LayerSection.tsx:40-42` guards it with `{layer.thesis && ...}`. Emptying the
string leaves a bare empty `<p>` in the résumé's layer card. If the thesis is emptied
rather than replaced, `resume/page.tsx` needs the same guard. If it is replaced, nothing
else moves.

**Total cost of Reading B:** two strings, optionally one shader attribute.

## Recommendation: Reading B, thesis replaced rather than emptied

Two reasons, in order of weight.

**The owner's own clarifier scopes it.** *"like just keep the pong game in 404 page"* names
an outcome he can see — Pong appearing in two places — and asks for one of them to go. It
does not describe a structural deletion, and a structural deletion is not something a
person asks for in that register. He is cutting content, not architecture.

**Reading A is not cheaply reversible.** The depth-table re-derivation changes every `t`,
and undoing it later does not restore the four control points to the values they had. The
hero rewrite is worse: "four layers" is the site's organising claim and it appears in the
meta description, the OG description, the Bedrock block and the About page.

**But Reading B must not mean "do nothing."** The strongest argument for A is real: a layer
with no exhibit and one apologetic sentence is filler, and the sentence currently on it —
*"...and a C++/SFML one and a Java one before it that I no longer have. The Pong still
runs; it lives on the 404 page."* — is an apology with a footnote. Removing the game
content and leaving the apology would be the worst of both. The thesis should stop
pointing at the 404 and stop explaining an absence.

A grounded candidate, every clause traceable to `docs/games.md:20-21` (*"Original C++
SFML Pong: NOT FOUND on local disk"*, *"Original Java 2D RPG: NOT FOUND on local disk"*):

```
'The oldest layer. A C++/SFML Pong and a Java 2D RPG were written here first; neither survives on any disk I still own.'
```

Offered as a candidate, not as final copy. Nothing in it is invented; the owner may
prefer his own sentence or none.

## What the site loses either way — stated plainly

**Under B:** the Engine layer still has no exhibit. A visitor who opens `/layer/engine`
gets a heading, a datum line and one sentence. That is thin, and calling it "deliberately
terse" does not make it less thin. The honest defence is that the 3D at that depth is
genuinely good — the frustum, the ghosts and the court converge are the most interesting
40 m of the descent — and Proposal 6 below is what makes a visitor actually see it.

**Under A:** Game Dev, one of four domains the owner claims, disappears from the site
completely. `docs/projects.md` already records that the domain has zero repository
evidence; deleting the layer makes the site agree that it never happened. That is a bigger
claim than the owner made.

---

# 2. Honest critique of the site as it stands

## 2.1 The 3D is behind the document, not beside it

The canvas is `position: fixed; inset: 0; zIndex: -1` (`src/three/index.tsx:90`). Every
`LayerSection` renders its content inside `lg:col-span-12` (`LayerSection.tsx:24`), and
every project article is `bg-field border border-hairline` — opaque `#0E1116`. At desktop
widths the twelve-column grid is fully occupied, so the 3D is visible only in the 72 px
page margins and in the vertical gaps between sections.

This is the single biggest structural problem. The most expensive engineering on the site
— the `PassThrough` render trick, the `EXTERIOR`/`INTERIOR` layer split, the instanced
ghosts, the fog table — is rendering underneath an opaque document. A visitor experiences
a text page with a dark animated gradient behind it. The Pong-court converge at `y = -124`
happens, correctly, in a strip of margin.

It is also the cheapest thing on this list to fix. See Proposal 6.

## 2.2 Ten seconds

The hero (`Hero.tsx`) gives, in order: a line that is memorable but withholds
(*"I wrote the thing that deploys the thing. Then I went further down."*), a 33-word
sub-line that lists four projects in a comma chain, a credential, and three links
(Résumé / GitHub / Email). Nothing above the fold names the four domains as four things,
and nothing offers a way into any of them. The four layer routes exist
(`routes.ts:8-11`) and are reachable only by scrolling 900 vh, by Tab-ing into
`ExhibitProxyNav`, or by knowing Cmd+K exists.

A recruiter scanning gets: a name, a college, and a riddle. That is a genuine cost of the
concept, and it is fixable in one server component without weakening the concept.

## 2.3 Four projects, two of which are pure prose

- `deployment-platform` → `DeploymentPlatformDiagram` (14.2 KB source) — carries itself.
- `gamezone` → `GameZoneDiagram` (12.8 KB) plus the launcher icon
  (the `gamezone` branch in `ProjectArticle.tsx`) — carries itself.
- `switchboard` → `ProtocolTable`, twelve message names. `SWITCHBOARD_TRACE` is `null`
  (`site.ts:42`) and stays `null`, so the trace list never renders. Thin but honest, and
  the honesty line says so.
- `proacademys` → `presentation: { kind: 'links' }`. `ProjectArticle`'s presentation slot
  has branches for `diagram` and `node-field` only, so this project renders **nothing**
  there. It is two paragraphs and a `LinkRow`.

That last one is the loss. `proacademys` is the **only project with a live, public,
working URL** — `https://proacademys-client.vercel.app/` (`proacademys.ts:19`) — and the
site presents it as one 14 px monospace link among three, below the fold of the article.
The single most convincing artefact the site owns is styled like a footnote. No screenshot
is needed to fix that, and none is proposed.

## 2.4 The pacing is inverted

From `LAYERS`, the `t` each layer is entered at: Surface `0.030`, Device `0.300`, Engine
`0.600`, Reasoning `0.870`.

| Band | `t` span | Share of 900 vh | Exhibits in it |
|---|---:|---:|---|
| Surface → Device | 0.270 | 24 % | 2 |
| Device → Engine | 0.300 | 27 % | 1 |
| **Engine → Reasoning** | **0.270** | **24 %** | **0** |
| **Reasoning → Bedrock** | **0.130** | **12 %** | **1, plus the entire About/contact block** |

The layer with no exhibit gets twice the dwell of the layer holding the project he is
building right now, and Bedrock — portrait, About, Contact, Keyboard help, the descent
profile — is crammed into the last 12 %. This is measurable, not impressionistic, and it
is correctable entirely inside `depth-table.ts` without moving a single depth.

## 2.5 The site says almost nothing about who he is

Bedrock (`page.tsx:44-72`) is a portrait, a name, a credential, and one paragraph that
restates the four layers — the same claim already made by `SITE.hero`, `SITE.heroSub`,
`SITE.metaDescription` and `SITE.ogDescription`. It is the most redundant paragraph on
the site.

Meanwhile the best writing on the site is the `honesty` field on each project, and it is
the last paragraph of every article:

> *"Private repo — it runs a real business, so there is nothing to link to and no demo to
> try. No screenshots either; this one never had a marketing surface."*

That is a voice. It appears four times and is buried four times. Nothing else on the site
sounds like a person.

## 2.6 The phone is the worst-served visitor, and probably the most common one

Verified, not assumed:

- `DepthGauge` is `hidden lg:flex` (`DepthGauge.tsx:155`). Below 1024 px there is **no
  depth readout and no layer navigation at all** — `display:none` also removes its four
  buttons from the accessibility tree, so a mobile screen-reader user loses them too.
- The twelve-column `.page` grid only exists at `min-width: 1024px` (`globals.css:137-142`).
  Below that everything is a single column.
- `detectTier()` awards +1 for `min-width: 1024px` and +1 for `pointer: fine`
  (`tier.ts:58-61`); a phone forfeits both, and typically forfeits the `dpr <= 2` point
  as well. It lands at **mid at best, low routinely** — and low ships zero Three.js by
  design (`SceneMount.tsx:23,134`).
- Low tier's entire visual is `public/stills/*.avif`, which `docs/creative-pass-2.md`
  records as *"known-bad near-black placeholders (three failed bake attempts)"*.

So the mobile visitor gets: no 3D, no depth gauge, near-black images where the scenery
should be, and 900 vh of vertical scroll through a text document. The descent metaphor —
the entire premise — does not exist for them.

## 2.7 A live bug found while reading

`DepthGauge`'s readout is driven by `useStoreSelector` / `subscribe` over `src/lib/store.ts`.
`store.ts` registers **no scroll listener** — `t` is published only by `setScrollT(t)` at
the end of `Rig.tsx`'s `useFrame`, which is the correct single-subscription invariant. It
also means that when there is no 3D, `t` is frozen at its initial value.

At low tier on a **desktop** (`saveData`, no WebGL, or a `substrate-tier` override), the
gauge therefore renders and reads `0 m · SURFACE` permanently, whatever the visitor does.
The four jump buttons still work — they compute from `document.documentElement.scrollHeight`
directly — but the readout lies. It is invisible today only because `hidden lg:flex` hides
it on the narrow viewports where low tier usually lands. Any proposal that unhides the
gauge must deal with this; Proposal 3 does.

## 2.8 What is genuinely good — do not touch it

- **The pass-through at −40 m.** `PassThrough.tsx` at `renderPriority: 1` as the sole
  `gl.render` caller, keyed purely on `camera.position.y`. You fly through the screen of
  the device you are reading about. It is the one idea on the site that no template has.
- **The `honesty` field.** Four sentences that make the whole site credible.
- **The closed palette and the single live `--accent`.** `globals.css:78-83` — one accent
  per depth, focus ring always `--color-surface-accent` regardless of depth
  (`globals.css:98-101`). That is a real discipline and it shows.
- **`ExhibitProxyNav` as the single canonical tab stop**, in depth order, `sr-only` +
  `focus-within:not-sr-only`, never `display:none`, never `aria-hidden`.
- **`DescentProfile`.** A server component that draws the actual `DEPTH_TABLE`, zero JS,
  zero tab stops, `role="img"` with a real `<title>` and `<desc>`. The cheapest good thing
  on the site.
- **`DepthGauge`'s imperative readout.** React re-renders only when the active layer
  changes; the metre reading is written with `textContent`. Correct instinct, correctly
  executed.
- **Everything is server-rendered DOM and the 3D is purely additive.** Whole-document
  parity at low tier is real, and `assert-tier-parity.mjs` enforces it.
- **The Engine court converge** and **the 404 Pong.**

---

# 3. Proposals

Eight, spanning cost. The rule this pass applies: **a proposal that adds paragraphs is
wrong; a proposal that makes an existing thing land harder is right.** Six of the eight
add zero bytes to every budget row because they are server-component markup or class
strings. Nothing below fabricates a project fact, invents a library, or fills
`SWITCHBOARD_TRACE`.

---

## Proposal 1 — Give the dwell to the layer that has something in it

**Depth table. Zero bytes. Highest structural value, highest risk.**

**What the visitor experiences.** Nothing new appears. The descent simply slows where
there is something to look at and speeds up where there is not: the Engine band stops
being the longest stretch on the site, and the Reasoning layer — the node field, the
switchboard, the project he is building now — goes from 12 % of the scroll to roughly a
quarter of it. Bedrock stops arriving all at once. The 900 vh is unchanged; only its
distribution moves.

**Files.**
- Modify `src/content/depth-table.ts` — the **`t` column only**. The `y` column is not
  touched, so every depth in the site still exists at the same metre.
- Modify `src/content/layers.ts` — the `t` field on each of the five entries, which is
  read only by `DescentProfile.tsx` for the datum notches.

Not touched: `src/three/depth.ts` (the interpolation is table-driven and indifferent),
`Rig.tsx`, `store.ts`, `DepthGauge.tsx`, `routes.ts`, `measure-budget.mjs`.

**Bytes.** 0.0 KB on all three JS rows. The table keeps twenty pairs; only the numeric
literals change, and gzip does not care. Basis: `depth-table.ts` is imported by
`src/three/depth.ts` (deferred 3D row) and `DescentProfile.tsx` (server, no row); the
module's token count is identical before and after. **Row: none.**

**Accessibility contract.** No DOM change. `DescentProfile`'s `<desc>` names four datums
at 0, −40, −120 and −260 m; all four are still at those depths, so the description stays
true without editing. No tab stop added or moved.

**Reduced motion.** `depth(t)` is a pure function with no time term; reduced motion is
unaffected at every value. Under `frameloop: 'demand'` the camera still resolves to the
same `y` for the same scroll fraction, which is all reduced motion guarantees.

**Low tier.** Low tier never mounts `Rig`, so no camera reads the table. `DescentProfile`
renders byte-identically at every tier; its curve simply has a different shape. Deep
links still work: `store.ts` resolves them through `tOfDepth(depth)`, which re-derives
from the same table.

**Acceptance check.** A one-line Node assertion over the edited table — `t` strictly
ascending, `y` strictly descending, twenty pairs — then `tOfDepth(-150)` must be
**smaller** than its current value (Reasoning starts earlier in the scroll) while
`tOfDepth(-120)`, `tOfDepth(-40)` and `tOfDepth(0)` still return the depths they name.
Then `node scripts/measure-budget.mjs` — all three JS rows unchanged to 0.1 KB.

**Risk, stated.** This is the only proposal that touches a table everything reads. It
should be executed alone, by one agent, with no other edit in flight.

---

## Proposal 2 — Four depths, above the fold

**Hero. Zero bytes. Fixes the ten-second problem.**

**What the visitor experiences.** Beneath the hero's sub-line, on the same monospace row
as Résumé / GitHub / Email, one more row: `0 m · Web`, `−40 m · App`, `−120 m · Game`,
`−260 m · Agentic AI` — four links to the four layer routes that already exist. In ten
seconds a visitor now knows the four things this person builds and has four ways in. No
sentence is added; the row is data the site already holds, rendered once.

**Files.** Modify `src/components/Hero.tsx` only. It imports `LAYERS` and maps the four
non-bedrock entries, exactly as `DepthGauge`, `DepthPalette` and `resume/page.tsx`
already do.

**Bytes.** 0.0 KB on all three JS rows — `Hero.tsx` is a server component with no
`'use client'`, so it emits markup and no script. ~180 bytes of document HTML, which
`measure-budget.mjs` does not measure. **Row: none.**

**Accessibility contract.** Four ordinary `<a href="/layer/...">` in a `<p>`, in depth
order, inside the existing `<header>`. This does **not** touch the `ExhibitProxyNav`
contract: that nav is the single canonical tab stop for *exhibits*, and the hero already
carries three ordinary anchors (`ResumeLink`, GitHub, Email), so this is the established
pattern, not a new one. Each link's accessible name is its visible text. Underline uses
`decoration-[var(--accent)]`, matching the three links beside it.

**Reduced motion.** Nothing animates. Following a link is a normal navigation.

**Low tier.** Identical DOM at every tier — and on low tier these four links are the
*best* navigation on the site, because the gauge readout is dead there (§ 2.7) and the
3D does not exist. `/layer/<id>` resolves at low tier via `store.ts`'s
`el.scrollIntoView()` branch, which is already implemented.

**Acceptance check.** `out/index.html` contains exactly four anchors whose `href` starts
`/layer/`, inside the `<header>`. `node scripts/measure-budget.mjs` — all three JS rows
unchanged to 0.1 KB. `node scripts/assert-tier-parity.mjs` — still 11 routes.

---

## Proposal 3 — The phone gets the depth gauge back

**DepthGauge. ~0.1 KB. Fixes the worst-served visitor, and fixes § 2.7 on the way.**

**What the visitor experiences.** On a phone, a thin fixed rail along the bottom edge
instead of nothing: the four layer stops as tap targets, with the current depth reading
beside them. The descent metaphor becomes perceptible on the device most people will open
the link on. On desktop nothing changes — the vertical rail stays exactly where it is.

**Files.** Modify `src/components/DepthGauge.tsx`. The change is the container's class
string (`hidden lg:flex flex-col ...` becomes a bottom-anchored horizontal rail below
`lg` and the existing vertical rail at `lg`), plus one guard described below. No new
component, no new file, no new module on the initial route — `DepthGauge` is already a
client island rendered unconditionally by `page.tsx`.

**The § 2.7 guard, which is the non-cosmetic half of this proposal.** The metre readout
is fed by `store.t`, which is published only by `Rig.tsx`. With no 3D, it is frozen and
therefore wrong. The fix that respects the one-scroll-subscription invariant is **not** to
add a listener: it is to render the readout only when 3D is live — gate it on
`document.documentElement.dataset.tier !== 'low'`, the same signal `SceneMount` already
uses. The four stops stay, unconditionally, because they compute their target from
`document.documentElement.scrollHeight` and work at every tier. Low tier gets a working
navigator and no lying number.

**Bytes.** ~0.07–0.1 KB gz on the **initial route** row (35.1 KB headroom, more after
`KillTelemetry` lands). Basis: ~250 raw bytes of additional Tailwind class text plus one
`dataset.tier` comparison, inside a module already in the initial bundle, at the ~3:1
ratio stated above — not the 9:1 3D ratio. **Row: initial route.**

**Accessibility contract.** Strictly an improvement. The four `<button>`s already carry
`aria-label={`Jump to ${layer.name} (${formattedDatum})`}` and live in
`<nav aria-label="Depth navigation">`; today `hidden` (`display:none`) removes them from
the accessibility tree below 1024 px, so mobile AT users cannot reach them at all. The
readout stays `aria-hidden="true"` as it is now. Focus ring is untouched
(`outline-[#8FD3FF]`, already hard-coded to the surface accent per § 9.3). The rail must
not overlap content: bottom padding on `main` or a `safe-area-inset-bottom` allowance,
and it must not become a touch target smaller than 44 px.

**Reduced motion.** `handleClickDatum` and `scrollToT` already branch on
`getMotion() === 'off'` and pass `behavior: 'auto'`. Nothing new animates; the rail has no
transition.

**Low tier.** Renders, stops work, readout suppressed (above). This is the tier that gains
most.

**Acceptance check.** At a 390 × 844 viewport in `out/`: the rail is visible, `Tab`
reaches four buttons, tapping `−260 m` scrolls to the Reasoning section. With
`localStorage.setItem('substrate-tier','low')` and a reload, the four stops still work and
**no metre readout is rendered**. `node scripts/measure-budget.mjs` — initial route row
moves by ≤ 0.2 KB and the gate exits 0.

---

## Proposal 4 — The one live URL stops looking like a footnote

**ProjectArticle. Zero bytes.**

**What the visitor experiences.** `proacademys` is the only project a stranger can open
and use. Today its presentation slot renders nothing and its live URL is one 14 px link
among three. Instead, the `links` presentation kind renders its *live* link as the
exhibit: a single full-width bordered block in the presentation slot, the URL in mono at
`t-md`, labelled `LIVE`. Same styling vocabulary as every other block on the site — `bg`,
hairline border, accent underline. No screenshot, no new copy, no claim added.

**Files.** Modify `src/components/ProjectArticle.tsx` — add a `presentation.kind ===
'links'` branch to the presentation slot. The file is free as of `43a7a8f`. Optionally extend `src/content/types.ts`'s `links` variant
with a `primary?: string` field so the component does not have to guess which link is
live; the lazier alternative is to render the entry whose `label` is `'Live demo'`, which
exists once, in `proacademys.ts:19`.

**Bytes.** 0.0 KB on all three JS rows — `ProjectArticle` is a server component. ~120
bytes of HTML on `/`, `/project/proacademys.html` and the four layer routes. **Row: none.**

**Accessibility contract.** The promoted link **replaces** the `Live demo` entry in
`LinkRow` rather than duplicating it — two anchors to one destination is a duplicate tab
stop and a duplicate announcement. Accessible name is the visible URL text plus the `LIVE`
label; it is an ordinary anchor, already in the reading order between the thesis and the
decisions.

**Reduced motion.** Nothing animates, at any preference.

**Low tier.** Identical DOM at every tier. This is the one proposal whose entire value
survives with zero JavaScript.

**Acceptance check.** `out/project/proacademys.html` contains **exactly one** anchor whose
`href` is `https://proacademys-client.vercel.app/`. The other three project pages are
byte-identical to before. `assert-tier-parity.mjs` still reports 11 routes.

---

## Proposal 5 — The descent profile becomes navigable

**Bedrock. Zero bytes. Cheaper alternative to Proposal 2 — do not build both.**

**What the visitor experiences.** `DescentProfile` already draws the whole descent at
bedrock. Under its figure, one monospace row: `SURFACE · DEVICE · ENGINE · REASONING`,
each linking to its layer route. A visitor who has reached the bottom gets a map of where
they have been that they can actually click.

**Files.** Modify `src/components/DescentProfile.tsx` only.

**The accessibility trap, and why the links go outside the SVG.** The obvious version —
wrap each datum `<text>` in an `<a>` inside the chart — is wrong. The `<svg>` carries
`role="img"` with `aria-labelledby`, which makes its entire subtree presentational to
assistive technology; links inside it would be invisible to AT while remaining
click-targets for everyone else. Rather than dismantle a correct `role="img"` contract,
the links go in a normal `<p>` under the `</svg>`, where they are ordinary anchors. The
chart stays a picture and the navigation stays text.

**Bytes.** 0.0 KB on all three JS rows — server component. ~150 bytes of HTML.
**Row: none.**

**Accessibility contract.** Four ordinary anchors in reading order after the figure. The
SVG's `role="img"` / `<title>` / `<desc>` contract is unchanged.

**Reduced motion / low tier.** Nothing animates, no client JS, byte-identical at every
tier — the same properties that made `DescentProfile` worth building.

**Acceptance check.** `out/index.html` contains four `/layer/` anchors *after* the
`descent-profile-desc` element, and the `<svg>` itself contains no `<a>`.

**Why not both.** Proposal 2 puts the same four links above the fold. Two rows of
identical links on one page is a duplicate navigation — precisely the "fifth navigation
affordance" this project has rejected before. Ship 2; ship 5 only if 2 is rejected.

---

## Proposal 6 — Let the 3D out from behind the document

**LayerSection. One class. Zero bytes. Highest delight per byte on this list.**

**What the visitor experiences.** At desktop widths the reading column stops occupying
the full twelve columns and takes seven. The right five columns are open onto the canvas
at every depth, permanently. The pass-through at −40 m now happens *beside* the Device
heading instead of behind it; the Engine ghosts converging into a court at −124 m are
visible while you read the Engine layer's sentence; the Reasoning node field is a thing
you watch rather than a thing you are told about. The most expensive engineering on the
site becomes the thing you are actually looking at. No copy changes, no element is added,
nothing new is downloaded.

**Files.** Modify `src/components/LayerSection.tsx` — the inner
`<div className="lg:col-span-12">` at line 24 becomes `lg:col-span-7`. That is the whole
change. `prose-measure` already caps body text at 68ch, so no line length degrades; the
project articles keep their `bg-field` card because they are reading surfaces. Bedrock
(`page.tsx:51`) deliberately stays `lg:col-span-12` — it is the destination, not a
waypoint.

**Bytes.** 0.0 KB on all three JS rows — server component, one class token shorter.
**Row: none.**

**Accessibility contract.** Nothing changes: same DOM, same reading order, same headings,
same landmarks, same tab stops. Text still sits on `bg-field` inside a hairline border, so
every contrast ratio is unchanged — the canvas is behind `zIndex: -1` and never becomes a
text background.

**Reduced motion.** Nothing is animated by this change. Under reduced motion the canvas is
already `frameloop: 'demand'`, so what becomes visible is a still image that updates on
scroll — which is exactly what reduced motion should show, and more of it.

**Low tier.** Low tier ships no canvas, so the freed columns render page background. In
practice low tier is almost always below 1024 px, where the twelve-column grid does not
apply at all and the layout is identical to today. The one visible consequence is that a
low-tier *desktop* visitor's layer stills narrow from twelve columns to seven; given
`public/stills/*.avif` are the known-bad near-black bakes, that is not a loss worth
blocking on — but re-baking those stills is the standing prerequisite noted in § 4.

**Acceptance check.** Serve `out/` at 1440 px. The right edge of a `LayerSection`'s inner
div is under 60 % of viewport width. Scroll until `window.__rig.cameraY` reads ≈ −124: the
Pong court must be visible in the open columns, not clipped into the margin. Lighthouse
accessibility stays 100 and CLS stays 0.

---

## Proposal 7 — The honest sentence goes first

**ProjectArticle. Zero bytes. A taste call, flagged as one.**

**What the visitor experiences.** Each project's `honesty` line — the best writing on the
site, and currently its last paragraph — moves directly under the thesis, keeping its
left-rule styling. You learn that GameZone is a private repo running a real business
*before* you read about SQLite WAL settings, instead of after. Nothing is added and
nothing is cut; one JSX block moves up.

**Files.** Modify `src/components/ProjectArticle.tsx`. Land it in the same pass as
Proposal 4 — one writer, one file.

**Bytes.** 0.0 KB on every row — server component, identical markup in a different order.
**Row: none.**

**Accessibility contract.** DOM order change only, and it improves reading order: caveat
before detail. Still a plain `<p>`; no tab stop, no live region, no ARIA.

**Reduced motion / low tier.** Identical at every tier and every preference.

**Acceptance check.** In `out/project/gamezone.html`, the string `Private repo` appears at
a lower character offset than `spinning disk`.

**The honest counter-argument.** It front-loads the limitation on every project. For
`switchboard` — *"Still being built. There is no demo yet"* — that is the first thing a
recruiter reads about the project he is proudest of. This is the owner's call, not a
planner's; it is listed here because the writing deserves a better position than last, not
because the move is obviously correct.

---

## Proposal 8 — Delete the most redundant paragraph on the site

**Bedrock and About. Negative bytes.**

**What the visitor experiences.** One fewer paragraph. The Bedrock block currently says
*"Four domains, four depths of one stack: a self-hosted PaaS and a client rewrite at the
surface..."* — a fourth restatement of a claim already made by `SITE.hero`,
`SITE.heroSub`, `SITE.metaDescription` and `SITE.ogDescription`, and (with Proposal 2)
made visually by the hero link row. After 900 vh of descent, being told again what the
four layers were is the flattest possible ending.

**What replaces it: nothing, and that is deliberate.** § 2.5 is the real gap — the site
says nothing about who he is. The correct content for that slot is one sentence in the
owner's own voice, and **a planner inventing it would be fabricating a personal fact.**
So this proposal removes the redundancy and leaves the slot empty for him to fill, or
empty permanently. Removing a claim is always allowed; inventing one never is.

**Files.** Modify `src/app/page.tsx` (the Bedrock paragraph) and `src/app/about/page.tsx`
— the paragraph is duplicated verbatim in both, so both must change together or the About
page contradicts the home page.

**Bytes.** 0.0 KB on all three JS rows; ~240 bytes *off* the document on two routes.
**Row: none.**

**Accessibility contract.** `assert-tier-parity.mjs` requires each route's extracted text
to exceed 100 characters; both routes are far above that after the cut, and neither of the
script's `REQUIRED_PHRASES` nor `REQUIRED_PROJECTS` appears in the deleted paragraph —
verified against `assert-tier-parity.mjs:5-19`. The `<h2 id="bedrock-h">` and its
`aria-labelledby` are untouched.

**Reduced motion / low tier.** Identical everywhere.

**Acceptance check.** `Four domains, four depths` appears **zero** times anywhere under
`out/`. `node scripts/assert-tier-parity.mjs` still prints `parity OK, 11 routes`.

---

# 4. Ranking, and what to build

Ordered by delight per byte and per unit of risk.

| # | Proposal | Bytes | Risk | Verdict |
|---|---|---:|---|---|
| 1 | **P6** — open the grid to the canvas | 0.0 KB | one class, reversible | **Build first.** If only one thing ships, this. |
| 2 | **P3** — depth gauge on mobile, readout gated | ~0.1 KB init | contained to one client island | **Build second.** Also fixes the § 2.7 bug. |
| 3 | **P2** — four depth links in the hero | 0.0 KB | none | **Build third.** |
| 4 | **P8** — delete the redundant Bedrock paragraph | negative | none | **Build with P2** — same redundancy. |
| 5 | **P1** — re-spread the depth table | 0.0 KB | **highest** — everything reads this table | **Build fourth, alone.** |
| 6 | **P4** — promote the live URL | 0.0 KB | low | **Build any time; file is free.** |
| 7 | **P7** — honesty line first | 0.0 KB | low, but a taste call | **Propose to the owner. Do not ship unasked.** |
| 8 | **P5** — links under the descent profile | 0.0 KB | none | **Do not build if P2 ships.** |

**Build now: P6, P3, P2, P8, then P1 alone, then P4.** Total cost across all six:
**~0.1 KB gz on one row**, and a net reduction in document bytes. Every budget row keeps
its limit and the gate keeps exiting 0.

**What I would not build, and why.**

- **P5 alongside P2.** Two rows of the same four links is the "fifth navigation
  affordance" this project has already rejected once.
- **P7 without the owner's word.** Front-loading *"Still being built. There is no demo
  yet"* on his newest project is his decision to make.
- **Anything that spends the deferred 3D row.** 8.8 KB of headroom is not a budget, it is
  a margin. Every proposal here is 0.0 KB on that row on purpose, and the Engine-court
  deletion under Reading B would give a little back.
- **Anything that adds a paragraph.** The content cut removed 69 % of the body copy one
  pass ago. Six of these eight proposals add zero words; the other two add a label and
  four link texts.

## Considered and rejected as too conventional

New to this pass. The project has already rejected boot-screen intros, bento grids,
tech-logo walls, GitHub contribution widgets, cursor trails, bloom, a fourth light, audio,
visitor counters, confetti at bedrock, and scroll-linked DOM parallax; those stay
rejected, for the reasons already recorded in `docs/creative-pass-2.md`.

- **A sticky top navigation bar.** The correct conventional answer to § 2.2, and it kills
  the premise: a fixed header over a descent announces that the page is a normal page with
  a gimmick bolted on. Proposal 2 buys ~80 % of the benefit for none of the damage.
- **Per-project case-study sections** (problem / approach / result). Re-adds exactly the
  prose the content cut removed, wearing an "improvement" label.
- **A project grid or card wall above the fold.** Bento grid by another name, and the
  screenshots that would make it work were removed by instruction.
- **A thin scroll-progress bar at the top of the viewport.** Duplicates `DepthGauge` and is
  the single most recognisable scrollytelling tell on the web.
- **A typing or terminal effect on the hero line.** Boot-screen intro, already rejected,
  and it delays the one line worth reading.
- **A light/dark toggle.** The palette is closed at ten tokens and the site is a descent
  into rock. A light mode is a second design system built for nobody.
- **Testimonials, endorsements, or a skills-proficiency chart.** Every number would be
  invented. Disqualified by the no-fabrication rule, not by taste.
- **Animated counters on anything.** The count-based stat blocks were already cut for
  presenting basic engineering facts as achievements; animating them would be worse.
- **A second playable game, or moving Pong back onto the descent.** Directly contrary to
  the instruction that produced this pass.

## One standing prerequisite that is not a design proposal

`public/stills/surface.avif`, `device-approach.avif`, `device.avif` and `engine.avif` are
near-black failed bakes, and they are **the entire visual experience of every low-tier
visitor** — which, per § 2.6, means most phones. Re-running `scripts/bake-stills.mjs`
until the output is legible is worth more to real visitors than any proposal in § 3. It is
a pipeline job, not a design decision, which is why it is listed here rather than costed
above.

---

# 5. Execution plan

## Consumed by all, modified by none

**`src/lib/store.ts`, `src/three/depth.ts`, `src/three/PassThrough.tsx`,
`src/three/Rig.tsx`, `scripts/measure-budget.mjs`.**

No proposal in this document edits any of them. `store.ts` keeps its single scroll
authority; `Rig.tsx` stays the only publisher of `t`; `depth.ts` stays the only depth
mapping (Proposal 1 changes its *input table*, never the function); `PassThrough.tsx` stays
the sole `gl.render` caller at `renderPriority: 1`; `measure-budget.mjs` is read-only and
every limit in it is frozen.

**One note, no edit:** `src/three/depth.ts`'s docstring says *"21 control points"* while
`DEPTH_TABLE` holds 20 and `depth-table.ts` says 20. A stale comment, harmless, in a
modified-by-none file. Flagged for the orchestrator to fold into some other pass rather
than opened here.

## Concurrent sibling

`KillTelemetry` **has landed** (`43a7a8f`). It deleted `VisitReadout.tsx`, `visit.ts`
and `VisitField.tsx` and edited `ProjectArticle.tsx`, `Reasoning.tsx` and
`DeferredOverlays.tsx`. No proposal in this document touches `Reasoning.tsx` or
`DeferredOverlays.tsx`, and `ProjectArticle.tsx` now has no other writer, so **Proposals 4
and 7 are unblocked and agent E may run in the first wave.**

## Disjoint ownership sets

| Agent | Proposals | Files — exclusive |
|---|---|---|
| **A · Layout** | P6 | `src/components/LayerSection.tsx` |
| **B · Mobile** | P3 | `src/components/DepthGauge.tsx` |
| **C · Entry** | P2, P8 | `src/components/Hero.tsx`, `src/app/page.tsx`, `src/app/about/page.tsx` |
| **D · Depth** | Engine decision (Reading B) + P1 | `src/content/layers.ts`, `src/content/routes.ts`, `src/content/depth-table.ts`, optionally `src/three/layers/Engine.tsx` |
| **E · Articles** | P4, P7 | `src/components/ProjectArticle.tsx`, optionally `src/content/types.ts` |

No file appears in two rows. A, B, C and E are mutually independent and free of
any landed work, so all four may run in parallel immediately.

## Where serialization is genuinely required

1. ~~`KillTelemetry` → E.~~ Resolved: that agent landed as `43a7a8f`. E is free.
2. **The Engine decision and P1 must be one agent (D), not two.** Both edit
   `src/content/layers.ts` — the decision rewrites the `engine` `thesis`, P1 rewrites the
   `t` field on all five entries. Splitting them puts two writers on one file for no gain.
   Within D, do the Engine decision first (two strings, low risk), verify, then P1.
3. **P1 runs with nothing else in flight.** `depth-table.ts` is read by `depth.ts`, `Rig`,
   `store`, `DepthGauge` and `DescentProfile`. A build failure during P1 must be
   attributable to P1 alone.
4. **P5 is gated on P2 being rejected.** If P2 ships, P5 must not.

```
now        A (LayerSection)  ─┐
           B (DepthGauge)     ├─ parallel, fully independent
           C (Hero + Bedrock) │
           E (ProjectArticle)─┘
           D-1 (Engine thesis + route description)

after D-1  D-2 (depth table + layer t)   ── alone, nothing else in flight
```

## Validation — orchestrator only, once, after everything lands

Not to be run by any of A–E mid-flight; siblings editing concurrently produce phantom
failures.

- `npx tsc --noEmit` — clean.
- `npx next build` — green, **14 routes** (Reading B does not change the count).
- `node scripts/assert-tier-parity.mjs` — `parity OK, 11 routes`.
- `node scripts/measure-budget.mjs` — exits 0. Expected movement: initial route
  144.9 → **≤ 145.1 KB** from P3, minus whatever `43a7a8f` already freed; deferred 3D
  241.2 → **≤ 241.2 KB**; full descent 404.0 → **≤ 404.2 KB**. No limit number touched.
- The 3 engine tests in `src/engine/loop.test.ts` — untouched by every proposal here,
  must still pass.
- Manual, at 1440 px and at 390 px: Lighthouse accessibility **100**, CLS **0**, the
  404's Pong still starts and still never auto-starts.
