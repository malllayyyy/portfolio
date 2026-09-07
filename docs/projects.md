# Project Inventory & Technical Specs

Verified inventory of Malay Chaudhary's four local software projects, extracted directly from codebase entrypoints, configuration files, database schemas, and migration runbooks.

---

## 1. deployment-platform

- **Project Name**: `deployment-platform` (Workspace packages: `@platform/api`, `@platform/worker`, `@platform/proxy`, `@platform/dashboard`, `@platform/db`, `@platform/shared`, `@platform/storage`)
- **What it Actually Does**: A self-hosted PaaS (Netlify/Vercel alternative) that receives git repository URLs, builds static web applications inside throwaway isolated Docker sandbox containers, uploads static assets to MinIO S3 object storage (or supervises long-lived Node.js services), and dynamically routes custom subdomains to versioned deployment buckets with instant zero-downtime rollbacks and real-time Socket.IO build log streaming.
- **Dependency Versions (from package.json files)**:
  - Root `package.json`: `socket.io-client`: `^4.7.5`
  - `@platform/api`: `express`: `^4.19.2`, `cors`: `^2.8.5`, `bullmq`: `^5.12.0`, `socket.io`: `^4.7.5`, `@platform/db`: `*`, `@platform/shared`: `*`, `@platform/worker`: `*`
  - `@platform/worker`: `bullmq`: `^5.12.0`, `@platform/db`: `*`, `@platform/shared`: `*`, `@platform/storage`: `*`
  - `@platform/proxy`: `@platform/db`: `*`, `@platform/storage`: `*`
  - `@platform/dashboard`: `react`: `^18.3.1`, `react-dom`: `^18.3.1`, `@react-three/fiber`: `^8.18.0`, `@react-three/drei`: `^9.122.0`, `three`: `^0.185.1`, `gsap`: `^3.15.0`, `@gsap/react`: `^2.1.2`, `socket.io-client`: `^4.7.5`, `vite`: `^5.4.0` (dev), `@vitejs/plugin-react`: `^4.3.1` (dev)
  - `@platform/db`: `pg`: `^8.11.5`
  - `@platform/shared`: `ioredis`: `^5.4.1`
  - `@platform/storage`: `minio`: `^8.0.5`, `mime-types`: `^2.1.35`
- **Monorepo / App Structure**:
  - `apps/api/`: Express REST API managing auth (`/auth/*`), deployment triggering (`POST /deploy`), project metadata (`/projects`), build logs (`/deployments/:id/logs`), and Socket.IO log relay.
  - `apps/worker/`: BullMQ queue worker executing containerized builds (`apps/worker/src/build.js`) and long-lived service container monitoring (`apps/worker/src/service-monitor.js`).
  - `apps/proxy/`: Dynamic Node.js HTTP proxy (`apps/proxy/src/index.js`) looking up subdomains against PostgreSQL (`projects.current_deployment_id`) and streaming files from MinIO.
  - `apps/dashboard/`: React (Vite) single-page frontend featuring 3D Three.js hero login/celebration scenes (`apps/dashboard/src/three/`), GSAP animated log viewer, project details, build logs, and rollback controls.
  - `packages/db/`: PostgreSQL database schema (`schema.sql`), client pool, queries (`users.js`, `projects.js`, `logs.js`), and migration runner (`migrate.js`).
  - `packages/shared/`: Redis connection factory (`createRedisConnection`) and BullMQ queue/channel naming constants (`BUILD_QUEUE_NAME`, `buildLogChannel`).
  - `packages/storage/`: MinIO S3 wrapper for bucket creation, object uploads, and streaming reads (`client.js`, `upload.js`, `get.js`).
  - `infra/`: `infra/docker-compose.yml` (Postgres, Redis, MinIO) and `infra/docker/Dockerfile.build-sandbox` + `build.sh`.
  - `scripts/`: Manual CLI tools (`upload-site.js`, `watch-logs.js`).
  - `fixtures/`: Sample test web apps (`fixtures/sample-site`).
- **Genuinely Interesting Engineering Decision (with file paths as evidence)**:
  1. *Containerized Build Isolation & Lockfile Caching*: `infra/docker/build.sh` & `apps/worker/src/build.js` — builds execute inside an isolated throwaway Docker sandbox container (`platform-build-sandbox`). `build.sh` hashes the lockfile (`package-lock.json`/`yarn.lock`/`pnpm-lock.yaml`) against a host bind-mounted cache directory to restore `node_modules` and skip `npm install` on hit.
  2. *Zero-Downtime Atomic Swaps & MinIO Dynamic Proxying*: `apps/proxy/src/index.js` — proxy resolves incoming `<subdomain>.yourdomain.com` host headers by querying Postgres for `projects.current_deployment_id -> deployments.bucket_path` per request. Redeploys compile to isolated MinIO bucket paths (`<project>/<deploymentId>`); `current_deployment_id` updates only after build success. Instant rollbacks update `current_deployment_id` in a single SQL operation.
  3. *Memory-Hard Auth without External Session Dependencies*: `apps/api/src/auth.js` — implements scrypt password hashing and HMAC-SHA256 signed base64url stateless session cookies using Node's native `node:crypto` standard library module.
- **Rough Scale Signals**:
  - File count: ~25 source JS/JSX files
  - LOC estimate: ~2,200 LOC
  - DB Models / Tables: 4 PostgreSQL tables (`users`, `projects`, `deployments`, `build_logs`)
  - API Routes: 10 endpoints (`POST /auth/register`, `POST /auth/login`, `POST /auth/logout`, `GET /auth/me`, `GET /projects`, `POST /deploy`, `GET /projects/:id/deployments`, `PUT /projects/:id/env`, `POST /deployments/:id/rollback`, `GET /deployments/:id/logs`)
- **README / Media Assets**: None found in repo.
- **Deployed & Repo URLs**:
  - Deployed: `http://<project>.localhost:8080` (local dynamic proxy), `http://localhost:5173` (dashboard)
  - Repo URL: `malllayyyy/deployment-platform`
- **Domain**: **Web Dev** (PaaS cloud infrastructure, fullstack web app, monorepo architecture, container orchestration).

---

## 2. switchboard

- **Project Name**: `switchboard`
- **What it Actually Does**: Real-time control switchboard and tactical IDE dashboard for Oh My Pi (`@oh-my-pi/pi-coding-agent`) subagents, permitting direct subagent steering, live in-memory model swapping, session history browsing, and visual roster tracking over WebSockets without orchestrator overhead.
- **Dependency Versions (from package.json files)**:
  - `package.json`: `@oh-my-pi/pi-coding-agent`: `latest`, `express`: `^4.21.0`, `ws`: `^8.18.0`, `react`: `^18.3.1`, `react-dom`: `^18.3.1`, `gsap`: `^3.15.0`, `@gsap/react`: `^2.1.2`
  - DevDependencies: `typescript`: `^5.5.4`, `vite`: `^5.4.3`, `vitest`: `^2.1.1`, `@vitejs/plugin-react`: `^4.3.1`, `@types/express`: `^4.17.21`, `@types/ws`: `^8.5.12`, `@types/react`: `^18.3.5`, `@types/react-dom`: `^18.3.0`
- **Monorepo / App Structure**:
  - `server/`: Bun + Express + WebSocket backend (`server/index.ts`, `server/agent-manager.ts`). Embeds the `@oh-my-pi/pi-coding-agent` SDK directly in-process.
  - `client/`: React 18 + Vite + GSAP frontend (`client/src/App.tsx`, `AgentGraph.tsx`, `SessionBrowser.tsx`, `StatusBar.tsx`, `MessageView.tsx`).
  - `shared/`: TypeScript WebSocket message protocol definitions (`shared/protocol.ts`).
  - `docs/superpowers/specs/`: Architecture and UI/UX specs (`2026-09-02-switchboard-design.md`, `2026-09-06-dashboard-uiux-design.md`, `2026-09-06-graph-primary-redesign.md`, etc.).
- **Genuinely Interesting Engineering Decision (with file paths as evidence)**:
  1. *Direct In-Memory Subagent Steering*: `server/index.ts` & `server/agent-manager.ts` — instead of routing subagent prompts through the main orchestrator session (which wastes tokens and latency), Switchboard holds live `AgentSession` references in Bun process memory via `AgentRegistry.global()`. Direct prompts to subagent cards call `.steer()` or `.prompt()` on the target subagent session object directly, completely bypassing orchestrator turns.
  2. *Live In-Flight Model Swapping*: `server/agent-manager.ts` & `shared/protocol.ts` — dynamically updates `AgentSession.setModel()` on active subagent sessions mid-conversation over WebSockets without file edits or session restarts.
  3. *Hydration & Resync of Persisted Subagent Rosters*: `server/agent-manager.ts` — periodically invokes `registerPersistedSubagents` and `ensurePersistedRoster` against OMP's `~/.omp/agent/sessions/*.jsonl` files to keep background/parked subagent states synchronized across app restarts.
- **Rough Scale Signals**:
  - File count: ~15 source TS/TSX files across server/client/shared, 7 architecture spec docs
  - LOC estimate: ~1,800 LOC
  - DB Models / Tables: 0 database tables (reads live state and transcript files from `~/.omp/agent/sessions/*.jsonl`)
  - WebSocket Protocol Types: 5 ClientMessage types (`prompt`, `set_model`, `spawn`, `list_sessions`, `switch_session`), 7 ServerMessage types (`roster`, `models`, `session_event`, `session_messages`, `error`, `sessions`, `session_switched`)
- **README / Media Assets**: None found in repo.
- **Deployed & Repo URLs**:
  - Repo URL: `malllayyyy/swtchboard`
- **Domain**: **Agentic AI** (Tactical multi-agent orchestration, live subagent monitoring, model swapping, multi-agent control UI).

---

## 3. proacademys

- **Project Name**: `proacademys-server` / `client` (Full-stack MERN rewrite of `proacademys.com`)
- **What it Actually Does**: A complete full-stack MERN (MongoDB, Express, React 19, Node.js) rewrite of a legacy PHP/Laravel 10 e-learning platform, featuring automated MySQL-to-MongoDB production data migration pipelines, cross-site proxy cookie routing, Razorpay payment processing, and interactive quiz/certificate management.
- **Dependency Versions (from package.json files)**:
  - `server/package.json`: `express`: `^4.19.2`, `mongoose`: `^8.5.0`, `zod`: `^4.4.3`, `jsonwebtoken`: `^9.0.3`, `bcryptjs`: `^3.0.3`, `cookie-parser`: `^1.4.6`, `cors`: `^2.8.5`, `google-auth-library`: `^11.0.2`, `helmet`: `^7.1.0`, `morgan`: `^1.10.0`, `multer`: `^2.2.0`, `mysql2`: `^3.23.3` (used for migration script source connection), `nodemailer`: `^9.0.5`, `pdfkit`: `^0.19.1`, `razorpay`: `^2.9.8`, `dotenv`: `^16.4.5`. DevDependencies: `supertest`: `^7.2.2`, `mongodb-memory-server`: `^11.2.0`.
  - `client/package.json`: `react`: `^19.2.8`, `react-dom`: `^19.2.8`, `react-router-dom`: `^7.18.2`, `axios`: `^1.19.0`, `gsap`: `^3.15.0`, `vite`: `^8.2.0` (dev), `tailwindcss`: `^4.3.3` (dev), `@tailwindcss/vite`: `^4.3.3` (dev), `oxlint`: `^1.75.0` (dev). (Plain JavaScript, no TypeScript compiler used).
- **Monorepo / App Structure**:
  - `server/`: Express REST API organized into 4-tier layered directories (`src/routes/`, `src/controllers/`, `src/services/`, `src/repositories/`, `src/models/`) and data migration engine (`server/scripts/migrate/`).
  - `client/`: React 19 single-page application built with Vite and Tailwind v4 CSS, configured with server-side proxy rewrites (`client/vercel.json`).
  - `pro acedamys/`: Archived PHP/Laravel reference codebase (read-only reference material).
  - `u841361899_proAcademys.sql`: Archived 37-table MySQL dump from production Hostinger environment (read-only reference material).
- **Genuinely Interesting Engineering Decision (with file paths as evidence)**:
  1. *MySQL-to-MongoDB Production Data Migration Engine*: `server/scripts/migrate/run.js` & `server/scripts/migrate/transform/*` — custom multi-stage ETL pipeline that connects directly to the 37-table MySQL production dump via `mysql2`, transforms relational schema (users, courses, enrollments, quizzes, payments, certificates) into MongoDB documents, resolves legacy ID relationships to BSON ObjectIds, generates automated count-parity verification reports (`scripts/migrate/out/report.md`), and supports dry-run JSON exports.
  2. *Same-Origin Proxying for Cross-Site Auth Cookies*: `client/vercel.json` — resolves browser-enforced cross-site `SameSite=Lax` cookie dropping between Vercel (`proacademys-client.vercel.app`) and Render (`proacademys-server.onrender.com`) by rewriting `/api/*` requests on the frontend origin server-side, forcing browsers to scope JWT auth cookies to the frontend domain.
  3. *Tiered Layered Architecture with Generic CRUD Factories*: `server/src/controllers/`, `server/src/services/`, `server/src/repositories/` — enforces total decoupling (`routes -> controllers -> services -> repositories -> models`) powered by reusable CRUD factory abstractions.
- **Rough Scale Signals**:
  - File count: ~100+ files across client, server, and public-assets
  - LOC estimate: ~8,500 LOC
  - DB Models / Collections: 37 legacy MySQL tables transformed into 20 MongoDB Mongoose collections (`User`, `Course`, `Module`, `Lesson`, `LessonMaterial`, `Quiz`, `QuizAttempt`, `Enrollment`, `Payment`, `Coupon`, `Certificate`, `LiveClass`, `BlogVideo`, `Notebook`, `Message`, `Suggestion`, `HelpRequest`, `StudentFile`, `Project`, `Assignment`)
  - API Routes: ~30 REST API endpoints
- **README / Media Assets**:
  - Site & Course images in `server/public-assets/site/` (e.g. `Logo.png`, `Mansi.png`, `founder.png`, `about-us-1.png`), `server/public-assets/site/home/` (e.g. `hero-1.jpg`, `hero-2.jpg`, `quiz.png`, `books.png`, `deep-learning.png`, `Course-img-1.png`...`Course-img-6.png`), `server/public-assets/course_images/` (e.g. `python.jpg`, `1786341690.png`, `1738488040.png`), `client/public/icons.svg`, `favicon.svg`.
- **Deployed & Repo URLs**:
  - Frontend Live Preview: `https://proacademys-client.vercel.app/`
  - Backend API: `https://proacademys-server.onrender.com`
  - Frontend Repo: `https://github.com/malllayyyy/proacademys-client`
  - Backend Repo: `https://github.com/malllayyyy/proacademys-server`
  - Legacy Live Site (untouched PHP): `https://proacademys.com`
- **Domain**: **Web Dev** (Fullstack e-learning platform, database migration, authentication, payment gateway, REST API design).

---

## 4. gamezone

- **Project Name**: `gamezone-backend` / `gamezone-frontend` (`com.gamezone.app` in Capacitor)
- **What it Actually Does**: Real-time gaming cafe point-of-sale (POS) terminal, station timer dashboard, and Capacitor cross-platform Android mobile app built for legacy low-spec hardware (Windows 7 HDDs, Node v13.14.0) with SQLite WAL tuning, session billing, cafeteria order management, and offline-first state sync.
- **Dependency Versions (from package.json files)**:
  - `backend/package.json`: `express`: `^4.19.2`, `cors`: `^2.8.5`, `sqlite3`: `^5.1.7`, `nodemon`: `^3.1.0` (dev).
  - `frontend/package.json`: `react`: `^18.2.0`, `react-dom`: `^18.2.0`, `lucide-react`: `^0.368.0`, `@capacitor/core`: `^6.0.0`, `@capacitor/filesystem`: `^6.0.4`, `@capacitor/preferences`: `^6.0.4`, `@capacitor/share`: `^6.0.4`, `@capacitor/android`: `^6.0.0` (dev), `@capacitor/cli`: `^6.0.0` (dev), `vite`: `^5.2.0` (dev), `tailwindcss`: `^3.4.3` (dev), `autoprefixer`: `^10.4.19` (dev), `postcss`: `^8.4.38` (dev), `@vitejs/plugin-react`: `^4.2.1` (dev).
- **Monorepo / App Structure**:
  - `backend/`: Express.js backend (`backend/server.js`) connected to custom-tuned SQLite database (`backend/database.js`). Serves static Vite frontend build output.
  - `frontend/`: React 18 + Vite SPA styled with Tailwind CSS, configured with Capacitor 6 (`frontend/capacitor.config.json`) for compilation into native Android app package (`frontend/android/`).
  - `Start-GameZone.bat`: One-click Windows startup batch script launching backend server and opening browser window.
- **Genuinely Interesting Engineering Decision (with file paths as evidence)**:
  1. *Low-Spec Windows 7 / HDD SQLite PRAGMA & WAL Optimization*: `backend/database.js` — engineered specifically for slow legacy spinning-disk HDDs running Windows 7 and older Node versions (v13.14.0). Configures SQLite with `PRAGMA journal_mode = WAL`, `PRAGMA synchronous = NORMAL`, memory temp storage (`PRAGMA temp_store = MEMORY`), custom cache size (`PRAGMA cache_size = -10000`), and transaction batching (`BEGIN TRANSACTION ... COMMIT`) during startup seeding to eliminate disk wait cycles.
  2. *Cross-Platform Web & Mobile Native Packaging*: `frontend/capacitor.config.json` & `frontend/android/` — compiles the React POS dashboard into a native Android app package via Capacitor 6 while maintaining desktop web browser compatibility.
  3. *Dynamic Multi-Activity Session Rollover & Overage Math*: `backend/server.js` — `/api/sessions/add-game` route allows players to switch games (e.g. Snooker to PS5) mid-session on the same station without resetting station occupancy, automatically calculating played overage time and deducting it from the newly selected game's duration.
- **Rough Scale Signals**:
  - File count: ~30 source files across frontend/backend, plus native Android resource bundles (`mipmap-*`, `drawable-*`).
  - LOC estimate: ~3,500 LOC
  - DB Models / Tables: 7 SQLite tables (`stations`, `sessions`, `settings`, `activities`, `snacks`, `cafeteria_expenses`, `revenue_history`)
  - API Routes: ~15 REST endpoints (`GET/POST /api/stations`, `GET /api/activities`, `POST /api/sessions/start`, `POST /api/sessions/extend`, `POST /api/sessions/add-game`, `POST /api/sessions/cancel`, `POST /api/sessions/stop`, etc.)
- **README / Media Assets**:
  - Android native splash screens and launcher icons: `frontend/android/app/src/main/res/drawable/splash.png`, `frontend/android/app/src/main/res/drawable-*/splash.png`, `frontend/android/app/src/main/res/mipmap-*/ic_launcher.png`, `ic_launcher_foreground.png`, `ic_launcher_round.png`.
- **Deployed & Repo URLs**:
  - Repo URL: `malllayyyy/GameZone`
- **Domain**: **App Dev** (Cross-platform mobile app via Capacitor, desktop POS software, hardware optimization, hybrid web/native architecture).

---

## Gaps

### Portfolio Content Gaps per Project

1. **deployment-platform**:
   - *Missing Visuals*: No screenshots or video recordings exist anywhere in the repository. Needs high-resolution hero screenshots of the dark-themed terminal UI dashboard, 3D Canvas celebration scene, live Socket.IO build log viewer, and an architecture diagram illustrating the isolated Docker sandbox execution.
   - *Missing Hosted URL*: No live production URL exists (operates locally via Docker Compose and local subdomains like `http://myproject.localhost:8080`).

2. **switchboard**:
   - *Missing Visuals*: No screenshots or video recordings exist in the codebase. Needs screenshots of the tactical IDE dashboard layout, agent graph node visualization, direct subagent chat tab, and live model dropdown control.
   - *Missing Hosted URL*: No hosted live preview (runs locally within Bun and the user's local Oh My Pi environment).

3. **proacademys**:
   - *Visuals Available vs. Missing*: Contains rich image assets (logos, course banners, instructor photos), but lacks crisp, clean hero screenshots of the finished React 19 UI (e.g. course catalog, stacked card scroll section, student quiz interface, admin panel dashboard).
   - *Deployment Status*: Has active live previews (`https://proacademys-client.vercel.app/` and `https://proacademys-server.onrender.com`), but pending final client DNS cutover to `proacademys.com` and live Razorpay API key configuration.

4. **gamezone**:
   - *Missing Visuals*: Contains native Android splash and launcher icons, but lacks desktop/tablet screenshots showing the live POS station timer grid, cafeteria billing modal, and session history tables.
   - *Missing Download Links*: Lacks a pre-compiled downloadable `.apk` file or Windows installer package in the repository.

### Game Dev Domain Assessment

- **EXPLICIT FLAG**: **NONE of the four repositories is genuinely a GAME DEV artifact.**
- `GameZone` is a **gaming cafe POS system and station timer application (App Dev / POS Software)** for managing Snooker tables and PS5 console rentals. It contains zero game engine code, zero 2D/3D physics, zero canvas/WebGL rendering, and zero game loops.
- **Result**: The **Game Dev** domain currently has **ZERO evidence** across all local repositories evaluated.

---

## Required Asset Copy Operations

To consolidate assets for portfolio rendering, the following files should be copied to `C:/Portfolio/assets/raw/<project-slug>/`:

1. **proacademys** (`C:/Portfolio/assets/raw/proacademys/`):
   - `C:/proacademys/server/public-assets/site/Mansi.png` -> `Mansi.png`
   - `C:/proacademys/server/public-assets/site/Logo.png` -> `Logo.png`
   - `C:/proacademys/server/public-assets/site/connect.png` -> `connect.png`
   - `C:/proacademys/server/public-assets/site/founder-frame.png` -> `founder-frame.png`
   - `C:/proacademys/server/public-assets/site/founder.png` -> `founder.png`
   - `C:/proacademys/server/public-assets/site/home/hero-1.jpg` -> `hero-1.jpg`
   - `C:/proacademys/server/public-assets/site/home/quiz.png` -> `quiz.png`
   - `C:/proacademys/server/public-assets/site/home/Course-img-1.png` -> `Course-img-1.png`
   - `C:/proacademys/client/public/favicon.svg` -> `favicon.svg`

2. **gamezone** (`C:/Portfolio/assets/raw/gamezone/`):
   - `C:/Gamezone/GameZone-main/frontend/android/app/src/main/res/drawable/splash.png` -> `splash.png`
   - `C:/Gamezone/GameZone-main/frontend/android/app/src/main/res/mipmap-xxhdpi/ic_launcher.png` -> `ic_launcher.png`
   - `C:/Gamezone/GameZone-main/frontend/android/app/src/main/res/mipmap-xxhdpi/ic_launcher_foreground.png` -> `ic_launcher_foreground.png`
