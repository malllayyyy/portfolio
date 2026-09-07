# Portfolio — Three Concept Directions

Owner: developer working across **Web · App · Game · Agentic AI**, real projects in each.
Deploy target: Vercel + custom domain. Downloadable resume PDF exists in all three.

These three concepts **disagree with each other** about what a portfolio is:

| | Concept | What it believes a portfolio is | Risk |
|---|---|---|---|
| **A** | **Latency** | A measurement instrument. Proof, not vibes. | Low (S/M) |
| **B** | **Substrate** | A place you travel through. | High (L) |
| **C** | **The Territory** | A document you explore, not a page you scroll. | Medium (M) |

Only one is dark. All three obey: static hero text before any canvas, `prefers-reduced-motion`, full keyboard nav, max 2 font families, mobile-first perf budget.

---

## Concept A — **Latency**

### 1. Name + thesis
**Latency.** *Every one of the four things I build is the same promise — finish before a deadline a human can feel — and the only honest difference between them is how many milliseconds I get.*

### 2. The unifying metaphor
**One logarithmic time axis, 1 ms → 60 s, is the entire navigation spine of the site.**

The four domains are not four sections. They are four *positions on one ruler*, because each domain is defined by a hard latency budget:

| Domain | Budget it lives inside | Where it sits on the axis |
|---|---|---|
| Game Dev | 16.6 ms frame, no exceptions | far left |
| App Dev | ~100 ms touch response, ~1.5 s cold start | left-of-centre |
| Web Dev | ~200 ms interaction, ~2.5 s LCP | centre |
| Agentic AI | 2–60 s tool-call loop, budget measured in tokens and retries | right |

**The mechanic (concrete):** the page scrolls left-to-right along that log axis. Every project is a **tick mark** placed at its real measured budget. Every project card, regardless of domain, renders the *same component*: a horizontal **budget bar** broken into labelled segments that sum to the deadline — `input 2ms · sim 4ms · cull 1ms · draw 7ms · slack 2.6ms` for the game; `plan 1.2s · tool 8.4s · verify 0.9s · slack 19s` for the agent. Identical visual grammar, wildly different scale. That single repeated component is what makes four domains read as one practice instead of four résumés.

The axis is also the site's persistent UI: a thin ruler pinned to the top, always showing where you are and what budget you are currently inside. Jump anywhere by clicking a tick.

### 3. Signature moment
**The hero prints a number measured on the visitor's own machine.**

Above the fold, in large serif: *"This page painted in **312 ms** on your device."* — read from the real `PerformanceObserver` LCP entry, typeset on load, followed by a single line: *"That's my whole web budget. Here's what I do with less."* Then the axis begins and the first tick to the left is a 16.6 ms game frame.

It is a real measurement of the visitor's own hardware, presented as the thesis of the site. Nobody screenshots a tech-logo wall. People screenshot a site that just measured them. No reference site does anything like this — they *claim* performance, this one *reports* it.

### 4. Section-by-section IA
1. **The Number** (hero) — static SSR headline renders instantly; the measured ms value swaps in when the observer fires (no layout shift, digit slot reserved). Static résumé link + email. Scroll cue points **right**.
2. **The Ruler** — full-bleed log axis, 1 ms → 60 s, with all ~10 project ticks visible at once. This is the table of contents. Click a tick → travel to it. This is the only "overview" the site has; there is no separate projects grid.
3. **16 ms — Game Dev** — 1–2 projects. Budget bar broken into frame phases. Embedded 3–6 s silent looping WebM of actual gameplay, `poster` first frame, click-to-play.
4. **100 ms — App Dev** — touch-response and cold-start budgets. Device-frame screenshots, plus one real number per app (bundle size, startup ms, crash-free rate).
5. **200 ms — Web Dev** — interaction + LCP budgets. Before/after bars where a real optimisation happened.
6. **10 s — Agentic AI** — the budget bar becomes a **trace**: one real agent run, replayed as a static, scrubable list of steps with per-step ms and token cost. Not a live fake terminal — a recorded, honest trace with a scrubber.
7. **Slack** (about) — one column of prose about what the leftover milliseconds get spent on. Photo optional. Short.
8. **Contact / Résumé** — email, GitHub, PDF. End of axis: `60 s — everything else`.

Movement: horizontal scroll is *mapped from vertical wheel/trackpad* (native `scroll-snap` on a horizontal container — no scrolljacking); arrow keys and Tab move tick-to-tick; each tick is a real anchor with a real URL.

### 5. Visual system
- **Type (2 families):** **Instrument Serif** (Google Fonts) for headline numbers and section titles — high-contrast, editorial, unexpectedly elegant next to data. **Geist Mono** (Google Fonts) for every measurement, axis label, budget segment and code fragment. Serif states the claim, mono provides the evidence.
- **Palette (light — this is the concept that breaks the dark default):**
  | Hex | Role |
  |---|---|
  | `#F5F3EF` | Page — warm off-white, lab-notebook paper |
  | `#16181C` | Ink — all primary text |
  | `#6B6F76` | Secondary — labels, axis minor ticks |
  | `#D6D2C8` | Rule — hairlines, grid, card borders |
  | `#FF3B14` | Signal vermilion — the "now" marker, deadline line, one CTA |
  | `#1E7F5C` | Slack green — the unused-budget segment only |
  | `#0B0C0E` | Inverted block — the agent trace section only, for contrast |
- **Grid:** strict 12-column with a **1px baseline rule visible throughout** — the page literally looks like graph paper for time. Everything aligns to a 4px vertical rhythm. Asymmetric: text hangs left, numbers hang right against the rule.
- **Texture/material:** none. No shadows, no blur, no gradients. Hairlines, flat fills, and one printed-ink vermilion. The material language is *technical drawing* — measurement instrument, not glass.

### 6. Motion spec
| What | Library | Trigger | Reduced-motion fallback |
|---|---|---|---|
| Horizontal travel along the axis | Native CSS `scroll-snap-type: x proximity` + `scroll-behavior` | wheel/trackpad/keys | `scroll-behavior: auto` — instant jumps, snapping kept |
| Budget-bar segments filling on entry | **Motion** (motion.dev, ~18 KB gz) `whileInView`, 380 ms, staggered 40 ms | IntersectionObserver at 40% | Bars render pre-filled at final width, no stagger |
| Section headings + ticks fading up 12px | Motion, 240 ms ease-out | in-view once | opacity only, 0 ms |
| Agent-trace scrubber stepping | Motion `animate()` on a value, driven by range input | user drag / arrow keys | Identical — user-driven, always allowed |
| Cross-project navigation | **View Transitions API** (0 KB, native) — the clicked tick morphs into the project heading | link click | Browser skips transition automatically when reduced-motion is set |
| Hero number appearing | CSS opacity 160 ms | LCP observer callback | Same; no count-up animation ever (count-ups lie about the measurement) |

Global: one `matchMedia('(prefers-reduced-motion: reduce)')` check sets a `data-motion="off"` attribute on `<html>`; Motion reads it and all durations collapse to 0.

### 7. Tech stack
- **Next.js 15 (App Router) + React, static-exported where possible.** Justification: every section is content, not application state — SSR/SSG gives real HTML text as the LCP element with zero hydration dependency, which is the entire premise of the concept.
- **Tailwind CSS** for the hairline grid system.
- **Motion** (motion.dev) — ~18 KB gz — the only animation dependency.
- **View Transitions API** — 0 KB, native, progressive.
- No 3D. No smooth-scroll library (native scrolling is the honest choice for a site about latency).
- **Total JS beyond framework: ~18 KB gz.**

### 8. Build cost & risk
- **Effort: S/M.** ~2 solid weekends for a strong build; the hard part is copywriting the budget breakdowns, not the code.
- **Risk 1 — the numbers must be real.** If the budget segments are invented, a sharp reviewer smells it instantly and the whole thesis collapses. Owner must produce genuine profiler screenshots/logs for at least one project per domain.
- **Risk 2 — horizontal scroll on desktop trackpads.** Mapped wheel→horizontal can feel wrong on some hardware. Mitigation: horizontal on ≥1024px only; below that the axis becomes a **vertical** ruler with the same tick logic — no layout redesign, just axis rotation.
- **Mobile perf:** trivially excellent. Text, hairlines, one accent colour, ~18 KB of JS, videos lazy with posters. Expect Lighthouse 100/100 on mid-range Android without effort.

### 9. Why it fits this owner
Four domains is normally a *weakness* signal — "generalist, mastered nothing." Latency inverts it into the strongest possible claim: the same engineering discipline, stress-tested across four different orders of magnitude. Game dev proves he can work at 16 ms; agentic AI proves he can reason about systems where the budget is seconds and non-deterministic. Placing them on **one ruler** makes the breadth read as range, not scatter. And it lets the agentic AI work — normally the hardest thing to show visually — be the most interesting section on the site, because a trace with real timings is genuinely fascinating.

---

## Concept B — **Substrate**

### 1. Name + thesis
**Substrate.** *These aren't four disciplines — they're four depths of the same stack, and you get to fall through all of them.*

### 2. The unifying metaphor
**The site is one continuous vertical descent through the layers of a computing stack, and scroll is depth.**

There is a single Three.js scene. The camera never cuts; it dollies down the Z/Y axis through four stratified layers, each a physically distinct environment:

| Depth | Layer | Domain | What it looks like |
|---|---|---|---|
| 0 m | **Surface** | Web Dev | Flat glass plates suspended in light — live DOM-ish panels, type rendered crisply, everything orthographic and clean |
| −40 m | **Device** | App Dev | Physical hardware: phone and tablet bodies floating, screens lit, held in perspective |
| −120 m | **Engine** | Game Dev | The world stops pretending to be flat — wireframes, colliders, a visible frustum, geometry with no textures, the scene showing its own guts |
| −260 m | **Reasoning** | Agentic AI | Below geometry: a dark volumetric field of drifting nodes and edges, activations pulsing along paths — the layer that decides what the layers above should do |

**Why it holds together (the mechanic, not the poetry):** each layer is *causally responsible* for the one above it. Falling from Surface to Device you pass **through a phone's screen** and the content that was UI becomes the world. Falling from Engine to Reasoning, the wireframes you just flew through are revealed as being *drawn by* the node field below. Projects are physical objects embedded at their true depth: a web app is a glass plate at 0 m, a game is a geometry chunk at −120 m, an agent is a live subgraph at −260 m. There is nowhere for a "four unrelated pages" feeling to occur — the visitor never leaves the shot.

Depth is addressable: a persistent **depth gauge** on the right shows `−072 m · DEVICE`, and clicking any of the four layer names dollies there. URLs are `/#device`, `/#engine`, etc.

### 3. Signature moment
**The screen pass-through.**

Around −38 m, the camera approaches a floating phone. The phone's screen is a render target showing one of the owner's actual apps running. The camera keeps descending, enters the screen bezel, and *the render target becomes the scene* — you are now inside the app's own space, and the app's UI elements are 3D objects around you. One continuous move, no cut, no loader.

It's the moment a viewer sends to a friend with "watch what happens when it goes into the phone." Bruno Simon drives a car, Henry Heffernan gives you a desktop — nobody falls *through the screen into the layer below it*.

### 4. Section-by-section IA
1. **Static hero (DOM, above the canvas)** — name, one specific line, résumé link. Plain HTML text, is the LCP element, renders before a single byte of Three.js loads. Canvas boots behind it after `requestIdleCallback` and fades in under the text.
2. **Layer 0 — Surface / Web Dev** — 2–3 glass plates. Focus a plate → DOM overlay panel slides in with the case study (real HTML, real text, scrollable, screen-reader visible).
3. **Transition: the Device approach** — the descent narrows, hardware silhouettes resolve.
4. **Layer 1 — Device / App Dev** — the pass-through moment, then 2–3 app case studies presented as objects inside the app's own space.
5. **Transition: geometry unwrap** — textures strip away, wireframes appear.
6. **Layer 2 — Engine / Game Dev** — playable-adjacent: one short interactive toy (move a light, orbit a rig, step a physics sim) plus real gameplay video panels.
7. **Transition: the render call** — the wireframes are shown being emitted from below.
8. **Layer 3 — Reasoning / Agentic AI** — the node field. Selecting a project lights one real trace path through the graph; the side panel shows the actual steps and outcomes.
9. **Bedrock — About + Contact** — the descent bottoms out on a solid plane. DOM takes over completely: bio, résumé PDF, email, links. The canvas unmounts here to release GPU memory.

Movement: **Lenis** normalised scroll drives a **GSAP ScrollTrigger** timeline that owns the camera. Keyboard: `↑/↓` step 10 m, `1–4` jump to layers, `Tab` cycles focusable DOM proxies for every 3D object (each object mirrors to a real focusable element with an accessible name — the canvas is never the only way in).

### 5. Visual system
- **Type (2 families):** **Satoshi** (Fontshare) — geometric, neutral, holds up over a busy canvas. **JetBrains Mono** (Google Fonts) — depth readout, coordinates, trace steps, code.
- **Palette (dark — the one dark concept, and deliberately not neon-purple):**
  | Hex | Role |
  |---|---|
  | `#06080B` | Void — deepest background, scene clear colour |
  | `#10151C` | Strata — layer fog, panel fills |
  | `#EDF1F5` | Light — all primary text, key light colour |
  | `#8FD3FF` | Surface layer accent (Web) — cool glass |
  | `#FFC46B` | Device layer accent (App) — warm screen glow |
  | `#FF5F56` | Engine layer accent (Game) — wireframe / collider red |
  | `#C8FF6A` | Reasoning layer accent (AI) — acid activation green |
  The four accents are **per-layer light temperature**, not decoration: as you descend, the scene's key light shifts hue, so depth is legible from a single screenshot. No `backdrop-blur` glass cards, no gradient blobs — the light comes from objects in the scene.
- **Grid/layout:** the DOM overlay is a strict right-hand 5-column panel on desktop, full-width sheet on mobile. The canvas is full-bleed behind it. Persistent left-edge depth gauge.
- **Texture/material:** physically-based and restrained. Frosted-thin glass (transmission) at Surface, brushed aluminium and emissive OLED at Device, untextured matcap + wireframe at Engine, additive points and thin lines at Reasoning. One HDR environment map, downscaled to 512px, shared by all layers.

### 6. Motion spec
| What | Library | Trigger | Reduced-motion fallback |
|---|---|---|---|
| Camera descent | **GSAP ScrollTrigger** (~40 KB gz w/ plugin) scrubbed timeline | page scroll progress | Timeline killed. Camera snaps to four fixed presets; scroll becomes ordinary paging between four static rendered views |
| Scroll normalisation | **Lenis** (~4 KB gz) | wheel/touch | Lenis not initialised at all — native scroll |
| Screen pass-through | GSAP timeline segment + render-target swap | depth −36 m → −42 m | Replaced by a hard cut to the Device preset |
| DOM case-study panels | **Motion** (~18 KB gz) slide + fade, 300 ms | object focus/click | Opacity 0→1, 0 ms |
| Node-field pulse (AI layer) | Three.js shader time uniform | continuous rAF | `rAF` loop stopped; single static frame rendered, field frozen mid-pulse |
| Hover highlight on objects | Three.js raycast + emissive lerp | pointer | Kept (pointer-driven, instant) |
| Layer light-temperature shift | GSAP tween on light colour | scroll progress | Set instantly per preset |

Global: reduced-motion **also caps the renderer to a single on-demand render per state change** — no continuous rAF at all, which fixes both the a11y and the battery concern in one switch.

### 7. Tech stack
- **Next.js 15 + React Three Fiber.** Justification: R3F lets every 3D object be a React component with a paired DOM proxy for accessibility, which is the only sane way to keep a WebGL site keyboard-navigable.
- **three** ~150 KB gz · **@react-three/fiber** ~30 KB gz · **@react-three/drei** ~20 KB gz (tree-shaken, a handful of helpers only) · **GSAP + ScrollTrigger** ~40 KB gz · **Lenis** ~4 KB gz · **Motion** ~18 KB gz.
- Assets: GLTF with **Draco** compression, textures as **KTX2/Basis**. Budget: **≤ 3 MB total scene assets**, all lazy-loaded per layer.
- **Total: ~260 KB gz of JS, loaded after first paint, plus lazy per-layer assets.**

### 8. Build cost & risk
- **Effort: L.** 3–6 weeks of real evenings. The pass-through moment alone is several days of iteration.
- **Risk 1 — the scene looks amateur.** A mediocre WebGL scene is *worse* than no WebGL. This concept has no fallback identity: if the lighting, materials and pacing aren't genuinely good, the site fails. Mitigation: build the Device layer first, in isolation; if the pass-through doesn't feel great as a standalone prototype, abandon and take Concept A.
- **Risk 2 — mobile thermals and memory.** Continuous rAF plus render targets on a mid-range Android is a battery and jank hazard.
- **Mobile-perf story:** device-tiered by design. `navigator.hardwareConcurrency` + DPR check picks a tier. Low tier ships **no Three.js at all** — the same content renders as a vertical stack of pre-rendered layer stills (exported from the real scene, so it still looks like the site) with the DOM panels intact. Mid tier: DPR capped at 1.5, no post-processing, render targets at half res. High tier: full experience. The DOM content is identical across all three, so nothing is lost but the travel.

### 9. Why it fits this owner
This is the only concept that makes the four domains feel **inevitable** rather than assembled. A stack genuinely has these layers, and this owner genuinely works at all of them — the site's structure is an argument that his breadth is vertical integration, not indecision. It also happens to be a live demonstration of the game-dev skillset (it *is* a real-time rendered scene), which means the Game Dev section is proven by the medium itself, not just described. High risk, highest ceiling.

---

## Concept C — **The Territory**

### 1. Name + thesis
**The Territory.** *A hand-drawn atlas of one country I've been surveying for years — four regions, four terrains, one weather system moving over all of it.*

### 2. The unifying metaphor
**The site is a single large map that you pan and zoom. There is no scroll and there are no pages.**

One continuous illustrated landmass, drawn once at high resolution. The four domains are four **regions with terrain logic that actually matches how the work behaves**:

| Region | Domain | Terrain, and why |
|---|---|---|
| **The Coast** | Web Dev | Ports, harbours, shipping lanes — the edge where the country meets everyone else. Traffic arrives here. Things ship from here. |
| **The Settlements** | App Dev | Inland towns with roads between them — self-contained places people live in daily, each with its own footprint and population |
| **The Highlands** | Game Dev | Mountains, contour lines packed tight — high elevation, hard to build on, spectacular views. Effort per square metre is enormous |
| **The Basin** | Agentic AI | A low wetland of braided channels that keep re-routing — the terrain that changes shape depending on what flows through it |

**The mechanic that unifies them — the weather:** a translucent **weather layer** drifts across the whole map on a slow real-time loop, and it is the agentic AI made literal. Where the weather front currently sits, that region's annotations become *live*: a station marker in the Coast shows the actual current status/response time of a deployed web project; over the Settlements it shows an app's latest release; over the Highlands, a recent build. The weather originates in the Basin and moves outward — the visual claim being that the AI work now touches everything upstream of it. It's one system, moving over one territory, and it is the reason the four regions are one country rather than four maps.

Projects are **map pins with survey annotations**: each opens a hand-lettered margin card — coordinates, elevation (complexity), "surveyed 2024", the actual write-up, links. Zooming in on any region reveals a second annotation layer that only exists at close zoom (contour labels, road names, sounding depths) — rewarding exploration the way a real map does.

### 3. Signature moment
**Zoom until the map admits it's a map.**

Keep zooming into any region past the normal limit and the illustration doesn't blur — it **resolves into its own construction**: the ink linework becomes visible as strokes, the contour lines separate into labelled data, and the paper's riso mis-registration splits into its individual colour plates, which drift apart by a few pixels and then settle back. For two seconds you see the map being printed. Then a small hand-lettered note appears: *"Surveyed and drawn by hand. Like everything else here."*

It's a craft flex that no dark-mode developer portfolio can do, and it's the antithesis of a Spline torus.

### 4. Section-by-section IA
There is no linear order — but there is a **guided route** for visitors who don't want to explore.

1. **Landfall (entry)** — the map opens at a fixed, composed view of the whole territory. Static SSR headline text is typeset directly *on* the map in the ocean area — name, one sentence, and two buttons: **"Take the tour"** and **"Explore"**. This text is real DOM and is the LCP element; the map image loads behind it progressively.
2. **The Legend** (persistent, bottom-left) — a real map legend that doubles as navigation: four region names, pin-type key, and the weather toggle. Clicking a region flies to it. This is the site's menu.
3. **The Coast — Web Dev** — port pins for shipped web work. Live status readouts under the weather layer.
4. **The Settlements — App Dev** — town pins, each app with install/release annotations, device screenshots pinned like photographs to the margin.
5. **The Highlands — Game Dev** — the visually densest region. Gameplay video plays in a torn-paper window pinned over the contours.
6. **The Basin — Agentic AI** — braided channels; selecting a channel traces one real agent run downstream, and you watch the path it took, annotated at each fork.
7. **The Margin** (about) — the map's border cartouche: portrait, bio, "the surveyor", scale bar, compass rose.
8. **The Post Office** (contact) — a stamped card in the corner of the map: email, GitHub, LinkedIn, **résumé PDF as a "download the survey report"**.

Movement: drag to pan, scroll/pinch to zoom, click legend to fly. **Keyboard: `Tab` moves pin-to-pin in a defined reading order and the map flies to each focused pin — the entire site is completable with Tab and Enter alone.** Every pin has a real URL (`/coast/project-name`) that deep-links to that map position.

### 5. Visual system
- **Type (2 families):** **Gambarino** (Fontshare) — a strange, beautiful display serif with genuine character, used for region names and the cartouche. **Bricolage Grotesque** (Google Fonts, variable) — for every label, annotation and body text; its optical-size axis lets tiny map labels stay legible while headings get personality.
- **Palette (riso print — warm, saturated, not paper-beige-boring):**
  | Hex | Role |
  |---|---|
  | `#FBF7EC` | Paper — base, warm bone |
  | `#22201C` | Ink — linework and body text |
  | `#1F6F6B` | Sea teal — water, Coast region, primary UI |
  | `#D98E2B` | Ochre — Settlements, roads, highlight fills |
  | `#8C2B2B` | Oxblood — Highlands contours, pins, the one CTA colour |
  | `#3B6EA5` | Weather blue — the drifting overlay, always ~35% opacity |
  | `#C9D6CF` | Chalk — Basin wetland, disabled states, grid |
  Strictly **five ink plates + paper**, as a real riso press would allow. That constraint is what makes it look printed rather than designed-in-Figma.
- **Grid/layout:** no page grid — a **map projection**. Layout logic is the annotation system: margin cards align to a hanging baseline on the right, labels align to their pins with leader lines. The only rectilinear element on the site is the legend, deliberately.
- **Texture/material:** riso mis-registration (each colour plate offset 0.5–1.5px), visible paper grain at 6% opacity, halftone dot fills in the sea and Basin, and hand-drawn hairlines with irregular weight. Everything is SVG + one grain PNG — no filters, no blur.

### 6. Motion spec
| What | Library | Trigger | Reduced-motion fallback |
|---|---|---|---|
| Pan / zoom / inertia | **Motion** (~18 KB gz) `drag` + a transform spring on the map container | pointer drag, wheel, pinch | Spring stiffness maxed → movement is instant and non-inertial; drag still works |
| Fly-to a region or pin | Motion `animate()` on x/y/scale, 700 ms ease-out | legend click, Tab focus, deep link | Instant transform set, 0 ms — position still updates, no travel |
| Weather layer drift | CSS `@keyframes` translating one SVG group, 90 s linear infinite | always on | Animation paused; weather sits in one fixed, composed position and the live readouts still work |
| Annotation layer appearing at zoom > 2.2 | CSS opacity transition on a zoom-level class, 200 ms | zoom threshold | Opacity swaps with 0 ms transition |
| Margin card opening | Motion, 260 ms fade + 8px rise | pin click / Enter | Opacity only, 0 ms |
| The plate-separation zoom moment | Motion stagger on 5 SVG plate groups, ±3px offsets, 900 ms out-and-back | zoom past max on any region | **Skipped entirely** — max zoom simply shows the note text, no plate drift |
| Pin hover | CSS transform scale 1.15, 120 ms | pointer | Retained (instant) |

No GSAP, no Lenis, no ScrollTrigger — there is no scroll to trigger on.

### 7. Tech stack
- **Astro + a single React island.** Justification: 95% of this site is static SVG and text that needs zero JS; Astro ships the map and all annotations as pure HTML/SVG (fast LCP, fully crawlable, every project indexable), and only the pan/zoom controller hydrates. Deploys to Vercel unchanged.
- **Motion** (motion.dev) ~18 KB gz — pan, zoom, fly-to, cards. Only runtime dependency.
- Map artwork: **hand-drawn, exported as layered SVG**, optimised with SVGO, split into per-region files loaded on demand; a rasterised WebP fallback for the far-zoom base tile.
- No 3D, no canvas, no scroll library. **Total JS: ~20 KB gz.**

### 8. Build cost & risk
- **Effort: M** — for the code. The code is genuinely small. The **art is the project**: 20–40 hours of illustration, or a commission.
- **Risk 1 — the artwork carries everything.** A mediocre map makes this the worst of the three concepts by a wide margin. There is no way to compensate with code. Mitigation: draw only the Coast region first as a full-fidelity test; if it isn't beautiful, stop.
- **Risk 2 — discoverability.** Non-scrolling sites lose visitors who don't realise they can pan. Mitigations: the composed opening view, a "Take the tour" button that auto-flies the full route, a persistent legend, and a one-time drag hint that appears after 3 s of inactivity.
- **Mobile perf:** excellent — it's SVG and text. Real mobile risk is *interaction*, not speed: on <768px the map locks to one region at a time with a horizontal region-switcher, so pinch-zoom precision is never required. SVG detail is progressively loaded per region so the initial payload is one region, not four.

### 9. Why it fits this owner
Four domains presented as four *terrains* stops the comparison — nobody asks whether mountains are better than a coastline, they're just different country. That neutralises the "jack of all trades" read completely. The weather layer solves the hardest problem in this owner's portfolio: agentic AI has no natural visual form, and here it becomes the one system that moves across and touches every other region, which is exactly what agentic tooling actually does to a developer's other work. And a site that is unmistakably hand-made says something about craft that no amount of framework choice can.

---

## Recommendation

**Build Concept A — Latency.**

It is the only one whose ceiling is set by *thinking* rather than by an asset pipeline. B depends on WebGL artistry that takes weeks and can still land mediocre; C depends on 30+ hours of illustration that either sings or sinks the site. A depends on the owner knowing his own numbers — which he does, because he built the things.

It is also the sharpest positioning. Every other portfolio *claims* range; Latency proves the range is one skill measured at four scales, and it opens by measuring the visitor's own machine. That idea survives being described in one sentence to a recruiter.

It ships in a fortnight at Lighthouse 100 and breaks the dark-mode default. If it lands and the appetite remains, Concept B's descent can be added later at `/substrate` without touching it.

**Owner must supply:** real profiler/trace numbers for one project per domain (frame timing, cold-start, LCP, and one full agent run log with per-step timings and token counts), plus short gameplay clips, app screenshots, and the résumé PDF.
