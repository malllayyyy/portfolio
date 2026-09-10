import type { Project } from '../types';

export const deploymentPlatform: Project = {
  slug: 'deployment-platform',
  title: 'deployment-platform',
  layer: 'surface',
  depth: -2,
  thesis: 'A self-hosted PaaS. Give it a git URL, it builds in a throwaway Docker container and serves the result on its own subdomain.',
  decisions: [
    {
      body: 'Every redeploy writes to its own MinIO path, and the proxy resolves a subdomain by reading one column — projects.current_deployment_id. Going live is a single UPDATE. Rolling back is the same UPDATE pointed at the row before it, so neither direction has downtime.',
      evidence: ['apps/proxy/src/index.js'],
    },
    {
      body: 'Passwords are scrypt, sessions are HMAC-SHA256 signed cookies, and both are written against node:crypto. No session store, no Redis, no auth library.',
      evidence: ['apps/api/src/auth.js'],
    },
  ],
  links: [
    { label: 'GitHub', href: 'https://github.com/malllayyyy/deployment-platform' },
  ],
  honesty: 'It runs on my machine only, at http://<project>.localhost:8080. The code is public if you want to read it.',
  presentation: { kind: 'diagram', component: 'deployment-platform' },
};
