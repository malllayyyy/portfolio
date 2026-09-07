import type { Project } from '@/content/types';
import { DecisionList } from './DecisionList';
import { ScaleStats } from './ScaleStats';
import { LinkRow } from './LinkRow';
import { ShotGallery } from './ShotGallery';
import { DeploymentPlatformDiagram } from '@/diagrams/DeploymentPlatformDiagram';
import { GameZoneDiagram } from '@/diagrams/GameZoneDiagram';
import { ProtocolTable } from './ProtocolTable';

export function ProjectArticle({ project: p }: { project: Project }) {
  return (
    <article id={p.slug} data-layer={p.layer} aria-labelledby={`${p.slug}-h`}>
      <h3 id={`${p.slug}-h`} className="font-display font-semibold text-t-lg text-light m-0">
        {p.title}
      </h3>
      <p className="mt-3 font-display text-t-md text-light prose-measure m-0">{p.thesis}</p>
      <LinkRow links={p.links} />
      <DecisionList decisions={p.decisions} />
      <ScaleStats scale={p.scale} />
      <div className="mt-12">
        {p.presentation.kind === 'screenshots' && <ShotGallery shots={p.presentation.shots} />}
        {p.presentation.kind === 'diagram' && p.presentation.component === 'deployment-platform' && (
          <DeploymentPlatformDiagram />
        )}
        {p.presentation.kind === 'diagram' && p.presentation.component === 'gamezone' && (
          <GameZoneDiagram />
        )}
        {p.presentation.kind === 'node-field' && <ProtocolTable />}
        {/* presentation.kind === 'playable' renders nothing in Phase 1; Task 2.6 mounts GameMount here */}
      </div>
      <p className="mt-12 font-display text-t-base text-muted prose-measure border-l border-hairline pl-6 m-0">
        {p.honesty}
      </p>
    </article>
  );
}
