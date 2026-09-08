# Substrate — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build `malaychaudhary.dev` — one uncut Three.js camera descent through four depths of a computing stack, shipped in six phases where every phase is independently deployable and Phase 1 alone is a complete portfolio.

**Architecture:** Next 16 App Router, `output: 'export'`, statically rendered. The entire site — hero, four layer sections, six project articles, both architecture SVGs, about, résumé, contact — exists as real DOM in the first HTML response with zero JS. The WebGL descent is a dynamically imported enhancement chunk that mid/high tier reaches after `requestIdleCallback` and low tier never loads. Content lives in typed data modules that both the DOM path and the 3D path read, so the two can never disagree.

**Tech Stack:** Next 16.3.4 · React 19.2.8 · Tailwind CSS 4.3.3 (CSS-first `@theme`) · three 0.185.1 · @react-three/fiber 9.7.0 · lenis 1.3.26 · motion 13.2.0 · @fontsource-variable/jetbrains-mono 5.3.0 · Satoshi (Fontshare, self-hosted, no npm package) · Vercel. (`gsap`, `@gsap/react`, and `@react-three/drei` removed in Phase 6 budget optimization).

**Spec:** `docs/design-spec.md`. Every task below cites the spec section it implements. Where this plan and the spec disagree, the spec wins and this plan is the bug.

**Supporting docs:** `docs/projects.md` (verified project facts), `docs/live-capture.md` (screenshots, repo/URL verification), `docs/games.md` and `'C:\Users\Malay\.omp\agent\sessions\--C--Portfolio--\2026-09-07T21-36-09-579Z_01a07dcc-cf6b-72be-adbe-d5a37248826d\GameHunt.md'` (exact current shape of `pong.js` / `rpg.js`), `docs/concepts.md` (concept rationale).

---

## Owner resolutions applied (these were § OPEN QUESTIONS; they are now decided)

| OQ | Resolution | Effect on this plan |
|---|---|---|
| **OQ1 Domain** | **`malaychaudhary.dev`** | Site runs on the `.vercel.app` subdomain from Phase 1. Cutover is Task 6.7 in Phase 6. `SITE_URL` is one constant (`src/content/site.ts`) so the cutover is a one-line change plus a Vercel DNS step. |
| **OQ2 Hero / meta** | Hero = § 13.1 **candidate A**; § 13.1 **candidate B** becomes the sub-line beneath it; `<meta name="description">` = § 13.2 **candidate 2**; OG/Twitter description = § 13.2 **candidate 3**. Candidate C is the LinkedIn headline and **is not used on the site at all**. | Wired as literal strings in Task 1.4. Candidate C appears nowhere in the codebase. |
| **OQ3 Switchboard trace** | **DEFERRED — owner is still actively building Switchboard.** The Reasoning exhibit ships with the **12 protocol message types (5 client + 7 server) as the exhibit**. A trace-replay slot is designed as a clean drop-in, addable later with no rework. | **No trace fixture is authored, synthesised, mocked or approximated.** Task 5.6 builds the node field against the 12 types only and defines the drop-in seam (`TraceFixture` type + `traceFixture: null`). Task 5.7 is the documented, not-yet-executed drop-in. The § 2.3 "Trace path" `Line` object and § 7 motion row 13 are built but mount only when `traceFixture !== null`. |
| **OQ4 Pixel Quest touch** | Accepted as specced — video-only on touch, no on-screen d-pad. | Task 2.7 implements § 5.5 exactly. |
| **OQ5 Reduced-motion default** | Accepted as specced — mid tier starts in the descent; the frame-time watchdog demotes. | Task 2.2 does not special-case first-time mobile visitors. Task 6.2 builds the watchdog. |

**Still owner-blocked, both with honest interim states already specced and built from Phase 1:**

| Asset | Lands at | Interim state (must never break) |
|---|---|---|
| **Résumé PDF** | `public/malay-chaudhary-resume.pdf` | § 12 item 6. The link slot is live from Phase 1 and points at `/resume`, which states plainly that the PDF is coming and gives `malayrc276@gmail.com`. When the file lands, `RESUME_PDF_PRESENT = true` in `src/content/site.ts` flips the hero/Bedrock/`/resume` links to the direct download. **No dead link ships at any point.** |
| **Portrait photo** | `public/portrait.avif` (+ `.webp`), ≥ 1200 px square | § 12 item 7. Until supplied, `PortraitSlot` renders a flat `--strata` block with the name and *B.Tech CSE, IIIT Naya Raipur* set in Satoshi. That is a legitimate design, not a broken image. Flipped by `PORTRAIT_PRESENT = true`. |
| **Switchboard trace** | `src/content/switchboard-trace.json` | OQ3 above. Until supplied, `traceFixture` is `null`, the trace `Line` and the DOM step list do not mount, and the Reasoning panel carries the 12-type protocol table as the exhibit. **Nothing renders empty and nothing renders fake.** |

---

## Global Constraints

Every task's requirements implicitly include this section. Values are copied verbatim from the spec.

- **Non-goals (§ 1.2) are hard bans, all twelve.** No tech-logo wall. No bento grid. No boot screen or fake terminal intro. No GitHub contribution widget or star badges. No purple/pink gradient blobs, glassmorphism, or `backdrop-blur`. No custom cursor trail. No word-by-word scroll reveal on body copy. No decorative torus/mascot/ambient shader without a narrative job. **No resemblance to `malllayyyy-portfolio.vercel.app`** — specifically banned by inheritance: Press Start 2P / Silkscreen, `#00f5a0` on black, CRT scanlines/bloom toggle, XP bar, achievement toasts, `⌘K` palette, rank labels, "Quest Board", theme switcher. No scrolljacking with a hijacked scrollbar. No auto-playing audio, ever. No "I turn complex problems into elegant solutions" copy.
- **Every claim in body text traces to a file path or a measured fact in `docs/projects.md`.** If a sentence cannot cite, it does not ship.
- **Two font families only:** Satoshi (Fontshare, self-hosted, **no npm package exists**) and JetBrains Mono (`@fontsource-variable/jetbrains-mono@5.3.0`). Nothing else, at any tier, in any component.
- **Palette (§ 6.2) is closed.** Ten tokens. No colour outside the table appears anywhere, including SVGs and canvas draw calls.
- **Exactly one accent is live at any depth.** `--surface-accent #8FD3FF` / `--device-accent #FFC46B` / `--engine-accent #FF5F56` / `--reasoning-accent #C8FF6A`. `#FF5F56` is never used for body text (5.0:1) — strokes, the Pong ball, and ≥ 20 px headings only.
- **Spacing scale (§ 6.4): `4, 8, 12, 16, 24, 32, 48, 64, 96, 128` px. Nothing else.**
- **No `backdrop-filter` and no `box-shadow` on any DOM element, site-wide.** Elevation is fill value plus 1 px `--hairline` borders.
- **No post-processing pass and no shadow map at any tier (§ 8.2).**
- **Budget gates (§ 8.1):** initial route ≤ **180 KB gz** (measured Next 16 + React 19 framework floor of 173.3 KB gz + app client JS, with ~6.7 KB slack for Phase 5/6 client features); deferred 3D chunk ≤ **250 KB gz**; total JS ≤ **430 KB gz**; fonts ≤ **28 KB each, ≤ 56 KB total**; scene assets ≤ **2.8 MB**; low-tier stills ≤ **70 KB each, ≤ 380 KB total**; draw calls ≤ **120** high / ≤ **60** mid; resident triangles ≤ **180 k** high / ≤ **90 k** mid.
- **Low tier ships zero bytes of Three.js.** The 3D code is behind a dynamic `import()` low tier never reaches.
- **The DOM content is byte-identical across all three tiers (§ 8.3).** Asserted at build time in Task 6.5.
- **Accessibility target: WCAG 2.2 AA, Lighthouse Accessibility 100 on every route at every tier.** The canvas is `aria-hidden="true" role="presentation" tabindex="-1"` and everything it shows exists in the DOM as real focusable content (§ 9.1).
- **Scroll maps 1:1 and monotonically to a real document scroll offset.** The scrollbar is real and draggable.
- **Dependencies are the § 11 table and nothing else.** No state-management library, no icon library, no UI component library, no physics engine, no `@react-three/postprocessing`, no analytics beyond Vercel Web Analytics. Adding a package that is not in § 11 requires a spec amendment first.
- **Commit after every task.** Conventional-commit prefixes (`feat:`, `chore:`, `fix:`, `docs:`).

---

## Parallelism protocol

This plan is executed by concurrent subagents. Two rules, no exceptions:

1. **Every task declares `**Parallelism:**` with a file-ownership boundary** — the exact paths it may create or modify. A task may touch nothing outside its boundary.
2. **Any two tasks whose boundaries intersect on even one file are SERIALIZED against each other**, in the order given. A task marked `SERIALIZED after Task N` must not start until Task N is committed.

Files that many tasks want are deliberately concentrated so serialization chains stay short:

| Shared file | Serialized chain (in order) |
|---|---|
| `package.json` | 1.1 → 2.1 → 3.1 → 6.1 |
| `src/app/globals.css` | 1.2 → 1.3 → 2.6 → 5.4 |
| `src/app/layout.tsx` | 1.1 → 1.3 → 1.9 → 2.2 → 6.4 |
| `src/content/site.ts` | 1.4 → 6.7 |
| `next.config.mjs` | 1.1 → 6.1 |

Everything else is single-owner and parallel-safe.

---

## File Structure

The tree Phase 1 creates in full. Later phases add only the files their tasks name.

```
C:/Portfolio/
  package.json                          Task 1.1  deps, scripts, budget measurement script (6.1)
  next.config.mjs                       Task 1.1  output:'export', images.unoptimized
  tsconfig.json                         Task 1.1
  postcss.config.mjs                    Task 1.1  @tailwindcss/postcss
  .gitignore                            Task 1.1
  scripts/measure-budget.mjs            Task 6.1  HTML script tag parser for accurate network payload measurements
  scripts/
    subset-fonts.sh                     Task 1.10 glyphhanger driver, run manually
    bake-stills.mjs                     Task 4.7  Playwright capture of 5 datums
    assert-tier-parity.mjs              Task 6.5  low vs high DOM text diff
  public/
    fonts/Satoshi-Variable.subset.woff2       Task 1.10
    fonts/Satoshi-LICENSE.txt                 Task 1.3  (from the Fontshare zip)
    fonts/JetBrainsMono-Variable.subset.woff2 Task 1.10
    malay-chaudhary-resume.pdf                OWNER — absent until supplied
    portrait.avif / portrait.webp             OWNER — absent until supplied
    stills/{surface,device-approach,device,engine,reasoning}.avif  Task 2.4 placeholder, Task 4.7 real
    video/pixel-quest.{mp4,webm} + poster.avif                     Task 2.7
    shots/proacademys/*.avif|.webp            Task 1.7  (from assets/raw/proacademys/)
    gamezone/ic_launcher.png                  Task 1.7  (from assets/raw/gamezone/)
    models/phone.glb                          Task 3.2  Draco, ≤ 9k tris
    env/studio-512x256.ktx2                   Task 4.2
    matcap/engine-256.ktx2                    Task 4.2
    textures/*.ktx2                           Tasks 4.2, 5.2
  src/
    app/
      layout.tsx                        Task 1.1 → 1.3 → 1.9 → 2.2 → 6.4
      globals.css                       Task 1.2 → 1.3 → 2.6 → 5.4
      page.tsx                          Task 1.8   /
      about/page.tsx                    Task 1.9   /about
      resume/page.tsx                   Task 1.9   /resume
      layer/[slug]/page.tsx             Task 1.8   /layer/{surface,device,engine,reasoning}
      project/[slug]/page.tsx           Task 1.8   /project/{6 slugs}
      lab/passthrough/page.tsx          Task 3.1   Phase 3 prototype route
      sitemap.ts                        Task 6.4
      robots.ts                         Task 6.4
      opengraph-image.tsx               Task 6.3
      layer/[slug]/opengraph-image.tsx  Task 6.3
      project/[slug]/opengraph-image.tsx Task 6.3
    content/
      types.ts                          Task 1.4   all content interfaces
      site.ts                           Task 1.4   hero, meta, contacts, asset flags, SITE_URL
      layers.ts                         Task 1.4   4 layer records
      routes.ts                         Task 1.4   the § 10.1 route table as data
      depth-table.ts                    Task 1.4   the 18 § 2.2 control points as data
      projects/index.ts                 Task 1.4
      projects/deployment-platform.ts   Task 1.5
      projects/proacademys.ts           Task 1.5
      projects/gamezone.ts              Task 1.5
      projects/pong.ts                  Task 1.5
      projects/pixel-quest.ts           Task 1.5
      projects/switchboard.ts           Task 1.5
      switchboard-trace.json            OWNER — absent (OQ3 deferred)
    components/
      SkipLink.tsx                      Task 1.6
      Hero.tsx                          Task 1.6
      LayerSection.tsx                  Task 1.6
      ProjectArticle.tsx                Task 1.6
      DecisionList.tsx                  Task 1.6
      ScaleStats.tsx                    Task 1.6
      LinkRow.tsx                       Task 1.6
      ShotGallery.tsx                   Task 1.7
      PortraitSlot.tsx                  Task 1.6
      Contact.tsx                       Task 1.6
      KeyboardHelp.tsx                  Task 1.6
      ResumeLink.tsx                    Task 1.6
      TierToggle.tsx                    Task 2.2
      GameMount.tsx                     Task 2.6
      DepthGauge.tsx                    Task 4.6
      ExhibitCard.tsx                   Task 5.3
      DetailPanel.tsx                   Task 5.4
    diagrams/
      DeploymentPlatformDiagram.tsx     Task 1.7a
      GameZoneDiagram.tsx               Task 1.7b
    lib/
      tier.ts                           Task 2.2   § 8.2 scoring + override + webglSupported
      motion-pref.ts                    Task 2.3   live prefers-reduced-motion store
      store.ts                          Task 4.5   useSyncExternalStore over t/tier/panel
      watchdog.ts                       Task 6.2   frame-time demotion
    engine/
      loop.ts                           Task 2.5   fixed-timestep accumulator (§ 5.1)
      loop.test.ts                      Task 2.5   the only test on this project
      pong.ts                           Task 2.6   port of C:/portfolio website/games/pong.js
      pixel-quest.ts                    Task 2.7   port of C:/portfolio website/games/rpg.js
      skin.ts                           Task 2.6   § 5.2 draw constants, shared
    three/
      index.tsx                         Task 4.1   the dynamic-import entry (the whole 3D chunk)
      depth.ts                          Task 4.1   depth(t) / t(depth), Float32Array binary search
      Scene.tsx                         Task 4.2
      Rig.tsx                           Task 4.3   camera, drift curve, exponential settle (tau ≈ 0.12 s), Lenis
      Fog.tsx                           Task 4.4   § 2.4 fog + 3 lights
      layers/Surface.tsx                Task 4.2
      layers/Device.tsx                 Task 3.2 → 4.2
      layers/Engine.tsx                 Task 4.2
      layers/Reasoning.tsx              Task 4.2
      PassThrough.tsx                   Task 3.3   two-pass render + screen material
      ScreenMaterial.ts                 Task 3.3   gl_FragCoord shader
      Exhibit.tsx                       Task 5.1   mesh + DOM proxy pairing
      NodeField.tsx                     Task 5.6
```

---

# Phase 1 — The whole site, static, no WebGL

**Spec:** § 15 Phase 1. **Deliverable:** Next 16 App Router project, Tailwind 4, both fonts subset and self-hosted, the full route table (§ 10.1), and every word of content — hero, four layer sections, all six project articles with verified facts and file-path evidence, both architecture SVGs, about, résumé slot, contact. Plain vertical document. **No canvas, no `three`, no `lenis` in `package.json` yet.**

**This phase is the kill-switch for Risks 1 and 4 (§ 14). After Phase 1 the portfolio exists.**

**Phase 1 gate — all five must pass before Phase 2 starts:**

| # | Check | Command / action | Expected |
|---|---|---|---|
| G1.1 | Lighthouse mobile | `npx lighthouse http://localhost:3000/ --only-categories=performance,accessibility,best-practices,seo --form-factor=mobile --throttling-method=simulate --output=json --output-path=./lh-mobile.json` | Performance ≥ **98**, Accessibility **100**, CLS ≤ **0.01**, LCP ≤ **2600 ms** (measured floor, see `docs/measurements.md`), FCP ≤ **1.0 s**, TTI ≤ **2700 ms** (measured floor, see `docs/measurements.md`) |
| G1.2 | Initial-route JS | `node scripts/measure-budget.mjs` (or `du -b .next/static/chunks/*.js`) | initial route ≤ **180 KB gz** (measured Next 16 + React 19 framework floor for zero-client-component export) |
| G1.3 | Keyboard pass | Load `/`, press `Tab` from page load to footer without touching the mouse | Order is: skip link → Surface exhibits (2) → Device exhibit (1) → Engine exhibits (2) → Reasoning exhibit → Bedrock links (résumé, email, GitHub, LinkedIn) → footer. Focus ring `2px #8FD3FF`, `outline-offset: 3px`, visible on every stop. No trap. |
| G1.4 | No-JS | DevTools → Settings → Debugger → Disable JavaScript → reload `/` | Every heading, every project fact, both SVG diagrams, every link present and usable. `<noscript>` shows the résumé link and `malayrc276@gmail.com`. |
| G1.5 | Live on a phone | `vercel --prod`, open the `.vercel.app` URL on a real Android phone | Site loads, reads, scrolls; no horizontal overflow at 390 px |

---

### Task 1.1: Project scaffold

**Files:**
- Create: `package.json`, `next.config.mjs`, `tsconfig.json`, `postcss.config.mjs`, `.gitignore`
- Create: `src/app/layout.tsx` (minimal shell — Task 1.3 adds fonts, 1.9 adds metadata)
- Create: `src/app/globals.css` (empty file with a single `@import "tailwindcss";` — Task 1.2 fills it)

**Parallelism:** **SERIALIZED — first task in the repo.** Owns the repo root. Head of the `package.json`, `next.config.mjs`, `layout.tsx` and `globals.css` chains. Nothing else may start until this is committed.

**Interfaces:**
- Produces: a buildable Next 16 App Router project at `C:/Portfolio` with `output: 'export'`.

- [ ] **Step 1: Create `package.json`**

```json
{
  "name": "substrate",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "npx serve out",
    "subset-fonts": "bash scripts/subset-fonts.sh"
  },
  "dependencies": {
    "next": "16.3.4",
    "react": "19.2.8",
    "react-dom": "19.2.8"
  },
  "devDependencies": {
    "@tailwindcss/postcss": "4.3.3",
    "@types/node": "22.10.2",
    "@types/react": "19.0.2",
    "@types/react-dom": "19.0.2",
    "tailwindcss": "4.3.3",
    "typescript": "5.7.2"
  }
}
```

`three`, `gsap`, `@gsap/react`, `lenis`, `motion`, `@react-three/fiber`, `@react-three/drei` are **deliberately absent**. They arrive in Tasks 2.1 and 3.1.

- [ ] **Step 2: Create `next.config.mjs`**

```js
/** @type {import('next').NextConfig} */
export default {
  output: 'export',
  images: { unoptimized: true },
  reactStrictMode: true,
  eslint: { ignoreDuringBuilds: true },
};
```

`output: 'export'` is required by § 11 ("Static output … No serverless functions, no database, no runtime environment variables"). `images.unoptimized` follows from it; the ProAcademys shots are pre-encoded AVIF/WebP in Task 1.7 rather than resized at request time.

- [ ] **Step 3: Create `tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "ES2022"],
    "allowJs": false,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./src/*"] }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules", "out"]
}
```

- [ ] **Step 4: Create `postcss.config.mjs`**

```js
export default { plugins: { '@tailwindcss/postcss': {} } };
```

- [ ] **Step 5: Create `.gitignore`**

```
node_modules
.next
out
*.tsbuildinfo
next-env.d.ts
lh-*.json
tmp/
.vercel
```

- [ ] **Step 6: Create `src/app/globals.css` with one line**

```css
@import "tailwindcss";
```

- [ ] **Step 7: Create `src/app/layout.tsx`**

```tsx
import type { ReactNode } from 'react';
import './globals.css';

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
```

- [ ] **Step 8: Create a throwaway `src/app/page.tsx` so the build has a route**

```tsx
export default function Home() {
  return <h1>Substrate</h1>;
}
```

Task 1.8 replaces this file entirely.

- [ ] **Step 9: Install and build**

Run: `npm install && npx next build`
Expected: build succeeds; `out/index.html` exists and contains the string `Substrate`.
Verify: `npx serve out` then open `http://localhost:3000/` — an `<h1>` reading `Substrate` on a white page.

- [ ] **Step 10: Commit**

```bash
git add package.json package-lock.json next.config.mjs tsconfig.json postcss.config.mjs .gitignore src/app
git commit -m "chore: scaffold Next 16 App Router static export"
```

---

### Task 1.2: Tailwind 4 token layer — § 6.2 palette, § 6.3 type scale, § 6.4 spacing

**Files:**
- Modify: `src/app/globals.css` (replaces the one-line file from Task 1.1)

**Parallelism:** **SERIALIZED after Task 1.1** — shares `src/app/globals.css`. Head of the `globals.css` chain proper. Nothing else in Phase 1 may write `globals.css`; Task 1.3 is next in that chain.

**Interfaces:**
- Produces: Tailwind 4 theme tokens consumable everywhere as utility classes (`bg-void`, `text-muted`, `border-hairline`, `text-t-2xl`) and as CSS variables (`var(--color-void)`, `var(--text-t-2xl)`).

- [ ] **Step 1: Write the whole token layer into `src/app/globals.css`**

Tailwind 4 is CSS-first: there is no `tailwind.config.js` on this project. `@theme` declares the tokens; the `--color-*`, `--text-*`, `--spacing-*` and `--font-*` namespaces auto-generate the utilities.

```css
@import "tailwindcss";

@theme {
  /* § 6.2 palette — closed set, ten tokens */
  --color-void: #06080B;
  --color-field: #0E1116;
  --color-strata: #10151C;
  --color-hairline: #1B2430;
  --color-light: #EDF1F5;
  --color-muted: #8FA0B0;
  --color-surface-accent: #8FD3FF;
  --color-device-accent: #FFC46B;
  --color-engine-accent: #FF5F56;
  --color-reasoning-accent: #C8FF6A;

  /* § 6.1 families */
  --font-display: "Satoshi", system-ui, sans-serif;
  --font-mono: "JetBrains Mono", ui-monospace, monospace;

  /* § 6.3 type scale — base 16, ratio 1.25, rounded to whole px */
  --text-t-xs: 12px;
  --text-t-xs--line-height: 1.4;
  --text-t-sm: 14px;
  --text-t-sm--line-height: 1.5;
  --text-t-base: 16px;
  --text-t-base--line-height: 1.6;
  --text-t-md: 20px;
  --text-t-md--line-height: 1.4;
  --text-t-lg: 25px;
  --text-t-lg--line-height: 1.25;
  --text-t-xl: 31px;
  --text-t-xl--line-height: 1.2;
  --text-t-2xl: 49px;
  --text-t-2xl--line-height: 1.08;
  --text-t-2xl--letter-spacing: -0.02em;
  --text-t-3xl: 61px;
  --text-t-3xl--line-height: 1.04;
  --text-t-3xl--letter-spacing: -0.025em;

  /* § 6.4 spacing — the scale is 4,8,12,16,24,32,48,64,96,128 and nothing else.
     Tailwind's --spacing base of 4px generates exactly these as 1,2,3,4,6,8,12,16,24,32. */
  --spacing: 4px;
}

/* § 6.2: exactly one accent is live at any depth. Sections set --accent; nothing
   else in the site is allowed to name an accent colour directly. */
:root {
  --accent: var(--color-surface-accent);
}
[data-layer="surface"]   { --accent: var(--color-surface-accent); }
[data-layer="device"]    { --accent: var(--color-device-accent); }
[data-layer="engine"]    { --accent: var(--color-engine-accent); }
[data-layer="reasoning"] { --accent: var(--color-reasoning-accent); }
[data-layer="bedrock"]   { --accent: var(--color-surface-accent); }

@layer base {
  html {
    background: var(--color-void);
    color: var(--color-light);
    font-family: var(--font-display);
    font-size: 16px;
    scroll-behavior: smooth;
    -webkit-text-size-adjust: 100%;
  }
  body { margin: 0; }

  /* § 9.3 — the focus ring is --surface-accent at every depth, never the layer
     accent. A focus ring that changes colour is one people stop recognising. */
  :focus-visible {
    outline: 2px solid var(--color-surface-accent);
    outline-offset: 3px;
  }

  a { color: inherit; text-decoration-color: var(--accent); text-underline-offset: 3px; }
  code, kbd, samp, .path { font-family: var(--font-mono); font-size: var(--text-t-sm); }

  /* § 6.5 — no elevation by shadow, anywhere, ever. */
  * { box-shadow: none !important; backdrop-filter: none !important; }

  /* § 7 global reduced-motion collapse */
  @media (prefers-reduced-motion: reduce) {
    html { scroll-behavior: auto; }
    *, *::before, *::after {
      animation-duration: 0s !important;
      animation-delay: 0s !important;
      transition-duration: 0s !important;
      transition-delay: 0s !important;
    }
  }
}

/* § 6.4 grid: desktop ≥1024 = 12 col / 72px margin / 24px gutter;
   tablet 640–1023 = 8 col / 40px margin; mobile <640 = 1 col / 20px margin. */
@utility page {
  margin-inline: auto;
  padding-inline: 20px;
  max-width: 100%;
}
@media (min-width: 640px) { .page { padding-inline: 40px; } }
@media (min-width: 1024px) {
  .page {
    padding-inline: 72px;
    display: grid;
    grid-template-columns: repeat(12, 1fr);
    column-gap: 24px;
  }
}

/* § 6.3 — body measure capped at 68ch */
@utility prose-measure { max-width: 68ch; }
```

- [ ] **Step 2: Prove the tokens emit**

Run: `npx next build`
Then: `grep -c "#8FD3FF" out/_next/static/css/*.css`
Expected: ≥ 1 (the focus-ring rule). If 0, the `@theme` block is not being read — check `postcss.config.mjs`.

- [ ] **Step 3: Prove the type scale is addressable**

Temporarily add `<p className="text-t-3xl font-display">X</p>` to `src/app/page.tsx`, run `npx next build && npx serve out`, open `http://localhost:3000/`, inspect the `<p>` in devtools.
Expected computed style: `font-size: 61px; line-height: 1.04; letter-spacing: -1.525px`. Then revert the temporary markup.

- [ ] **Step 4: Commit**

```bash
git add src/app/globals.css
git commit -m "feat: Tailwind 4 theme tokens for the spec palette, type scale and grid"
```

---

### Task 1.3: Fonts — install unsubset, `@font-face` with metric overrides, preload

**Files:**
- Create: `public/fonts/Satoshi-Variable.woff2` (unsubset, temporary — Task 1.10 replaces it with the subset)
- Create: `public/fonts/Satoshi-LICENSE.txt`
- Create: `public/fonts/JetBrainsMono-Variable.woff2` (unsubset, temporary)
- Modify: `src/app/globals.css` (append the `@font-face` block)
- Modify: `src/app/layout.tsx` (add the two `<link rel="preload">` tags)
- Modify: `package.json` (add `@fontsource-variable/jetbrains-mono@5.3.0` as a devDependency — it is a source of the woff2 file, not a runtime dependency)

**Parallelism:** **SERIALIZED after Task 1.2** — shares `src/app/globals.css`; also second in the `layout.tsx` chain after 1.1 and touches `package.json`. No other Phase 1 task may run concurrently with this one on those three files.

**Interfaces:**
- Produces: `font-family: var(--font-display)` resolves to Satoshi and `var(--font-mono)` to JetBrains Mono, with zero layout shift on swap.

- [ ] **Step 1: Get Satoshi from Fontshare — there is no npm package**

1. Open `https://www.fontshare.com/fonts/satoshi` (verified HTTP 200, § 6.1).
2. Click **Download Family**. You get `Satoshi_Complete.zip`.
3. From `Satoshi_Complete/Fonts/WEB/fonts/`, copy `Satoshi-Variable.woff2` → `public/fonts/Satoshi-Variable.woff2`.
4. From the zip root, copy the licence file (`Fontshare_Licence.txt` / `LICENSE.txt` — whichever the zip ships) → `public/fonts/Satoshi-LICENSE.txt`. **The licence file ships alongside the woff2. This is a licence condition, not a nicety.**

Do **not** add a Satoshi npm package, a Google Fonts link, or a CDN `<link>`. None exists and none is permitted.

- [ ] **Step 2: Get JetBrains Mono from the verified npm package**

Run: `npm i -D @fontsource-variable/jetbrains-mono@5.3.0`
Then copy the variable woff2 out of the package (it is a build input, not a runtime import — the site never imports the package's CSS):

Run: `cp node_modules/@fontsource-variable/jetbrains-mono/files/jetbrains-mono-latin-wght-normal.woff2 public/fonts/JetBrainsMono-Variable.woff2`
Expected: the file exists and is non-zero — `wc -c public/fonts/JetBrainsMono-Variable.woff2`.

- [ ] **Step 3: Append the `@font-face` block to `src/app/globals.css`**

The `size-adjust` / `ascent-override` / `descent-override` values are § 6.1 verbatim and exist so `font-display: swap` causes **zero** layout shift.

```css
@font-face {
  font-family: "Satoshi";
  src: url("/fonts/Satoshi-Variable.woff2") format("woff2-variations");
  font-weight: 300 900;
  font-style: normal;
  font-display: swap;
}
@font-face {
  font-family: "Satoshi Fallback";
  src: local("system-ui"), local("Segoe UI"), local("Helvetica Neue");
  size-adjust: 101%;
  ascent-override: 96%;
  descent-override: 24%;
  font-display: swap;
}
@font-face {
  font-family: "JetBrains Mono";
  src: url("/fonts/JetBrainsMono-Variable.woff2") format("woff2-variations");
  font-weight: 100 800;
  font-style: normal;
  font-display: swap;
}
@font-face {
  font-family: "JetBrains Mono Fallback";
  src: local("ui-monospace"), local("Consolas"), local("Menlo");
  size-adjust: 100%;
  font-display: swap;
}
```

Then update the two family tokens inside `@theme` so the metric-matched fallbacks sit between the real face and the generic:

```css
  --font-display: "Satoshi", "Satoshi Fallback", system-ui, sans-serif;
  --font-mono: "JetBrains Mono", "JetBrains Mono Fallback", ui-monospace, monospace;
```

- [ ] **Step 4: Add the preloads to `src/app/layout.tsx`, before any CSS**

```tsx
import type { ReactNode } from 'react';
import './globals.css';

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preload" as="font" type="font/woff2" crossOrigin="anonymous"
              href="/fonts/Satoshi-Variable.woff2" />
        <link rel="preload" as="font" type="font/woff2" crossOrigin="anonymous"
              href="/fonts/JetBrainsMono-Variable.woff2" />
        <meta name="theme-color" content="#06080B" />
      </head>
      <body>{children}</body>
    </html>
  );
}
```

- [ ] **Step 5: Verify both faces load and neither shifts**

Run: `npx next build && npx serve out`
Open `http://localhost:3000/`, DevTools → Network → filter `Font`.
Expected: exactly **two** font requests, both `200`, both `woff2`, both initiated by the preload (Initiator column: `(index)`, not the stylesheet).
Then DevTools → Performance → record a reload with **Slow 4G** throttling.
Expected: **Layout Shift: 0** entries in the Experience track. Any shift means the metric overrides are wrong — check `size-adjust`.

- [ ] **Step 6: Commit**

```bash
git add public/fonts src/app/globals.css src/app/layout.tsx package.json package-lock.json
git commit -m "feat: self-host Satoshi (Fontshare) and JetBrains Mono with zero-CLS metric overrides"
```

---

### Task 1.4: Content types, site constants, layers, route table, depth table

**Files:**
- Create: `src/content/types.ts`, `src/content/site.ts`, `src/content/layers.ts`, `src/content/routes.ts`, `src/content/depth-table.ts`, `src/content/projects/index.ts`

**Parallelism:** **PARALLEL-SAFE with Tasks 1.2 and 1.3** — owns `src/content/*.ts` and `src/content/projects/index.ts` exclusively; touches no shared file. Requires Task 1.1 committed. **Head of the `src/content/site.ts` chain (next writer: Task 6.7).** Tasks 1.5, 1.6, 1.7, 1.8, 1.9 all consume the types defined here, so they must not start until this is committed.

**Interfaces:**
- Produces: `Project`, `Decision`, `Shot`, `Layer`, `RouteEntry`, `TraceFixture` types; `SITE`, `LAYERS`, `ROUTES`, `DEPTH_TABLE`, `PROJECTS` constants. Every later task imports from here and defines no content of its own.

- [ ] **Step 1: Write `src/content/types.ts`**

```ts
export type LayerId = 'surface' | 'device' | 'engine' | 'reasoning' | 'bedrock';

export type Decision = {
  /** Prose, ~40 words. Every claim traces to docs/projects.md. */
  body: string;
  /** The file path that proves it. Rendered in JetBrains Mono at --t-sm. */
  evidence: string[];
};

export type Shot = {
  src: string;          // /shots/proacademys/desktop-home.avif
  fallback: string;     // /shots/proacademys/desktop-home.webp
  width: number;
  height: number;
  alt: string;
  /** The specific claim this shot carries (§ 4.2). A shot with no claim is cut. */
  claim: string;
};

export type Presentation =
  | { kind: 'screenshots'; shots: Shot[] }
  | { kind: 'diagram'; component: 'deployment-platform' | 'gamezone' }
  | { kind: 'node-field' }
  | { kind: 'playable'; game: 'pong' | 'pixel-quest' };

export type Project = {
  slug: 'deployment-platform' | 'proacademys' | 'gamezone' | 'pong' | 'pixel-quest' | 'switchboard';
  title: string;
  layer: LayerId;
  /** camera.y of this exhibit, metres. Matches § 10.1 exactly. */
  depth: number;
  /** One line. Rendered at --t-md. */
  thesis: string;
  decisions: Decision[];
  /** Rendered as a JetBrains Mono row. Label/value pairs only, no icons. */
  scale: { label: string; value: string }[];
  links: { label: string; href: string }[];
  /** The single honest limitation line. Never omitted, never softened. */
  honesty: string;
  presentation: Presentation;
};

export type Layer = {
  id: LayerId;
  name: string;         // 'SURFACE'
  domain: string;       // 'Web'
  datum: number;        // 0, -40, -120, -260, -300
  /** t at the datum, from § 2.2. */
  t: number;
  accentVar: string;    // '--color-surface-accent'
  thesis: string;
};

export type RouteEntry = {
  path: string;
  /** camera.y the route enters at; null for routes with no depth (/about, /resume). */
  depth: number | null;
  title: string;
  description: string;
  openPanel: Project['slug'] | null;
};

/**
 * OQ3 is DEFERRED — the owner is still building Switchboard. No trace exists and
 * none may be synthesised. This type is the drop-in seam: when a real recorded
 * session is committed to src/content/switchboard-trace.json, it is imported,
 * typed as TraceFixture, and assigned to SWITCHBOARD_TRACE. Nothing else changes.
 */
export type TraceFixture = {
  sessionId: string;
  steps: { at: number; type: string; from: string; to: string; summary: string }[];
};
```

- [ ] **Step 2: Write `src/content/site.ts` — hero and meta per the OQ2 resolution**

```ts
/** OQ1 resolved: malaychaudhary.dev. Runs on .vercel.app until the Phase 6 cutover. */
export const SITE_URL = 'https://substrate-malay.vercel.app';
export const FINAL_DOMAIN = 'https://malaychaudhary.dev';

export const SITE = {
  name: 'Malay Chaudhary',
  credential: 'B.Tech CSE, IIIT Naya Raipur',

  /** OQ2: § 13.1 candidate A. */
  hero: 'I wrote the thing that deploys the thing. Then I went further down.',

  /** OQ2: § 13.1 candidate B, demoted to the sub-line beneath the hero. */
  heroSub:
    'Four layers of the same stack: a deploy platform, a 37-table migration, two game engines, and a control plane for AI agents.',

  /** § 13.1 standing sub-line — not itself pending, sits under heroSub. */
  standing: 'B.Tech CSE, IIIT Naya Raipur. Scroll to descend — four layers, one shot.',

  /** OQ2: § 13.2 candidate 2 — search + recruiters. 150 ch. */
  metaDescription:
    'Malay Chaudhary, B.Tech CSE at IIIT Naya Raipur. A self-hosted PaaS, a MERN rewrite of a legacy platform, two game engines, and an agent switchboard.',

  /** OQ2: § 13.2 candidate 3 — social. 145 ch. */
  ogDescription:
    'Web, app, game, agent — four depths of one stack. Portfolio of Malay Chaudhary, told as a single uncut descent through the layers he builds on.',

  email: 'malayrc276@gmail.com',
  github: 'https://github.com/malllayyyy',
  linkedin: 'https://linkedin.com/in/malay-chaudhary-959077328/',
  resumePath: '/malay-chaudhary-resume.pdf',
} as const;

/**
 * OWNER-BLOCKED ASSET FLAGS. Both are false until the owner supplies the file.
 * Flipping one to true is the entire integration — no other code changes.
 * § 12 items 6 and 7.
 */
export const RESUME_PDF_PRESENT = false;
export const PORTRAIT_PRESENT = false;

/** OQ3 deferred. Stays null until a real recorded session is committed. */
export const SWITCHBOARD_TRACE = null;
```

**§ 13.1 candidate C does not appear in this file or anywhere in the repo.** Per the OQ2 resolution it is the LinkedIn headline only. If you find it in the codebase, delete it.

- [ ] **Step 3: Write `src/content/layers.ts` — the four theses from § 3**

```ts
import type { Layer } from './types';

export const LAYERS: Layer[] = [
  {
    id: 'surface', name: 'SURFACE', domain: 'Web', datum: 0, t: 0.030,
    accentVar: '--color-surface-accent',
    thesis: 'The layer everyone sees is the one with the least of my code in it — and the most of other people\u2019s.',
  },
  {
    id: 'device', name: 'DEVICE', domain: 'App', datum: -40, t: 0.300,
    accentVar: '--color-device-accent',
    thesis: 'Software that has to run on a Windows 7 machine with a spinning disk is a harder constraint than any framework I\u2019ve ever picked.',
  },
  {
    id: 'engine', name: 'ENGINE', domain: 'Game', datum: -120, t: 0.600,
    accentVar: '--color-engine-accent',
    thesis: 'Everything above this is a frame that can afford to be late. Down here it can\u2019t.',
  },
  {
    id: 'reasoning', name: 'REASONING', domain: 'Agentic AI', datum: -260, t: 0.870,
    accentVar: '--color-reasoning-accent',
    thesis: 'The layer that decides what the other three should do. It has no UI of its own — so I built one.',
  },
  {
    id: 'bedrock', name: 'BEDROCK', domain: '', datum: -300, t: 1.0,
    accentVar: '--color-surface-accent',
    thesis: '',
  },
];
```

- [ ] **Step 4: Write `src/content/routes.ts` — the § 10.1 route table, verbatim, as data**

This table is the single source for the App Router `generateStaticParams`, the sitemap (Task 6.4), the OG images (Task 6.3), and the deep-link depth resolution (Task 5.5). It is copied from § 10.1 row for row.

```ts
import type { RouteEntry } from './types';
import { SITE } from './site';

const t = (title: string) => `${title} — Malay Chaudhary`;

export const ROUTES: RouteEntry[] = [
  { path: '/',                            depth:   +6, title: 'Malay Chaudhary — Substrate',   description: SITE.metaDescription, openPanel: null },
  { path: '/layer/surface',               depth:    0, title: t('Surface — Web'),              description: 'Depth 0 m. A self-hosted PaaS and a MERN rewrite of a legacy e-learning platform.', openPanel: null },
  { path: '/layer/device',                depth:  -40, title: t('Device — App'),               description: 'Depth \u221240 m. A gaming-cafe POS built for Windows 7 and a spinning disk.', openPanel: null },
  { path: '/layer/engine',                depth: -120, title: t('Engine — Game'),              description: 'Depth \u2212120 m. Two Canvas 2D engines, playable in-page, on a fixed-timestep loop.', openPanel: null },
  { path: '/layer/reasoning',             depth: -260, title: t('Reasoning — Agentic AI'),     description: 'Depth \u2212260 m. A real-time control switchboard for Oh My Pi subagents.', openPanel: null },
  { path: '/project/deployment-platform', depth:   -2, title: t('deployment-platform'),        description: 'Self-hosted PaaS: isolated Docker builds, MinIO buckets, atomic zero-downtime swaps.', openPanel: 'deployment-platform' },
  { path: '/project/proacademys',         depth:   -8, title: t('ProAcademys'),                description: 'MERN rewrite of a PHP/Laravel e-learning platform. 37 MySQL tables to 20 collections.', openPanel: 'proacademys' },
  { path: '/project/gamezone',            depth:  -52, title: t('GameZone'),                   description: 'Gaming-cafe POS and Capacitor 6 Android app, tuned for Windows 7 and a 5400 rpm disk.', openPanel: 'gamezone' },
  { path: '/project/pong',                depth: -124, title: t('Pong'),                       description: 'Canvas 2D Pong with trigonometric deflection, on a fixed-timestep accumulator. Playable.', openPanel: 'pong' },
  { path: '/project/pixel-quest',         depth: -134, title: t('Pixel Quest'),                description: 'Canvas 2D top-down room: axis-separated AABB collision and a hand-written word-wrap.', openPanel: 'pixel-quest' },
  { path: '/project/switchboard',         depth: -278, title: t('Switchboard'),                description: 'Real-time control plane for Oh My Pi subagents. Direct in-memory steering over WebSocket.', openPanel: 'switchboard' },
  { path: '/about',                       depth: null, title: t('About'),                      description: 'Malay Chaudhary, B.Tech CSE at IIIT Naya Raipur.', openPanel: null },
  { path: '/resume',                      depth: null, title: t('Résumé'),                     description: 'Résumé of Malay Chaudhary — B.Tech CSE, IIIT Naya Raipur.', openPanel: null },
];
```

`/#contact` is **not** a route (§ 10.1) — it is an anchor on the Bedrock section. There is no `/projects` index, no `/blog`, no `/uses`.

- [ ] **Step 5: Write `src/content/depth-table.ts` — the 18 § 2.2 control points**

Phase 1 does not use this, but it is content, it belongs with the content, and Task 4.1 imports it rather than re-typing 18 pairs under time pressure.

```ts
/** § 2.2. Monotonic piecewise-linear. 18 control points, t ascending, y descending. */
export const DEPTH_TABLE: readonly (readonly [t: number, y: number])[] = [
  [0.000,   +6.0], [0.030,    0.0], [0.075,   -2.0], [0.135,   -8.0],
  [0.170,  -12.0], [0.235,  -30.0], [0.270,  -36.0], [0.300,  -40.0],
  [0.330,  -44.0], [0.400,  -52.0], [0.470,  -70.0], [0.560, -112.0],
  [0.600, -120.0], [0.640, -124.0], [0.690, -134.0], [0.730, -150.0],
  [0.830, -248.0], [0.870, -260.0], [0.930, -278.0], [0.965, -290.0],
  [1.000, -300.0],
] as const;
```

- [ ] **Step 6: Write `src/content/projects/index.ts`**

```ts
import type { Project } from '../types';
import { deploymentPlatform } from './deployment-platform';
import { proacademys } from './proacademys';
import { gamezone } from './gamezone';
import { pong } from './pong';
import { pixelQuest } from './pixel-quest';
import { switchboard } from './switchboard';

/** Document order = depth order (§ 9.2). Do not re-sort. */
export const PROJECTS: Project[] = [
  deploymentPlatform, proacademys, gamezone, pong, pixelQuest, switchboard,
];

export const projectBySlug = (slug: string): Project | undefined =>
  PROJECTS.find((p) => p.slug === slug);
```

This file will not typecheck until Task 1.5 lands the six modules. That is expected and is why 1.5 is serialized after 1.4.

- [ ] **Step 7: Verify the depth table is monotonic and matches the routes**

Run: `npx tsc --noEmit` (will error only on the six missing project modules from Step 6 — nothing else)
Then, in `node`: assert every `ROUTES[i].depth` that is non-null appears as a `y` value reachable by `DEPTH_TABLE` interpolation, and that `DEPTH_TABLE` `t` strictly increases and `y` strictly decreases.

Run:
```bash
node -e "const {DEPTH_TABLE}=await import('./src/content/depth-table.ts')" 2>/dev/null || \
node --experimental-strip-types -e "import('./src/content/depth-table.ts').then(({DEPTH_TABLE})=>{for(let i=1;i<DEPTH_TABLE.length;i++){if(!(DEPTH_TABLE[i][0]>DEPTH_TABLE[i-1][0]&&DEPTH_TABLE[i][1]<DEPTH_TABLE[i-1][1]))throw new Error('non-monotonic at '+i);}console.log('monotonic OK',DEPTH_TABLE.length,'points')})"
```
Expected: `monotonic OK 21 points`.

- [ ] **Step 8: Commit**

```bash
git add src/content
git commit -m "feat: content types, site constants (hero A + sub-line B, meta 2/3), route and depth tables"
```

---

### Task 1.5: The six project content modules

**Files:**
- Create: `src/content/projects/deployment-platform.ts`
- Create: `src/content/projects/proacademys.ts`
- Create: `src/content/projects/gamezone.ts`
- Create: `src/content/projects/pong.ts`
- Create: `src/content/projects/pixel-quest.ts`
- Create: `src/content/projects/switchboard.ts`

**Parallelism:** **SERIALIZED after Task 1.4** (needs `types.ts`). **Internally the six files are PARALLEL-SAFE with each other** — one owner per file, no shared imports beyond `../types`. Six subagents may run this task simultaneously, one file each. None of them may touch `src/content/projects/index.ts` (Task 1.4 owns it).

**Interfaces:**
- Consumes: `Project`, `Decision`, `Shot`, `Presentation` from `src/content/types.ts`.
- Produces: named exports `deploymentPlatform`, `proacademys`, `gamezone`, `pong`, `pixelQuest`, `switchboard`, each a `Project`.

**Source of every fact:** `docs/projects.md` and `docs/live-capture.md`. Every number below is copied from those documents. **Nothing is rounded, embellished, or inferred.** If a fact is not in those documents, it does not go in the file.

- [ ] **Step 1: `deployment-platform.ts` (§ 3.1)**

```ts
import type { Project } from '../types';

export const deploymentPlatform: Project = {
  slug: 'deployment-platform',
  title: 'deployment-platform',
  layer: 'surface',
  depth: -2,
  thesis: 'A self-hosted PaaS: give it a git URL, it builds in a throwaway container and serves the result on its own subdomain.',
  decisions: [
    {
      body: 'Builds run inside a throwaway `platform-build-sandbox` Docker container. The build script hashes the lockfile against a host bind-mounted cache directory, restores `node_modules` on a hit, and skips `npm install` entirely.',
      evidence: ['infra/docker/build.sh', 'apps/worker/src/build.js'],
    },
    {
      body: 'The proxy resolves an incoming subdomain by querying Postgres for `projects.current_deployment_id`, then `deployments.bucket_path`, per request. Each redeploy writes to its own MinIO path. Success flips one column; rollback flips it back. One UPDATE, zero downtime.',
      evidence: ['apps/proxy/src/index.js'],
    },
    {
      body: 'scrypt password hashing and HMAC-SHA256 signed base64url session cookies, built on `node:crypto` alone. Stateless — no session store, no Redis for auth, no dependency.',
      evidence: ['apps/api/src/auth.js'],
    },
  ],
  scale: [
    { label: 'workspace packages', value: '7' },
    { label: 'source files',       value: '~25 JS/JSX' },
    { label: 'LOC',                value: '~2,200' },
    { label: 'Postgres tables',    value: '4 — users, projects, deployments, build_logs' },
    { label: 'REST endpoints',     value: '10' },
  ],
  links: [
    { label: 'GitHub', href: 'https://github.com/malllayyyy/deployment-platform' },
  ],
  honesty: 'Runs on my machine and my machine only: http://<project>.localhost:8080. Code is public.',
  presentation: { kind: 'diagram', component: 'deployment-platform' },
};
```

**No live-demo link.** There is no public URL (`docs/projects.md` § 1). Do not invent one.

- [ ] **Step 2: `proacademys.ts` (§ 3.1, § 4.2)**

```ts
import type { Project } from '../types';

const shot = (name: string, w: number, h: number, alt: string, claim: string) => ({
  src: `/shots/proacademys/${name}.avif`,
  fallback: `/shots/proacademys/${name}.webp`,
  width: w, height: h, alt, claim,
});

export const proacademys: Project = {
  slug: 'proacademys',
  title: 'ProAcademys',
  layer: 'surface',
  depth: -8,
  thesis: 'A full-stack MERN rewrite of a legacy PHP/Laravel e-learning platform, including the production data migration.',
  decisions: [
    {
      body: 'A multi-stage ETL engine reads the 37-table MySQL production dump over `mysql2`, transforms the relational schema into MongoDB documents, resolves legacy integer IDs to BSON ObjectIds, and emits an automated count-parity verification report.',
      evidence: ['server/scripts/migrate/run.js', 'server/scripts/migrate/transform/*', 'scripts/migrate/out/report.md'],
    },
    {
      body: 'Browsers were dropping the JWT cookie between the Vercel frontend and the Render API because `SameSite=Lax` treats them as cross-site. Rewriting `/api/*` server-side on the frontend origin scopes the cookie to the frontend domain instead.',
      evidence: ['client/vercel.json'],
    },
    {
      body: 'Strict four-tier decoupling — routes to controllers to services to repositories to models — with reusable generic CRUD factories rather than a hand-written controller per collection.',
      evidence: ['server/src/controllers/', 'server/src/services/', 'server/src/repositories/'],
    },
  ],
  scale: [
    { label: 'migration',      value: '37 MySQL tables → 20 Mongoose collections' },
    { label: 'files',          value: '~100+' },
    { label: 'LOC',            value: '~8,500' },
    { label: 'REST endpoints', value: '~30' },
  ],
  links: [
    { label: 'Live demo', href: 'https://proacademys-client.vercel.app/' },
  ],
  honesty: 'Pending the client\u2019s DNS cutover to proacademys.com and live Razorpay keys.',
  presentation: {
    kind: 'screenshots',
    shots: [
      shot('desktop-catalog-courses', 1440, 900, 'ProAcademys course catalogue grid showing Power BI Course, Advanced Excel Mastery and Data Analyst cards.', 'Real catalogue data, served live from Render.'),
      shot('desktop-course-detail',   1440, 900, 'Power BI Course detail page showing instructor, \u20B95,999 price and enrolment call to action.', 'Real commerce: instructor, \u20B95,999, enrolment.'),
      shot('desktop-catalog',         1440, 900, 'Top of the ProAcademys course catalogue page.', 'Catalogue chrome and navigation.'),
      shot('desktop-blog',            1440, 900, 'ProAcademys blog listing page.', 'A content surface beyond the course flow.'),
      shot('mobile-home',              390, 844, 'ProAcademys homepage hero at a 390 px viewport.', 'Responsive is implemented, not asserted — same routes at 390 px.'),
      shot('mobile-catalog',           390, 844, 'ProAcademys catalogue with stacked responsive course cards at 390 px.', 'Responsive is implemented, not asserted — same routes at 390 px.'),
      shot('mobile-course-detail',     390, 844, 'Power BI Course detail view at a 390 px viewport.', 'Responsive is implemented, not asserted — same routes at 390 px.'),
    ],
  },
};
```

**No code link.** `proacademys-client` returns HTTP 404 on GitHub (`docs/live-capture.md`). The eighth shot, `desktop-home.png`, is the in-world plate texture (Task 5.2) and is not in the panel gallery — § 4.2 assigns it to the plate, and all 8 shots are therefore used.

- [ ] **Step 3: `gamezone.ts` (§ 3.2)**

```ts
import type { Project } from '../types';

export const gamezone: Project = {
  slug: 'gamezone',
  title: 'GameZone',
  layer: 'device',
  depth: -52,
  thesis: 'A real-time gaming-cafe POS — station timers, session billing, cafeteria orders — running as an Android app and a desktop web app off one build.',
  decisions: [
    {
      body: 'Built for the hardware it actually runs on: Windows 7, a spinning disk, Node v13.14.0. SQLite is configured with `journal_mode = WAL`, `synchronous = NORMAL`, `temp_store = MEMORY` and `cache_size = -10000`, and startup seeding is wrapped in one `BEGIN TRANSACTION … COMMIT` to eliminate disk wait cycles.',
      evidence: ['backend/database.js'],
    },
    {
      body: 'One React codebase compiles to a native Android package via Capacitor 6 while staying a normal browser app. A one-click batch launcher starts the backend and opens the browser on the cafe\u2019s own machine.',
      evidence: ['frontend/capacitor.config.json', 'frontend/android/', 'Start-GameZone.bat'],
    },
    {
      body: 'Mid-session activity rollover: a player switches Snooker to PS5 on the same station without resetting occupancy. The route computes the played overage and deducts it from the new activity\u2019s duration.',
      evidence: ['backend/server.js'],
    },
  ],
  scale: [
    { label: 'source files',   value: '~30' },
    { label: 'LOC',            value: '~3,500' },
    { label: 'SQLite tables',  value: '7 — stations, sessions, settings, activities, snacks, cafeteria_expenses, revenue_history' },
    { label: 'REST endpoints', value: '~15' },
    { label: 'Android package', value: 'com.gamezone.app' },
  ],
  links: [],
  honesty: 'Private repo — it runs a real business. No screenshots: this one never had a marketing surface.',
  presentation: { kind: 'diagram', component: 'gamezone' },
};
```

**`links` is empty and stays empty.** No repo link, no demo link, no APK link (§ 3.2). Task 6.8 explicitly clicks for the absence of these two links.

- [ ] **Step 4: `pong.ts` (§ 3.3)**

```ts
import type { Project } from '../types';

export const pong: Project = {
  slug: 'pong',
  title: 'Pong',
  layer: 'engine',
  depth: -124,
  thesis: 'Canvas 2D Pong, no libraries and no assets — every pixel is a canvas primitive.',
  decisions: [
    {
      body: 'Paddle collision is an AABB intersection, and the bounce angle comes out of where on the paddle the ball landed: `hitRatio` against the paddle centre becomes `angle = hitRatio * PI/3`, then `vx = speed * cos(angle)`, `vy = speed * sin(angle)`.',
      evidence: ['games/pong.js:139-158'],
    },
    {
      body: 'The ball accelerates 3.5 % on every paddle hit, clamped at speed 9. The AI tracks the ball at 3.6 px per tick with a 10 px deadzone, which is what stops it oscillating on centre and what makes it beatable.',
      evidence: ['games/pong.js:126-133'],
    },
    {
      body: 'It shipped on an unthrottled `requestAnimationFrame` loop with per-frame constants and no delta scaling, so it ran 2.4× fast on a 144 Hz display. The port puts it on a fixed-timestep accumulator at 1000/60 ms with render interpolation — and retunes not one constant, because the tick rate is now exactly the rate they were authored for.',
      evidence: ['games/pong.js:283-288', 'src/engine/loop.ts'],
    },
  ],
  scale: [
    { label: 'LOC',        value: '305' },
    { label: 'entry',      value: 'export function initPong(canvas, onWin)' },
    { label: 'resolution', value: '640 × 400 internal' },
    { label: 'assets',     value: 'none — canvas primitives only' },
    { label: 'win',        value: 'WINNING_SCORE = 7' },
  ],
  links: [],
  honesty: 'The C++/SFML and Java versions came first. They\u2019re gone — no repo, no backup. What\u2019s here is the third time I wrote them, in Canvas 2D.',
  presentation: { kind: 'playable', game: 'pong' },
};
```

- [ ] **Step 5: `pixel-quest.ts` (§ 3.3)**

```ts
import type { Project } from '../types';

export const pixelQuest: Project = {
  slug: 'pixel-quest',
  title: 'Pixel Quest',
  layer: 'engine',
  depth: -134,
  thesis: 'A top-down Canvas 2D room with collision, NPC dialogue and collectibles — also no libraries, also no assets.',
  decisions: [
    {
      body: 'Collision is resolved axis-separated: X is moved and resolved, then Y is moved and resolved, independently. That is what stops the player catching on wall corners, and it is three lines shorter than the swept-AABB version that does the same job here.',
      evidence: ['games/rpg.js:145-152', 'games/rpg.js:198-214'],
    },
    {
      body: 'Diagonal input is normalised by 0.7071 so moving on both axes is not 1.414× faster than moving on one. Player speed is 3.2 px per tick against 3 wall colliders; NPC interaction triggers at 20 px proximity.',
      evidence: ['games/rpg.js:192-195'],
    },
    {
      body: 'Dialogue boxes are sized by a hand-written `wrapText` that measures the string against the canvas context and grows the box height to fit the wrapped lines. Collectible orbs bob on `Math.sin(orbAnimTime + orb.x) * 4` — the `orb.x` term is what keeps them from pulsing in unison.',
      evidence: ['games/rpg.js:154-171', 'games/rpg.js:296'],
    },
  ],
  scale: [
    { label: 'LOC',        value: '431' },
    { label: 'entry',      value: 'export function initRpg(canvas, onUnlockSkill)' },
    { label: 'resolution', value: '640 × 400 internal' },
    { label: 'colliders',  value: '3 walls, axis-separated AABB' },
  ],
  links: [],
  honesty: 'Not playable on touch. A WASD room with proximity dialogue needs a d-pad, and an on-screen d-pad over a 390 px viewport is worse than nothing — so mobile gets a 6-second clip of real play and the full mechanics in text.',
  presentation: { kind: 'playable', game: 'pixel-quest' },
};
```

- [ ] **Step 6: `switchboard.ts` (§ 3.4)**

```ts
import type { Project } from '../types';

/** § 3.4: the 12 protocol message types are the node-field taxonomy AND, per the
 *  OQ3 deferral, the Reasoning exhibit in full. Order is protocol order. */
export const CLIENT_MESSAGES = [
  'prompt', 'set_model', 'spawn', 'list_sessions', 'switch_session',
] as const;
export const SERVER_MESSAGES = [
  'roster', 'models', 'session_event', 'session_messages', 'error', 'sessions', 'session_switched',
] as const;

export const switchboard: Project = {
  slug: 'switchboard',
  title: 'Switchboard',
  layer: 'reasoning',
  depth: -278,
  thesis: 'A real-time control plane for Oh My Pi subagents — steer a running agent directly, swap its model mid-conversation, watch the roster.',
  decisions: [
    {
      body: 'Routing a prompt through the orchestrator costs a turn and the latency of one. Switchboard holds live `AgentSession` references in Bun process memory via `AgentRegistry.global()` and calls `.steer()` or `.prompt()` on the target subagent directly, bypassing the orchestrator entirely.',
      evidence: ['server/index.ts', 'server/agent-manager.ts'],
    },
    {
      body: '`AgentSession.setModel()` is called on an active session mid-conversation, over the WebSocket. No restart, no file edit, no lost context.',
      evidence: ['server/agent-manager.ts', 'shared/protocol.ts'],
    },
    {
      body: 'Parked and background subagents outlive the dashboard. `registerPersistedSubagents` and `ensurePersistedRoster` periodically resync the roster from the `~/.omp/agent/sessions/*.jsonl` transcripts, so a restart does not lose the board.',
      evidence: ['server/agent-manager.ts'],
    },
  ],
  scale: [
    { label: 'source files',    value: '~15 TS/TSX' },
    { label: 'LOC',             value: '~1,800' },
    { label: 'database tables', value: '0 — live in-memory state plus .jsonl transcripts' },
    { label: 'protocol',        value: '5 client message types, 7 server message types' },
  ],
  links: [
    { label: 'GitHub', href: 'https://github.com/malllayyyy/swtchboard' },
  ],
  honesty: 'Still being built. The exhibit is the protocol itself — 12 message types — not a recording of a session I have not finished having.',
  presentation: { kind: 'node-field' },
};
```

The repo name is **`swtchboard`** — that spelling is correct and verified (`docs/live-capture.md`). Do not "fix" it.

- [ ] **Step 7: Typecheck the whole content layer**

Run: `npx tsc --noEmit`
Expected: **no errors.** Step 6 of Task 1.4 now resolves.

- [ ] **Step 8: Verify no unsourced claim slipped in**

Run: `grep -o "[0-9][0-9,.]*" src/content/projects/*.ts | sort -u`
Then check each number against `docs/projects.md`. Every one must appear there or in `'C:\Users\Malay\.omp\agent\sessions\--C--Portfolio--\2026-09-07T21-36-09-579Z_01a07dcc-cf6b-72be-adbe-d5a37248826d\GameHunt.md'`. Expected: zero numbers you cannot point at a line for.

- [ ] **Step 9: Commit**

```bash
git add src/content/projects
git commit -m "feat: six project content modules, every fact sourced to docs/projects.md"
```

---

### Task 1.6: Presentational components

**Files:**
- Create: `src/components/SkipLink.tsx`, `Hero.tsx`, `LayerSection.tsx`, `ProjectArticle.tsx`, `DecisionList.tsx`, `ScaleStats.tsx`, `LinkRow.tsx`, `PortraitSlot.tsx`, `Contact.tsx`, `KeyboardHelp.tsx`, `ResumeLink.tsx`

**Parallelism:** **SERIALIZED after Task 1.4** (needs the content types). **PARALLEL-SAFE with Tasks 1.5 and 1.7** — owns `src/components/*.tsx` exclusively and imports only types, never project data. Within the task the eleven files are one-owner-each and may be split across subagents.

**Interfaces:**
- Consumes: `Project`, `Layer`, `Decision`, `Shot` from `@/content/types`; `SITE`, `RESUME_PDF_PRESENT`, `PORTRAIT_PRESENT` from `@/content/site`.
- Produces:
  - `<SkipLink />`
  - `<Hero />`
  - `<LayerSection layer={Layer} children />`
  - `<ProjectArticle project={Project} />`
  - `<DecisionList decisions={Decision[]} />`
  - `<ScaleStats scale={{label,value}[]} />`
  - `<LinkRow links={{label,href}[]} />`
  - `<PortraitSlot />`
  - `<Contact />`
  - `<KeyboardHelp />`
  - `<ResumeLink className?: string />`

All eleven are **server components** — no `'use client'` anywhere in this task. That is what keeps G1.4 (no-JS) and the 180 KB initial-route budget true.

- [ ] **Step 1: `SkipLink.tsx` — first focusable element in the document (§ 9.2)**

```tsx
export function SkipLink() {
  return (
    <a href="#surface"
       className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50
                  focus:bg-strata focus:text-light focus:px-4 focus:py-3 focus:border focus:border-hairline">
      Skip to the descent
    </a>
  );
}
```

- [ ] **Step 2: `ResumeLink.tsx` — the owner-blocked résumé slot, § 12 item 6**

The whole interim-state mechanism is these six lines. **There is never a link to a file that does not exist.**

```tsx
import { SITE, RESUME_PDF_PRESENT } from '@/content/site';

export function ResumeLink({ className }: { className?: string }) {
  return RESUME_PDF_PRESENT
    ? <a className={className} href={SITE.resumePath} download>Résumé (PDF)</a>
    : <a className={className} href="/resume">Résumé</a>;
}
```

- [ ] **Step 3: `Hero.tsx` — the LCP element, static HTML, OQ2 wiring (§ 13.1)**

```tsx
import { SITE } from '@/content/site';
import { ResumeLink } from './ResumeLink';

export function Hero() {
  return (
    <header className="page pt-24 pb-32" data-layer="surface">
      <div className="lg:col-span-9 prose-measure">
        <h1 className="font-display font-bold text-t-2xl lg:text-t-3xl text-light">
          {SITE.hero}
        </h1>
        <p className="mt-6 font-display text-t-md text-light/90 prose-measure">
          {SITE.heroSub}
        </p>
        <p className="mt-6 font-display text-t-base text-muted prose-measure">
          {SITE.standing}
        </p>
        <p className="mt-6 font-mono text-t-sm flex flex-wrap gap-x-6 gap-y-3">
          <ResumeLink className="underline decoration-[var(--accent)]" />
          <a className="underline decoration-[var(--accent)]" href={SITE.github}>GitHub</a>
          <a className="underline decoration-[var(--accent)]" href={`mailto:${SITE.email}`}>Email</a>
        </p>
      </div>
    </header>
  );
}
```

`SITE.hero` is § 13.1 candidate A, `SITE.heroSub` is candidate B demoted to a sub-line — the OQ2 resolution. There is no boot screen, no typewriter, no letter-by-letter reveal (non-goals 3 and 7): the text is in the first HTML response, whole.

- [ ] **Step 4: `LayerSection.tsx` — the five § 9.1 landmarks**

```tsx
import type { ReactNode } from 'react';
import type { Layer } from '@/content/types';

export function LayerSection({ layer, children }: { layer: Layer; children: ReactNode }) {
  return (
    <section id={layer.id} data-layer={layer.id} aria-labelledby={`${layer.id}-h`}
             className="page border-t border-hairline py-24">
      <div className="lg:col-span-12">
        <p className="font-mono text-t-xs text-muted">
          {layer.datum === 0 ? '0' : String(layer.datum).replace('-', '\u2212')} m · {layer.name}
          {layer.domain && <> · {layer.domain}</>}
        </p>
        <h2 id={`${layer.id}-h`} className="mt-3 font-display font-semibold text-t-xl text-light">
          {layer.name}{layer.domain && <span className="text-muted"> — {layer.domain}</span>}
        </h2>
        {layer.thesis && (
          <p className="mt-6 font-display text-t-md text-light prose-measure">{layer.thesis}</p>
        )}
        <div className="mt-16 flex flex-col gap-24">{children}</div>
      </div>
    </section>
  );
}
```

- [ ] **Step 5: `DecisionList.tsx`, `ScaleStats.tsx`, `LinkRow.tsx`**

```tsx
// DecisionList.tsx
import type { Decision } from '@/content/types';

export function DecisionList({ decisions }: { decisions: Decision[] }) {
  return (
    <ol className="mt-6 flex flex-col gap-6 list-none p-0 m-0">
      {decisions.map((d, i) => (
        <li key={i} className="prose-measure">
          <p className="font-display text-t-base text-light m-0">{d.body}</p>
          <p className="mt-3 font-mono text-t-sm text-muted m-0">
            {d.evidence.join('  ·  ')}
          </p>
        </li>
      ))}
    </ol>
  );
}
```

```tsx
// ScaleStats.tsx
export function ScaleStats({ scale }: { scale: { label: string; value: string }[] }) {
  return (
    <dl className="mt-6 font-mono text-t-sm grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 m-0">
      {scale.map((s) => (
        <div key={s.label} className="flex gap-3">
          <dt className="text-muted shrink-0">{s.label}</dt>
          <dd className="text-light m-0">{s.value}</dd>
        </div>
      ))}
    </dl>
  );
}
```

```tsx
// LinkRow.tsx  — renders nothing at all when links is empty (GameZone, Pong, Pixel Quest)
export function LinkRow({ links }: { links: { label: string; href: string }[] }) {
  if (links.length === 0) return null;
  return (
    <p className="mt-6 font-mono text-t-sm flex flex-wrap gap-x-6 gap-y-3">
      {links.map((l) => (
        <a key={l.href} href={l.href} className="underline decoration-[var(--accent)]">{l.label}</a>
      ))}
    </p>
  );
}
```

- [ ] **Step 6: `ProjectArticle.tsx` — the § 4.2 panel order, used as the page content in Phase 1 and as the panel body in Phase 5**

Order is fixed by § 4.2: title → thesis → links → decisions with file-path evidence → scale numbers → presentation → honesty line.

```tsx
import type { Project } from '@/content/types';
import { DecisionList } from './DecisionList';
import { ScaleStats } from './ScaleStats';
import { LinkRow } from './LinkRow';
import { ShotGallery } from './ShotGallery';
import { DeploymentPlatformDiagram } from '@/diagrams/DeploymentPlatformDiagram';
import { GameZoneDiagram } from '@/diagrams/GameZoneDiagram';
import { ProtocolTable } from './ProtocolTable';

export function ProjectArticle({ project: p }: { project: Project }) {
  return (
    <article id={p.slug} data-layer={p.layer} aria-labelledby={`${p.slug}-h`}>
      <h3 id={`${p.slug}-h`} className="font-display font-semibold text-t-lg text-light m-0">
        {p.title}
      </h3>
      <p className="mt-3 font-display text-t-md text-light prose-measure m-0">{p.thesis}</p>
      <LinkRow links={p.links} />
      <DecisionList decisions={p.decisions} />
      <ScaleStats scale={p.scale} />
      <div className="mt-12">
        {p.presentation.kind === 'screenshots' && <ShotGallery shots={p.presentation.shots} />}
        {p.presentation.kind === 'diagram' && p.presentation.component === 'deployment-platform' && <DeploymentPlatformDiagram />}
        {p.presentation.kind === 'diagram' && p.presentation.component === 'gamezone' && <GameZoneDiagram />}
        {p.presentation.kind === 'node-field' && <ProtocolTable />}
        {/* presentation.kind === 'playable' renders nothing in Phase 1; Task 2.6 mounts GameMount here */}
      </div>
      <p className="mt-12 font-display text-t-base text-muted prose-measure border-l border-hairline pl-6 m-0">
        {p.honesty}
      </p>
    </article>
  );
}
```

- [ ] **Step 7: `ProtocolTable.tsx` — the Reasoning exhibit under the OQ3 deferral**

OQ3 is deferred, so the 12 protocol message types **are** the exhibit, in the DOM, in full. No trace, no fixture, no placeholder for one.

```tsx
import { CLIENT_MESSAGES, SERVER_MESSAGES } from '@/content/projects/switchboard';

export function ProtocolTable() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
      <div>
        <h4 className="font-mono text-t-xs text-muted m-0">ClientMessage · 5</h4>
        <ul className="mt-3 font-mono text-t-sm text-light list-none p-0 m-0 flex flex-col gap-2">
          {CLIENT_MESSAGES.map((m) => <li key={m}>{m}</li>)}
        </ul>
      </div>
      <div>
        <h4 className="font-mono text-t-xs text-muted m-0">ServerMessage · 7</h4>
        <ul className="mt-3 font-mono text-t-sm text-light list-none p-0 m-0 flex flex-col gap-2">
          {SERVER_MESSAGES.map((m) => <li key={m}>{m}</li>)}
        </ul>
      </div>
    </div>
  );
}
```

Add `ProtocolTable.tsx` to this task's file list. It is owned here and by nothing else.

- [ ] **Step 8: `PortraitSlot.tsx` — the owner-blocked portrait, § 12 item 7**

Used **exactly once** on the site (§ 3.4). The `false` branch is a designed block, not a broken image and not a grey box with a camera glyph.

```tsx
import { SITE, PORTRAIT_PRESENT } from '@/content/site';

export function PortraitSlot() {
  if (PORTRAIT_PRESENT) {
    return (
      <picture>
        <source srcSet="/portrait.avif" type="image/avif" />
        <img src="/portrait.webp" width={320} height={320} loading="lazy"
             alt={`${SITE.name}, ${SITE.credential}`}
             className="w-80 h-80 object-cover border border-hairline" />
      </picture>
    );
  }
  return (
    <div className="w-80 h-80 bg-strata border border-hairline flex flex-col justify-end p-6"
         role="img" aria-label={`${SITE.name}, ${SITE.credential}`}>
      <p className="font-display font-semibold text-t-md text-light m-0">{SITE.name}</p>
      <p className="mt-2 font-mono text-t-xs text-muted m-0">{SITE.credential}</p>
    </div>
  );
}
```

- [ ] **Step 9: `Contact.tsx` and `KeyboardHelp.tsx` (§ 9.2, § 10.3)**

Four links. **No contact form** (§ 10.3). `KeyboardHelp` is a static block on Bedrock — never a modal, never a `⌘K` palette (non-goal 9).

```tsx
// Contact.tsx
import { SITE } from '@/content/site';
import { ResumeLink } from './ResumeLink';

export function Contact() {
  return (
    <div id="contact">
      <h3 className="font-display font-semibold text-t-lg text-light m-0">Contact</h3>
      <p className="mt-6 font-mono text-t-sm flex flex-col gap-3 m-0">
        <a href={`mailto:${SITE.email}`} className="underline decoration-[var(--accent)]">{SITE.email}</a>
        <a href={SITE.github} className="underline decoration-[var(--accent)]">github.com/malllayyyy</a>
        <a href={SITE.linkedin} className="underline decoration-[var(--accent)]">linkedin.com/in/malay-chaudhary-959077328</a>
        <ResumeLink className="underline decoration-[var(--accent)]" />
      </p>
    </div>
  );
}
```

```tsx
// KeyboardHelp.tsx
export function KeyboardHelp() {
  const rows: [string, string][] = [
    ['1 – 4', 'jump to a layer datum'],
    ['↑ / ↓', 'step ±10 m'],
    ['Home / End', 'Surface / Bedrock'],
    ['Tab', 'move through every exhibit in depth order'],
    ['Esc', 'close a panel, or release a game'],
  ];
  return (
    <div>
      <h3 className="font-display font-semibold text-t-lg text-light m-0">Keyboard</h3>
      <dl className="mt-6 font-mono text-t-sm grid grid-cols-[auto_1fr] gap-x-6 gap-y-3 m-0">
        {rows.map(([k, v]) => (
          <div key={k} className="contents"><dt className="text-light">{k}</dt><dd className="text-muted m-0">{v}</dd></div>
        ))}
      </dl>
      <p className="mt-6 font-display text-t-base text-muted prose-measure">
        All of these are additive. The site is complete with Tab and Enter alone.
      </p>
    </div>
  );
}
```

- [ ] **Step 10: Typecheck**

Run: `npx tsc --noEmit`
Expected: errors only for `ShotGallery` and the two diagram modules, which Task 1.7 creates. Nothing else.

- [ ] **Step 11: Commit**

```bash
git add src/components
git commit -m "feat: static server components for hero, layers, project articles, portrait and contact"
```

---

### Task 1.7a: `deployment-platform` architecture SVG — "one deploy, end to end."

**Files:**
- Create: `src/diagrams/DeploymentPlatformDiagram.tsx`

**Parallelism:** **PARALLEL-SAFE.** Owns `src/diagrams/DeploymentPlatformDiagram.tsx` and nothing else. Runs concurrently with 1.5, 1.6, 1.7b. Requires only that Task 1.2 has landed the colour tokens.

**Interfaces:**
- Produces: `<DeploymentPlatformDiagram />`, an inline `<svg role="img">` with `<title>` and `<desc>`, and a `<title>` on **every** node group (§ 4.3, § 9.1).

**Grammar (§ 4.3, shared by both diagrams):** rectangles = processes · cylinders = stores · **solid** arrow = synchronous call · **dashed** arrow = queue/stream · **dotted** boundary = isolation boundary. All labels JetBrains Mono 11 px. **Maximum 12 nodes.** Non-focal strokes and text `#8FA0B0`; the one focal element `#8FD3FF`; fills `#10151C`; boundary and hairlines `#1B2430`.

**Canvas:** `viewBox="0 0 960 560"`, `preserveAspectRatio="xMidYMid meet"`, `width="100%"`, `height="auto"`.

**The 12 nodes.** Draw these and no others. Coordinates are the node's top-left; rectangles are 150 × 44 unless stated; cylinders are 150 wide × 60 tall with a 10-unit elliptical cap top and bottom.

| # | Node | Shape | Position (x, y) | Label lines (Mono 11) |
|---:|---|---|---|---|
| N1 | git URL | rect, `--muted` stroke | 24, 40 | `git URL` |
| N2 | `@platform/api` | rect | 220, 40 | `@platform/api` / `express` |
| N3 | Redis · BullMQ queue | cylinder | 430, 30 | `Redis` / `BullMQ` / `BUILD_QUEUE_NAME` |
| N4 | `@platform/worker` | rect | 640, 40 | `@platform/worker` |
| N5 | `platform-build-sandbox` | rect, **inside the dotted boundary** | 660, 170 | `platform-build-sandbox` / `docker run` |
| N6 | `node_modules` cache | cylinder, host bind mount, **inside the dotted boundary** | 460, 165 | `node_modules cache` / `host bind mount` |
| N7 | MinIO | cylinder | 660, 320 | `MinIO` / `<project>/<deploymentId>` |
| N8 | Postgres | cylinder | 380, 400 | `Postgres` / `users · projects` / `deployments · build_logs` |
| N9 | Socket.IO | rect | 220, 170 | `Socket.IO` |
| N10 | `@platform/dashboard` | rect | 24, 170 | `@platform/dashboard` |
| N11 | `@platform/proxy` | rect | 140, 400 | `@platform/proxy` |
| N12 | browser | rect, `--muted` stroke | 24, 470 | `browser` |

**The dotted isolation boundary** is one `<rect>` with `stroke-dasharray="2 4"`, stroke `#1B2430`, no fill, spanning `x 440 → 830, y 150 → 250`, labelled at its top-left in Mono 11 `--muted`: `isolation boundary — throwaway container`. It encloses **N5 and N6 only**.

**The 13 edges.** Every arrowhead is a shared `<marker>` (`#arrow` in `--muted`, `#arrow-focal` in `#8FD3FF`).

| # | From → To | Style | Label (Mono 11) |
|---:|---|---|---|
| E1 | N1 → N2 | solid | `POST /deploy` |
| E2 | N2 → N3 | **dashed** | `enqueue` |
| E3 | N3 → N4 | **dashed** | `consume` |
| E4 | N4 → N5 | solid | `spawn container` |
| E5 | N5 ↔ N6 | solid, **double-headed** | `lockfile hash → cache hit → skip npm install` |
| E6 | N5 → N7 | solid | `upload static output` |
| E7 | N5 → N3 | **dashed** | `buildLogChannel` |
| E8 | N3 → N2 | **dashed** | `pub/sub` |
| E9 | N2 → N9 | **dashed** | — |
| E10 | N9 → N10 | **dashed** | `live` |
| E11 | **N4 → N8** | **solid, FOCAL `#8FD3FF`, stroke-width 2** | `UPDATE projects SET current_deployment_id` |
| E12 | N12 → N11 | solid | `Host: <subdomain>` |
| E13 | N11 → N8 | solid | `current_deployment_id → bucket_path` |
| E14 | N11 → N7 | solid | `stream object` |

**The focal annotation.** Beside E11, in Satoshi 13, `#8FD3FF`, at roughly (600, 470), on two lines:

> `success flips this. rollback flips it back.`
> `one UPDATE, zero downtime.`

**Nothing else on the diagram is `#8FD3FF`.** The diagram exists to make one idea land: the atomic swap is a single column.

**File-path evidence rendered under the diagram** in Mono 11 `--muted`, one line:
`infra/docker/build.sh · apps/worker/src/build.js · apps/proxy/src/index.js`

- [ ] **Step 1: Write the component**

Structure it so every node is a `<g role="listitem">` carrying a `<title>`; the root is `<svg role="img" aria-labelledby="dp-title dp-desc">`.

```tsx
export function DeploymentPlatformDiagram() {
  return (
    <figure className="m-0">
      <svg viewBox="0 0 960 560" width="100%" height="auto" role="img"
           aria-labelledby="dp-title dp-desc"
           className="border border-hairline bg-strata">
        <title id="dp-title">deployment-platform: one deploy, end to end</title>
        <desc id="dp-desc">
          A git URL posts to the platform API, which enqueues a build on a BullMQ queue in Redis.
          The worker consumes it and spawns a throwaway platform-build-sandbox Docker container
          inside an isolation boundary. The sandbox hashes the lockfile against a host bind-mounted
          node_modules cache and skips npm install on a hit, then uploads the static output to a
          versioned MinIO path. Build logs stream back over a Redis pub/sub channel through the API
          and Socket.IO to the dashboard. On success the worker updates a single Postgres column,
          projects.current_deployment_id. A browser request reaches the proxy, which looks that
          column up to find the deployment bucket path and streams the object from MinIO.
        </desc>
        <defs>
          <marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M0,0 L10,5 L0,10 z" fill="#8FA0B0" />
          </marker>
          <marker id="arrow-focal" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M0,0 L10,5 L0,10 z" fill="#8FD3FF" />
          </marker>
        </defs>
        {/* nodes N1–N12, boundary, edges E1–E14 and the focal annotation, per the tables above */}
      </svg>
      <figcaption className="mt-3 font-mono text-t-xs text-muted">
        infra/docker/build.sh · apps/worker/src/build.js · apps/proxy/src/index.js
      </figcaption>
    </figure>
  );
}
```

- [ ] **Step 2: Verify the node count**

Run: `grep -c "<title>" src/diagrams/DeploymentPlatformDiagram.tsx`
Expected: **13** — one root `<title id="dp-title">` plus exactly 12 node titles. More than 13 means you drew a node the spec does not have; § 4.3 caps it at 12 and the cap is the point.

- [ ] **Step 3: Verify the focal colour is used exactly once**

Run: `grep -o "#8FD3FF" src/diagrams/DeploymentPlatformDiagram.tsx | wc -l`
Expected: **4** — the `arrow-focal` marker fill, E11's stroke, and the two annotation text lines. Any other occurrence means something non-focal is wearing the accent.

- [ ] **Step 4: Look at it**

Run: `npx next build && npx serve out`, open `http://localhost:3000/project/deployment-platform` (after Task 1.8) or temporarily render it on `/`.
Expected: at 100 % zoom on a 1440 px screen every label is legible, no line crosses a node box, and the one blue arrow is the first thing your eye lands on.

- [ ] **Step 5: Screen-reader check**

Turn on NVDA or VoiceOver, `Tab` to the figure.
Expected: the title is announced, then the full `<desc>` prose. The diagram is comprehensible with the screen off.

- [ ] **Step 6: Commit**

```bash
git add src/diagrams/DeploymentPlatformDiagram.tsx
git commit -m "feat: deployment-platform architecture diagram, atomic swap as the focal edge"
```

---

### Task 1.7b: GameZone architecture SVG — "a POS that assumes the disk is slow."

**Files:**
- Create: `src/diagrams/GameZoneDiagram.tsx`

**Parallelism:** **PARALLEL-SAFE.** Owns `src/diagrams/GameZoneDiagram.tsx` and nothing else. Runs concurrently with 1.5, 1.6, 1.7a.

**Interfaces:**
- Produces: `<GameZoneDiagram />`, same contract as 1.7a.

**Grammar:** identical to 1.7a. **Focal colour is `#FFC46B`** (Device accent), non-focal `#8FA0B0`.

**Canvas:** `viewBox="0 0 960 620"`. Two zones: the main graph occupies `y 0 → 420`; the session-rollover inset strip occupies `y 460 → 600`, separated by a full-width 1 px `#1B2430` rule at `y = 440`.

**The 10 nodes** (6 in the main graph, 4 in the inset — well inside the 12 cap):

| # | Node | Shape | Position (x, y) | Label lines (Mono 11) |
|---:|---|---|---|---|
| M1 | Android app | rect 170 × 56 | 30, 40 | `Android app` / `Capacitor 6 · com.gamezone.app` |
| M2 | Desktop browser | rect 170 × 56 | 30, 150 | `desktop browser` |
| M3 | same Vite bundle | rect 190 × 56, both arrows converge here | 300, 95 | `same Vite bundle` / `React 18 + Vite` |
| M4 | `backend/server.js` | rect 190 × 56 | 590, 95 | `backend/server.js` / `Express · ~15 endpoints` |
| M5 | SQLite | cylinder 190 × 96 | 590, 250 | `SQLite` / `stations · sessions · settings` / `activities · snacks` / `cafeteria_expenses · revenue_history` |
| M6 | `Start-GameZone.bat` | rect 170 × 44, `--muted` stroke | 300, 250 | `Start-GameZone.bat` |

**Main-graph edges:**

| # | From → To | Style | Label |
|---:|---|---|---|
| F1 | M1 → M3 | solid | — |
| F2 | M2 → M3 | solid | — |
| F3 | M3 → M4 | solid | `fetch /api/*` |
| F4 | M4 → M5 | solid | `sqlite3` |
| F5 | M6 → M4 | **dashed** | `one click, on the cafe's own machine` |

**The pragma callout.** A rect `x 300 → 560, y 330 → 420`, fill `#10151C`, stroke `#FFC46B` 1 px, joined to the M5 cylinder by a short solid `#FFC46B` leader line. Contents, Mono 11:

```
PRAGMA journal_mode = WAL
PRAGMA synchronous  = NORMAL
PRAGMA temp_store   = MEMORY
PRAGMA cache_size   = -10000
BEGIN TRANSACTION … COMMIT   (startup seeding)
```

Beneath it, Satoshi 13 in `#FFC46B`, one line: **`Windows 7. 5400 rpm. Node v13.14.0.`**

This callout is the diagram's focal element. It is the only thing outside the inset strip wearing `#FFC46B`.

**The session-rollover inset strip.** Four boxes, one line, left to right, each rect 190 × 52, `y = 500`, `x =` 30, 260, 490, 720, joined by three solid `--muted` arrows. Mono 11 labels:

| Box | Label |
|---|---|
| R1 | `station occupied` |
| R2 | `POST /api/sessions/add-game` |
| R3 | `overage computed` |
| R4 | `deducted from new activity` |

Strip caption, centred under the four boxes at `y = 585`, Satoshi 13 in `#FFC46B`: **`occupancy unbroken`**.
Strip heading, above the boxes at `y = 478`, Mono 11 `--muted`: `mid-session rollover — Snooker → PS5, same station`.

This is the business logic and it is the most interesting thing in the project (§ 4.3). It gets its own strip for that reason.

**File-path evidence under the figure**, Mono 11 `--muted`:
`backend/database.js · backend/server.js · frontend/capacitor.config.json`

**The launcher icon.** `assets/raw/gamezone/ic_launcher.png` is used **once, at 96 px**, as the exhibit's identity mark beside the panel heading (Task 1.7c places it) — **not** inside this diagram and **not** as a screenshot substitute (§ 3.2).

- [ ] **Step 1: Write the component**

Same structural contract as 1.7a: `<svg role="img" aria-labelledby="gz-title gz-desc">`, a `<title>` per node, and a `<desc>` that reads:

```
Two clients — a Capacitor 6 Android app and a desktop browser — run the same Vite
React bundle, which calls backend/server.js, an Express API of roughly fifteen
endpoints, which reads and writes a SQLite database of seven tables: stations,
sessions, settings, activities, snacks, cafeteria_expenses and revenue_history.
SQLite is configured for a slow spinning disk on Windows 7 running Node v13.14.0:
journal_mode WAL, synchronous NORMAL, temp_store MEMORY, cache_size -10000, and
startup seeding wrapped in a single transaction. A separate strip shows the
mid-session rollover rule: a station is occupied, a request to add-game arrives,
the played overage is computed and deducted from the new activity's duration, and
occupancy is never broken.
```

- [ ] **Step 2: Verify the node count**

Run: `grep -c "<title>" src/diagrams/GameZoneDiagram.tsx`
Expected: **11** — root plus 10 nodes. Never more than 13 (root + 12).

- [ ] **Step 3: Verify the four literal pragmas are present verbatim**

Run: `grep -c "PRAGMA" src/diagrams/GameZoneDiagram.tsx`
Expected: **4**.
Run: `grep -o "cache_size   = -10000\|cache_size = -10000" src/diagrams/GameZoneDiagram.tsx`
Expected: a match. The value is negative — `-10000` means 10 000 KiB, and getting the sign wrong makes the whole callout wrong.

- [ ] **Step 4: Look at it and read it aloud**

Run: `npx next build && npx serve out`, open the GameZone article.
Expected: the pragma callout is readable at 1440 px without zooming; the rollover strip reads left-to-right as a sentence; nothing but the callout and the strip caption is orange.

- [ ] **Step 5: Commit**

```bash
git add src/diagrams/GameZoneDiagram.tsx
git commit -m "feat: GameZone architecture diagram with the four literal pragmas and the rollover strip"
```

---

### Task 1.7c: Image pipeline — ProAcademys shots and the GameZone identity mark

**Files:**
- Create: `src/components/ShotGallery.tsx`
- Create: `public/shots/proacademys/{desktop-home,desktop-catalog,desktop-catalog-courses,desktop-course-detail,desktop-blog,mobile-home,mobile-catalog,mobile-course-detail}.{avif,webp}`
- Create: `public/gamezone/ic_launcher.png`

**Parallelism:** **PARALLEL-SAFE.** Owns `src/components/ShotGallery.tsx`, `public/shots/**`, `public/gamezone/**`. Note `ShotGallery.tsx` lives in `src/components/` — coordinate with Task 1.6, which owns every *other* file in that directory. These two tasks do not intersect on any file and may run concurrently.

**Interfaces:**
- Consumes: `Shot` from `@/content/types`.
- Produces: `<ShotGallery shots={Shot[]} />`.

- [ ] **Step 1: Encode the eight captures**

Sources are `C:/Portfolio/assets/raw/proacademys/*.png` (all 8 verified present, `docs/live-capture.md`). Encode each to AVIF and WebP, capped at the panel's 5-column width — max **640 px CSS**, so 1280 px physical for 2× (§ 4.2).

```bash
mkdir -p public/shots/proacademys
for f in assets/raw/proacademys/*.png; do
  n=$(basename "$f" .png)
  npx @squoosh/cli --avif '{"cqLevel":33}' --resize '{"width":1280}' -d public/shots/proacademys "$f"
  npx @squoosh/cli --webp '{"quality":78}' --resize '{"width":1280}' -d public/shots/proacademys "$f"
done
```

Run: `wc -c public/shots/proacademys/*.avif`
Expected: every file ≤ **90 KB**. These are lazy-loaded panel images, not the LCP, but the § 8.1 scene-asset ceiling of 2.8 MB has to hold with them in it.

- [ ] **Step 2: Copy the GameZone identity mark**

```bash
mkdir -p public/gamezone
cp assets/raw/gamezone/ic_launcher.png public/gamezone/ic_launcher.png
```

Used once, at 96 px, beside the GameZone heading. Do not upscale it, do not use it as a hero, do not repeat it.

- [ ] **Step 3: Write `ShotGallery.tsx`**

`loading="eager"` only on index 0 (§ 4.2); the mobile triptych is grouped in a 3-up row at its native 390 × 844 aspect.

```tsx
import type { Shot } from '@/content/types';

export function ShotGallery({ shots }: { shots: Shot[] }) {
  const desktop = shots.filter((s) => s.width > 640);
  const mobile = shots.filter((s) => s.width <= 640);
  return (
    <div className="flex flex-col gap-12">
      {desktop.map((s, i) => (
        <figure key={s.src} className="m-0">
          <picture>
            <source srcSet={s.src} type="image/avif" />
            <img src={s.fallback} width={s.width} height={s.height} alt={s.alt}
                 sizes="(min-width: 1024px) 640px, 100vw"
                 loading={i === 0 ? 'eager' : 'lazy'}
                 className="w-full h-auto border border-hairline" />
          </picture>
          <figcaption className="mt-3 font-mono text-t-xs text-muted">{s.claim}</figcaption>
        </figure>
      ))}
      {mobile.length > 0 && (
        <figure className="m-0">
          <div className="grid grid-cols-3 gap-6">
            {mobile.map((s) => (
              <picture key={s.src}>
                <source srcSet={s.src} type="image/avif" />
                <img src={s.fallback} width={s.width} height={s.height} alt={s.alt}
                     loading="lazy" className="w-full h-auto border border-hairline" />
              </picture>
            ))}
          </div>
          <figcaption className="mt-3 font-mono text-t-xs text-muted">
            Responsive is implemented, not asserted — same routes, 390 px.
          </figcaption>
        </figure>
      )}
    </div>
  );
}
```

- [ ] **Step 4: Verify every image resolves and none shifts layout**

Run: `npx next build && npx serve out`, open the ProAcademys article, DevTools → Network → filter `Img`.
Expected: 7 AVIF requests, all `200`, zero `404`. Performance panel: **Layout Shift 0** (every `<img>` carries explicit `width`/`height`).

- [ ] **Step 5: Commit**

```bash
git add src/components/ShotGallery.tsx public/shots public/gamezone
git commit -m "feat: ProAcademys shot gallery in AVIF/WebP and the GameZone identity mark"
```

---

### Task 1.8: The route table as real pages — `/`, `/layer/[slug]`, `/project/[slug]`

**Files:**
- Modify: `src/app/page.tsx` (replaces the Task 1.1 throwaway)
- Create: `src/app/layer/[slug]/page.tsx`
- Create: `src/app/project/[slug]/page.tsx`
- Create: `src/app/not-found.tsx`

**Parallelism:** **SERIALIZED after Tasks 1.4, 1.5, 1.6, 1.7a, 1.7b, 1.7c** — it composes all of them. Owns the four page files. Does **not** touch `layout.tsx` (Task 1.9 does).

**Interfaces:**
- Consumes: `LAYERS`, `PROJECTS`, `ROUTES`, and every component from Task 1.6.
- Produces: eleven statically exported HTML documents, each containing the **complete** DOM (§ 9.1) — a project route is not a subset of `/`, it is `/` with a different `generateMetadata` and a scroll target.

**The critical property (§ 8.3, § 9.1):** the *content* of `/`, `/layer/*` and `/project/*` is **identical**. What differs is metadata, the anchor the browser lands on, and — from Phase 5 — which panel opens. This is what makes the Task 6.5 tier-parity assertion possible and what makes deep links free.

- [ ] **Step 1: Extract the shared document into `src/app/page.tsx`**

```tsx
import { SkipLink } from '@/components/SkipLink';
import { Hero } from '@/components/Hero';
import { LayerSection } from '@/components/LayerSection';
import { ProjectArticle } from '@/components/ProjectArticle';
import { PortraitSlot } from '@/components/PortraitSlot';
import { Contact } from '@/components/Contact';
import { KeyboardHelp } from '@/components/KeyboardHelp';
import { LAYERS } from '@/content/layers';
import { PROJECTS } from '@/content/projects';
import { SITE } from '@/content/site';

export function Descent() {
  return (
    <>
      <SkipLink />
      <Hero />
      <main>
        {LAYERS.filter((l) => l.id !== 'bedrock').map((layer) => (
          <LayerSection key={layer.id} layer={layer}>
            {PROJECTS.filter((p) => p.layer === layer.id).map((p) => (
              <ProjectArticle key={p.slug} project={p} />
            ))}
          </LayerSection>
        ))}
        <section id="bedrock" data-layer="bedrock" aria-labelledby="bedrock-h"
                 className="page border-t border-hairline py-24">
          <div className="lg:col-span-12">
            <p className="font-mono text-t-xs text-muted">−300 m · BEDROCK</p>
            <h2 id="bedrock-h" className="mt-3 font-display font-semibold text-t-xl text-light">About</h2>
            <div className="mt-12 flex flex-col gap-12 lg:flex-row lg:gap-24">
              <PortraitSlot />
              <div className="prose-measure">
                <p className="font-display text-t-base text-light">{SITE.name} — {SITE.credential}.</p>
                <p className="mt-6 font-display text-t-base text-light">
                  Four domains, presented as four depths of one stack: a self-hosted PaaS and a MERN
                  rewrite at the surface, a gaming-cafe POS on the device below it, two Canvas 2D
                  engines below that, and a control plane for AI agents at the bottom. Each layer is
                  causally responsible for the one above it, and the projects are the evidence.
                </p>
              </div>
            </div>
            <div className="mt-24 grid grid-cols-1 lg:grid-cols-2 gap-24">
              <Contact />
              <KeyboardHelp />
            </div>
          </div>
        </section>
      </main>
    </>
  );
}

export default function Home() {
  return <Descent />;
}
```

- [ ] **Step 2: `src/app/layer/[slug]/page.tsx`**

```tsx
import { notFound } from 'next/navigation';
import { Descent } from '../../page';
import { LAYERS } from '@/content/layers';
import { ROUTES } from '@/content/routes';

export function generateStaticParams() {
  return LAYERS.filter((l) => l.id !== 'bedrock').map((l) => ({ slug: l.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const route = ROUTES.find((r) => r.path === `/layer/${slug}`);
  if (!route) return {};
  return { title: route.title, description: route.description };
}

export default async function LayerPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!LAYERS.some((l) => l.id === slug && l.id !== 'bedrock')) notFound();
  return <Descent />;
}
```

- [ ] **Step 3: `src/app/project/[slug]/page.tsx`** — same shape, `generateStaticParams` from `PROJECTS.map(p => ({ slug: p.slug }))`, `generateMetadata` from the matching `ROUTES` entry, body `<Descent />`.

- [ ] **Step 4: `src/app/not-found.tsx`** — one heading, one sentence, a link back to `/`. No 3D, no illustration, no joke.

- [ ] **Step 5: Verify all eleven documents export**

Run: `npx next build`
Then: `find out -name index.html | sort`
Expected exactly these eleven plus `/about` and `/resume` after Task 1.9:
```
out/index.html
out/layer/surface/index.html
out/layer/device/index.html
out/layer/engine/index.html
out/layer/reasoning/index.html
out/project/deployment-platform/index.html
out/project/proacademys/index.html
out/project/gamezone/index.html
out/project/pong/index.html
out/project/pixel-quest/index.html
out/project/switchboard/index.html
```

- [ ] **Step 6: Verify the DOM is genuinely complete in the source (§ 9.5)**

Run: `grep -c "current_deployment_id" out/index.html`
Expected: ≥ 2 (the decision prose and the diagram edge label).
Run: `grep -c "PRAGMA journal_mode = WAL" out/index.html`
Expected: ≥ 1.
Run: `grep -c "37 MySQL tables" out/index.html`
Expected: ≥ 1.
Run: `grep -c "session_switched" out/index.html`
Expected: ≥ 1 (the 12-type protocol table).
Run: `grep -c "proacademys-client.vercel.app" out/project/gamezone/index.html`
Expected: ≥ 1 — the project routes carry the *whole* document, not just their own project.

- [ ] **Step 7: Verify the two links that must NOT exist**

Run: `grep -o "github.com/malllayyyy/GameZone\|GameZone.apk" out/index.html | wc -l`
Expected: **0**. GameZone is private; there is no repo link, no demo link, no APK link (§ 3.2).

- [ ] **Step 8: Commit**

```bash
git add src/app/page.tsx src/app/layer src/app/project src/app/not-found.tsx
git commit -m "feat: the full route table as eleven statically exported documents"
```

---

### Task 1.9: `/about`, `/resume`, per-route metadata, `<noscript>`

**Files:**
- Create: `src/app/about/page.tsx`
- Create: `src/app/resume/page.tsx`
- Modify: `src/app/layout.tsx` (root `metadata`, `<noscript>`, `lang`, live region container)

**Parallelism:** **SERIALIZED after Task 1.8** (needs `Descent` and the components) **and after Task 1.3** in the `layout.tsx` chain. Owns `src/app/about/`, `src/app/resume/`, and the third write to `layout.tsx`.

**Interfaces:**
- Produces: `/about` and `/resume` as standalone documents; root `metadata` carrying the OQ2 descriptions.

- [ ] **Step 1: `src/app/resume/page.tsx` — the honest interim state for § 12 item 6**

This page is why no dead link ever ships. It is correct **before** the PDF exists and correct **after**, with no code change beyond the `RESUME_PDF_PRESENT` flag.

```tsx
import type { Metadata } from 'next';
import { SITE, RESUME_PDF_PRESENT } from '@/content/site';
import { ROUTES } from '@/content/routes';

const route = ROUTES.find((r) => r.path === '/resume')!;
export const metadata: Metadata = { title: route.title, description: route.description };

export default function ResumePage() {
  return (
    <main className="page py-24" data-layer="bedrock">
      <div className="lg:col-span-8 prose-measure">
        <h1 className="font-display font-bold text-t-xl text-light">Résumé</h1>
        {RESUME_PDF_PRESENT ? (
          <>
            <p className="mt-6 font-display text-t-base text-light">
              {SITE.name} — {SITE.credential}.
            </p>
            <p className="mt-6 font-mono text-t-sm">
              <a href={SITE.resumePath} download className="underline decoration-[var(--accent)]">
                Download the PDF
              </a>
            </p>
            <object data={SITE.resumePath} type="application/pdf"
                    className="mt-12 w-full h-[80vh] border border-hairline"
                    aria-label={`Résumé of ${SITE.name}`}>
              <p className="font-display text-t-base text-muted p-6">
                Your browser will not display the PDF inline.{' '}
                <a href={SITE.resumePath} download className="underline">Download it instead.</a>
              </p>
            </object>
          </>
        ) : (
          <>
            <p className="mt-6 font-display text-t-base text-light">
              The PDF is not up yet. Everything it would say is on this site already — the projects,
              the file paths, the numbers — and the fastest way to get the document itself is to ask.
            </p>
            <p className="mt-6 font-mono text-t-sm">
              <a href={`mailto:${SITE.email}`} className="underline decoration-[var(--accent)]">
                {SITE.email}
              </a>
            </p>
            <p className="mt-6 font-mono text-t-sm">
              <a href="/" className="underline decoration-[var(--accent)]">Back to the descent</a>
            </p>
          </>
        )}
      </div>
    </main>
  );
}
```

- [ ] **Step 2: `src/app/about/page.tsx`** — the Bedrock block as a standalone document (§ 10.3: same DOM, two entry points). Renders `<PortraitSlot />`, the name, `B.Tech CSE, IIIT Naya Raipur`, the bio prose from Task 1.8 Step 1, `<Contact />`, and the four-layer thesis paragraph. Import the same components; do not retype the copy.

- [ ] **Step 3: Root metadata and `<noscript>` in `layout.tsx`**

```tsx
import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { SITE, SITE_URL } from '@/content/site';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: 'Malay Chaudhary — Substrate', template: '%s' },
  description: SITE.metaDescription,          // OQ2: § 13.2 candidate 2 — search
  openGraph: {
    type: 'website',
    siteName: 'Malay Chaudhary — Substrate',
    title: 'Malay Chaudhary — Substrate',
    description: SITE.ogDescription,          // OQ2: § 13.2 candidate 3 — social
  },
  twitter: { card: 'summary_large_image', description: SITE.ogDescription },
  alternates: { canonical: '/' },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preload" as="font" type="font/woff2" crossOrigin="anonymous"
              href="/fonts/Satoshi-Variable.woff2" />
        <link rel="preload" as="font" type="font/woff2" crossOrigin="anonymous"
              href="/fonts/JetBrainsMono-Variable.woff2" />
        <meta name="theme-color" content="#06080B" />
      </head>
      <body>
        {children}
        <noscript>
          <p className="page py-12 font-mono text-t-sm">
            <a href="/resume">Résumé</a> · <a href={`mailto:${SITE.email}`}>{SITE.email}</a>
          </p>
        </noscript>
        {/* § 9.3: route changes announce the new title here. Populated in Phase 5. */}
        <div id="route-announcer" role="status" aria-live="polite" className="sr-only" />
      </body>
    </html>
  );
}
```

§ 9.5: `<noscript>` contains **one line** — the résumé link and the email. Everything else is already in the markup above it.

- [ ] **Step 4: Verify metadata is distinct per route**

Run: `npx next build`
Then:
```bash
grep -o "<title>[^<]*</title>" out/index.html out/project/gamezone/index.html out/layer/engine/index.html out/resume/index.html
```
Expected four distinct titles: `Malay Chaudhary — Substrate`, `GameZone — Malay Chaudhary`, `Engine — Game — Malay Chaudhary`, `Résumé — Malay Chaudhary`.

Run: `grep -o 'name="description" content="[^"]*"' out/index.html`
Expected: the § 13.2 candidate-2 string (`…A self-hosted PaaS, a MERN rewrite of a legacy platform, two game engines, and an agent switchboard.`).

Run: `grep -o 'property="og:description" content="[^"]*"' out/index.html`
Expected: the § 13.2 candidate-3 string (`Web, app, game, agent — four depths of one stack…`). **The two must differ** — that is the OQ2 resolution.

- [ ] **Step 5: Verify the résumé slot cannot 404**

Run: `grep -o 'href="/malay-chaudhary-resume.pdf"' out/index.html | wc -l`
Expected: **0** while `RESUME_PDF_PRESENT === false`. Every résumé link points at `/resume`.
Then click every "Résumé" link on the running site.
Expected: all land on `/resume`, which explains the state and gives the email. **Zero 404s.**

- [ ] **Step 6: Commit**

```bash
git add src/app/about src/app/resume src/app/layout.tsx
git commit -m "feat: /about, /resume with the honest interim state, and per-route metadata"
```

---

### Task 1.10: Font subsetting — Satoshi and JetBrains Mono to ≤ 28 KB each

**Files:**
- Create: `scripts/subset-fonts.sh`
- Replace: `public/fonts/Satoshi-Variable.woff2` → `public/fonts/Satoshi-Variable.subset.woff2`
- Replace: `public/fonts/JetBrainsMono-Variable.woff2` → `public/fonts/JetBrainsMono-Variable.subset.woff2`
- Modify: `src/app/globals.css` (`src:` URLs) and `src/app/layout.tsx` (preload `href`s)

**Parallelism:** **SERIALIZED after Tasks 1.8 and 1.9** — glyphhanger reads the *built* HTML, so all content must exist first. Also fourth in the `globals.css` chain and fifth in the `layout.tsx` chain. **Nothing may run concurrently with this task.**

**Interfaces:**
- Produces: two subset woff2 files, ≤ 28 KB each, ≤ 56 KB total (§ 6.1).

**Why it runs here and not in Task 1.3:** glyphhanger derives the glyph set from the rendered HTML. Subsetting before the content exists produces a font missing characters that later copy needs. Subsetting after produces exactly the right set. The unsubset files carried development; they are now replaced.

- [ ] **Step 1: Install the Python toolchain glyphhanger drives**

Run: `pip install fonttools brotli zopfli`
Expected: `pyftsubset --help` prints usage. glyphhanger shells out to `pyftsubset`; without it the subset step fails with a cryptic exit code.

- [ ] **Step 2: Write `scripts/subset-fonts.sh`**

```bash
#!/usr/bin/env bash
set -euo pipefail

# Subsets both families against the BUILT html. Run AFTER `next build`.
# § 6.1: Latin basic + Latin-1 punctuation + ₹ + · — → ↩ ⏎.
# Budget: ≤ 28 KB each, ≤ 56 KB total.

WHITELIST='U+20B9,U+00B7,U+2013,U+2014,U+2192,U+21A9,U+23CE,U+2212,U+2019,U+201C,U+201D'
UNICODES="U+0020-007E,U+00A0-00FF,${WHITELIST}"
LAYOUT='--layout-features=kern,liga,calt --layout-scripts=latn'

mkdir -p tmp/fonts
cp public/fonts/Satoshi-Variable.woff2       tmp/fonts/ 2>/dev/null || true
cp public/fonts/JetBrainsMono-Variable.woff2 tmp/fonts/ 2>/dev/null || true

# glyphhanger crawls every exported document and unions the glyphs actually used,
# then intersects with the whitelist above. --formats=woff2 keeps one output each.
npx glyphhanger \
  ./out/index.html \
  ./out/about/index.html \
  ./out/resume/index.html \
  ./out/layer/*/index.html \
  ./out/project/*/index.html \
  --formats=woff2 \
  --subset="tmp/fonts/*.woff2" \
  --whitelist="${UNICODES}" \
  --output=tmp/subset

# glyphhanger emits <name>-subset.woff2; normalise the names the CSS expects.
mv tmp/subset/Satoshi-Variable-subset.woff2       public/fonts/Satoshi-Variable.subset.woff2
mv tmp/subset/JetBrainsMono-Variable-subset.woff2 public/fonts/JetBrainsMono-Variable.subset.woff2
rm -f public/fonts/Satoshi-Variable.woff2 public/fonts/JetBrainsMono-Variable.woff2

# Budget gate — § 6.1 and § 8.1.
for f in public/fonts/*.subset.woff2; do
  b=$(wc -c < "$f")
  echo "$f: ${b} bytes"
  [ "$b" -le 28672 ] || { echo "FAIL: $f exceeds 28 KB"; exit 1; }
done
total=$(cat public/fonts/*.subset.woff2 | wc -c)
echo "total: ${total} bytes"
[ "$total" -le 57344 ] || { echo "FAIL: fonts exceed 56 KB total"; exit 1; }
echo "font budget OK"
```

**Fallback if glyphhanger will not run** (it is the only tool in this plan with a Python dependency): drive `pyftsubset` directly with the same unicode set. The result is byte-comparable because the whitelist is a superset of what the HTML uses.

```bash
pyftsubset tmp/fonts/Satoshi-Variable.woff2 \
  --output-file=public/fonts/Satoshi-Variable.subset.woff2 \
  --flavor=woff2 --no-hinting --desubroutinize \
  --layout-features=kern,liga,calt --layout-scripts=latn \
  --unicodes="U+0020-007E,U+00A0-00FF,U+20B9,U+00B7,U+2013,U+2014,U+2192,U+21A9,U+23CE,U+2212,U+2019,U+201C,U+201D"
```

Note: **do not pass `--instance`** to `pyftsubset`. Both faces are variable (Satoshi 300–900, JetBrains Mono 100–800) and instancing collapses the weight axis the type scale uses.

- [ ] **Step 3: Run it**

Run: `npx next build && bash scripts/subset-fonts.sh`
Expected output ends with:
```
public/fonts/JetBrainsMono-Variable.subset.woff2: <N> bytes
public/fonts/Satoshi-Variable.subset.woff2: <N> bytes
total: <N> bytes
font budget OK
```
with each `<N>` ≤ 28672 and the total ≤ 57344. § 6.1 expects a 68–75 % byte reduction against the originals; if you see less than 50 %, the whitelist is too wide — check for a stray `U+0100-FFFF`.

- [ ] **Step 4: Point the CSS and the preloads at the subsets**

In `src/app/globals.css`: `url("/fonts/Satoshi-Variable.subset.woff2")` and `url("/fonts/JetBrainsMono-Variable.subset.woff2")`.
In `src/app/layout.tsx`: the same two paths in the `<link rel="preload">` `href`s.

- [ ] **Step 5: Verify nothing renders as tofu**

Run: `npx next build && npx serve out`
Load `/`, `/project/proacademys` (the `₹5,999` price), `/project/deployment-platform` (the `→` in the diagram), and the depth readouts (the `−` U+2212 minus, **not** a hyphen).
Expected: no `□` anywhere. Zoom to 400 % on the `₹` and confirm it is the rupee sign, not a fallback-face substitute — the glyph must come from Satoshi.

Run: `grep -c "Satoshi-Variable.woff2" src/app/globals.css src/app/layout.tsx`
Expected: **0** in both — every reference is now `.subset.woff2`, and the unsubset files are deleted.

- [ ] **Step 6: Commit**

```bash
git add scripts/subset-fonts.sh public/fonts src/app/globals.css src/app/layout.tsx
git commit -m "chore: subset both variable fonts to under 28 KB each against the built HTML"
```

---

### Task 1.11: Phase 1 gate — Lighthouse, keyboard, no-JS, deploy

**Files:**
- Create: `docs/measurements.md` (the running record the § 8.1 table is written into)

**Parallelism:** **SERIALIZED — last task of Phase 1.** Owns `docs/measurements.md`. Requires every prior Phase 1 task committed. No other task may run concurrently, because it measures the whole tree.

- [ ] **Step 1: Build and serve the production output**

Run: `npx next build && npx serve out -l 3000`

- [ ] **Step 2: Lighthouse mobile — G1.1**

Run:
```bash
npx lighthouse http://localhost:3000/ \
  --only-categories=performance,accessibility,best-practices,seo \
  --form-factor=mobile --screenEmulation.mobile \
  --throttling-method=simulate --throttling.cpuSlowdownMultiplier=4 \
  --output=json --output-path=./lh-mobile.json --quiet --chrome-flags="--headless"
```
Then: `node -e "const r=require('./lh-mobile.json');console.log(Object.entries(r.categories).map(([k,v])=>k+': '+Math.round(v.score*100)).join('\n'));console.log('LCP',r.audits['largest-contentful-paint'].displayValue,'FCP',r.audits['first-contentful-paint'].displayValue,'CLS',r.audits['cumulative-layout-shift'].displayValue,'TBT',r.audits['total-blocking-time'].displayValue)"`

Expected against § 8.1 low tier — Phase 1 **is** the low-tier path, so these are the low-tier column:
- performance ≥ **98**
- accessibility **100**
- LCP ≤ **2600 ms** (measured framework floor, see `docs/measurements.md`)
- FCP ≤ **1.0 s**
- CLS ≤ **0.01**
- TTI ≤ **2700 ms** (measured framework floor, see `docs/measurements.md`)

Repeat for `/project/gamezone` and `/about`. Accessibility must be **100 on every route** (§ 9).

- [ ] **Step 3: JS budget — G1.2**

Run: `find out/_next/static/chunks -name '*.js' -exec gzip -c {} \; | wc -c`
Expected: ≤ **184320** bytes (180 KB gz). Phase 1 has no `three`, no `gsap`, no `lenis`, no `motion` — if this number is anywhere near the ceiling, something got imported that should not have been.

Run: `grep -rl "three\|gsap\|lenis" out/_next/static/chunks/ | wc -l`
Expected: **0**.

- [ ] **Step 4: Keyboard pass — G1.3**

Load `/` and press `Tab` repeatedly without touching the mouse, recording each stop.
Expected order (§ 9.2), exactly:
1. `Skip to the descent`
2. Hero: Résumé, GitHub, Email
3. Surface: `deployment-platform` GitHub link → ProAcademys live-demo link
4. Device: (GameZone has no links — Tab passes through its article without a stop, which is correct)
5. Engine: no links in Phase 1
6. Reasoning: Switchboard GitHub link
7. Bedrock: email, GitHub, LinkedIn, Résumé
8. `<noscript>` content is not focusable; the announcer is not focusable

Every stop shows `outline: 2px solid #8FD3FF; outline-offset: 3px`. No stop is invisible. No trap. `Shift+Tab` reverses cleanly.

- [ ] **Step 5: No-JS — G1.4**

DevTools → ⋮ → Settings → Debugger → **Disable JavaScript** → reload `/`.
Expected: hero, four layer sections, six project articles with every fact and file path, both SVG diagrams fully drawn, the portrait slot, contact links, keyboard block. Click the ProAcademys demo link — it navigates. **§ 9.5: without JS the site is a long, correct, readable document.**

- [ ] **Step 6: Canvas-absence check (§ 9.1 acceptance criterion)**

There is no canvas in Phase 1, so this passes trivially — but record the baseline now: copy the full rendered text of `/` for the Task 6.5 parity assertion.

Run: `node -e "const{JSDOM}=require('jsdom');const d=new JSDOM(require('fs').readFileSync('out/index.html','utf8'));require('fs').writeFileSync('docs/baseline-dom-text.txt',d.window.document.body.textContent.replace(/\s+/g,' ').trim())"`
Expected: `docs/baseline-dom-text.txt` written, non-empty, containing `current_deployment_id`, `PRAGMA journal_mode = WAL`, and `session_switched`.

- [ ] **Step 7: Deploy — G1.5**

Run: `npx vercel --prod`
Open the returned `.vercel.app` URL on a real Android phone.
Expected: loads, reads, scrolls; **no horizontal overflow at 390 px** (check by scrolling sideways — there must be nowhere to go); both diagrams scale down legibly; tapping any link works.

**Domain note:** the custom domain is `malaychaudhary.dev` and its cutover is Task 6.7. Phase 1 through 5 run on `.vercel.app`. Do not attempt the cutover early — `SITE_URL` feeds `metadataBase`, canonicals and the sitemap, and changing it before the DNS resolves produces canonical URLs that 404.

- [ ] **Step 8: Record the measurements**

Create `docs/measurements.md` with a dated table: route, form factor, Performance, Accessibility, LCP, FCP, CLS, TTI, initial-route gz bytes, font bytes. This file grows one section per phase and is what Task 6.9 fills in against the full § 8.1 table.

- [ ] **Step 9: Commit**

```bash
git add docs/measurements.md docs/baseline-dom-text.txt
git commit -m "docs: Phase 1 gate measurements — Lighthouse, budget, keyboard, no-JS"
```

**✅ Phase 1 complete. The portfolio exists and is deployed. Risks 1 and 4 are now bounded: every later phase is additive, and shipping at any point from here is shipping a complete site.**

---

# Phase 2 — Static stills, tiering, and the games

**Spec:** § 15 Phase 2, § 5, § 7, § 8.2, § 8.3. **Deliverable:** the tier detector with the manual override link; placeholder layer stills (replaced with real bakes in Phase 4); both game engines ported with the fixed-timestep accumulator, re-skinned, with capture/release and the mobile touch story; `engine/loop.test.ts` passing.

**Still no `three`, no `gsap`, no `lenis`.** Phase 2 adds exactly one runtime dependency: `motion@13.2.0`.

**Phase 2 gate:**

| # | Check | Command / action | Expected |
|---|---|---|---|
| G2.1 | Loop test | `npx vitest run src/engine/loop.test.ts` | 3 passing assertions (144 Hz vs 60 Hz tick parity ±2; 30 s jump → exactly 5 ticks, accumulator 0) |
| G2.2 | Pong keyboard | Play to 7 points using arrow keys only; exit with `Escape`; re-enter; exit with `Tab` | Wins at 7. `Escape` returns focus to the trigger button. `Tab` releases **and** moves focus to the next control — the Tab is not swallowed. |
| G2.3 | Pong touch | Open on a real phone, drag anywhere on the canvas | Paddle tracks the drag; the page does not scroll while dragging; lifting the finger does not release the game |
| G2.4 | Low tier ships no `three` | `grep -rl "THREE\|three" out/_next/static/chunks/ \| wc -l` | **0** |
| G2.5 | Budget holds | `find out/_next/static/chunks -name '*.js' -exec gzip -c {} \; \| wc -c` | ≤ **184320** bytes (Motion is ~18 KB gz and must fit inside the 180 KB initial route) |
| G2.6 | Reduced motion | OS → reduce motion **on**, reload, then toggle it **off** mid-session | `document.documentElement.dataset.motion` flips `off`→`on` without a reload; no Motion animation runs while `off`; the games remain startable |

---

### Task 2.1: Add Motion; add Vitest

**Files:** Modify `package.json`. Create `vitest.config.ts`.

**Parallelism:** **SERIALIZED — second writer in the `package.json` chain (after 1.1, before 3.1).** Nothing else in Phase 2 starts until this commits.

- [ ] **Step 1:** `npm i motion@13.2.0` and `npm i -D vitest@2.1.1`.
- [ ] **Step 2:** `vitest.config.ts` with `test: { environment: 'node', include: ['src/**/*.test.ts'] }`. Node environment, not jsdom — the loop test drives a synthetic clock and touches no DOM.
- [ ] **Step 3:** Add `"test": "vitest run"` to `scripts`.
- [ ] **Step 4:** Run `npx vitest run` → `No test files found` (expected; Task 2.5 adds the only one).
- [ ] **Step 5:** Commit — `chore: add motion 13.2.0 and vitest`.

---

### Task 2.2: Tier detection (§ 8.2) and the manual override

**Files:** Create `src/lib/tier.ts`, `src/components/TierToggle.tsx`, `src/components/TierBoot.tsx`. Modify `src/app/layout.tsx` (mount `TierBoot` and the footer `TierToggle`).

**Parallelism:** **SERIALIZED after 2.1** and **fourth writer in the `layout.tsx` chain** (after 1.1, 1.3, 1.9). Owns `src/lib/tier.ts` and the two components. Parallel-safe against 2.5/2.6/2.7 on everything except `layout.tsx`.

**Interfaces:**
- Produces: `detectTier(): 'low' | 'mid' | 'high'`, `webglSupported(): boolean`, `setTierOverride(t): void`, and `document.documentElement.dataset.tier` set before any 3D import decision.

- [ ] **Step 1: Write `src/lib/tier.ts` — the § 8.2 scoring, verbatim**

```ts
export type Tier = 'low' | 'mid' | 'high';

export function webglSupported(): boolean {
  try {
    const c = document.createElement('canvas');
    const ok = !!(c.getContext('webgl2') ?? c.getContext('webgl'));
    c.width = c.height = 0;      // discard immediately
    return ok;
  } catch { return false; }
}

/** Runs ONCE, synchronously, before the 3D import decision. Never re-run on resize. */
export function detectTier(): Tier {
  const override = localStorage.getItem('substrate-tier');
  if (override === 'low' || override === 'mid' || override === 'high') return override;

  const nav = navigator as Navigator & {
    deviceMemory?: number;
    connection?: { saveData?: boolean };
  };
  const prefersReducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

  let score = 0;
  const cores = nav.hardwareConcurrency ?? 2;
  if (cores >= 8) score += 2; else if (cores >= 4) score += 1;
  const mem = nav.deviceMemory ?? 2;
  if (mem >= 8) score += 2; else if (mem >= 4) score += 1;
  if (matchMedia('(min-width: 1024px)').matches) score += 1;
  if (matchMedia('(pointer: fine)').matches) score += 1;
  if (devicePixelRatio <= 2) score += 1;
  if (nav.connection?.saveData) score = -99;
  if (!webglSupported()) score = -99;
  if (prefersReducedMotion) score = Math.min(score, 3);

  return score >= 6 ? 'high' : score >= 3 ? 'mid' : 'low';
}

export function setTierOverride(t: Tier): void {
  localStorage.setItem('substrate-tier', t);
  location.reload();
}
```

The override is read **before** the score (§ 8.2). `saveData` and no-WebGL both force low unconditionally. **`webglSupported()` is a real context probe — never a UA string.**

- [ ] **Step 2: `TierBoot.tsx`** — a `'use client'` component that runs `detectTier()` in a layout effect and writes `document.documentElement.dataset.tier`. Renders `null`. This is the only client component the initial route carries in Phase 2, and it is ~30 lines.

- [ ] **Step 3: `TierToggle.tsx`** — the persistent footer link (§ 8.2): *"Prefers the still version? Switch."* Calls `setTierOverride('low')`, or `setTierOverride('high')` when already low. Real `<button>`, real focus ring, in the tab order.

- [ ] **Step 4: Verify the score on three devices**

Run: `npx next build && npx serve out`, then in the console on each device: `document.documentElement.dataset.tier`.
Expected: desktop laptop → `high`; mid-range Android → `mid`; DevTools with `navigator.connection.saveData` forced true, or WebGL disabled via `chrome://flags` → `low`.

- [ ] **Step 5: Verify the override survives a reload**

Click the footer toggle on a `high` machine. Expected: page reloads, `dataset.tier === 'low'`, `localStorage['substrate-tier'] === 'low'`. Click again → back to `high`. **Any visitor can escape any tier we guessed wrong.**

- [ ] **Step 6:** Commit — `feat: tier detection with a real WebGL probe and a persistent manual override`.

---

### Task 2.3: Live `prefers-reduced-motion` store (§ 7)

**Files:** Create `src/lib/motion-pref.ts`. Modify `src/components/TierBoot.tsx` (subscribe and write `dataset.motion`).

**Parallelism:** **SERIALIZED after 2.2** — shares `TierBoot.tsx`. Owns `src/lib/motion-pref.ts`.

- [ ] **Step 1:** One `matchMedia('(prefers-reduced-motion: reduce)')` with a **live** `change` listener that re-applies without a reload (§ 7). Sets `document.documentElement.dataset.motion = 'off' | 'on'`.
- [ ] **Step 2:** Export `subscribeMotion(cb)` / `getMotion()` shaped for `useSyncExternalStore`, so Task 4.5's store can compose it without a second listener.
- [ ] **Step 3: Verify it is live.** Load the site, open OS accessibility settings, toggle "reduce motion" **without reloading**. Expected: `document.documentElement.dataset.motion` flips in the Elements panel within one frame.
- [ ] **Step 4:** Commit — `feat: live prefers-reduced-motion store`.

---

### Task 2.4: Placeholder layer stills and the low-tier static path (§ 8.3)

**Files:** Create `public/stills/{surface,device-approach,device,engine,reasoning}.avif` (placeholders). Create `src/components/LayerStill.tsx`. Modify `src/components/LayerSection.tsx` to render the still above the heading.

**Parallelism:** **SERIALIZED after Task 1.6** — shares `src/components/LayerSection.tsx`. Owns `public/stills/**` and `LayerStill.tsx`. Parallel-safe against 2.5/2.6/2.7.

**These are placeholders on purpose.** Task 4.7 bakes the real five from the finished high-tier scene and overwrites the same five paths. Nothing downstream changes.

- [ ] **Step 1:** Generate five flat 1600 × 1000 AVIF placeholders — each a solid fill in that layer's fog colour from § 2.4 (`#1A2430`, `#171A1E`, `#1E1A12`, `#14090A`, `#06080B`) with the depth readout set in JetBrains Mono. They are **not** stock images, gradients, or noise; they are the scene's own values, so the placeholder already looks like the site.
- [ ] **Step 2:** `LayerStill.tsx` — `<img>` with explicit `width`/`height`, `loading="lazy"` except the first (§ 8.3), `alt` describing the frame in words.
- [ ] **Step 3: Verify the budget.** Run `wc -c public/stills/*.avif`. Expected: each ≤ **71680** bytes (70 KB), total ≤ **389120** (380 KB).
- [ ] **Step 4: Verify no CLS.** Lighthouse `/` again. Expected: CLS still ≤ 0.01 — every still has intrinsic dimensions.
- [ ] **Step 5:** Commit — `feat: five layer stills (placeholder) and the low-tier static path`.

---

### Task 2.5: The fixed-timestep accumulator and its test (§ 5.1)

**Files:** Create `src/engine/loop.ts`, `src/engine/loop.test.ts`.

**Parallelism:** **PARALLEL-SAFE.** Owns `src/engine/loop.ts` and `src/engine/loop.test.ts` exclusively. Runs concurrently with 2.2, 2.3, 2.4. **Tasks 2.6 and 2.7 are serialized after it** — they import `createLoop`.

**Interfaces:**
- Produces:
```ts
export const TIMESTEP_MS = 1000 / 60;
export const MAX_STEPS = 5;
export type Loop = { start(): void; stop(): void; frame(now: number): number };
export function createLoop(opts: {
  update: () => void;
  draw: (alpha: number) => void;
  copyStateToPrev: () => void;
}): Loop;
```
`frame(now)` returns the number of ticks it ran — that return value is what the test asserts on, and it is why `frame` is exported rather than hidden inside the rAF closure.

- [ ] **Step 1: Write the failing test first — `src/engine/loop.test.ts`**

```ts
import { describe, it, expect } from 'vitest';
import { createLoop, MAX_STEPS, TIMESTEP_MS } from './loop';

const mk = () => {
  let ticks = 0;
  const loop = createLoop({ update: () => { ticks++; }, draw: () => {}, copyStateToPrev: () => {} });
  return { loop, ticks: () => ticks };
};

describe('fixed-timestep accumulator', () => {
  it('runs the same number of ticks for the same wall time at 144 Hz and 60 Hz', () => {
    const a = mk(); let t = 0;
    a.loop.frame(0);
    for (let i = 0; i < 100; i++) { t += 1000 / 144; a.loop.frame(t); }

    const b = mk(); let u = 0;
    b.loop.frame(0);
    for (let i = 0; i < 100; i++) { u += 1000 / 60; b.loop.frame(u); }

    // 100 frames at 144 Hz = 694 ms ≈ 41 ticks; 100 frames at 60 Hz = 1667 ms ≈ 100 ticks.
    // Normalise by elapsed wall time: ticks per second must agree.
    const rateA = a.ticks() / (t / 1000);
    const rateB = b.ticks() / (u / 1000);
    expect(Math.abs(rateA - rateB)).toBeLessThanOrEqual(2);
  });

  it('clamps a 30-second tab-restore jump to MAX_STEPS and drops the backlog', () => {
    const { loop, ticks } = mk();
    loop.frame(0);
    const ran = loop.frame(30_000);
    expect(ran).toBe(MAX_STEPS);
    expect(ticks()).toBe(MAX_STEPS);
    // accumulator must be zeroed, so the very next normal frame runs at most one tick
    expect(loop.frame(30_000 + TIMESTEP_MS)).toBe(1);
  });
});
```

- [ ] **Step 2: Run it and watch it fail**

Run: `npx vitest run src/engine/loop.test.ts`
Expected: FAIL — `Failed to resolve import "./loop"`.

- [ ] **Step 3: Write `src/engine/loop.ts` — § 5.1 verbatim**

```ts
export const TIMESTEP_MS = 1000 / 60;   // 16.6667 ms — the rate the constants were authored for
export const MAX_STEPS = 5;             // largest catch-up that still fits inside two 30 fps frames
const MAX_FRAME_MS = 250;               // tab restore never dumps 30 s of simulation

export type Loop = { start(): void; stop(): void; frame(now: number): number };

export function createLoop(opts: {
  update: () => void;
  draw: (alpha: number) => void;
  copyStateToPrev: () => void;
}): Loop {
  let accumulator = 0;
  let prevTime = 0;
  let raf = 0;
  let running = false;

  function frame(now: number): number {
    const frameTime = Math.min(now - prevTime, MAX_FRAME_MS);
    prevTime = now;
    accumulator += frameTime;
    let steps = 0;
    while (accumulator >= TIMESTEP_MS && steps < MAX_STEPS) {
      opts.copyStateToPrev();
      opts.update();
      accumulator -= TIMESTEP_MS;
      steps++;
    }
    if (steps === MAX_STEPS) accumulator = 0;   // drop the backlog; never spiral
    opts.draw(accumulator / TIMESTEP_MS);
    return steps;
  }

  function tick(now: number) { frame(now); if (running) raf = requestAnimationFrame(tick); }

  return {
    start() { if (running) return; running = true; prevTime = performance.now(); accumulator = 0; raf = requestAnimationFrame(tick); },
    stop()  { running = false; cancelAnimationFrame(raf); },
    frame,
  };
}
```

- [ ] **Step 4: Run it and watch it pass**

Run: `npx vitest run src/engine/loop.test.ts`
Expected: **2 passed**.

- [ ] **Step 5:** Commit — `feat: fixed-timestep accumulator with render interpolation, and its test`.

---

### Task 2.6: Pong port — skin, capture/release, mount (§ 5.2, § 5.3, § 5.5)

**Files:** Create `src/engine/skin.ts`, `src/engine/pong.ts`, `src/components/GameMount.tsx`. Modify `src/app/globals.css` (canvas focus ring + `touch-action`). Modify `src/components/ProjectArticle.tsx` (mount `GameMount` for `presentation.kind === 'playable'`).

**Parallelism:** **SERIALIZED after Task 2.5** (imports `createLoop`), **after Task 1.6** (`ProjectArticle.tsx`), and **third in the `globals.css` chain** (after 1.2, 1.3). **Task 2.7 is serialized after this** — it shares `skin.ts` and `GameMount.tsx`.

**Source:** `C:/portfolio website/games/pong.js`, 305 LOC, `export function initPong(canvas, onWin)`, 640 × 400 internal. Read-only — that directory is never modified. The port is a new file in this repo.

**What is preserved, exactly (verified in `agent://GameHunt`):** AABB paddle intersection with `hitRatio → angle = hitRatio * Math.PI / 3`, `vx = speed * cos(angle)`, `vy = speed * sin(angle)` (`pong.js:139-158`); `ball.speed = Math.min(9, ball.speed * 1.035)` on each paddle hit; AI at `aiSpeed = 3.6` with a 10 px deadzone (`pong.js:126-133`); `paddleSpeed = 7` (`pong.js:120-123`); `WINNING_SCORE = 7`; mouse, keyboard and touch input.

**What changes, and only this:**
1. The loop. `pong.js:283-288` (`update(); draw(); requestAnimationFrame(loop)`) is replaced by `createLoop`. **No constant is retuned** — the tick rate is now exactly the rate they were authored for.
2. `draw(alpha)` interpolates `ball.x`, `ball.y`, `playerY`, `aiY` and **nothing else**. Scores, `gameState` — never interpolated. Interpolating a score is how you get `6.4`.
3. The skin, per the § 5.2 table.
4. Touch: the two-button scheme becomes drag-anywhere-on-canvas (`touchmove` → paddle Y, identical maths to `mousemove`).

- [ ] **Step 1: `src/engine/skin.ts` — the § 5.2 replacement table as constants**

```ts
/** § 5.2. The engines' logic is untouched; only these draw constants change. */
export const SKIN = {
  field: '#0E1116',
  grid: '#1B2430',
  net: '#3A4654',
  netDash: [8, 8] as const,
  accent: '#FF5F56',          // ball, player paddle, orbs, dialogue stroke
  text: '#EDF1F5',
  panel: '#10151C',
  mono: '14px "JetBrains Mono", ui-monospace, monospace',
  monoTracking: 0.04,          // em
  display: '20px "Satoshi", system-ui, sans-serif',
  /** shadowBlur is 0 everywhere. The ball is the single exception (§ 5.2). */
  ballShadowBlur: 4,
} as const;
```

Press Start 2P, `#00f5a0`, and `shadowBlur = 8` do not appear in this repo. They are non-goal 9, banned by inheritance.

- [ ] **Step 2: Port `pong.js` into `src/engine/pong.ts`**

Signature `export function initPong(canvas: HTMLCanvasElement, onWin: (winner: 'player'|'ai') => void): { start(): void; stop(): void; destroy(): void }`.

DPR backing store (§ 5.2): `canvas.width = 640 * Math.min(devicePixelRatio, 2)`, matching `ctx.scale`, CSS size fixed at the layout box. Hairlines stay crisp.

- [ ] **Step 3: `GameMount.tsx` — capture and release (§ 5.3), the part that must not be got wrong**

The rule: **the game never takes keys it was not explicitly given, and always gives them back.**

- The trigger is a real `<button>` reading *"Play Pong — 7 points wins. Enter to start."* in document order.
- **Capture only on explicit activation:** `Enter`/`Space` on the button, or click/tap on the canvas. **Never** on hover, scroll-into-view, or focus alone.
- While captured: `aria-live` announces *"Pong active. Arrow keys to move. Escape to exit."*; canvas has `tabindex="0"` and holds focus; document scroll locked; `keydown` calls `preventDefault()` **only** for `ArrowUp`, `ArrowDown`, `ArrowLeft`, `ArrowRight`, `KeyW`, `KeyA`, `KeyS`, `KeyD`, `Space`. Every other key — `Tab`, `Escape`, `Enter`, `/`, browser and screen-reader shortcuts — passes through untouched.
- **Release on any of:** `Escape`, `Tab` (which releases **and** performs the normal focus move — no swallowed Tab, ever), canvas `blur`, pointerdown outside the canvas, the visible **Exit (Esc)** button beside the canvas, `document.visibilitychange` to hidden. On release: the rAF loop stops, focus returns to the trigger, scroll unlocks.
- A visible focus ring (`2px #8FD3FF`, `outline-offset: 3px`) is on the canvas whenever captured. **There is never a captured state without a visible indicator.**
- Reduced motion (§ 7 row 15): the game is never auto-started; the card reads *"Playing this starts an animation"*; it remains playable, because a game the user explicitly started is requested motion.

- [ ] **Step 4: `globals.css` — canvas rules**

```css
canvas[data-game] { touch-action: none; display: block; }
canvas[data-game]:focus-visible { outline: 2px solid var(--color-surface-accent); outline-offset: 3px; }
```

`touch-action: none` is scoped to the game canvas **only** (§ 5.5). Putting it on `body` would break page scrolling on touch.

- [ ] **Step 5: G2.2 — play it with the keyboard**

Load `/project/pong`, `Tab` to the trigger, press `Enter`, play to 7 with `ArrowUp`/`ArrowDown`.
Expected: `Game over — 7:N. Space to play again.` in Satoshi 20 px on a flat `#10151C` panel. Sentence case. No "GAME OVER" arcade overlay.
Press `Escape`. Expected: loop stops (confirm in the Performance profiler — **zero** rAF callbacks), focus is back on the trigger button, page scrolls again.
Re-enter, then press `Tab`. Expected: the game releases **and** focus moves to the next control in one press. Press `Tab` again mid-game with a screen reader running — the reader's own shortcuts still work.

- [ ] **Step 6: G2.3 — play it on a phone**

Open the deployed URL on a real Android phone, tap the canvas, drag.
Expected: the paddle tracks the drag anywhere on the canvas; the page does not scroll while dragging; the canvas is presented full-bleed at 16:10 in a DOM overlay, not as a texture on a quad.

- [ ] **Step 7: Verify frame-rate independence in the wild**

Play on a 144 Hz display and a 60 Hz display. Expected: the ball crosses the field in the same wall-clock time on both. If it is 2.4× fast on the 144 Hz screen, `createLoop` is not wired and `update()` is still running per frame.

- [ ] **Step 8:** Commit — `feat: Pong ported to the fixed-timestep loop, re-skinned, with keyboard capture and release`.

---

### Task 2.7: Pixel Quest port and the touch fallback video (§ 5.5)

**Files:** Create `src/engine/pixel-quest.ts`, `public/video/pixel-quest.mp4`, `public/video/pixel-quest.webm`, `public/video/pixel-quest-poster.avif`. Modify `src/components/GameMount.tsx` (the touch branch).

**Parallelism:** **SERIALIZED after Task 2.6** — shares `GameMount.tsx` and `skin.ts`.

**Source:** `C:/portfolio website/games/rpg.js`, 431 LOC, `export function initRpg(canvas, onUnlockSkill)`, 640 × 400.

**Preserved exactly:** axis-separated AABB resolution — X solved, then Y, independently (`rpg.js:145-152`, `rpg.js:198-214`); diagonal normalisation `dx *= 0.7071; dy *= 0.7071` (`rpg.js:192-195`); `player.speed = 3.2`; 3 wall colliders; NPC proximity at 20 px; the hand-written `wrapText` with dynamically sized dialogue boxes (`rpg.js:154-171`); orb bob `Math.sin(orbAnimTime + orb.x) * 4` (`rpg.js:296`).

**Interpolated fields, and only these (§ 5.1):** `player.x`, `player.y`, `orbAnimTime`. `player.dir`, dialogue index and orb-collected flags are discrete and snap.

**OQ4 is resolved as specced: video-only on touch, no on-screen d-pad.**

- [ ] **Step 1:** Port `rpg.js` → `src/engine/pixel-quest.ts` on `createLoop`, re-skinned per `SKIN`. The old neon-green dialogue stroke becomes `SKIN.accent`; the 40 × 40 grid becomes `SKIN.grid` at 1 px.
- [ ] **Step 2:** Record the fallback clip **from the finished port** (§ 12 item 27) — 6 seconds, silent, real play: walk, hit a wall corner (showing the axis-separated resolution), trigger the NPC dialogue, collect an orb.
```bash
ffmpeg -i raw-capture.mov -t 6 -an -vf "scale=640:400" -c:v libx264 -crf 26 -pix_fmt yuv420p public/video/pixel-quest.mp4
ffmpeg -i raw-capture.mov -t 6 -an -vf "scale=640:400" -c:v libvpx-vp9 -crf 34 -b:v 0 public/video/pixel-quest.webm
ffmpeg -i public/video/pixel-quest.mp4 -frames:v 1 -f image2 tmp/poster.png && npx @squoosh/cli --avif '{"cqLevel":34}' -d public/video tmp/poster.png
```
Expected: `wc -c public/video/*` — mp4 ≤ 400 KB, webm ≤ 300 KB, poster ≤ 40 KB.
- [ ] **Step 3:** The touch branch of `GameMount` renders `<video muted loop playsinline poster preload="none" controls>` with **no `autoplay`** (non-goal 11: no auto-playing audio; and a video that starts itself is imposed motion). Click-to-play. Beside it, in one visible line: *"Not playable on touch — a WASD room needs a d-pad, and an on-screen d-pad at 390 px is worse than nothing. Here is 6 seconds of real play."* Plus the full mechanics copy in text.
- [ ] **Step 4:** Low tier gets the same treatment regardless of viewport width (§ 5.5).
- [ ] **Step 5: Verify.** On desktop: play with WASD, walk into a corner — the player slides along the wall rather than sticking (that is the axis-separated resolution working). On a phone: the video is there with a poster, it does **not** autoplay, and tapping it plays it silently.
- [ ] **Step 6:** Commit — `feat: Pixel Quest ported to the fixed-timestep loop, with the touch fallback clip`.

---

### Task 2.8: Phase 2 gate

**Files:** Modify `docs/measurements.md`.

**Parallelism:** **SERIALIZED — last task of Phase 2.**

- [ ] **Step 1:** Run G2.1 through G2.6 from the gate table above; record each result.
- [ ] **Step 2:** Re-run Lighthouse mobile on `/` and `/project/pong`. Expected: Performance still ≥ 98, Accessibility still **100**. Motion's 18 KB gz must not have pushed the initial route over 180 KB gz — if it has, the fix is that `TierBoot` and `GameMount` are the only client components and everything else is a server component.
- [ ] **Step 3:** `npx vercel --prod`; play Pong on the deployed phone build.
- [ ] **Step 4:** Commit — `docs: Phase 2 gate measurements`.

**✅ Phase 2 complete. The site is now the full low-tier product from § 8.3, with both games playable. This is what ships if Phase 3 fails.**

---

# Phase 3 — The pass-through prototype, in isolation

**Spec:** § 15 Phase 3, § 2.6, § 14 Risks 1 and 2. **Deliverable:** a standalone route `/lab/passthrough` containing **only** the phone monolith, the bezel, the screen quad, the two-pass render, and a scroll from `y = −30` to `y = −44`. Nothing else. No panels, no other layers, no depth gauge, no exhibits.

> ## ⛔ THIS PHASE IS THE GO / NO-GO GATE FOR THE ENTIRE CONCEPT
>
> § 14 Risk 1 rates "the scene looks amateur" the top risk on this project, and the mitigation is to build the Device layer and the pass-through **first, in isolation**, and judge it as a standalone prototype on a real phone and a real laptop before any other 3D work exists.
>
> **If the pass-through does not feel good here, STOP. Do not proceed to Phase 4.**
>
> **What ships instead:** Phase 2, exactly as it stands, as the whole site. Per § 8.3 the low-tier static path has **byte-identical DOM content** — same headings, same copy, same project panels, same diagrams, same links, same routes, same résumé, same contact. The only thing it loses is the travel. It is a complete, fast, accessible portfolio and it is already deployed. **The fallback is the product, not a consolation.**
>
> **Intermediate kill-switch (§ 14 Risk 2):** if the mechanic works but shows a visible seam that the § 2.6 frame-diff criterion cannot clear, replace the swap with a **180 ms `power2.in` fade to `--void` and back at `y = −40`**. That costs the signature moment and keeps the descent. **This decision is made by the end of Phase 3 and never later** — deciding it in Phase 5 means rebuilding the Device layer with the whole scene attached.

**Phase 3 gate:**

| # | Check | Command / action | Expected |
|---|---|---|---|
| G3.1 | Frame-diff | Record the canvas at 60 fps across `t ∈ [0.29, 0.31]`; diff consecutive frames inside the aperture region | Max per-pixel delta on the **swap frame** ≤ the delta between any two adjacent non-swap frames in the same window. Failing this means the screen material is sampling in UV space instead of screen space. |
| G3.2 | Desktop frame rate | Scroll the route on a 2020 MacBook Air (M1) with the Performance profiler recording | **60 fps, no frame > 20 ms**, across the whole `−30 → −44` sweep |
| G3.3 | Phone frame rate | Same on a mid-range Android | **45 fps floor** held through the pass-through window |
| G3.4 | 3D chunk size | `find out/_next/static/chunks -name '*.js' -exec gzip -c {} \; \| wc -c` minus the Phase 2 baseline | 3D chunk ≤ **256000** bytes gz (250 KB) |
| G3.5 | Low tier untouched | Load `/` (not `/lab/`) with `dataset.tier === 'low'` | Zero `three` bytes requested. `/lab/passthrough` is the only route that loads the 3D chunk in Phase 3. |
| G3.6 | **Human judgement** | Scroll it ten times on the laptop and ten times on the phone | It feels like descending into a device. If it feels like a texture swap, or like a cut, or cheap — **invoke the Risk 1 kill-switch.** |

---

### Task 3.1: Add the 3D dependencies, behind a dynamic import

**Files:** Modify `package.json`. Create `src/three/index.tsx` (the single dynamic-import entry point — **the only module the rest of the app is allowed to import from**).

**Parallelism:** **SERIALIZED — third writer in the `package.json` chain (after 1.1, 2.1).**

- [ ] **Step 1:** `npm i three@0.185.1 @react-three/fiber@9.7.0 @react-three/drei@10.7.8 gsap@3.15.0 @gsap/react@2.1.2 lenis@1.3.26`
- [ ] **Step 2:** `src/three/index.tsx` exports one default component. **Every** import of `three`, `@react-three/*`, `gsap` and `lenis` happens inside this module's subtree and nowhere else. `drei` is imported by **named imports only** — `useTexture`, `Environment`, `useGLTF`, `Instances`. Never `import * from 'drei'` (§ 11).
- [ ] **Step 3:** Consumers reach it exclusively through `const Scene = dynamic(() => import('@/three'), { ssr: false })`, called only when `tier !== 'low'` and only inside `requestIdleCallback` (§ 8.1).
- [ ] **Step 4: Verify the split.** `npx next build && npx next build --analyze`. Expected: `three` appears in **one** async chunk, not in the initial route. If it is in the initial route, something imported a type from `three` at the top level of a server component — use `import type`.
- [ ] **Step 5:** Commit — `chore: add three, fiber, drei, gsap and lenis behind a single dynamic entry`.

*Deviation note (2026-09-09): `gsap`, `@gsap/react`, and `@react-three/drei` were subsequently removed during Phase 6 bundle optimization. `@react-three/fiber` was measured at 76.5 KB gz due to its internal `react-reconciler`, requiring the removal of GSAP (~44.5 KB gz) and Drei (~1.2 KB gz) to bring the 3D chunk under the 250 KB limit without altering budget targets.*
---

### Task 3.2: The monolith, the bezel, the screen quad (§ 2.3 Device)

**Files:** Create `src/three/layers/Device.tsx`, `public/models/phone.glb`.

**Parallelism:** **SERIALIZED after 3.1.** Owns `src/three/layers/Device.tsx` and `public/models/phone.glb`. Parallel-safe against 3.3 only if 3.3 waits for the component's exported props — in practice run them serially; the prototype is one moving part.

**Geometry, § 2.3 verbatim:**
- **Body:** `BoxGeometry(6.2, 0.62, 13.4)` centred at `y = −40`, chamfered via a beveled GLTF, **≤ 9 k tris**, Draco-compressed. Material `MeshStandardMaterial { metalness: 0.95, roughness: 0.28, color: '#7C8590' }` — brushed aluminium, **no clearcoat**.
- **Bezel ring:** a **separate mesh**, inner aperture 5.6 × 12.4 m, thickness 0.3 m, spanning `y = −39.9 … −40.1`. **This is the mesh the camera visibly passes and it is never hidden.**
- **Screen quad:** `PlaneGeometry(5.6, 12.4)` at exactly `y = −40.0`, facing up, `ShaderMaterial` from Task 3.3.

- [ ] **Step 1:** Author the phone body in Blender: box, uniform bevel, decimate to ≤ 9 000 triangles, export glTF with Draco. Run `npx gltf-transform inspect public/models/phone.glb`. Expected: `triangles` ≤ 9000, `Draco` listed under extensions, file ≤ 120 KB.
- [ ] **Step 2:** Build the R3F component with the three meshes and the § 2.6 layer channel assignments: body, bezel and screen quad on **channel 1 (EXTERIOR)**; the interior test geometry on **channel 2 (INTERIOR)**.
- [ ] **Step 3:** Add minimal interior content so there is something to see through the screen — the § 2.3 emissive floor grid at `y = −70` in `#FFC46B` at 0.12 intensity and the eight instanced station slabs (`BoxGeometry(2.4, 0.12, 1.6)`, one draw call). This is the real Device interior, not a stand-in; Phase 4 reuses it.
- [ ] **Step 4: Verify.** Load `/lab/passthrough`, scroll to `y = −38`. Expected: an aluminium monolith seen from above, a distinct bezel ring, and a screen showing an orange-lit grid below. `renderer.info.render.calls` ≤ **6**.
- [ ] **Step 5:** Commit — `feat: the Device monolith, bezel ring and screen quad`.

---

### Task 3.3: The two-pass render and the screen-space material (§ 2.6)

**Files:** Create `src/three/ScreenMaterial.ts`, `src/three/PassThrough.tsx`, `src/app/lab/passthrough/page.tsx`.

**Parallelism:** **SERIALIZED after 3.2.** Owns all three files.

**The mechanic, non-negotiable:** the interior and exterior are the **same scene**, in the **same world coordinates**, with **one camera**. There is no second world, no rebasing, no second camera. Separation is `THREE.Layers`; the screen quad samples the interior **in screen space**, which makes the quad's pixels identical to the pixels that would be there if the quad did not exist.

**Layer channels (§ 2.6):** `0` shared (helpers, travelling point light) · `1` EXTERIOR (strata ceiling, Surface plates, phone body, bezel, screen quad) · `2` INTERIOR (everything at `y < −40`).

**Per-frame sequence, only while `camera.y ∈ (−36.0, −40.0]`:**

```
1. camera.layers.set(2)
   renderer.setRenderTarget(rtInterior)
   renderer.render(scene, camera)            // pass A — the world below, from the real camera
2. renderer.setRenderTarget(null)
   camera.layers.set(1)
   screenMaterial.uniforms.uMap.value = rtInterior.texture
   renderer.render(scene, camera)            // pass B — phone + strata, quad sampling pass A
```

Outside that window there is exactly **one** pass: above −36 m render channel 1 only; at and below −40 m render channel 2 only.

**The fragment shader — this is what makes the swap invisible:**

```glsl
uniform sampler2D uMap;
uniform vec2 uResolution;
void main() {
  vec2 uv = gl_FragCoord.xy / uResolution;   // screen-space, NOT the quad's UV
  gl_FragColor = texture2D(uMap, uv);
}
```

Because the sample is `gl_FragCoord`-based and pass A used the **same camera matrices** as pass B, every texel the quad shows is exactly the texel pass A would have written to that pixel. **The quad is a window, not a screen.**

**Render target (§ 2.6):** `new WebGLRenderTarget(w, h, { samples: tier === 'high' ? 4 : 0, depthBuffer: true, type: HalfFloatType })` where `w, h = canvasSize * Math.min(devicePixelRatio, dprCap)`, `dprCap` = 2 high / 1.5 mid. **Allocated on entering `t > 0.24`; disposed on leaving `t ∉ [0.24, 0.31]`** — it exists for ~7 % of the scroll and costs no memory outside it. Reallocated on resize, debounced 200 ms.

**Near-plane handling — read this before touching the camera:**
- `near = 0.1`. The drift curve is **hard-clamped to ±1.6 m for `t ∈ [0.255, 0.345]`** so the camera never intersects bezel geometry (aperture is 5.6 × 12.4 m; base drift is ±3.2 m).
- The bezel and body clip against the near plane naturally as they pass. **That clipping is the sensation of entering**, and it is why the bezel must be a real mesh rather than a fade.
- **Do not animate `near`.** Changing it mid-descent shifts the depth-buffer distribution and causes z-fighting on the Engine wireframes 80 m later. This bug will not appear until Phase 4 and will look like it came from nowhere.

**After the swap:** nothing is destroyed during the move. Body, bezel and quad stay mounted on channel 1 and fall behind the camera. They are disposed at the `t > 0.47` boundary (Device floor), 30 m back and fully fogged. Scrolling back up remounts them at `t < 0.47` from an already-loaded `useMemo` — one frame of nothing.

- [ ] **Step 1:** Write `ScreenMaterial.ts` — a `ShaderMaterial` with `uMap` and `uResolution`, `depthWrite: true`, `transparent: false`, `toneMapped: false`. `toneMapped: false` matters: pass A already went through ACES, and tone-mapping it twice is exactly the kind of one-frame value pop the frame-diff test catches.
- [ ] **Step 2:** Write `PassThrough.tsx` — `useFrame` with `renderPriority: 1` implementing the sequence above, plus the RT lifecycle and the resize handler.
- [ ] **Step 3:** Write `/lab/passthrough/page.tsx` — a 400 vh document, scroll mapped linearly to `y ∈ [−30, −44]`, the Device component, one directional light and one point light. **Nothing else.**
- [ ] **Step 4: G3.1 — run the frame-diff criterion**

```bash
# Record the canvas across the swap. Use a Playwright script that steps scrollY
# in 60 equal increments across t ∈ [0.29, 0.31] and screenshots the canvas each step.
npx playwright screenshot --help   # driver of choice; any deterministic stepper works
```
Then compare adjacent frames inside the aperture rectangle only:
```bash
for i in $(seq 1 59); do
  compare -metric AE -fuzz 0 tmp/frames/f$(printf %02d $i).png tmp/frames/f$(printf %02d $((i+1))).png null: 2>>tmp/deltas.txt; echo >> tmp/deltas.txt
done
sort -n tmp/deltas.txt | tail -1
```
Expected: the largest delta in the series is **not** the swap-frame pair. If the swap frame is the outlier, the shader is sampling `vUv` instead of `gl_FragCoord` — go back to Step 1.

- [ ] **Step 5: G3.2 / G3.3 — frame rate on both devices.** Chrome Performance recording across the whole sweep. Desktop: 60 fps, no frame > 20 ms. Mid-range Android: never below 45 fps.
- [ ] **Step 6: G3.6 — the human gate.** Scroll it ten times on each device. **This is a judgement call and it is the whole point of the phase.** If it does not feel like descending into a device, stop and ship Phase 2.
- [ ] **Step 7:** Record the verdict in `docs/measurements.md` under a **Phase 3 go/no-go** heading, with the frame-diff numbers, both frame rates, and a one-line written decision: `GO`, `GO with the fade kill-switch (Risk 2)`, or `NO-GO — shipping Phase 2`.
- [ ] **Step 8:** Commit — `feat: the screen pass-through prototype at /lab/passthrough`.

---

# Phase 4 — The full descent

**Spec:** § 15 Phase 4, § 2.2, § 2.3, § 2.4, § 2.5, § 7. **Deliverable:** the complete scene — all geometry, the `depth(t)` mapping, fog and light falloff, the exponential settle camera (`tau ≈ 0.12 s`), Lenis, the depth gauge, and the pass-through integrated at its real depth. Bake the five real layer stills from this scene and replace Phase 2's placeholders.

**Phase 4 gate:**

| # | Check | Command / action | Expected |
|---|---|---|---|
| G4.1 | Full sweep | Scroll `t = 0 → 1` and back on desktop | No stall, no visual discontinuity, no pop at any layer boundary |
| G4.2 | Depth gauge | Read the gauge at each of the four datums | `0 m · SURFACE`, `−040 m · DEVICE`, `−120 m · ENGINE`, `−260 m · REASONING` — exact metres |
| G4.3 | Shortcuts | Press `1`, `2`, `3`, `4`, then `↑`/`↓`, then `Home`/`End` | Land exactly on datum depths; `↑`/`↓` step ±10 m; `Home`→Surface, `End`→Bedrock |
| G4.4 | Reduced motion mid-session | Toggle OS reduce-motion **while the page is open**, then profile | Exponential camera smoothing disabled (snaps directly to target), Lenis destroyed, camera snapped to the 4 presets, **rAF loop stopped** — verify in the Performance profiler, **not by eye** |
| G4.5 | Draw calls | `renderer.info.render.calls` logged at each datum | ≤ **120** high tier, ≤ **60** mid tier |
| G4.6 | Triangles | `renderer.info.render.triangles` | ≤ **180 k** high, ≤ **90 k** mid |
| G4.7 | Scene asset transfer | DevTools Network, filter to `/models`, `/env`, `/matcap`, `/textures` | ≤ **2.8 MB** high, ≤ **1.6 MB** mid |
| G4.8 | Scrollbar is real | Drag the browser scrollbar directly from top to bottom | The camera follows monotonically. Non-goal 10: no scrolljacking, the scrollbar is real and draggable. |

### Task 4.1: `depth(t)` and its inverse — the load-bearing function

**Files:** Create `src/three/depth.ts`.
**Parallelism:** **PARALLEL-SAFE.** Owns `src/three/depth.ts`. Runs concurrently with 4.2, 4.3, 4.4.
**Interfaces:** Produces `depth(t: number): number` and `tOfDepth(y: number): number`.

- [ ] **Step 1:** Precompute the `DEPTH_TABLE` (Task 1.4) into two module-level `Float32Array`s at module load. `depth(t)` is a **binary search plus one `lerp`**. `tOfDepth(y)` is the same arrays searched on the other column — this is what deep links and depth-gauge clicks use (§ 2.5, § 10.3). **No allocation per frame.**
- [ ] **Step 2: Verify round-tripping.** Assert `Math.abs(tOfDepth(depth(t)) - t) < 1e-6` for `t` at every table point and at 1000 samples between. Assert `depth(0) === 6`, `depth(0.3) === -40`, `depth(0.6) === -120`, `depth(0.87) === -260`, `depth(1) === -300`. Run in a scratch node script; do not add a second test file — § 5.1 says `loop.test.ts` is the only test on this project, and this assertion belongs in a throwaway.
- [ ] **Step 3:** Commit — `feat: monotonic piecewise-linear depth(t) and its inverse`.

### Task 4.2: All remaining geometry (§ 2.3)

**Files:** Create `src/three/Scene.tsx`, `src/three/layers/Surface.tsx`, `src/three/layers/Engine.tsx`, `src/three/layers/Reasoning.tsx`, `public/env/studio-512x256.ktx2`, `public/matcap/engine-256.ktx2`, `public/textures/*.ktx2`. Modify `src/three/layers/Device.tsx` (add the architecture-diagram quad).

**Parallelism:** the three layer components are **PARALLEL-SAFE with each other**, one owner per file. `Scene.tsx` is **SERIALIZED after all three**. `Device.tsx` is **SERIALIZED after Task 3.2**.

Build exactly what § 2.3 specifies and nothing more — every mesh belongs to a project or to the strata (non-goal 8):
- **Surface:** strata ceiling `PlaneGeometry(240,240,1,1)` facing down at `y=0` with a 2048² single-channel KTX2 alpha grid (1 draw call); two exhibit plates `BoxGeometry(18,0.06,26)` at `y=−2` and `y=−8`, offset ±7 m in `x`, `MeshPhysicalMaterial { transmission: 0.9, thickness: 0.4, roughness: 0.08, ior: 1.45, color: '#EDF1F5' }`; 24 suspension `LineSegments` merged into one buffer (1 draw call).
- **Engine:** no textures at all — `MeshMatcapMaterial` with one shared 256² matcap plus `WireframeGeometry` in `#FF5F56`; the visible frustum wireframe apex-up at `y=−150` (1 draw call); two open-topped 16 × 10 m play volumes at `y=−124` and `y=−134` carrying the game `CanvasTexture` quads; 40 instanced wireframe collider ghosts on a shared vertex-shader time uniform (1 draw call).
- **Reasoning:** one `Points`, **6 000** vertices high / **2 400** mid, `AdditiveBlending`, custom shader with `uTime` and `uAccent = '#C8FF6A'` (1 draw call); one `LineSegments` edge field, 9 000 segments, additive, opacity 0.22 (1 draw call); the Bedrock plane `PlaneGeometry(400,400)` at `y=−300`, `MeshStandardMaterial { color: '#10151C', roughness: 1 }`.
- **Mid-tier delta:** glass `transmission` is replaced by `MeshStandardMaterial { opacity: 0.55, transparent: true }` — transmission needs an extra scene render and is not affordable below high tier (§ 6.5).

Acceptance: log `renderer.info.render.calls` at each datum. Expected ≤ 120 high / ≤ 60 mid (G4.5).

### Task 4.3: Camera rig — ScrollTrigger, drift curve, Lenis (§ 2.1, § 2.2, § 7)

**Files:** Create `src/three/Rig.tsx`.
**Parallelism:** **PARALLEL-SAFE** with 4.1/4.2/4.4 (owns `Rig.tsx`); **SERIALIZED before 4.6**.

- `PerspectiveCamera`, `fov 55`, `near 0.1`, `far 420`, `up = (0, 0, −1)`, looking **straight down −Y** for the whole descent.
- `camera.position.y = depth(t)` assigned once per frame inside `useFrame` via an exponential settle `p.t += (target - p.t) * (1 - Math.exp(-dt / tau))` with `tau ≈ 0.12 s` using real frame delta — the camera lags the scrollbar by ~600 ms of critically damped catch-up. **No spring, no overshoot.** (Originally specced as GSAP ScrollTrigger `scrub: 0.6`; replaced in Phase 6 budget optimization to remove 44.5 KB gz of dependency overhead).
- Lateral drift: one Catmull-Rom curve sampled by the same scroll parameter, amplitude **±3.2 m**, **hard-clamped to ±1.6 m for `t ∈ [0.255, 0.345]`** (§ 2.6). `x`/`z` are cosmetic; nothing addressable depends on them.
- Lenis `{ lerp: 0.09, wheelMultiplier: 1 }`. **Under reduced motion Lenis is never instantiated** (§ 7 row 3) — not created and disabled, *not created*.
- Document is **900 vh**; `S = scrollHeight − innerHeight`; `t = clamp(scrollY / S, 0, 1)`. Scroll restoration is `manual`; the app restores from the route's `t`, because document height depends on viewport height (§ 10.2).
- Renderer: `{ antialias: tier === 'high', powerPreference: 'high-performance', alpha: false }`, clear `#06080B`, `ACESFilmicToneMapping`, `toneMappingExposure = 1.05`, `outputColorSpace = SRGBColorSpace`.

Acceptance: G4.8 — drag the real scrollbar top to bottom; the camera follows monotonically and the scrollbar is never hijacked.

### Task 4.4: Fog and the three lights (§ 2.4)

**Files:** Create `src/three/Fog.tsx`.
**Parallelism:** **PARALLEL-SAFE** (owns `Fog.tsx`).

One `FogExp2`, colour and density GSAP-tweened from the same scroll timeline, **linear across boundary segments, never stepped**. Fog colour is also written to `renderer.setClearColor` every frame so the horizon and the void are the same value — no visible dome edge.

| Depth range | Colour | Density |
|---|---|---:|
| +6 … −12 | `#1A2430` | 0.012 |
| −12 … −40 | `#171A1E` | 0.018 |
| −40 … −70 | `#1E1A12` | 0.022 |
| −70 … −150 | `#14090A` | 0.028 |
| −150 … −260 | `#0A0C10` | 0.034 |
| −260 … −300 | `#06080B` | 0.042 |

**Exactly three lights, always, never more:**
1. `DirectionalLight` from `(0, +60, 0)`, always above the camera, intensity ramping `2.4 → 0.15` linearly over `y ∈ [0, −150]`, then `0.15 → 0` over `y ∈ [−150, −260]`.
2. `PointLight` travelling at `y = camera.y − 3.0`, `distance 42`, `decay 2`, intensity `6.0`. **Its colour is the layer accent**, GSAP-tweened at boundaries over 700 ms `power2.out`: `#8FD3FF → #FFC46B → #FF5F56 → #C8FF6A`. Depth is legible from a single screenshot.
3. `AmbientLight` at `0.06`, colour = current fog colour.

Below −260 m the directional light is at zero and **all** illumination comes from the additive node field itself.

Acceptance: screenshot each of the four datums. Expected: four visibly different colour temperatures, in the order above. **No shadow maps and no post-processing at any tier.**

### Task 4.5: The three-value global store

**Files:** Create `src/lib/store.ts`.
**Parallelism:** **PARALLEL-SAFE** (owns `src/lib/store.ts`).

The only global state on the site is `t`, `tier` and the open panel — three values, `useSyncExternalStore` over **one** scroll subscription (§ 11). **No state-management library.** Composes `subscribeMotion` from Task 2.3 rather than adding a second `matchMedia` listener.

### Task 4.6: The depth gauge (§ 2.5, § 9.2)

**Files:** Create `src/components/DepthGauge.tsx`.
**Parallelism:** **SERIALIZED after 4.1, 4.3 and 4.5.**

- Fixed, left edge, `24 px` in, vertically centred, `48 px` wide, JetBrains Mono 12 px. Reads `−072 m · DEVICE`. Mobile: a horizontal rail pinned to the top edge, 32 px tall (§ 6.4).
- Four tick stops. Clicking one calls `window.scrollTo({ top: tOfDepth(datum) * S, behavior: prefersReducedMotion ? 'auto' : 'smooth' })` — **real scrolling, real scrollbar, no synthetic camera flight.** This is the entire reason `tOfDepth` is invertible.
- Numerals are a direct `textContent` write, throttled to whole metres. **Never a count-up tween** (§ 7 row 14). Kept under reduced motion — it is a readout, not an animation.
- Keyboard (§ 9.2): `1`–`4` jump to datums, `↑`/`↓` step ±10 m, `Home`/`End` to Surface/Bedrock — active **only** when focus is on `<body>` or a non-input element. All additive; the site is complete without them.

Acceptance: G4.2 and G4.3.

### Task 4.7: Bake the five real layer stills (§ 8.3, § 12 item 26)

**Files:** Create `scripts/bake-stills.mjs`. Replace all five files in `public/stills/`.
**Parallelism:** **SERIALIZED — last task of Phase 4.** Requires the finished scene.

- [ ] Bake at the four datums **plus one at `y = −38`** (the phone from above, immediately before the pass-through — the single most legible frame in the descent).
- [ ] Playwright script: load `/`, force `tier=high`, set scroll to `tOfDepth(y) * S`, wait two rAF frames, screenshot the canvas at 1600 px wide.
- [ ] Encode to AVIF. Run `wc -c public/stills/*.avif`. Expected: each ≤ **71680** bytes, total ≤ **389120**.
- [ ] Acceptance: force `tier=low`, load `/`. Expected: five full-bleed sections each headed by a still that is recognisably **this** site — the same fog values, the same accents, the same monolith. Low tier looks like the site, not a different site.
- [ ] Commit — `feat: bake the five layer stills from the real scene`.

---

# Phase 5 — Exhibits, panels, and deep links

**Spec:** § 15 Phase 5, § 4.1, § 4.3, § 4.4, § 5.4, § 9.3, § 10.2. **Deliverable:** exhibit meshes wired to their DOM proxies; cards and detail panels with View Transitions; all `/project/*` and `/layer/*` deep links resolving to the right depth with no auto-flight; games mounted at their real depths in the Engine layer; the Switchboard node field wired to the 12 protocol message types.

**Phase 5 gate:**

| # | Check | Command / action | Expected |
|---|---|---|---|
| G5.1 | Every URL cold | Load all 13 routes from `src/content/routes.ts` in a fresh tab, one at a time | The camera arrives **at** the specified depth with the correct panel open. **No auto-flight** — the visitor never watches a 52-metre descent they did not ask for (§ 10.2). |
| G5.2 | Focus and camera agree | `Tab` through the whole descent from skip link to footer | Focusing an exhibit proxy scrolls the document to that exhibit's depth. Focus never lands somewhere the camera is not (§ 9.2). |
| G5.3 | On-demand while a panel is open | Open any panel, record the Performance profiler for 5 s | **Zero** rAF callbacks, zero GPU work at idle (§ 4.1). A panel-open reader costs nothing. |
| G5.4 | Reverse pass-through | Deep-link to `/project/gamezone`, then scroll **up** past `y = −40` | Pass B re-enables at the same threshold; the swap is symmetric and seamless in both directions (§ 10.2 step 5) |
| G5.5 | Panel is a real dialog | Open a panel with the keyboard | `role="dialog" aria-modal="true"`, focus moves to the panel `<h2>`, focus is trapped, canvas and background get `inert`; `Esc` returns focus to the **exact** trigger |
| G5.6 | Browser back closes it | Open a panel, press the browser Back button | Panel closes, focus returns to the trigger, the camera has not moved |

### Task 5.1: Exhibit mesh ↔ DOM proxy pairing (§ 4.1, § 9.1)

**Files:** Create `src/three/Exhibit.tsx`.
**Parallelism:** **PARALLEL-SAFE** (owns `src/three/Exhibit.tsx`).

Three entry paths, all equivalent, all producing the same DOM:
1. **Scroll into range** — when `|camera.y − exhibit.y| < 6 m` the exhibit's DOM proxy becomes the active landmark and a compact card fades in at the right edge. **It does not open by itself.**
2. **Click the mesh** — raycast on `pointerup`, **not** `pointerdown`, so dragging the scrollbar never selects an exhibit.
3. **Tab to it** — every exhibit has a real focusable `<button>` in a visually-hidden-but-focusable list in scroll order. Focus scrolls the document to that exhibit's `t` and shows the card; `Enter` opens.

Hover highlight is a Three.js emissive lerp over 120 ms and is **kept under reduced motion** (§ 7 row 10) — it is pointer-driven feedback, not decoration.

### Task 5.2: In-world exhibit surfaces

**Files:** Create `public/textures/proacademys-plate.ktx2`, `public/textures/dp-diagram.ktx2`, `public/textures/gz-diagram.ktx2`. Modify `src/three/layers/Surface.tsx` and `src/three/layers/Device.tsx`.
**Parallelism:** **SERIALIZED after 4.2** (shares the two layer components).

- Each plate carries its exhibit surface as a second, **coplanar unlit quad** (§ 2.3).
- ProAcademys plate texture: `desktop-home.png` at 1024², KTX2, loaded with the Surface layer chunk. This is the eighth screenshot, and it is why all 8 captures are used (§ 4.2).
- The two architecture diagrams are baked from the **same inline SVGs** built in Tasks 1.7a/1.7b to KTX2 — one source, two renderings. If they ever diverge, the SVG is right and the bake is stale.

### Task 5.3: Exhibit cards (§ 4.1, § 7 row 8)

**Files:** Create `src/components/ExhibitCard.tsx`.
**Parallelism:** **PARALLEL-SAFE** (owns `ExhibitCard.tsx`).

Title, one-line thesis, `Open ⏎`. Motion `opacity` + `y: 8 → 0`, 240 ms `easeOut`; **opacity only, 0 ms** under reduced motion. The Engine cards additionally read *"Playing this starts an animation"* (§ 7 row 15).

### Task 5.4: The detail panel (§ 4.1, § 9.3)

**Files:** Create `src/components/DetailPanel.tsx`. Modify `src/app/globals.css` (panel grid placement, `content-visibility`).
**Parallelism:** **SERIALIZED after 2.6** — fourth and final writer in the `globals.css` chain.

- Desktop: grid columns **8–12**, full viewport height, `overflow-y: auto`, `#10151C` at **100 % opacity** — no blur, no transparency. Mobile: full-width bottom sheet at **92 vh** with a drag handle.
- Opening pushes a route (`/project/<slug>`) and slides in with Motion `x: 24 → 0` + opacity, 300 ms `easeOut`, using View Transitions for the route morph (0 KB, native). Document scroll is locked (`overscroll-behavior: contain`, `inert` on the canvas), the camera **holds at its current depth**, and the rAF loop drops to **on-demand rendering only**.
- The panel body is `<ProjectArticle>` — the same component Phase 1 rendered as the page. **The content is not duplicated.** When closed it is hidden with `content-visibility` — **never `display: none` on focusable descendants and never `aria-hidden`** (§ 9.1).
- Closing by `Esc`, the close button, or browser back. Focus returns to the trigger. **The camera has not moved, so closing is not a transition.**

Acceptance: G5.3, G5.5, G5.6.

### Task 5.5: Deep-link depth resolution (§ 10.2)

**Files:** Modify `src/three/Rig.tsx`, `src/lib/store.ts`.
**Parallelism:** **SERIALIZED after 4.3 and 4.5.**

1. Server returns the full static document with the target `<article>` present and the panel open. LCP is text, as always.
2. Tier detection runs.
3. **Low tier: the page is already correct.** The browser scrolls to the section anchor. Done — no further work.
4. **Mid/high tier:** the 3D chunk loads; on the first frame scroll position is set **without animation** to `tOfDepth(routeDepth) * S` and the camera is placed there directly.
5. **There is no separate "fly to" code path.** Client-side navigation uses View Transitions for the panel morph and `window.scrollTo` for the depth change, so the camera follows via the same scroll target mechanism it always uses. One mechanism, exercised by every entry point.

Acceptance: G5.1 and G5.4.

### Task 5.6: The Reasoning node field — the 12 protocol types as the exhibit (§ 3.4, § 4.4)

**Files:** Create `src/three/NodeField.tsx`. Modify `src/components/ProjectArticle.tsx` (Switchboard branch).
**Parallelism:** **SERIALIZED after 4.2** (Reasoning geometry) **and after 1.6** (`ProjectArticle.tsx`).

> **OQ3 is DEFERRED. The owner is still actively building Switchboard. There is no recorded trace and none may be synthesised, mocked or approximated. No fake data appears anywhere in the Reasoning layer.**

**What ships:** the 12 protocol message types **are** the exhibit. The 5 `ClientMessage` types (`prompt`, `set_model`, `spawn`, `list_sessions`, `switch_session`) and 7 `ServerMessage` types (`roster`, `models`, `session_event`, `session_messages`, `error`, `sessions`, `session_switched`) are the node classes. Selecting one lights the edges it can travel. The DOM panel carries the protocol table (already built in Task 1.6's `ProtocolTable`), the three engineering decisions with `server/agent-manager.ts` file-path evidence, and the GitHub link to `malllayyyy/swtchboard`.

**The trace-replay drop-in slot, designed now so it costs nothing later:**

```tsx
// src/three/NodeField.tsx
import { SWITCHBOARD_TRACE } from '@/content/site';
import type { TraceFixture } from '@/content/types';

// The § 2.3 "Trace path" Line and the § 7 row 13 illumination tween are built and
// wired, but mount only when a real recorded session exists. Until then the node
// field is complete on its own and nothing renders empty.
const trace: TraceFixture | null = SWITCHBOARD_TRACE;
// ...
{trace && <TracePath steps={trace.steps} />}
```

**Adding the trace later is exactly three edits and no rework:**
1. Commit the redacted real session as `src/content/switchboard-trace.json`.
2. In `src/content/site.ts`: `import trace from './switchboard-trace.json'; export const SWITCHBOARD_TRACE = trace as TraceFixture;`
3. Nothing else. `TracePath` (a `Line` of ≤ 60 vertices lit to full `#C8FF6A` on step selection, 1 draw call) and the DOM step list beside it are already built and already tested against the type.

**What must never happen:** a plausible-looking synthetic trace. A fabricated trace at the deepest layer of a site whose whole argument is evidence is the one unrecoverable mistake available here.

Acceptance: load `/project/switchboard`. Expected: 12 selectable node classes, each lighting its edges; the DOM panel lists all 12 types; **no trace line, no step list, no empty panel, no "coming soon"** — the exhibit is complete as it stands.

### Task 5.7: Trace drop-in (BLOCKED — owner, do not execute)

**Files (when unblocked):** Create `src/content/switchboard-trace.json`. Modify `src/content/site.ts` (three lines, per Task 5.6).
**Parallelism:** **SERIALIZED after 5.6.** Second writer in the `src/content/site.ts` chain alongside 6.7.

**Do not start this task.** It is recorded here so the seam is documented and so nobody re-designs it. Preconditions for unblocking: the owner supplies one genuine multi-subagent run from `~/.omp/agent/sessions/*.jsonl`, with private paths redacted. **Do not synthesise one.** Acceptance when it lands: the lit path steps through the field in sync with the DOM step list, and every step in that list corresponds to a real message in the committed transcript.

### Task 5.8: Games at their real depths (§ 5.4)

**Files:** Modify `src/three/layers/Engine.tsx`, `src/components/GameMount.tsx`.
**Parallelism:** **SERIALIZED after 4.2 and 2.7.**

- The `CanvasTexture` on the play-volume quad sets `texture.needsUpdate = true` **only when a frame was drawn** — a paused game costs no texture upload (§ 5.2).
- While playing, scroll is locked and the camera is stationary at the play volume's depth. The travelling point light dims to **3.0** so the canvas is the brightest thing in frame. Nothing else animates except the collider ghosts (§ 5.4).
- Pong on mobile is presented **full-bleed at 16:10 in a DOM overlay**, not in-world — reading a 640 × 400 texture on a perspective quad at 390 px is not a game (§ 5.5).

---

# Phase 6 — Budget, polish, domain

**Spec:** § 15 Phase 6, § 8.1, § 8.3, § 10.4, § 14 Risk 3. **Deliverable:** the budget measurement CI gate (`scripts/measure-budget.mjs`) wired to the § 8.1 numbers; the frame-time watchdog; OG image generation; sitemap, robots, JSON-LD; the tier-content-parity build assertion; the `malaychaudhary.dev` cutover; résumé PDF and portrait dropped into their live slots.

### Task 6.1: The one CI gate that matters (§ 8.1)

**Files:** Create `scripts/measure-budget.mjs`, `.github/workflows/budget.yml`. Modify `package.json`, `next.config.mjs`.
**Parallelism:** **SERIALIZED — fourth writer in the `package.json` chain and second in `next.config.mjs`.**

Run: `node scripts/measure-budget.mjs`
Expected: passing size checks for initial route (143.4 KB gz real JS vs 180 KB limit), 3D chunk (239.4 KB gz vs 250 KB limit), and full descent JS (426.3 KB gz vs 430 KB limit). **The build fails if any limit is breached.** This is the one CI gate that matters (§ 8.1) — wire it to fail the workflow, not warn.

*Deviation note (2026-09-09): `.size-limit.json` glob-based measurement was replaced by `scripts/measure-budget.mjs`, which parses out/index.html script tags, excludes noModule core-js polyfills, and accurately accounts for the motion overlay chunk to enforce true browser transfer limits.*
### Task 6.2: The frame-time watchdog (§ 14 Risk 3 kill-switch)

**Files:** Create `src/lib/watchdog.ts`. Modify `src/three/index.tsx`.
**Parallelism:** **SERIALIZED after 4.3.**

If the **rolling 120-frame mean frame time exceeds 28 ms for 3 consecutive seconds**, drop mid → low **in place**: dispose the renderer, swap in the static path, **no reload, no flash**, and show the tier-toggle link. The site degrades under its own supervision rather than waiting for the user.

Also wire `renderer.domElement.addEventListener('webglcontextlost')` (§ 9.5): tear down the scene, restore document scroll, swap in the static path **without a reload**. A lost context degrades; it never blanks.

Acceptance: in DevTools, throttle CPU 20× on a mid-tier profile and scroll. Expected: within ~3 s the canvas is disposed, the five stills are in place, the page still scrolls, and the footer toggle is visible. Then force a context loss via `WEBGL_lose_context` and confirm the same graceful path with no reload.

### Task 6.3: OG images (§ 10.4, § 12 item 28)

**Files:** Create `src/app/opengraph-image.tsx`, `src/app/layer/[slug]/opengraph-image.tsx`, `src/app/project/[slug]/opengraph-image.tsx`.
**Parallelism:** **PARALLEL-SAFE** (owns three new files).

**Twelve** images, generated at build time with Next's `ImageResponse`, 1200 × 630, on `--void` with the route's layer accent, in Satoshi: a depth readout, the layer name, and the project title. **Not screenshots — the site's own visual language.** Six project cards + five layer cards + one root card. `twitter:card = summary_large_image`. The OG **description** is § 13.2 candidate 3 (the OQ2 social choice), which differs from the meta description by design.

Acceptance: `find out -name 'opengraph-image*' | wc -l` → **12**. Then paste the deployed URL into a real link unfurl (Slack, X, LinkedIn) and look at the card.

### Task 6.4: `sitemap.ts`, `robots.ts`, JSON-LD, canonicals (§ 10.4)

**Files:** Create `src/app/sitemap.ts`, `src/app/robots.ts`. Modify `src/app/layout.tsx` (fifth and final writer in that chain).
**Parallelism:** **SERIALIZED after 1.9.**

- Sitemap and robots generated **from `src/content/routes.ts`** — one source, no drift.
- One `Person` JSON-LD on `/`: `name`, `alumniOf: IIIT Naya Raipur`, `sameAs: [GitHub, LinkedIn]`, `email`.
- One `SoftwareSourceCode` per project route, with `codeRepository` set **only where a public repo exists** (`deployment-platform`, `swtchboard`). **Omitted, not faked, for the private ones** (ProAcademys, GameZone).
- Canonical URLs on every route. `theme-color: #06080B`.

Acceptance: `curl -s localhost:3000/sitemap.xml | grep -c '<loc>'` → **13**. Then run the deployed URL through Google's Rich Results Test — `Person` valid, `SoftwareSourceCode` valid on both public projects, and **no `codeRepository` field at all** on `/project/gamezone` and `/project/proacademys`.

### Task 6.5: The tier-content-parity build assertion (§ 8.3)

**Files:** Create `scripts/assert-tier-parity.mjs`. Modify `package.json` build script.
**Parallelism:** **SERIALIZED after 6.1.**

Diffs the rendered **text content** of the high-tier route tree against the low-tier route tree and **fails the build on any difference**. § 8.3 states the DOM content is byte-identical across all three tiers; this is what makes that a fact rather than an intention.

Acceptance: `node scripts/assert-tier-parity.mjs` → `parity OK, 13 routes`. Then deliberately break it — add a word to a low-tier-only branch — and confirm the script exits non-zero naming the route.

### Task 6.6: Owner assets into their live slots

**Files:** Create `public/malay-chaudhary-resume.pdf`, `public/portrait.avif`, `public/portrait.webp`. Modify `src/content/site.ts` (`RESUME_PDF_PRESENT = true`, `PORTRAIT_PRESENT = true`).
**Parallelism:** **SERIALIZED — third writer in the `src/content/site.ts` chain (after 1.4, and coordinated with 5.7 and 6.7).** **BLOCKED on the owner.**

Both slots have been live and non-broken since Phase 1. This task is two file drops and two boolean flips.

- [ ] Drop the PDF at `public/malay-chaudhary-resume.pdf`. Flip `RESUME_PDF_PRESENT = true`. Verify: the hero link, the Bedrock link and `/resume` all now offer the direct download, and `/resume` renders the embedded `<object>` viewer with a download fallback.
- [ ] Encode the portrait to AVIF + WebP at ≥ 1200 px square, ≤ 90 KB each. Flip `PORTRAIT_PRESENT = true`. Verify: the image appears **exactly once** on the site — `grep -c "portrait" out/index.html` → 1 (Bedrock) and 1 on `/about`, which is the same block via a second entry point (§ 10.3). Never twice on one document.
- [ ] **If either asset never arrives, ship anyway.** The interim states are designed, correct, and already deployed.

### Task 6.7: Domain cutover to `malaychaudhary.dev` (OQ1)

**Files:** Modify `src/content/site.ts` (`SITE_URL`).
**Parallelism:** **SERIALIZED — last writer in the `src/content/site.ts` chain. Do this last in the phase**, after 6.3/6.4 have been verified on `.vercel.app`, because `SITE_URL` feeds `metadataBase`, every canonical, the sitemap and all 12 OG image URLs.

- [ ] Register `malaychaudhary.dev`. Add it in the Vercel project as the **primary** domain; add the DNS records Vercel prints; wait for the certificate.
- [ ] Set `SITE_URL = 'https://malaychaudhary.dev'`; redeploy.
- [ ] Verify: `curl -sI https://malaychaudhary.dev/ | head -1` → `HTTP/2 200`. `curl -s https://malaychaudhary.dev/sitemap.xml | grep -c 'malaychaudhary.dev'` → **13**. `curl -s https://malaychaudhary.dev/ | grep -o 'rel="canonical" href="[^"]*"'` → the apex domain, not `.vercel.app`.
- [ ] Verify the `.vercel.app` URL now **redirects** to the apex rather than serving a duplicate (Vercel does this automatically once the domain is primary — confirm it, do not assume it).
- [ ] Re-run one link unfurl to confirm the OG images resolve on the new origin.

### Task 6.8: Click every link once

**Parallelism:** **SERIALIZED — manual, after 6.7.**

Click every link on the site once, on the live domain. Including — explicitly — **the two that must not exist**: there is no GameZone code link and no GameZone demo link (§ 3.2, § 15 Phase 6).

Run: `grep -roh 'href="[^"]*"' out/ | sort -u | sed 's/href="//;s/"//' | grep '^http' | sort -u`
Then `curl -sI` each external URL.
Expected: every external link returns 200 — `github.com/malllayyyy/deployment-platform`, `github.com/malllayyyy/swtchboard`, `proacademys-client.vercel.app`, `linkedin.com/in/malay-chaudhary-959077328/`. **No link to `github.com/malllayyyy/GameZone`, `github.com/malllayyyy/proacademys-client`, or any `.apk`** — all of those are 404 or private and are deliberately absent.

### Task 6.9: Record the § 8.1 table as measured

**Files:** Modify `docs/measurements.md`.
**Parallelism:** **SERIALIZED — final task of the project.**

Measure on the reference devices — **mid-range Android, 4× CPU throttle, Slow 4G (1.6 Mbps / 150 ms RTT)** via Lighthouse mobile, and a 2020 MacBook Air (M1) for the desktop column — and write every row of the § 8.1 table with the number actually observed beside the target.

| Metric | Low | Mid | High |
|---|---:|---:|---:|
| LCP | ≤ 2600 ms * | ≤ 1.8 s | ≤ 1.2 s |
| FCP | ≤ 1.0 s | ≤ 1.2 s | ≤ 0.8 s |
| TTI | ≤ 2700 ms * | ≤ 3.0 s | ≤ 2.0 s |
| CLS | ≤ 0.01 | ≤ 0.01 | ≤ 0.01 |
| INP | ≤ 200 ms | ≤ 200 ms | ≤ 120 ms |
| JS initial route | ≤ 180 KB gz | ≤ 180 KB gz | ≤ 180 KB gz |
| JS deferred 3D chunk | **0 KB** | ≤ 250 KB gz | ≤ 250 KB gz |
| Total JS | ≤ 180 KB gz | ≤ 430 KB gz | ≤ 430 KB gz |
| Texture budget (GPU) | 0 | ≤ 1.4 MB | ≤ 2.5 MB |
| Scene asset transfer | ≤ 380 KB | ≤ 1.6 MB | ≤ 2.8 MB |
| Draw calls | 0 | ≤ 60 | ≤ 120 |
| Resident triangles | 0 | ≤ 90 k | ≤ 180 k |
| Target FPS | n/a | 45 floor / 60 target | 60, no frame > 20 ms |
| Lighthouse Performance | ≥ 98 | ≥ 90 | ≥ 95 |
| Lighthouse Accessibility | **100** | **100** | **100** |

Any row that misses gets one line in `docs/measurements.md` saying by how much and what was traded. **A missed row is recorded, never rounded.**

---

## Owner-asset landing map

Every point where an owner-supplied asset lands, and the interim state that holds until it does. **None of these can produce a broken link or a broken image at any phase.**

| Asset | Lands in | Files touched | Live from | Interim state | Verified by |
|---|---|---|---|---|---|
| **Résumé PDF** | Task 6.6 | `public/malay-chaudhary-resume.pdf`, `src/content/site.ts` (`RESUME_PDF_PRESENT`) | **Phase 1** — the link slot is live and points at `/resume` | `/resume` states plainly that the PDF is coming and gives `malayrc276@gmail.com`. Three link sites (hero, Bedrock, `/resume`), one component (`ResumeLink`), one flag. | Task 1.9 Step 5: `grep -o 'href="/malay-chaudhary-resume.pdf"' out/index.html \| wc -l` → **0** while the flag is false; every Résumé link lands on `/resume`; **zero 404s** |
| **Portrait photo** | Task 6.6 | `public/portrait.{avif,webp}`, `src/content/site.ts` (`PORTRAIT_PRESENT`) | **Phase 1** — the slot renders from day one | A flat `--strata` block with the name and *B.Tech CSE, IIIT Naya Raipur* in Satoshi, `role="img"` with a real `aria-label`. A legitimate design, not a broken image. | Load `/` and `/about`: a designed block, no `alt` text of a missing file, no layout hole. Used **exactly once** per document (§ 3.4). |
| **Switchboard trace** | Task 5.7 (**do not execute**) | `src/content/switchboard-trace.json`, `src/content/site.ts` (`SWITCHBOARD_TRACE`) | **Phase 5** — the seam exists; the exhibit does not need it | **OQ3 deferred.** The 12 protocol message types are the exhibit. `TracePath` and the DOM step list are built and typed but mount only when `SWITCHBOARD_TRACE !== null`. **No synthesised trace, no mock, no approximation, no fake data anywhere in the Reasoning layer.** | Load `/project/switchboard`: 12 selectable node classes, full protocol table in the DOM, **no empty trace panel and no "coming soon"** |

---

## Phase gates, collected

| Phase | Gate | Failure action |
|---|---|---|
| **1** | Lighthouse ≥ 98 / A11y **100** mobile; full keyboard pass; `view-source` contains every heading and project fact; JS disabled → site complete; deployed and loaded on a phone | Do not proceed. Phase 1 is the kill-switch for Risks 1 and 4 — nothing later is worth having without it. |
| **2** | `loop.test.ts` passes (144 Hz vs 60 Hz parity, 30 s clamp); Pong to 7 points keyboard-only, exits cleanly on `Escape` **and** on `Tab`; Pong playable by dragging on a phone; low tier ships **zero** `three` | Fix before Phase 3. Phase 2 is what ships if Phase 3 fails, so it must be complete. |
| **3** | **GO / NO-GO ON THE WHOLE CONCEPT.** Frame-diff criterion (§ 2.6) passes; 60 fps desktop, 45 fps mid-range Android; and it must *feel* like descending into a device on both. | **NO-GO → ship Phase 2 as the whole site.** § 8.3: identical DOM, same copy, same diagrams, same routes, same games. The fallback is the product. **Seam-only failure → the Risk 2 kill-switch:** replace the swap with a 180 ms `power2.in` fade to `--void` and back at `y = −40`. **Decided by the end of Phase 3, never later.** |
| **4** | Full `0 → 1` sweep with no stall or discontinuity; gauge reads the exact metre at all four datums; `1`–`4` and `↑`/`↓` land on datum depths; reduced-motion mid-session snaps to presets and **stops the rAF loop** (verified in the profiler, not by eye); draw calls ≤ 120 | Phases 1, 2, 4, 5 and 6 are each independently deployable (§ 14 Risk 4). Ship at whatever phase the calendar reaches. |
| **5** | Every URL in the route table loads cold at the specified depth with the correct panel open and **no auto-flight**; Tab through the descent with focus and camera never disagreeing; a panel open → renderer on-demand, **zero GPU work at idle** | Same — ship the previous phase. |
| **6** | § 8.1 table measured on the reference device and recorded; OG cards previewed in a real unfurl; parity assertion green; **every link clicked once, including the two that must not exist** | Any missed budget row is recorded in `docs/measurements.md` with the amount and the trade. Never rounded, never quietly dropped. |

---

## Self-review

**Spec coverage.** § 1 non-goals → Global Constraints, enforced per task. § 2.1–2.5 → Tasks 4.1, 4.2, 4.3, 4.4, 4.6. § 2.6 → Tasks 3.2, 3.3 (the whole of Phase 3). § 3.1–3.5 → Task 1.5 and Tasks 4.2, 5.2, 5.6. § 4.1 → 5.1, 5.3, 5.4. § 4.2 → 1.7c, 5.2. § 4.3 → 1.7a, 1.7b, 5.2. § 4.4 → 5.6. § 5.1 → 2.5. § 5.2 → 2.6 (`skin.ts`). § 5.3 → 2.6. § 5.4 → 5.8. § 5.5 → 2.6, 2.7, 5.8. § 6.1 → 1.3, 1.10. § 6.2–6.4 → 1.2. § 6.5 → 4.2. § 7 → 2.3, 4.3, 4.4, 5.3, 5.4. § 8.1 → 6.1, 6.9. § 8.2 → 2.2. § 8.3 → 2.4, 4.7, 6.5. § 9.1 → 1.6, 1.8, 5.4. § 9.2 → 1.8, 4.6, 5.1. § 9.3 → 1.2, 5.4. § 9.4 → 2.3. § 9.5 → 1.9, 6.2. § 10.1 → 1.4, 1.8. § 10.2 → 5.5. § 10.3 → 1.9. § 10.4 → 6.3, 6.4. § 11 → 1.1, 2.1, 3.1. § 12 → the owner-asset landing map. § 13 → 1.4 (OQ2 resolution). § 14 → the Phase 3 gate, Task 6.2. § 15 → the six phases.

**Placeholder scan.** No `TBD`, no `implement later`, no `add error handling`, no `similar to Task N`. The three items that *are* deferred — the résumé PDF, the portrait, and the Switchboard trace — are owner-blocked assets with fully specified, already-built interim states, not unwritten code.

**Type consistency.** `Project`, `Decision`, `Shot`, `Presentation`, `Layer`, `RouteEntry`, `TraceFixture` are defined once in Task 1.4 and imported unchanged everywhere. `createLoop` / `TIMESTEP_MS` / `MAX_STEPS` are defined in 2.5 and consumed by 2.6 and 2.7. `depth` / `tOfDepth` are defined in 4.1 and consumed by 4.3, 4.6 and 5.5. `detectTier` / `webglSupported` / `setTierOverride` are defined in 2.2 and consumed by 2.4, 3.1 and 6.2. `SWITCHBOARD_TRACE` is declared `null` in 1.4, read in 5.6, assigned in 5.7.

**Known tensions, resolved in favour of the spec.**
- § 4.2 assigns `desktop-home.png` to the in-world plate and the other seven to the panel; all 8 captures are therefore used, and the panel gallery has 7. Tasks 1.5 and 5.2 reflect that split.
- § 4.3 describes the GameZone rollover strip as "four boxes, one line" while listing five phrases. Task 1.7b draws **four boxes** and renders the fifth phrase, `occupancy unbroken`, as the strip's caption — every phrase present, the box count as specced.
- § 5.1 says `loop.test.ts` is the only test on this project. Task 4.1's `depth(t)` round-trip assertion therefore runs as a throwaway script, not a committed second test file.
