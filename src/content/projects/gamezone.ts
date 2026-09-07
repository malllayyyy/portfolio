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
