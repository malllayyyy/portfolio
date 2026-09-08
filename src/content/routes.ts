import type { RouteEntry } from './types';
import { SITE } from './site';

const t = (title: string) => `${title} \u2014 Malay Chaudhary`;

export const ROUTES: RouteEntry[] = [
  { path: '/',                            depth:   +6, title: 'Malay Chaudhary \u2014 Substrate',   description: SITE.metaDescription, openPanel: null },
  { path: '/layer/surface',               depth:    0, title: t('Surface \u2014 Web'),              description: 'Depth 0 m. A self-hosted PaaS and a MERN rewrite of a legacy e-learning platform.', openPanel: null },
  { path: '/layer/device',                depth:  -40, title: t('Device \u2014 App'),               description: 'Depth \u221240 m. A gaming-cafe POS built for Windows 7 and a spinning disk.', openPanel: null },
  { path: '/layer/engine',                depth: -120, title: t('Engine \u2014 Game'),              description: 'Depth \u2212120 m. Canvas 2D Pong engine, playable in-page, on a fixed-timestep loop.', openPanel: null },
  { path: '/layer/reasoning',             depth: -260, title: t('Reasoning \u2014 Agentic AI'),     description: 'Depth \u2212260 m. A real-time control switchboard for Oh My Pi subagents.', openPanel: null },
  { path: '/project/deployment-platform', depth:   -2, title: t('deployment-platform'),        description: 'Self-hosted PaaS: isolated Docker builds, MinIO buckets, atomic zero-downtime swaps.', openPanel: 'deployment-platform' },
  { path: '/project/proacademys',         depth:   -8, title: t('ProAcademys'),                description: 'MERN rewrite of a PHP/Laravel e-learning platform. 37 MySQL tables to 20 collections.', openPanel: 'proacademys' },
  { path: '/project/gamezone',            depth:  -52, title: t('GameZone'),                   description: 'Gaming-cafe POS and Capacitor 6 Android app, tuned for Windows 7 and a 5400 rpm disk.', openPanel: 'gamezone' },
  { path: '/project/pong',                depth: -124, title: t('Pong'),                       description: 'Canvas 2D Pong with trigonometric deflection, on a fixed-timestep accumulator. Playable.', openPanel: 'pong' },
  { path: '/project/switchboard',         depth: -278, title: t('Switchboard'),                description: 'Real-time control plane for Oh My Pi subagents. Direct in-memory steering over WebSocket.', openPanel: 'switchboard' },
  { path: '/about',                       depth: null, title: t('About'),                      description: 'Malay Chaudhary, B.Tech CSE at IIIT Naya Raipur.', openPanel: null },
  { path: '/resume',                      depth: null, title: t('R\u00e9sum\u00e9'),                     description: 'R\u00e9sum\u00e9 of Malay Chaudhary \u2014 B.Tech CSE, IIIT Naya Raipur.', openPanel: null },
];
