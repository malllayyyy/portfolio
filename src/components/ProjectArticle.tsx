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
      <LinkRow links={p.links} />
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
            <div id="visit-telemetry-root">
              <div className="mt-8 border-t border-hairline pt-6">
                <h4 className="font-mono text-t-xs text-muted m-0 uppercase tracking-wider">
                  This Visit Telemetry · Server Fallback
                </h4>
                <dl className="mt-4 space-y-3 p-0 m-0 font-mono text-t-xs">
                  {[
                    ['tier', 'detectTier()'],
                    ['reduced motion', "matchMedia('(prefers-reduced-motion: reduce)')"],
                    ['first paint', "PerformanceObserver 'paint' / first-contentful-paint"],
                    ['largest paint', "PerformanceObserver 'largest-contentful-paint'"],
                    ['document', 'PerformanceNavigationTiming.transferSize'],
                    ['3D chunk', 'PerformanceResourceTiming.encodedBodySize'],
                    ['total page fetch', 'PerformanceResourceTiming sum(encodedBodySize)'],
                    ['frame mean', 'rolling 120-frame rAF delta'],
                    ['layers crossed', 'camera depth(t) or IntersectionObserver'],
                  ].map(([label, source]) => (
                    <div
                      key={label}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-hairline/40 pb-2"
                    >
                      <dt className="text-muted shrink-0 w-36 uppercase tracking-wider">{label}</dt>
                      <dd className="font-semibold text-light shrink-0 sm:text-right">measured on load</dd>
                      <dd className="text-muted truncate text-right text-t-xs">{source}</dd>
                    </div>
                  ))}
                </dl>
                <p className="mt-4 font-display text-t-xs text-muted italic m-0">
                  Every number above was measured in your browser on this page load.
                </p>
              </div>
            </div>
          </>
        )}
      </div>
      <p className="mt-12 font-display text-t-base text-muted prose-measure border-l border-hairline pl-6 m-0">
        {p.honesty}
      </p>
    </article>
  );
}
