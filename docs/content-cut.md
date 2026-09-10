# Content Cut — reducing the site to what actually earns its place

**Status:** plan only. Nothing in this document has been executed.
**Baseline:** HEAD `629d283`, branch `main`. `npx next build` green, 15 routes,
`out/sitemap.xml` 12 URLs, § 8.1 gate exits 0.

## The rule this pass applies

The site was built evidence-first: every claim traces to a file path or a measured
number. That rule is what produced the over-explaining, because it gives *migrating
37 MySQL tables* and *a Pong paddle bounce angle* the same gravity as genuinely hard
work.

The correction is not to abandon evidence. It is:

> **Specificity earns its place only when the thing itself is unusual.**

Judge every sentence by: *would a competent engineer be mildly impressed, or would
they think "yes, that's just how you do it"?* Cut the second kind.

**Survives** — SQLite tuned with `cache_size = -10000` + WAL for a Windows 7 spinning
disk; the atomic single-`UPDATE` deploy swap with zero-downtime rollback; scrypt +
HMAC session cookies on `node:crypto` with no auth dependency; the screen pass-through
render trick; the SameSite cookie failure and its fix.

**Does not survive** — table counts, collection counts, LOC, endpoint counts, file
counts, package counts, "4-tier decoupling", CRUD factories, AABB collision, the
bounce-angle formula, "fixed timestep loop (60 Hz)" as a boast.

---

# 1. Length audit — measured, not guessed

## Method

`out/` from the current build. Text extracted by stripping `<script>` bodies and all
tags, then word-counted. Offsets below are word positions in that extracted stream for
`out/index.html`, used to attribute length to specific blocks.

## Rendered length per route

| Route | Rendered words | `<section>` count | Note |
|---|---|---|---|
| `/` | **3,024** | 5 (`surface`, `device`, `engine`, `reasoning`, `bedrock`) + `<header>` hero | the whole descent document |
| `/layer/surface` | 3,024 | 5 | renders the same `<Descent/>` (`src/app/layer/[slug]/page.tsx:20`) |
| `/layer/device` | 3,024 | 5 | identical |
| `/layer/engine` | 3,024 | 5 | identical |
| `/layer/reasoning` | 3,024 | 5 | identical |
| `/project/deployment-platform` | 3,024 | 5 | identical (`src/app/project/[slug]/page.tsx:20`) |
| `/project/proacademys` | 3,024 | 5 | identical |
| `/project/gamezone` | 3,024 | 5 | identical |
| `/project/pong` | 3,024 | 5 | identical |
| `/project/switchboard` | 3,024 | 5 | identical |
| `/about` | 86 | 1 | fine as-is |
| `/resume` | 970 | 5 | derives from `PROJECTS`; shrinks automatically |
| `/404` | 77 | 1 | fine as-is |

**There is one document, rendered ten times.** All ten descent routes are the same
3,024 words. So "the site is too long" is precisely: *the homepage body is too long*.
Fixing `/` fixes nine other routes for free.

Of the 3,024: **2,458 words are DOM text, ~566 are inside the two inline SVG diagrams**
(`<title>`, `<desc>`, `<text>` labels).

## Where the length actually comes from

| Block | Words | Word offsets in `out/index.html` | Share of page |
|---|---|---|---|
| **Architecture Node Index** (both instances) | **~1,097** | 489–1199, 1906–2291 | **36 %** |
| GameZone diagram (`<title>`/`<desc>`/labels) | ~330 | 1415–1905 | 11 % |
| Pong article (entire) | ~230 | 2314–2543 | 8 % |
| deployment-platform diagram + prose | ~355 | 134–488 | 12 % |
| Switchboard article | ~265 | 2612–2876 | 9 % |
| — of which visit telemetry (15 rows) | ~143 | 2734–2876 | 5 % |
| ProAcademys article (incl. 7 shot alts + claims) | ~185 | 1200–1384 | 6 % |
| Bedrock / About / Contact / Keyboard | ~115 | 2877–2991 | 4 % |
| Layer headers + theses + hero + proxy nav | ~230 | 1–133, 1385–1414, 2292–2313, 2544–2611 | 8 % |

Supporting counts: `src/content/snippets.ts` is **349 lines / 1,132 words** of quoted
source; the rendered node index carries **23 `Provenance:` rows** across the two
diagrams. `public/shots/proacademys/` is **16 files / 440 KB**.

## Structural length vs content length

**Structural — stays, untouched.** The 900 vh `min-h-[900vh]` descent
(`src/app/page.tsx:35`), the 21-point depth table, the four layer datums, the
pass-through, the deep links. The height of the document is the *concept*. Scroll
distance is not word count and is not what the owner is complaining about.

**Content — this is the target.** The node index, the stat blocks, the screenshots,
the third and fourth decision paragraph on every project, the evidence path lists
under table-stakes claims, the Pong article, the 15-row telemetry.

## Target

Cut the node index (−1,097), the Pong article (−230), the screenshot alts and claims
(−120), the five `scale` blocks (−75), four whole decision paragraphs (−160), trim
telemetry 15→9 rows (−57), and tighten every remaining paragraph (−150).

> **Target: ~1,100–1,200 rendered words on `/`, i.e. roughly one third of current
> body copy survives. Cut ~62 %.**

The nine other descent routes drop by the same amount automatically.

---

# 2. Per-project rewrite, with drafted copy

**To executing agents: the copy in this section is final. Paste it. Do not compose,
expand, "improve", or add adjectives.** Tone is the entire point of this pass.

## 2.0 One type change this section depends on

`src/content/types.ts:8-12` currently makes `evidence` required:

```ts
export type Decision = {
  body: string;
  evidence: string[];
};
```

Change to `evidence?: string[]`, and in `src/components/DecisionList.tsx:10-12` render
the evidence paragraph only when `d.evidence?.length`. Rationale: exactly three
surviving claims are unusual enough that a file path adds credibility. Every other
paragraph carries no citation, because citing `server/src/controllers/` to prove you
have controllers is the padding the owner objected to.

---

## 2.1 `deployment-platform`

| Item | Verdict |
|---|---|
| thesis | rewrite (shorter) |
| decision 1 — throwaway Docker sandbox + lockfile-hash cache | **cut as a paragraph**, folded into thesis as "builds in a throwaway container" |
| decision 2 — atomic single-`UPDATE` swap + rollback | **keep**, rewritten |
| decision 3 — scrypt + HMAC on `node:crypto` | **keep**, rewritten |
| `scale`: workspace packages 7 | cut |
| `scale`: source files ~25 JS/JSX | cut |
| `scale`: LOC ~2,200 | cut |
| `scale`: Postgres tables 4 | cut |
| `scale`: REST endpoints 10 | cut |
| `links`: GitHub | keep |
| `honesty` | keep, tightened |
| diagram | keep (see § 4 flagged decision) |

**Why each survivor clears the bar**

- *Atomic swap*: the whole deploy/rollback story reduces to one column write. That is
  a design most people reach for a blue/green load balancer to achieve. Grounded:
  `docs/projects.md` § 1, decision 2 — "`current_deployment_id` updates only after
  build success. Instant rollbacks update `current_deployment_id` in a single SQL
  operation."
- *scrypt + HMAC on `node:crypto` alone*: shipping session auth with zero auth
  dependency and zero session store is a deliberate, defensible refusal, not a default.
  Grounded: `docs/projects.md` § 1, decision 3 — "implements scrypt password hashing
  and HMAC-SHA256 signed base64url stateless session cookies using Node's native
  `node:crypto` standard library module."

**Cut claims, named:** lockfile hashing against a bind-mounted cache (standard CI
caching); "7 workspace packages"; "~25 JS/JSX source files"; "~2,200 LOC";
"4 Postgres tables — users, projects, deployments, build_logs"; "10 REST endpoints";
the evidence path lists `infra/docker/build.sh`, `apps/worker/src/build.js`.

**Replacement copy — `src/content/projects/deployment-platform.ts`, verbatim:**

```
thesis:
'A self-hosted PaaS. Give it a git URL, it builds in a throwaway Docker container and serves the result on its own subdomain.'

decisions[0].body:
'Every redeploy writes to its own MinIO path, and the proxy resolves a subdomain by reading one column — projects.current_deployment_id. Going live is a single UPDATE. Rolling back is the same UPDATE pointed at the row before it, so neither direction has downtime.'
decisions[0].evidence: ['apps/proxy/src/index.js']

decisions[1].body:
'Passwords are scrypt, sessions are HMAC-SHA256 signed cookies, and both are written against node:crypto. No session store, no Redis, no auth library.'
decisions[1].evidence: ['apps/api/src/auth.js']

scale: []

links: [ { label: 'GitHub', href: 'https://github.com/malllayyyy/deployment-platform' } ]

honesty:
'It runs on my machine only, at http://<project>.localhost:8080. The code is public if you want to read it.'
```

---

## 2.2 `proacademys`

| Item | Verdict |
|---|---|
| thesis | rewrite |
| decision 1 — 37-table MySQL→Mongo ETL | **keep the work, cut the number** |
| decision 2 — `SameSite=Lax` cookie drop and the rewrite fix | **keep**, rewritten |
| decision 3 — "strict four-tier decoupling" + generic CRUD factories | **cut entirely** |
| `scale`: 37 MySQL tables → 20 Mongoose collections | cut |
| `scale`: files ~100+ | cut |
| `scale`: LOC ~8,500 | cut |
| `scale`: REST endpoints ~30 | cut |
| `presentation: { kind: 'screenshots', shots: [7] }` | **cut entirely** (see § 3) |
| `links`: Live demo | keep, plus both public repos |
| `honesty` | keep, tightened |

**Why each survivor clears the bar**

- *The migration*: writing your own ETL against a client's live production data, with
  a count-parity check before you trust it, is real risk taken deliberately. The
  *number of tables* is not the achievement; **doing it on production data and
  verifying it** is. Grounded: `docs/projects.md` § 3, decision 1 — "generates
  automated count-parity verification reports (`scripts/migrate/out/report.md`)".
- *The cookie failure*: a browser silently dropping your auth cookie because your
  frontend and API are on different hosts is genuinely surprising, and the fix —
  rewrite `/api/*` on the frontend origin so the cookie is same-site — is the kind of
  thing you only know after it has cost you a day. Grounded: `docs/projects.md` § 3,
  decision 2, evidence `client/vercel.json`.

**Cut claims, named:** "37-table MySQL production dump"; "37 MySQL tables → 20
Mongoose collections"; "~100+ files"; "~8,500 LOC"; "~30 REST endpoints"; "strict
four-tier decoupling — routes to controllers to services to repositories to models";
"reusable generic CRUD factories"; all seven screenshots and their `claim` captions.

> **Note on the four-tier decision.** This is the single clearest instance of the
> "37 tables" disease outside the stat blocks. Layering an Express app into
> routes/controllers/services/repositories is how you are supposed to build an Express
> app. Presenting it as a decision invites exactly the reaction the owner described.

**Replacement copy — `src/content/projects/proacademys.ts`, verbatim:**

```
thesis:
'A MERN rewrite of a client\u2019s PHP/Laravel e-learning platform, including moving the live production data across.'

decisions[0].body:
'The old site kept everything in MySQL and the new one is MongoDB, so the migration had to be written by hand: read the production dump, reshape the rows into documents, map every legacy integer ID to an ObjectId, then count both sides and compare before trusting any of it. It ran against real customer data, which is why the parity check exists.'
decisions[0].evidence: undefined

decisions[1].body:
'The frontend is on Vercel and the API is on Render, so the browser treated them as different sites and quietly dropped the login cookie every time. The fix was to rewrite /api/* on the frontend origin, which puts the cookie back on the same domain it came from.'
decisions[1].evidence: ['client/vercel.json']

scale: []

links: [
  { label: 'Live demo',   href: 'https://proacademys-client.vercel.app/' },
  { label: 'Client repo', href: 'https://github.com/malllayyyy/proacademys-client' },
  { label: 'Server repo', href: 'https://github.com/malllayyyy/proacademys-server' },
]

honesty:
'Waiting on the client\u2019s DNS cutover to proacademys.com and live Razorpay keys.'

presentation: { kind: 'links' }
```

The new `presentation` kind is specified in § 3.

---

## 2.3 `gamezone`

| Item | Verdict |
|---|---|
| thesis | keep, lightly tightened |
| decision 1 — SQLite PRAGMA tuning for Windows 7 / spinning disk | **keep** — the best claim on the site |
| decision 2 — one React codebase → Capacitor Android + browser | **cut as a paragraph**, already stated in the thesis |
| decision 3 — mid-session activity rollover and overage maths | **keep**, rewritten |
| `scale`: source files ~30 | cut |
| `scale`: LOC ~3,500 | cut |
| `scale`: SQLite tables 7 (+ the name list) | cut |
| `scale`: REST endpoints ~15 | cut |
| `scale`: Android package `com.gamezone.app` | cut |
| `links` (empty) | stays empty — see § 3 |
| `honesty` | rewrite, now carries the "no link" statement |
| launcher icon `<img>` in `ProjectArticle` | keep — it is the only visual GameZone has |
| diagram | keep (see § 4 flagged decision) |

**Why each survivor clears the bar**

- *SQLite tuning*: naming the actual hardware — Windows 7, a spinning disk, Node
  v13.14.0 — and then tuning four PRAGMAs and wrapping seeding in one transaction
  because of it is engineering driven by a constraint nobody chose. Grounded:
  `docs/projects.md` § 4, decision 1, evidence `backend/database.js`.
- *Mid-session rollover*: a business rule with real arithmetic behind it (compute the
  played overage, deduct it) that you would only discover by watching a counter
  operate. Grounded: `docs/projects.md` § 4, decision 3, evidence `backend/server.js`.

**Cut claims, named:** "Capacitor 6" as its own decision paragraph; "one-click batch
launcher" as evidence; "~30 source files"; "~3,500 LOC"; "7 SQLite tables — stations,
sessions, settings, activities, snacks, cafeteria_expenses, revenue_history";
"~15 REST endpoints"; "Android package com.gamezone.app".

**Replacement copy — `src/content/projects/gamezone.ts`, verbatim:**

```
thesis:
'A gaming-cafe POS \u2014 station timers, session billing, cafeteria orders \u2014 running as an Android app and a desktop web app off one build.'

decisions[0].body:
'It runs on the cafe\u2019s own machine: Windows 7, a spinning disk, Node v13.14.0. So SQLite is set to WAL with synchronous NORMAL, temp_store MEMORY and cache_size -10000, and the startup seeding all happens inside one transaction. On that disk every extra flush is a pause somebody is standing at the counter waiting through.'
decisions[0].evidence: ['backend/database.js']

decisions[1].body:
'A player can move from Snooker to a PS5 halfway through a session without the station being freed and re-billed. The server works out how much of the first activity was already played and takes it off the new one.'
decisions[1].evidence: undefined

scale: []

links: []

honesty:
'Private repo \u2014 it runs a real business, so there is nothing to link to and no demo to try. No screenshots either; this one never had a marketing surface.'
```

---

## 2.4 `switchboard`

| Item | Verdict |
|---|---|
| thesis | keep, lightly tightened |
| decision 1 — direct in-memory `.steer()` bypassing the orchestrator | **keep**, rewritten |
| decision 2 — `setModel()` on a live session mid-conversation | **keep**, rewritten |
| decision 3 — `registerPersistedSubagents` / `ensurePersistedRoster` resync | **cut** |
| `scale`: source files ~15 TS/TSX | cut |
| `scale`: LOC ~1,800 | cut |
| `scale`: database tables 0 | cut |
| `scale`: "5 client message types, 7 server message types" | cut |
| `ProtocolTable` (the 12 message names) | **keep** — see below |
| `links`: GitHub | keep |
| `honesty` | rewrite ("12 message types" out) |
| `CLIENT_MESSAGES` / `SERVER_MESSAGES` exports | keep — `ProtocolTable` consumes them |

**Why each survivor clears the bar**

- *Direct in-memory steering*: going around your own orchestrator by holding live
  `AgentSession` references in process memory and calling `.steer()` on the target is
  a genuinely unusual architectural move with an obvious motive (a whole turn of
  latency and tokens). Grounded: `docs/projects.md` § 2, decision 1.
- *Live model swap*: changing a running conversation's model without restarting it or
  losing context is surprising because most agent tooling makes you start over.
  Grounded: `docs/projects.md` § 2, decision 2.

**Cut claims, named:** the persisted-roster resync paragraph (a periodic resync loop
is maintenance, not a decision); "~15 source TS/TSX files"; "~1,800 LOC";
"0 database tables"; "5 client message types, 7 server message types"; "12 message
types" in the honesty line.

**`ProtocolTable` keeps its rows, loses its counts.** Switchboard has no live URL, no
screenshots and no demo. The message-type list is the only concrete artefact it has,
and it is a *taxonomy*, not an accomplishment — so the names stay and the `· 5` /
`· 7` headings go (§ 5).

**Replacement copy — `src/content/projects/switchboard.ts`, verbatim:**

```
thesis:
'A control plane for Oh My Pi subagents \u2014 steer a running agent directly, swap its model mid-conversation, watch the roster.'

decisions[0].body:
'Sending a prompt through the orchestrator costs a whole turn before the subagent even sees it. Switchboard keeps the live AgentSession objects in process memory and calls .steer() or .prompt() on the target directly, so the orchestrator is never in the path.'
decisions[0].evidence: ['server/agent-manager.ts']

decisions[1].body:
'You can change a session\u2019s model while it is mid-conversation, over the socket. No restart, no config edit, no lost context.'
decisions[1].evidence: undefined

scale: []

links: [ { label: 'GitHub', href: 'https://github.com/malllayyyy/swtchboard' } ]

honesty:
'Still being built. There is no demo yet, so the protocol is the exhibit.'
```

---

## 2.5 `pong` — deleted

`src/content/projects/pong.ts` is **deleted in full**. Pong does not appear anywhere
on the site except the 404 page (§ 4).

**Everything is cut:** the AABB-intersection decision and its
`games/pong.js:139-158` citation; the `angle = hitRatio * PI/3`, `vx = speed *
cos(angle)`, `vy = speed * sin(angle)` formula; the "3.5 % acceleration clamped at
speed 9" / "AI at 3.6 px per tick with a 10 px deadzone" paragraph and its
`games/pong.js:126-133` citation; the "2.4× fast on a 144 Hz display" fixed-timestep
paragraph and its two citations; and the entire five-row `scale` block — `LOC 305`,
`export function initPong(canvas, onWin)`, `640 × 400 internal`, `none — canvas
primitives only`, `WINNING_SCORE = 7`.

None of it is unusual. It is how you write Pong.

**The one honest sentence that survives**, and where it goes: the 404 page,
`src/app/not-found.tsx`, replacing the "Engine sourced from the Pong project at
−120 m" line, which would otherwise be a dead link.

```
'I wrote this Pong when I was starting out, learning game dev. Hope you like it.'
```

The existing honesty line — *"The C++/SFML and Java versions came first. They're gone
— no repo, no backup. What's here is the third time I wrote them, in Canvas 2D."* —
is **not moved to the 404**. It is grounded (`docs/games.md`, "NOT FOUND on local
disk") and it is good, but it belongs to the Engine layer's framing, not to a 404. Its
substance is folded into the Engine layer copy in § 4.3.

---

# 3. Screenshots out, live links in

Owner's instruction, verbatim: *"dont add screenshots of the projects. instead just
tell them what we have done and if its live just keep its link there to visit."*

## 3.1 What gets deleted

| Path | Action | Notes |
|---|---|---|
| `src/components/ShotGallery.tsx` (59 lines) | **delete** | sole consumer of `Shot` |
| `public/shots/proacademys/` | **delete the directory** — 16 files, 440 KB | see file list below |
| `src/content/types.ts:12-20` — `export type Shot` | **delete** | no other consumer |
| `src/content/types.ts:22` — `{ kind: 'screenshots'; shots: Shot[] }` | **delete** from the `Presentation` union | |
| `src/content/projects/proacademys.ts:3-8` — the `shot()` helper | **delete** | |
| `src/content/projects/proacademys.ts` `presentation` block | **replace** with `{ kind: 'links' }` | |
| `src/components/ProjectArticle.tsx:7` — `import { ShotGallery }` | **delete** | |
| `src/components/ProjectArticle.tsx:71` — the `screenshots` branch | **delete** | |

The 16 files, all verified present:
`desktop-catalog-courses.{avif,webp}`, `desktop-course-detail.{avif,webp}`,
`desktop-catalog.{avif,webp}`, `desktop-blog.{avif,webp}`, `desktop-home.{avif,webp}`,
`mobile-home.{avif,webp}`, `mobile-catalog.{avif,webp}`,
`mobile-course-detail.{avif,webp}`.

> Note: `desktop-home.avif` / `desktop-home.webp` are **already** unreferenced —
> `proacademys.ts` declares only seven shots. They are dead weight today.

## 3.2 The replacement `presentation` kind

Add `| { kind: 'links' }` to the `Presentation` union in `src/content/types.ts`. In
`ProjectArticle`, `kind: 'links'` renders **nothing** in the presentation slot —
`LinkRow` already renders `p.links` above the decisions (`ProjectArticle.tsx:65`), and
the "short description" the owner asked for is the `thesis` plus the two surviving
decision paragraphs. Adding a second link block would be duplication.

Do **not** add a component for this. The branch is an absence.

## 3.3 Which link each project gets

| Project | Live? | Link row, exactly |
|---|---|---|
| **ProAcademys** | live | `Live demo` → `https://proacademys-client.vercel.app/`, `Client repo` → `https://github.com/malllayyyy/proacademys-client`, `Server repo` → `https://github.com/malllayyyy/proacademys-server` |
| **deployment-platform** | not hosted | `GitHub` → `https://github.com/malllayyyy/deployment-platform` (unchanged) |
| **Switchboard** | not hosted | `GitHub` → `https://github.com/malllayyyy/swtchboard` (unchanged) |
| **GameZone** | private, no hosted URL | **no link at all.** `links: []`, and `LinkRow` returns `null` for an empty array (`LinkRow.tsx:2`), so nothing renders. |
| Pong | — | removed from the site |

**GameZone gets a sentence instead of a link**, in the `honesty` line drafted in § 2.3:
*"Private repo — it runs a real business, so there is nothing to link to and no demo
to try. No screenshots either; this one never had a marketing surface."* Plus the
launcher icon already rendered at `ProjectArticle.tsx:47-55`, which stays.

Every URL above is verified in `docs/projects.md` (§ 1, § 2, § 3 "Deployed & Repo
URLs"; § 4 lists only `malllayyyy/GameZone`, and it is private).

## 3.4 Does removing `ShotGallery` orphan anything?

Checked by grep across `src/`:

- `ShotGallery` — imported **only** by `src/components/ProjectArticle.tsx:7`. No other
  importer. Safe.
- `Shot` type — imported **only** by `ShotGallery.tsx:1` and used only in
  `types.ts:22`. Safe to delete with it.
- `Presentation['kind']` — also referenced by `ExhibitCard.tsx:33` (the
  `presentationKind` prop) and `ExhibitCard.tsx:82`. Narrowing the union does not
  break the prop's type; it does make the `'playable'` clause dead (§ 4.2).
- `LayerStill` / `public/stills/` — **unrelated** to `ShotGallery`. Those are baked
  renders of the 3D descent, not project screenshots, and they stay. Do not confuse
  them.
- No CSS rule, sitemap entry, OG image, or test references `ShotGallery` or
  `/shots/`.

**Nothing is orphaned.**

---

# 4. Remove the Architecture Node Index; remove Pong from the site

## 4.1 The node index

The single largest block on the page: **~1,097 rendered words, 36 % of `/`**, across
23 expandable `<details>` rows.

| Path | Action |
|---|---|
| `src/components/DiagramNodeIndex.tsx` (82 lines) | **delete** |
| `src/components/DiagramNodeLink.tsx` (46 lines) | **delete** |
| `src/content/snippets.ts` (349 lines: `SnippetEntry`, `SNIPPETS`, `DIAGRAM_SNIPPET_IDS`) | **delete** |

**Every importer, verified by grep — there are exactly three edges:**

1. `src/components/DiagramNodeIndex.tsx:1` → `import { SNIPPETS, DIAGRAM_SNIPPET_IDS } from '@/content/snippets'`
2. `src/components/ProjectArticle.tsx:9` → `import { DiagramNodeIndex } from './DiagramNodeIndex'`
3. `src/components/ProjectArticle.tsx:10` → `import { DiagramNodeLink } from './DiagramNodeLink'`

Nothing else in `src/` references `SNIPPETS`, `SnippetEntry`, `DIAGRAM_SNIPPET_IDS`,
`DiagramNodeIndex` or `DiagramNodeLink`. `docs/creative-pass.md:698` lists them as
workstream A2 and needs a deviation note (§ 6).

In `ProjectArticle.tsx:72-85`, both diagram branches collapse from

```
<DiagramNodeLink><XDiagram /><DiagramNodeIndex id="x" /></DiagramNodeLink>
```

to just `<XDiagram />`.

`DiagramNodeLink` is the only `'use client'` component in this group, so its chunk
leaves the initial route (§ 6 budgets).

## 4.2 **FLAGGED DECISION — what happens to the two diagram SVGs**

The owner asked to remove the *index*, not the diagrams. This is a real fork and is
presented as one.

**The case for cutting them too.** They are 314 + 441 lines of SVG contributing ~566
rendered words. They were designed to be *explored* — every node carries
`data-node="…"`, `cursor-pointer` and `hover:opacity-80`, all of which exist purely to
feed `DiagramNodeLink`. With the index gone, those affordances point at nothing.

**The case for keeping them.** The owner's own instruction was *"just tell them what
we have done"* — and a diagram is the most compressed possible way to tell someone
what a system does. It replaces paragraphs rather than adding to them. They are inline
SVG: **zero JS, zero runtime dependency, zero byte-budget row**. And deployment-platform
and GameZone are precisely the two projects with no demo and no screenshots, so
without the diagrams they are prose and nothing else.

> ### Recommendation: **KEEP both diagrams. Cut the interaction affordances and the counts.**
>
> The diagrams are the payload; the index was the packaging. Specifically:
>
> 1. **Strip `data-node="…"` from every `<g>`** in both files. It is now inert markup.
> 2. **Strip `className="cursor-pointer hover:opacity-80 transition-opacity"`** from
>    every `<g>` in both files. Leaving a hover state and a pointer cursor on something
>    that no longer responds is a UX regression, not a leftover.
> 3. **Rewrite the count-bearing strings** — `GameZoneDiagram.tsx:15-27` (`<desc>`),
>    `:206` (`approximately 15 REST endpoints`), `:228` (`7 tables: …`). Replacement
>    text in § 5.
> 4. Keep every node label, every edge label, both `<title>`s, and the
>    `DeploymentPlatformDiagram` focal annotation *"success flips this. rollback flips
>    it back. / one UPDATE, zero downtime."* — that annotation **is** the surviving
>    claim, drawn.
>
> Net effect: ~566 diagram words drop to roughly 420, the a11y descriptions stay
> honest, and no one is invited to click something dead.
>
> **If the owner disagrees and wants the diagrams gone too**, deleting
> `src/diagrams/` and both `ProjectArticle` branches is clean — the only importer of
> each diagram is `ProjectArticle.tsx:7-8`. That would take `/` to roughly 750 words.
> Do not do this without the owner saying so.

## 4.3 Removing Pong from the descent

**Deletions and edits, all paths verified:**

| Path | Action |
|---|---|
| `src/content/projects/pong.ts` | **delete the file** |
| `src/content/projects/index.ts:5` | delete `import { pong } from './pong'` |
| `src/content/projects/index.ts:10` | `PROJECTS` becomes `[deploymentPlatform, proacademys, gamezone, switchboard]` — document order still equals depth order |
| `src/content/types.ts:24` | delete `\| { kind: 'playable'; game: 'pong' }` from `Presentation` |
| `src/content/types.ts:27` | slug union becomes `'deployment-platform' \| 'proacademys' \| 'gamezone' \| 'switchboard'` |
| `src/three/exhibit-state.tsx:21` | delete `\| 'pong'` from `ExhibitSlug` |
| `src/content/routes.ts:15` | delete the whole `/project/pong` row |
| `src/content/depth-table.ts` | **delete the `[0.640, -124.0]` control point** — 21 points become 20 |
| `src/components/ProjectArticle.tsx:11` | delete `import { GameMount }` |
| `src/components/ProjectArticle.tsx:88` | delete the `kind === 'playable'` branch |
| `src/components/DepthPalette.tsx:69` | delete `if (layer.id === 'engine' && p.slug === 'pong') return true;` |
| `src/components/ExhibitCard.tsx:80-83` | `isEngineCard` collapses to `isEngine ?? (derivedLayer === 'engine')`; the `'playable'` and `'pong'` clauses are dead |
| `src/components/ExhibitCard.tsx` disclosure block | delete the `isEngineCard &&` "Playing this starts an animation" paragraph, and the `isEngine` prop with it — no descent exhibit is playable any more |
| `src/three/layers/Engine.tsx` | remove the play volume — detail below |
| `scripts/assert-tier-parity.mjs:8` | delete `'Pong'` from `REQUIRED_PROJECTS` |
| `scripts/assert-tier-parity.mjs:32` | delete `'out/project/pong.html'` from `ROUTES` |
| `src/app/not-found.tsx:31-37` | replace the dead `/project/pong` link paragraph (§ 2.5) |

### `depth-table.ts` — why the control point goes

`[0.640, -124.0]` exists to give the Pong play volume the slowest segment on the site
(`docs/design-spec.md:82`). With no play volume there is nothing to dwell on, and a
control point that pins 100 vh of scroll to 4 m of travel is now just a stall. Removing
it leaves `[0.600, -120.0] → [0.690, -134.0]`, which stays **monotonic and
piecewise-linear** — the § 2.2 invariant holds. 20 points.

### `src/three/layers/Engine.tsx` — what comes out

| Lines | Action |
|---|---|
| `131-134` | delete `EngineProps` and the `pongGameQuad` seam |
| `137-188` | delete the `GameVolumeQuad` component (the `CanvasTexture` wrapper) |
| `199` | signature becomes `export function Engine()` |
| `203-204` | delete `playVolumeMatcapRef`, `playVolumeWireframeRef` |
| `279-298` | delete the `useLayoutEffect` that positions the volume at `y = -124` |
| `~385-391` | delete the `game-mount-pong-canvas` lookup, the `isPlaying` flag and its `state.invalidate()` |
| `~392-394` | the `PointLight` intensity line loses its `isPlaying` ternary → `intensity = 13.0` |
| `426-442` | delete both play-volume `<instancedMesh>` elements and the `<group position={[0, -124 - 0.79, 0]}>` quad |
| `243-249` | delete `openBoxGeo` / `openBoxWireframeGeo` **only if** unused after — **they are not**: `ghostGeometry` calls `createOpenBoxGeometry(1.6, 1.0, 1.6)` at `:327`. Keep `createOpenBoxGeometry`. Remove `openBoxGeo`/`openBoxWireframeGeo` and their `dispose()` calls, keep the function. |
| `192-197` | update the doc comment: frustum + 40 ghosts, no play volume |

**Invariants held:** exactly three lights, all `layers.enableAll()`; `PassThrough.tsx`
stays the sole `gl.render` caller; `depth.ts` untouched; `INTERIOR = 2` unchanged. Draw
calls at Engine go from 4 to 2.

`src/three/Scene.tsx:32` already renders `<Engine />` with no props. No change needed.

### The 404's Pong keeps working — confirmed

| Path | Depends on removed code? | Verdict |
|---|---|---|
| `src/engine/pong.ts` (335 lines) | no — `initPong` is standalone, imported dynamically | **survives untouched** |
| `src/engine/loop.ts` | no | **survives untouched** |
| `src/engine/loop.test.ts` (103 lines, 3 tests) | imports only `loop.ts` | **3 tests still pass** |
| `src/components/PlayEngine.ts` | `import type { PongInstance } from '@/engine/pong'` + `import('@/engine/pong')` | **survives untouched** |
| `src/components/GameTrigger.tsx` | `{ game: 'pong' }` is its **own** local prop type, not `Presentation` | **survives untouched** |
| `src/components/GameMount.tsx` | `GameMountProps = { game: 'pong' }` is likewise local | **survives**, one string edit (§ 5) |
| `src/components/NotFoundClient.tsx` | no imports from project content | **survives untouched** |
| `src/app/not-found.tsx` | `<GameMount game="pong" />` stays; only the `/project/pong` link paragraph changes | **survives**, one edit |

The critical check: **`GameMount` and `GameTrigger` do not consume
`Presentation['playable']`.** Both declare `game: 'pong'` inline. Narrowing the
`Presentation` union therefore cannot break the 404. Verified in
`GameMount.tsx:5-7` and `GameTrigger.tsx:5`.

## 4.4 **FLAGGED DECISION — what the Engine layer becomes**

Game Dev is one of the owner's four stated domains, and `-120 m` exists to hold it.
With Pong off the descent the layer has no exhibit. `docs/projects.md` states the
problem bluntly: *"NONE of the four repositories is genuinely a GAME DEV artifact …
the Game Dev domain currently has ZERO evidence across all local repositories."*

The layer is **not** deleted. Deleting it would drop a domain the owner claims, break
the four-layer concept, invalidate the depth table and the `LAYERS` array, and throw
away the frustum, the 40 collider ghosts and the fog band — all of which still render.

Inventing a game to fill it is off the table.

> ### Recommendation: **the Engine layer becomes a layer with no exhibit and one honest sentence.**
>
> Keep: the wireframe frustum at `y = -150`, the 40 instanced collider ghosts, the
> Engine fog band, the accent `#FF5F56`, the `-120 m` datum, `/layer/engine`, and the
> layer's OG image. Everything visual survives — only the play volume goes.
>
> Add nothing structural. `LayerSection` already renders `layer.thesis`
> (`LayerSection.tsx:42-44`), and `{children}` simply renders empty when no project
> has `layer: 'engine'`. **No new type field, no new component, no new prop.** The
> entire change is one string in `src/content/layers.ts:17`.
>
> **Replacement `layers.ts` engine thesis, verbatim:**
>
> ```
> 'This is where I started \u2014 a Pong I wrote in Canvas 2D to learn game dev, and a C++/SFML one and a Java one before it that I no longer have. The Pong still runs; it lives on the 404 page.'
> ```
>
> Every clause is grounded: the C++/SFML and Java originals and their loss are
> `docs/games.md` ("**NOT FOUND** on local disk", both entries); the Canvas 2D Pong is
> `src/engine/pong.ts` in this repo; "lives on the 404 page" is
> `src/app/not-found.tsx:29`. Nothing is invented.
>
> **Why this is the right answer rather than a cop-out:** it turns the layer's emptiness
> into the exact thing the owner asked for — *"i made this to learn game dev at
> starting"* — and it makes the 404 a reward rather than a dumping ground. A visitor
> who reads the Engine layer and later hits a 404 gets the payoff. That is a better
> use of the layer than a project article about a bounce angle.
>
> **The alternative, if the owner prefers:** promote `/layer/engine` to a
> deliberately terse layer with *no* thesis at all — just `ENGINE — Game` and the
> geometry, letting the descent speak. This is quieter but reads as an oversight, and
> it also empties the `/resume` layer card, which prints `layer.thesis`
> (`resume/page.tsx:96`). **Not recommended.**

---

# 5. Sitewide copy kill-list

Every string a visitor can read, outside the § 2 project copy (which is drafted there
in full). Line numbers are against HEAD `629d283`.

## 5.1 `src/content/site.ts`

| Line | Current string | Verdict | Replacement |
|---|---|---|---|
| 10 | `I wrote the thing that deploys the thing. Then I went further down.` | **keep** | — |
| 13-14 | `Four layers of the same stack: a deploy platform, a 37-table migration, two game engines, and a control plane for AI agents.` | **rewrite** | `Four layers of the same stack: a deploy platform, a rewrite of a client's e-learning site, a POS that runs a gaming cafe, and a control plane for AI agents.` |
| 17 | `B.Tech CSE, IIIT Naya Raipur. Scroll to descend — four layers, one shot.` | **keep** | — |
| 20-21 | `Malay Chaudhary, B.Tech CSE at IIIT Naya Raipur. A self-hosted PaaS, a MERN rewrite of a legacy platform, two game engines, and an agent switchboard.` | **rewrite** | `Malay Chaudhary, B.Tech CSE at IIIT Naya Raipur. A self-hosted PaaS, a MERN rewrite of a legacy platform, a cafe POS, and an agent switchboard.` (143 ch) |
| 24-25 | `Web, app, game, agent — four depths of one stack. Portfolio of Malay Chaudhary, told as a single uncut descent through the layers he builds on.` | **keep** | — the four domains are still four, and the Engine layer still stands |

> **`heroSub` is the "37 tables" pattern in its purest form** — a migration's table
> count used as a headline credential, on the first screen. It is also now factually
> stale: "two game engines" has been one since Pixel Quest was removed, and after this
> pass zero of them are on the descent. Both problems are fixed by the one rewrite.

## 5.2 `src/content/layers.ts`

| Line | Current string | Verdict | Replacement |
|---|---|---|---|
| 7 | `The layer everyone sees is the one with the least of my code in it — and the most of other people's.` | **keep** | — good, and true |
| 12 | `Software that has to run on a Windows 7 machine with a spinning disk is a harder constraint than any framework I've ever picked.` | **keep** | — the best line on the site |
| 17 | `Everything above this is a frame that can afford to be late. Down here it can't.` | **rewrite** | `This is where I started — a Pong I wrote in Canvas 2D to learn game dev, and a C++/SFML one and a Java one before it that I no longer have. The Pong still runs; it lives on the 404 page.` (§ 4.4) |
| 22 | `The layer that decides what the other three should do. It has no UI of its own — so I built one.` | **keep** | — |
| 27 | `''` (bedrock, empty) | **keep** | — |

The Engine line is rewritten not because it is bad writing, but because it is a boast
about frame budgets attached to a layer that no longer runs a frame loop.

## 5.3 `src/content/routes.ts`

| Line | Current `description` | Verdict | Replacement |
|---|---|---|---|
| 7 | `/` — uses `SITE.metaDescription` | **rewrite** via 5.1 | — |
| 8 | `Depth 0 m. A self-hosted PaaS and a MERN rewrite of a legacy e-learning platform.` | **keep** | — |
| 9 | `Depth −40 m. A gaming-cafe POS built for Windows 7 and a spinning disk.` | **keep** | — |
| 10 | `Depth −120 m. Canvas 2D Pong engine, playable in-page, on a fixed-timestep loop.` | **rewrite** | `Depth −120 m. Where I started: a Canvas 2D Pong written to learn game dev.` |
| 11 | `Depth −260 m. A real-time control switchboard for Oh My Pi subagents.` | **keep** | — |
| 12 | `Self-hosted PaaS: isolated Docker builds, MinIO buckets, atomic zero-downtime swaps.` | **keep** | — every clause is a surviving claim |
| 13 | `MERN rewrite of a PHP/Laravel e-learning platform. 37 MySQL tables to 20 collections.` | **rewrite** | `MERN rewrite of a PHP/Laravel e-learning platform, production data migration included.` |
| 14 | `Gaming-cafe POS and Capacitor 6 Android app, tuned for Windows 7 and a 5400 rpm disk.` | **rewrite** | `Gaming-cafe POS and Android app, tuned for Windows 7 and a spinning disk.` |
| 15 | `/project/pong` row, entire | **cut** | § 4.3 |
| 16 | `Real-time control plane for Oh My Pi subagents. Direct in-memory steering over WebSocket.` | **keep** | — |
| 17 | `Malay Chaudhary, B.Tech CSE at IIIT Naya Raipur.` | **keep** | — |
| 18 | `Résumé of Malay Chaudhary — B.Tech CSE, IIIT Naya Raipur.` | **keep** | — |

> **Line 14 is a factual defect, not just a length one.** `docs/projects.md` § 4 says
> "slow legacy spinning-disk HDDs" — it never states 5,400 rpm. `5400 rpm` is an
> invented specific. It must go regardless of this pass.

## 5.4 `src/app/page.tsx` (Bedrock block) and `src/app/about/page.tsx`

The same paragraph is duplicated in both files — `page.tsx:61-66` and
`about/page.tsx:21-26`. **Apply the identical rewrite in both.**

| Current | Verdict | Replacement |
|---|---|---|
| `Four domains, presented as four depths of one stack: a self-hosted PaaS and a MERN rewrite at the surface, a gaming-cafe POS on the device below it, a Canvas 2D engine below that, and a control plane for AI agents at the bottom. Each layer is causally responsible for the one above it, and the projects are the evidence.` | **rewrite** | `Four domains, four depths of one stack: a self-hosted PaaS and a client rewrite at the surface, a gaming-cafe POS below that, the games I learned on further down, and a control plane for AI agents at the bottom.` |

The cut clause — *"Each layer is causally responsible for the one above it, and the
projects are the evidence"* — is the thesis explaining itself. The descent already
demonstrates it; saying it out loud is the over-explaining.

| Line | Current string | Verdict |
|---|---|---|
| `page.tsx:50` | `−300 m · BEDROCK` | **keep** |
| `page.tsx:52` | `About` | **keep** |
| `page.tsx:59` | `Malay Chaudhary — B.Tech CSE, IIIT Naya Raipur.` | **keep** |

## 5.5 Exhibit card, detail panel, proxy nav

| File:line | Current string | Verdict | Replacement |
|---|---|---|---|
| `ExhibitCard.tsx:191` | `Open ⏎` | **keep** | — |
| `ExhibitCard.tsx:~186` | `aria-label={`Open ${derivedTitle}`}` | **keep** | — |
| `ExhibitCard.tsx:~216-219` | `Playing this starts an animation` | **cut** | no descent exhibit is playable (§ 4.3) |
| `exhibit-state.tsx:141-143` | `Exhibits (Scroll Order)` | **keep** | the single canonical tab stop's label |
| `exhibit-state.tsx:151` | `aria-label="Exhibits navigation"` | **keep** | — |
| `DetailPanel.tsx` | title/announcer strings come from `ROUTES` | **inherits 5.3** | — |
| `LinkRow.tsx` | labels come from project `links` | **inherits § 2** | — |

## 5.6 The 404

| File:line | Current string | Verdict | Replacement |
|---|---|---|---|
| `not-found.tsx:4` | `404 — Depth Not Found — Malay Chaudhary` | **keep** | — |
| `not-found.tsx:19` | `404 · NOT FOUND` | **keep** | — |
| `not-found.tsx:21` | `This depth does not exist.` | **keep** | — |
| `not-found.tsx:24` | `The requested path is not part of the stack.` | **cut** | redundant with the line above it |
| `not-found.tsx:31-37` | `Engine sourced from the [Pong project] at −120 m.` | **rewrite** | `I wrote this Pong when I was starting out, learning game dev. Hope you like it.` — and **delete the `<Link href="/project/pong">`**, which becomes a 404 inside a 404 |
| `NotFoundClient.tsx:15` | `Nothing is here. Playing Pong below is optional and never auto-starts.` | **keep** | reduced-motion disclosure; a11y, not padding |
| `NotFoundClient.tsx:16` | `Nothing is here. The engine from −120 m is, though.` | **keep** | still true — the Engine layer stands, the game came from there |
| `NotFoundClient.tsx:22, 42` | `Return to Surface` | **keep** | — |

`next/link` must be dropped from `not-found.tsx`'s imports **only if** no other `Link`
remains in the file; `NotFoundExitLink` supplies its own.

## 5.7 The playable board (404 only)

| File:line | Current string | Verdict | Replacement |
|---|---|---|---|
| `GameMount.tsx:11` | `Play Pong — 7 points wins. Enter to start.` | **keep** | the button label is an instruction, not a boast, and `docs/design-spec.md:409` pins it as the a11y affordance |
| `GameMount.tsx:47` | `PONG — FIXED TIMESTEP LOOP (60 HZ)` | **rewrite** | `PONG` |
| `GameMount.tsx:60` | `Exit (Esc)` | **keep** | — |
| `GameMount.tsx:70` | `aria-label="PONG game canvas. Press Enter to start playing."` | **keep** | — |
| `PlayEngine.ts:66` | `Pong active. Arrow keys to move. Escape to exit.` | **keep** | live-region a11y |
| `PlayEngine.ts:31` | `Pong exited. Controls returned to page.` | **keep** | live-region a11y |

> **`FIXED TIMESTEP LOOP (60 HZ)` is the "37 tables" pattern**, printed in a chrome bar
> above a Pong board. A fixed-timestep loop is how you write a game loop. Announcing it
> is exactly what the owner objected to.

## 5.8 Switchboard protocol table

| File:line | Current string | Verdict | Replacement |
|---|---|---|---|
| `ProtocolTable.tsx:8` | `ClientMessage · 5` | **rewrite** | `ClientMessage` |
| `ProtocolTable.tsx:15` | `ServerMessage · 7` | **rewrite** | `ServerMessage` |
| `ProtocolTable.tsx` rows | the 12 message names | **keep** | a taxonomy, and Switchboard's only artefact |
| `switchboard.ts:5-6` | `/** § 3.4: the 12 protocol message types are the node-field taxonomy AND, per the OQ3 deferral, the Reasoning exhibit in full. Order is protocol order. */` | **keep** | source comment, not visitor-facing |

## 5.9 Diagram strings (per the § 4.2 recommendation to keep the diagrams)

| File:line | Current string | Verdict | Replacement |
|---|---|---|---|
| `DeploymentPlatformDiagram.tsx:10` | `deployment-platform: one deploy, end to end` | **keep** | — |
| `DeploymentPlatformDiagram.tsx:11-…` | `<desc>` — "A git URL posts to the platform API, which enqueues a build on a BullMQ queue in Redis…" | **keep** | prose, no counts, and it is the a11y description of the image |
| `DeploymentPlatformDiagram.tsx:264` | `lockfile hash → cache hit → skip npm install` | **keep** | an edge label on a drawn path, not a claimed achievement |
| `DeploymentPlatformDiagram.tsx:300-305` | `success flips this. rollback flips it back. / one UPDATE, zero downtime.` | **keep** | the surviving claim, drawn |
| all `<g data-node="…">` and `cursor-pointer hover:opacity-80 transition-opacity` | **cut the attribute and the classes** | § 4.2 |
| `GameZoneDiagram.tsx:14` | `GameZone Architecture` | **keep** | — |
| `GameZoneDiagram.tsx:15-27` | `<desc>` containing `an Express API of roughly fifteen endpoints` and `a SQLite database of seven tables: stations, sessions, settings, activities, snacks, cafeteria_expenses and revenue_history` | **rewrite** | `Two clients — a Capacitor 6 Android app and a desktop browser — run the same Vite React bundle, which calls backend/server.js, an Express API reading and writing a SQLite database. SQLite is configured for a slow spinning disk on Windows 7 running Node v13.14.0: journal_mode WAL, synchronous NORMAL, temp_store MEMORY, cache_size -10000, and startup seeding wrapped in a single transaction. A separate strip shows the mid-session rollover rule: a station is occupied, a request to add-game arrives, the played overage is computed and deducted from the new activity's duration, and occupancy is never broken.` |
| `GameZoneDiagram.tsx:206` | `Express backend server exposing approximately 15 REST endpoints` | **rewrite** | `Express backend server for the POS` |
| `GameZoneDiagram.tsx:228` | `SQLite database storing 7 tables: stations, sessions, settings, activities, snacks, cafeteria_expenses, revenue_history` | **rewrite** | `SQLite database, tuned for a spinning disk` |
| `GameZoneDiagram.tsx:143, 165, 184, 261, 312, 331, 350, 369` | per-node `<desc>` strings | **keep** | one short factual clause each, no counts |

## 5.10 Keyboard help and contact

| File:line | Current string | Verdict |
|---|---|---|
| `KeyboardHelp.tsx:8` | `Tab — move through every exhibit in depth order` | **keep** |
| `KeyboardHelp.tsx:9` | `Cmd/Ctrl+K — jump to any layer or project by name` | **keep** |
| `KeyboardHelp.tsx:23` | `All of these are additive. The site is complete with Tab and Enter alone.` | **keep** — an accessibility guarantee, and short |
| `Contact.tsx` | email, GitHub, LinkedIn, résumé links | **keep** |
| `resume/page.tsx` | `Summary`, `Architecture & Layers`, `Projects & Technical Scope`, `Education`, `Bachelor of Technology in Computer Science and Engineering` | **keep** — a résumé is allowed to be a résumé; its project blocks shrink automatically because they read `PROJECTS` |

## 5.11 Remaining "37 tables" instances, flagged

Every basic engineering fact currently presented as an accomplishment:

1. `site.ts:13-14` — `a 37-table migration` in the hero sub-line. **Worst offender.**
2. `routes.ts:13` — `37 MySQL tables to 20 collections`.
3. `proacademys.ts` — `migration: 37 MySQL tables → 20 Mongoose collections`.
4. `proacademys.ts` — the four-tier-decoupling / CRUD-factory decision.
5. `proacademys.ts` — `files ~100+`, `LOC ~8,500`, `REST endpoints ~30`.
6. `deployment-platform.ts` — `workspace packages 7`, `source files ~25 JS/JSX`, `LOC ~2,200`, `Postgres tables 4`, `REST endpoints 10`.
7. `gamezone.ts` — `source files ~30`, `LOC ~3,500`, `SQLite tables 7`, `REST endpoints ~15`, `Android package com.gamezone.app`.
8. `switchboard.ts` — `source files ~15`, `LOC ~1,800`, `database tables 0`, `protocol: 5 client / 7 server`.
9. `pong.ts` — `LOC 305`, `entry`, `resolution`, `assets`, `win` (whole file deleted).
10. `GameMount.tsx:47` — `FIXED TIMESTEP LOOP (60 HZ)`.
11. `ProtocolTable.tsx:8, 15` — `· 5`, `· 7`.
12. `GameZoneDiagram.tsx:15-27, 206, 228` — `fifteen endpoints`, `seven tables`.
13. `DiagramNodeIndex.tsx:15` — `Architecture Node Index · N Nodes` (file deleted).
14. `ProjectArticle.tsx:21` — `Trace Replay · {steps.length} Steps` (unreachable: `SWITCHBOARD_TRACE` is `null` and stays `null`; the `TraceStepList` seam is retained per the frozen invariant, so **no action** — just noted so nobody reintroduces it).

**Every `scale` array on the site becomes `[]`.** Once all five are empty,
`src/components/ScaleStats.tsx` renders an empty `<dl>` on every project.
**Delete `ScaleStats.tsx`, its import at `ProjectArticle.tsx:4`, its call at
`ProjectArticle.tsx:67`, and the `scale` field from the `Project` type
(`types.ts:36`)**, plus the block that renders it in `resume/page.tsx:111-119`. Leaving
an empty component behind is dead flexibility.

## 5.12 Visit telemetry — assessed separately

The owner asked for this feature explicitly. It is also 15 rows, ~143 rendered words,
duplicated between a static server fallback (`ProjectArticle.tsx:92-107`) and the live
client render (`VisitReadout.tsx` reading `src/lib/visit.ts`).

**Recommendation: keep the feature, cut it from 15 rows to 9.**

The rows split cleanly into two kinds. Some measure *this descent* — how much it cost
you, how fast it ran, how deep you went. Those are the point. The rest print browser
trivia that any website could print and that says nothing about this one.

**Keep (9):**

| Row | Why |
|---|---|
| `tier` | decides whether Three.js ships at all |
| `reduced motion` | changes what the site does |
| `first paint` | this page's cost |
| `largest paint` | this page's cost |
| `document` | this page's cost |
| `3D chunk` | the deferred payload, and the low-tier row reads `3D chunk never fetched — low tier ships zero bytes of Three.js`, which is the whole tier argument in one line |
| `total page fetch` | the honest total |
| `frame mean` | the descent's actual frame budget |
| `layers crossed` | how far you actually went — unique to this site |

**Cut (6):** `cores`, `device memory`, `pixel ratio`, `viewport / pointer`,
`save-data`, `this reading`.

`this reading` (`performance.now()`) is cut with the trivia: it is a timestamp of the
render, not a measurement of the site.

**Mechanics.** Delete the six `MetricRow` builders and their `SERVER_SNAPSHOT` entries
in `src/lib/visit.ts`, delete the six entries from `SERVER_SNAPSHOT.rows`, delete the
six keys from the `VisitSnapshot` interface, and delete the matching six rows from the
static fallback array in `ProjectArticle.tsx:92-107`. **The two lists must stay in
lockstep** — they are the same table rendered twice, and `scripts/assert-tier-parity.mjs`
compares rendered text across tiers.

Keep verbatim: the heading `This Visit Telemetry · Live Browser Measurements`, the
server-fallback heading `This Visit Telemetry · Server Fallback`, the `Re-read` button,
and the closing line `Every number above was measured in your browser on this page
load.` That last line is the honest claim the whole block exists to make.

Net: ~143 words → ~90.

---

# 6. Consequences and risk

## 6.1 Routes and `generateStaticParams`

- `src/app/project/[slug]/page.tsx:7` returns `PROJECTS.map(p => ({ slug: p.slug }))`.
  With `pong` gone from `PROJECTS`, `/project/pong` stops being generated. **No edit to
  this file is required** — it is derived. Same for
  `src/app/project/[slug]/opengraph-image.tsx:17`.
- `src/app/layer/[slug]/page.tsx:7` filters `LAYERS` and is **untouched** — the Engine
  layer stays, so `/layer/engine` stays.
- `notFound()` at `project/[slug]/page.tsx:19` now fires for `/project/pong`, which is
  correct: an old deep link lands on the 404 — and gets the Pong. That is a good
  accident, not a regression.
- **Static output:** `out/project/pong.html` and its OG PNG stop being emitted. Any
  per-path route count in `next build` falls by exactly two; a per-entry count is
  unchanged at 11 app entries. **No gate asserts on the route count** — the only
  hardcoded route list is `scripts/assert-tier-parity.mjs:22-34`, which § 4.3 updates.

## 6.2 Sitemap

`src/app/sitemap.ts:8` maps `ROUTES` one-to-one. Deleting the `/project/pong` row takes
`out/sitemap.xml` from **12 URLs to 11**. Nothing else generates sitemap entries.

## 6.3 Deep links and depths

| Deep link | Before | After |
|---|---|---|
| `/project/deployment-platform` | `y = -2` | unchanged |
| `/project/proacademys` | `y = -8` | unchanged |
| `/project/gamezone` | `y = -52` | unchanged |
| `/project/pong` | `y = -124` | **gone** → 404 |
| `/project/switchboard` | `y = -278` | unchanged |
| `/layer/engine` | `y = -120` | unchanged — the datum is a `LAYERS` entry, not a project |

`DetailPanel.tsx:33-40` resolves a cold deep link through `projectBySlug`, which now
returns `undefined` for `pong`, so no panel opens. `DetailPanel.tsx:~236` looks up
`ROUTES.find(r => r.openPanel === openSlug)` — also safely absent. **No guard needs
adding; both paths already handle a miss.**

## 6.4 The exhibit slug union and `depth-table.ts`

- `Project['slug']` (`types.ts:27`) and `ExhibitSlug`
  (`three/exhibit-state.tsx:17-22`) are **two hand-maintained unions of the same set**.
  Both must lose `'pong'` in the same change or `tsc` fails. This is the most likely
  place to break the build.
- `DEPTH_TABLE` loses `[0.640, -124.0]`: 21 → 20 points, still monotonic in `t` and in
  `y`. `src/three/depth.ts` is a generic piecewise interpolator over the array and needs
  **no edit** — confirm before assuming, but do not modify it (§ 7).
- `PaletteKey` / `DepthPalette` receive `{slug, title, depth}` derived from `PROJECTS`
  (`page.tsx:29-33`), so they shrink automatically; only the hardcoded
  `DepthPalette.tsx:69` engine→pong mapping needs deleting.

## 6.5 `ProjectArticle`'s presentation-kind switch

Before: `screenshots | diagram | node-field | playable` — four branches.
After: `links | diagram | node-field` — three, and `links` renders nothing.

Removing two union members while a `switch`-style chain still references them is a
compile error, so **`types.ts` and `ProjectArticle.tsx` must land in the same commit**
(§ 7). `ExhibitCard.tsx:33` types `presentationKind` as `Presentation['kind']` and keeps
compiling; its `derivedKind === 'playable'` comparison becomes a type error once the
member is gone, which is why § 4.3 removes that clause.

## 6.6 OG image generation

`project/[slug]/opengraph-image.tsx` renders `project.title`, `project.depth` and
`project.thesis` only. It touches neither `scale` nor `decisions` nor `presentation`.
**Rewriting the theses changes the OG images' text; nothing breaks.** The Pong OG image
disappears with its route. `layer/[slug]/opengraph-image.tsx` is unaffected structurally
but will pick up the new Engine thesis if it renders one — verify visually after build.

## 6.7 `scripts/assert-tier-parity.mjs`

Two edits, both listed in § 4.3: drop `'Pong'` from `REQUIRED_PROJECTS:8` and
`'out/project/pong.html'` from `ROUTES:32`. **If either is missed the gate exits 1** —
it `process.exit(1)`s on a missing route file and on a missing project name.

The script also asserts each route's extracted text is `>= 100` chars. Post-cut, the
smallest descent route is ~1,100 words. No risk.

`REQUIRED_PHRASES` includes `'ENGINE'`, which `LayerSection` still renders from
`LAYERS`. Safe — **and this is precisely why the Engine layer must not be deleted.**

## 6.8 The three engine tests

`src/engine/loop.test.ts` (103 lines, 3 tests) imports only `src/engine/loop.ts`.
Neither file is touched by any edit in this plan. **The 3 tests pass unchanged.**
Confirm by running `npx vitest run src/engine/loop.test.ts` after the pass.

## 6.9 Byte budgets

**No budget row may be raised, lowered, or deleted.** `scripts/measure-budget.mjs:36-41`
keeps `initialRoute 180 KB`, `deferred3D 250 KB`, `fullDescent 430 KB`, `fontEach 28 KB`.
**Do not edit that file.**

| Row | Now | Expected after | Why |
|---|---|---|---|
| initial route | 145.8 / 180 | **−1 to −4 KB** | `ProjectArticle` statically imports `GameMount` (`:11`), which pulls `GameTrigger` into the descent chunk today. Both leave. `DiagramNodeLink` (the only `'use client'` component in the node-index group) leaves. `ShotGallery` and `ScaleStats` are server components, so they cut HTML rather than JS. |
| deferred 3D | 241.4 / 250 | **−0.3 to −1 KB** | `Engine.tsx` loses `GameVolumeQuad`, the `CanvasTexture` play-volume path, two `instancedMesh` elements and the `WireframeGeometry` import. |
| full descent | 410.1 / 430 | **−1 to −4 KB** | tracks the initial route down. `PlayEngine` and `engine/pong` stay `import()`ed at runtime from the 404, so they stay in the unreferenced set and stay counted — the same accounting `docs/creative-pass.md:478-484` describes. |
| fonts | 20.5, 18.0 / 28 | **unchanged** | this pass adds no glyph. **Do not re-run `scripts/subset-fonts.sh`.** |

**Can any row regress?** Only by adding code. This pass adds **zero** new components,
zero new dependencies, and zero new types beyond replacing two `Presentation` members
with one. Every row can only fall or hold. **If a row rises, something was added that
this plan did not authorise — stop and report it.**

Not measured by the gate but worth stating: `public/shots/proacademys/` is **440 KB**
of static images leaving the repository, and the rendered homepage HTML loses roughly
1,850 words.

## 6.10 Docs falsified by this pass — deviation notes required

| Doc | Line(s) | What is now false |
|---|---|---|
| `docs/design-spec.md` | 22 | table row `−120 m \| Engine \| Game \| Pong, Pixel Quest (both playable in-page)` — the Engine layer now has no in-page exhibit |
| `docs/design-spec.md` | 82 | depth-table row `0.640 \| −124.0 \| Pong play volume (slowest segment on the site)` — control point removed |
| `docs/design-spec.md` | 113 | `Two play volumes: open-topped boxes at y = −124 (Pong) and y = −134 (Pixel Quest)` — both gone |
| `docs/design-spec.md` | 252-257 | the "Resident: Pong" block, including `305 LOC`, `640 × 400`, the deflection maths, and `Playable in-page. This is mandatory` — no longer mandatory, no longer in-page |
| `docs/design-spec.md` | 264 | the before/after fixed-timestep code pair as "exhibit copy at this layer" — cut |
| `docs/design-spec.md` | 382-383 | `Pong: ball.x, ball.y, playerY, aiY` interpolation note — still true of `engine/pong.ts`, but no longer descent copy |
| `docs/design-spec.md` | 421 | `Pong: playable` mobile-touch story — still true on the 404, must be re-scoped |
| `docs/design-spec.md` | 614 | tier-parity paragraph naming Pong as descent content |
| `docs/design-spec.md` | 677 | deep-link table row `/project/pong \| Engine depth y = −124, panel open` |
| `docs/design-spec.md` | 685 | the 2026-09-09 deviation note "Pong remains as the sole playable game in the Engine layer" — superseded |
| `docs/design-spec.md` | 766, 799-800 | verified-facts row 12 (Pong engine facts) and the chosen hero sub-line rationale built on "37 MySQL tables" and "`pong.js` + `rpg.js`" |
| `docs/design-spec.md` | § 4.2 | "A shot with no claim is cut" — the whole screenshot presentation mode is cut |
| `docs/implementation-plan.md` | 135, 168, 879, 887, 1031-1061 | `projects/pong.ts` creation task and its verbatim source block |
| `docs/implementation-plan.md` | 650-654 | the `Presentation` union and slug union as specified |
| `docs/creative-pass.md` | 28-30 | presentation-mode inventory naming screenshots and playable |
| `docs/creative-pass.md` | 397-495 | Feature 3, "The 404 page is a playable Pong" — still accurate, but line 429 (`One line naming where the engine comes from, linking /project/pong`) is now wrong |
| `docs/creative-pass.md` | 527-528 | the depth ladder listing `−124 m Pong` |
| `docs/creative-pass.md` | 698 | workstream A2, which owns `snippets.ts`, `DiagramNodeIndex.tsx`, `DiagramNodeLink.tsx` — all deleted |
| `docs/games.md` | 135 | deviation note "Pong remains as the sole playable Canvas 2D engine in the portfolio" — still true of the *repo*, now false of the *descent* |

**Add one dated deviation note per doc, at the point of the falsified claim.** Do not
rewrite the specs; they are the historical record of why the site was built this way.
The note is the correction. `docs/games.md` and `docs/projects.md` are **fact sources
and are not edited at all** — every fact in them remains true; the site simply stops
printing some of them.

---

# 7. Execution plan

## 7.1 Consumed by all, modified by none

**`src/lib/store.ts`, `src/three/depth.ts`, `src/three/PassThrough.tsx`,
`src/three/Rig.tsx`, `scripts/measure-budget.mjs`.**

Also read-only for this pass: `docs/projects.md`, `docs/games.md`, `src/engine/pong.ts`,
`src/engine/loop.ts`, `src/engine/loop.test.ts`, `src/components/PlayEngine.ts`,
`src/components/GameTrigger.tsx`.

Frozen invariants that no agent may touch: one scroll subscription published by `Rig`
into `store`; `PassThrough` at `renderPriority: 1` as sole `gl.render` caller;
`depth.ts` as the only depth mapping; three lights, all `layers.enableAll()`;
`EXTERIOR = 1` / `INTERIOR = 2`; `SWITCHBOARD_TRACE` stays `null`;
`ExhibitProxyNav` stays the single canonical tab stop; `ExhibitCard` stays
`tabIndex={-1}`; the detail panel stays a real modal dialog; low tier ships zero
Three.js.

## 7.2 Contended files — serialize, do not fan out

Three files are touched by more than one concern and **must be edited by a single agent
in a single pass**, before anything downstream runs:

| File | Concerns landing in it |
|---|---|
| `src/content/types.ts` | delete `Shot`; delete `screenshots` member; add `links` member; delete `playable` member; narrow the slug union; make `Decision.evidence` optional; delete the `scale` field |
| `src/components/ProjectArticle.tsx` | drop 4 imports (`ShotGallery`, `ScaleStats`, `DiagramNodeIndex`, `DiagramNodeLink`, `GameMount`); rewrite the presentation chain; drop the `<ScaleStats>` call; trim 6 telemetry fallback rows |
| `src/content/projects/index.ts` | drop the `pong` import and array entry |

## 7.3 Waves

**Wave 0 — serialized, one agent, one commit. Nothing else runs until it lands.**

- `src/content/types.ts`
- `src/content/projects/index.ts`
- `src/content/projects/pong.ts` (delete)
- `src/components/ProjectArticle.tsx`
- `src/three/exhibit-state.tsx` (the `ExhibitSlug` union only)

Reason: every other wave depends on the shape of `Project` and `Presentation`. Doing
this first means the rest is mechanical. `tsc` will be red between the first and last
edit of this wave; that is expected and is why it is one commit.

**Wave 1 — four disjoint agents in parallel.**

| Agent | Owns | Nothing else touches these |
|---|---|---|
| **W1-content** | `src/content/projects/deployment-platform.ts`, `proacademys.ts`, `gamezone.ts`, `switchboard.ts`, `src/content/site.ts`, `src/content/layers.ts`, `src/content/routes.ts`, `src/content/depth-table.ts` | ✅ |
| **W1-nodeindex** | delete `src/components/DiagramNodeIndex.tsx`, `src/components/DiagramNodeLink.tsx`, `src/content/snippets.ts`; edit `src/diagrams/DeploymentPlatformDiagram.tsx`, `src/diagrams/GameZoneDiagram.tsx` | ✅ |
| **W1-three** | `src/three/layers/Engine.tsx` | ✅ |
| **W1-shots** | delete `src/components/ShotGallery.tsx`, `src/components/ScaleStats.tsx`, `public/shots/proacademys/` (16 files) | ✅ |

> W1-content owns `proacademys.ts` including its `presentation: { kind: 'links' }`
> field; W1-shots only deletes files. They do not collide.

**Wave 2 — three disjoint agents in parallel, after Wave 1.**

| Agent | Owns |
|---|---|
| **W2-ui** | `src/components/ExhibitCard.tsx`, `src/components/DepthPalette.tsx`, `src/components/ProtocolTable.tsx`, `src/components/GameMount.tsx` (one string) |
| **W2-404** | `src/app/not-found.tsx` |
| **W2-telemetry** | `src/lib/visit.ts` — **must mirror the six rows W0 already removed from `ProjectArticle.tsx`'s fallback.** Give this agent the exact keep/cut list from § 5.12; it has no freedom here. |

**Wave 3 — two disjoint agents, after Wave 2.**

| Agent | Owns |
|---|---|
| **W3-pages** | `src/app/page.tsx` (Bedrock paragraph), `src/app/about/page.tsx` (same paragraph), `src/app/resume/page.tsx` (delete the `scale` grid block) |
| **W3-scripts-docs** | `scripts/assert-tier-parity.mjs`, and the deviation notes in `docs/design-spec.md`, `docs/implementation-plan.md`, `docs/creative-pass.md`, `docs/games.md` |

**Wave 4 — verification, main session only, not delegated.**

1. `npx tsc --noEmit` — clean.
2. `npx vitest run src/engine/loop.test.ts` — 3 pass.
3. `npx next build` — green.
4. `node scripts/assert-tier-parity.mjs` — exits 0.
5. `node scripts/measure-budget.mjs` — exits 0, every row at or below its unchanged
   limit, and **every row at or below its current value**.
6. `out/sitemap.xml` — 11 URLs.
7. Load `/404` and play Pong to a point with the keyboard; `Escape` and `Tab` both
   release focus correctly.
8. Load `/layer/engine` and confirm the layer renders its heading, datum and new
   thesis with no exhibit and no empty-container artefact.
9. Re-run the word count from § 1 against `out/index.html` and confirm it landed in
   the 1,100–1,200 band.
10. Accessibility audit still 100.

## 7.4 Order dependency, stated once

```
W0 (serialized)
  └─> W1-content ─┐
      W1-nodeindex ├─> W2-ui ─┐
      W1-three     │   W2-404  ├─> W3-pages ─┐
      W1-shots ────┘   W2-telemetry ─┘  W3-scripts-docs ─┴─> W4 verify
```

---

# 8. What must NOT be cut

Guard against over-correction. An agent trimming aggressively will be tempted by every
item below. **None of them is padding.**

## 8.1 The concept

- **The 900 vh descent.** `min-h-[900vh]` at `src/app/page.tsx:35`. Scroll length is not
  word count. Do not shorten it "for consistency with the copy cut".
- **The four layers and their datums** — `0`, `-40`, `-120`, `-260`, floor `-300`.
  Including the Engine layer, which keeps its datum, its accent, its route, its OG
  image and its geometry (§ 4.4).
- **The depth table** as a monotonic piecewise-linear mapping. One control point is
  removed with the play volume it existed for. **No other point may move.**
- **`src/three/depth.ts` as the only depth mapping. `src/three/Rig.tsx` as the only
  scroll publisher. `src/lib/store.ts` as the only store.**

## 8.2 The mechanics

- **The pass-through render trick** — `src/three/PassThrough.tsx` at
  `renderPriority: 1`, sole `gl.render` caller, `EXTERIOR = 1` / `INTERIOR = 2`. It is
  the single most unusual thing on the site and is not content.
- **The three lights, all `layers.enableAll()`.**
- **The Engine layer's frustum and its 40 instanced collider ghosts.** They are one
  draw call each and they are what makes `-120 m` look like anything. Only the play
  volume goes.
- **The low tier shipping zero Three.js**, and the tier-parity assertion that proves
  the DOM text is identical across tiers.

## 8.3 Accessibility — cut nothing here

- `ExhibitProxyNav` as the **single canonical tab stop**, in depth order, `sr-only` +
  `focus-within:not-sr-only` — never `display:none`, never `aria-hidden`.
- `ExhibitCard` at `tabIndex={-1}`.
- `DetailPanel` as a real modal dialog: focus trap, `Escape`, `inert` on background,
  focus return to the exact trigger, live-region title announcement.
- Reduced motion as a first-class path, everywhere it branches.
- Every `aria-live` string in `PlayEngine.ts` and `GameMount.tsx`.
- The reduced-motion 404 line *"Playing Pong below is optional and never
  auto-starts."*
- `KeyboardHelp`'s closing line *"All of these are additive. The site is complete with
  Tab and Enter alone."*
- Every SVG `<title>` and `<desc>` in both diagrams. § 5.9 **rewrites two of them and
  deletes none.** A diagram without a `<desc>` is an image with no alt text.

> The one a11y-adjacent string this pass **does** remove is `ExhibitCard`'s "Playing
> this starts an animation". It is removed because the thing it discloses no longer
> exists on the descent. The 404's board keeps its own disclosure, its own button
> label and its own live region.

## 8.4 The honest telemetry

The feature stays. It is trimmed 15 → 9 (§ 5.12), never deleted. Specifically keep the
`3D chunk` row's low-tier value — *"3D chunk never fetched — low tier ships zero bytes
of Three.js"* — and the closing line *"Every number above was measured in your browser
on this page load."*

## 8.5 The claims that earned their place

These five sentences are the reason the site is worth reading. **Do not shorten them
further, do not strip their file paths, do not "make them consistent" with the shorter
paragraphs around them.**

1. **SQLite tuned for the hardware it runs on** — WAL, `synchronous = NORMAL`,
   `temp_store = MEMORY`, `cache_size = -10000`, seeding in one transaction, because
   the machine is Windows 7 on a spinning disk running Node v13.14.0.
   (`gamezone.ts`, evidence `backend/database.js`.)
2. **The atomic single-`UPDATE` deploy swap with zero-downtime rollback in both
   directions.** (`deployment-platform.ts`, evidence `apps/proxy/src/index.js`, and the
   drawn annotation in `DeploymentPlatformDiagram.tsx:300-305`.)
3. **scrypt + HMAC-SHA256 session cookies written against `node:crypto` with no auth
   dependency and no session store.** (`deployment-platform.ts`, evidence
   `apps/api/src/auth.js`.)
4. **The `SameSite` cookie failure across Vercel and Render, and the same-origin
   rewrite that fixed it.** (`proacademys.ts`, evidence `client/vercel.json`.)
5. **Direct in-memory `.steer()` on a live `AgentSession`, bypassing the orchestrator,
   plus swapping a running session's model mid-conversation.**
   (`switchboard.ts`, evidence `server/agent-manager.ts`.)

Plus the production-data migration with its count-parity check — the *risk taken*, not
the table count.

## 8.6 The frozen contract

- **No budget row may be raised, lowered, or deleted.** `measure-budget.mjs` is
  read-only.
- **The closed 10-token palette**, Satoshi + JetBrains Mono, no `box-shadow`, no
  `backdrop-filter`.
- **`SWITCHBOARD_TRACE` stays `null`** and `TraceStepList` stays as the drop-in seam.
- **No new runtime dependency.**
- **Nothing may be fabricated.** Removing a claim is always allowed. Replacing one with
  an invented substitute never is. If a rewrite in this document cannot be traced to
  `docs/projects.md`, `docs/games.md`, or code in this repository, **do not ship it —
  report it.**
