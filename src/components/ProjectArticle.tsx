import type { Project, TraceFixture } from '@/content/types';
import { SWITCHBOARD_TRACE } from '@/content/site';
import { DecisionList } from './DecisionList';
import { LinkRow } from './LinkRow';
import { DeploymentPlatformDiagram } from '@/diagrams/DeploymentPlatformDiagram';
import { GameZoneDiagram } from '@/diagrams/GameZoneDiagram';
import { ProtocolTable } from './ProtocolTable';

const trace: TraceFixture | null = SWITCHBOARD_TRACE;

function TraceStepList({ steps }: { steps: TraceFixture['steps'] }) {
  return (
    <div className="mt-8 border-t border-hairline pt-6">
      <h4 className="font-mono text-t-xs text-muted m-0 uppercase tracking-wider">
        Trace Replay · {steps.length} Steps
      </h4>
      <ol className="mt-4 space-y-3 p-0 m-0 list-none">
        {steps.map((step, i) => (
          <li
            key={i}
            className="font-mono text-t-xs text-light flex items-center justify-between gap-4 border-b border-hairline/40 pb-2"
          >
            <span className="text-accent shrink-0">{step.at}ms</span>
            <span className="font-semibold text-light">{step.type}</span>
            <span className="text-muted truncate">
              {step.from} → {step.to}
            </span>
            <span className="text-muted truncate max-w-[200px]">
              {step.summary}
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}

export function ProjectArticle({ project: p }: { project: Project }) {
  return (
    <article
      id={p.slug}
      data-layer={p.layer}
      aria-labelledby={`${p.slug}-h`}
      className="bg-field border border-hairline p-6 sm:p-8"
    >
      {p.slug === 'gamezone' ? (
        <div className="flex items-center gap-4">
          <img
            src="/gamezone/ic_launcher.png"
            width={96}
            height={96}
            alt="GameZone Android launcher icon"
            loading="lazy"
            className="w-24 h-24 border border-hairline shrink-0"
          />
          <h3 id={`${p.slug}-h`} className="font-display font-semibold text-t-lg text-light m-0">
            {p.title}
          </h3>
        </div>
      ) : (
        <h3 id={`${p.slug}-h`} className="font-display font-semibold text-t-lg text-light m-0">
          {p.title}
        </h3>
      )}
      <p className="mt-3 font-display text-t-md text-light prose-measure m-0">{p.thesis}</p>
      <LinkRow links={p.presentation.kind === 'links' ? p.links.filter((l) => l.label !== 'Live demo') : p.links} />
      <DecisionList decisions={p.decisions} />
      <div className="mt-12">
        {p.presentation.kind === 'diagram' && p.presentation.component === 'deployment-platform' && (
          <DeploymentPlatformDiagram />
        )}
        {p.presentation.kind === 'diagram' && p.presentation.component === 'gamezone' && (
          <GameZoneDiagram />
        )}
        {p.presentation.kind === 'node-field' && (
          <>
            <ProtocolTable />
            {trace && <TraceStepList steps={trace.steps} />}
          </>
        )}
        {p.presentation.kind === 'links' &&
          p.links.find((l) => l.label === 'Live demo') && (
            <a
              href={p.links.find((l) => l.label === 'Live demo')!.href}
              className="block w-full border border-hairline bg-strata p-6 font-mono text-t-md text-light underline decoration-[var(--accent)] focus-visible:outline-2 focus-visible:outline-[var(--accent)] focus-visible:outline-offset-4"
            >
              <span className="mr-3 text-accent font-semibold no-underline">LIVE</span>
              {p.links.find((l) => l.label === 'Live demo')!.href}
            </a>
          )}
      </div>
      <p className="mt-12 font-display text-t-base text-muted prose-measure border-l border-hairline pl-6 m-0">
        {p.honesty}
      </p>
    </article>
  );
}
