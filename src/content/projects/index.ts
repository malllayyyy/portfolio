import type { Project } from '../types';
import { deploymentPlatform } from './deployment-platform';
import { proacademys } from './proacademys';
import { gamezone } from './gamezone';
import { pong } from './pong';
import { switchboard } from './switchboard';

/** Document order = depth order (§ 9.2). Do not re-sort. */
export const PROJECTS: Project[] = [
  deploymentPlatform, proacademys, gamezone, pong, switchboard,
];

export const projectBySlug = (slug: string): Project | undefined =>
  PROJECTS.find((p) => p.slug === slug);
