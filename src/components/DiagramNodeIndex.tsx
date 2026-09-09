import { SNIPPETS, DIAGRAM_SNIPPET_IDS } from '@/content/snippets';

type DiagramNodeIndexProps = {
  id: 'deployment-platform' | 'gamezone';
};

export function DiagramNodeIndex({ id }: DiagramNodeIndexProps) {
  const nodeIds = DIAGRAM_SNIPPET_IDS[id] ?? [];

  return (
    <div className="diagram-node-index mt-6 flex flex-col gap-3" aria-label={`${id} node index`}>
      <h4 className="font-mono text-t-xs text-muted uppercase tracking-wider m-0">
        Architecture Node Index · {nodeIds.length} Nodes
      </h4>
      <div className="space-y-3">
        {nodeIds.map((nodeId) => {
          const entry = SNIPPETS[nodeId];
          if (!entry) return null;

          const isQuotedCode = entry.code !== null;

          return (
            <details
              key={nodeId}
              id={`node-idx-${nodeId}`}
              data-node={nodeId}
              className="group border border-hairline bg-strata rounded p-4 text-light"
            >
              <summary className="cursor-pointer font-mono text-t-sm font-semibold flex items-center justify-between gap-4 text-light hover:text-accent focus-visible:outline-2 focus-visible:outline-accent list-none select-none">
                <span className="flex items-baseline gap-2 truncate">
                  <span>{entry.title}</span>
                  <span className="text-muted text-t-xs font-normal font-mono truncate">
                    ({entry.path})
                  </span>
                </span>
                <span className="flex items-center gap-2 shrink-0">
                  <span
                    className={`text-[10px] uppercase font-mono px-1.5 py-0.5 rounded border ${
                      isQuotedCode
                        ? 'border-accent/40 text-accent bg-field'
                        : 'border-hairline text-muted bg-field'
                    }`}
                  >
                    {isQuotedCode ? 'Verbatim Code' : 'Prose Description'}
                  </span>
                  <span
                    aria-hidden="true"
                    className="text-t-xs text-muted font-normal group-open:rotate-180 transition-transform"
                  >
                    ▼
                  </span>
                </span>
              </summary>
              <div className="mt-3 text-t-xs font-mono space-y-3 border-t border-hairline/50 pt-3">
                {isQuotedCode ? (
                  <>
                    <div className="flex items-center justify-between text-[11px] font-mono text-muted">
                      <span>Provenance: Quoted Source Code</span>
                      <span className="text-accent/80 font-mono">commit c374f4d</span>
                    </div>
                    <pre className="overflow-x-auto p-3 bg-field border border-hairline rounded text-t-xs text-light font-mono leading-relaxed m-0">
                      <code>{entry.code}</code>
                    </pre>
                    <p className="text-muted text-t-xs m-0 font-sans">{entry.note}</p>
                  </>
                ) : (
                  <>
                    <div className="flex items-center justify-between text-[11px] font-mono text-muted">
                      <span>Provenance: Described, Not Quoted</span>
                      <span className="italic font-sans">Private Repository</span>
                    </div>
                    <p className="text-muted leading-relaxed m-0 font-sans">{entry.note}</p>
                  </>
                )}
              </div>
            </details>
          );
        })}
      </div>
    </div>
  );
}
