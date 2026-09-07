import type { ReactNode } from 'react';
import type { Layer } from '@/content/types';

export function LayerSection({ layer, children }: { layer: Layer; children: ReactNode }) {
  return (
    <section
      id={layer.id}
      data-layer={layer.id}
      aria-labelledby={`${layer.id}-h`}
      className="page border-t border-hairline py-24"
    >
      <div className="lg:col-span-12">
        <p className="font-mono text-t-xs text-muted">
          {layer.datum === 0 ? '0' : String(layer.datum).replace('-', '\u2212')} m · {layer.name}
          {layer.domain && <> · {layer.domain}</>}
        </p>
        <h2 id={`${layer.id}-h`} className="mt-3 font-display font-semibold text-t-xl text-light">
          {layer.name}
          {layer.domain && <span className="text-muted"> — {layer.domain}</span>}
        </h2>
        {layer.thesis && (
          <p className="mt-6 font-display text-t-md text-light prose-measure">{layer.thesis}</p>
        )}
        <div className="mt-16 flex flex-col gap-24">{children}</div>
      </div>
    </section>
  );
}
