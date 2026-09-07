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
