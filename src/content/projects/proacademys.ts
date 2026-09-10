import type { Project } from '../types';

export const proacademys: Project = {
  slug: 'proacademys',
  title: 'ProAcademys',
  layer: 'surface',
  depth: -8,
  thesis: 'A MERN rewrite of a client\u2019s PHP/Laravel e-learning platform, including moving the live production data across.',
  decisions: [
    {
      body: 'The old site kept everything in MySQL and the new one is MongoDB, so the migration had to be written by hand: read the production dump, reshape the rows into documents, map every legacy integer ID to an ObjectId, then count both sides and compare before trusting any of it. It ran against real customer data, which is why the parity check exists.',
    },
    {
      body: 'The frontend is on Vercel and the API is on Render, so the browser treated them as different sites and quietly dropped the login cookie every time. The fix was to rewrite /api/* on the frontend origin, which puts the cookie back on the same domain it came from.',
      evidence: ['client/vercel.json'],
    },
  ],
  links: [
    { label: 'Live demo',   href: 'https://proacademys-client.vercel.app/' },
    { label: 'Client repo', href: 'https://github.com/malllayyyy/proacademys-client' },
    { label: 'Server repo', href: 'https://github.com/malllayyyy/proacademys-server' },
  ],
  honesty: 'Waiting on the client\u2019s DNS cutover to proacademys.com and live Razorpay keys.',
  presentation: { kind: 'links' },
};
