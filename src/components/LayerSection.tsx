import type { ReactNode } from 'react';
import type { Layer, LayerId } from '@/content/types';
import { LayerStill } from '@/components/LayerStill';

const LAYER_STILLS: Record<LayerId, Array<{ src: string; priority?: boolean }>> = {
  surface: [{ src: '/stills/surface.avif', priority: true }],
  device: [
    { src: '/stills/device-approach.avif', priority: false },
    { src: '/stills/device.avif', priority: false },
  ],
  engine: [{ src: '/stills/engine.avif', priority: false }],
  reasoning: [],
  bedrock: [],
};

export function LayerSection({ layer, children }: { layer: Layer; children: ReactNode }) {
  const stills = LAYER_STILLS[layer.id] ?? [];
  return (
    <section
      id={layer.id}
      data-layer={layer.id}
      aria-labelledby={`${layer.id}-h`}
      className="page border-t border-hairline py-24"
    >
      <div className="lg:col-span-12">
        {stills.length > 0 && (
          <div className="mb-8 flex flex-col gap-6">
            {stills.map((still) => (
              <LayerStill key={still.src} src={still.src} priority={still.priority} />
            ))}
          </div>
        )}
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
