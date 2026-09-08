/** OQ1 resolved: malaychaudhary.dev. Phase 6 cutover. */
export const SITE_URL = 'https://malaychaudhary.dev';
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
