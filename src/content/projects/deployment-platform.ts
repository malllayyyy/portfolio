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
