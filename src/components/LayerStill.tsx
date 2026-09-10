'use client';

import { useTier } from '@/lib/store';

type LayerStillProps = {
  src: string;
  alt?: string;
  priority?: boolean;
  width?: number;
  height?: number;
};

export function LayerStill({
  src,
  alt = '',
  priority = false,
  width = 1600,
  height = 1000,
}: LayerStillProps) {
  const tier = useTier();
  if (tier !== 'low') return null;
  return (
    <div className="w-full overflow-hidden border border-hairline bg-field">
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        loading={priority ? 'eager' : 'lazy'}
        fetchPriority={priority ? 'high' : 'auto'}
        aria-hidden={alt === '' ? 'true' : undefined}
        className="w-full h-auto aspect-[16/10] object-cover"
      />
    </div>
  );
}
