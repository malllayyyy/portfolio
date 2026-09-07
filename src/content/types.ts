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
