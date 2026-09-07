import type { Shot } from '@/content/types';

export function ShotGallery({ shots }: { shots: Shot[] }) {
  const desktop = shots.filter((s) => s.width > 640);
  const mobile = shots.filter((s) => s.width <= 640);
  return (
    <div className="flex flex-col gap-12">
      {desktop.map((s, i) => (
        <figure key={s.src} className="m-0">
          <picture>
            <source srcSet={s.src} type="image/avif" />
            <img
              src={s.fallback}
              width={s.width}
              height={s.height}
              alt={s.alt}
              sizes="(min-width: 1024px) 640px, 100vw"
              loading={i === 0 ? 'eager' : 'lazy'}
              className="w-full h-auto border border-hairline"
            />
          </picture>
          <figcaption className="mt-3 font-mono text-t-xs text-muted">{s.claim}</figcaption>
        </figure>
      ))}
      {mobile.length > 0 && (
        <figure className="m-0">
          <div className="grid grid-cols-3 gap-6">
            {mobile.map((s) => (
              <picture key={s.src}>
                <source srcSet={s.src} type="image/avif" />
                <img
                  src={s.fallback}
                  width={s.width}
                  height={s.height}
                  alt={s.alt}
                  loading="lazy"
                  className="w-full h-auto border border-hairline"
                />
              </picture>
            ))}
          </div>
          <figcaption className="mt-3 font-mono text-t-xs text-muted">
            Responsive is implemented, not asserted — same routes, 390 px.
          </figcaption>
        </figure>
      )}
    </div>
  );
}
