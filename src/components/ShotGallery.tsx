import type { Shot } from '@/content/types';

export function ShotGallery({ shots }: { shots: Shot[] }) {
  const desktop = shots.filter((s) => s.width > 640);
  const mobile = shots.filter((s) => s.width <= 640);
  return (
    <div className="flex flex-col gap-12">
      {desktop.map((s, i) => (
        <figure key={s.src} className="m-0 max-w-[640px] w-full">
          <div className="p-3 bg-strata border border-hairline">
            <picture>
              <source srcSet={s.src} type="image/avif" />
              <img
                src={s.fallback}
                width={s.width}
                height={s.height}
                alt={s.alt}
                sizes="(max-width: 640px) 100vw, 640px"
                loading={i === 0 ? 'eager' : 'lazy'}
                className="w-full h-auto block"
              />
            </picture>
          </div>
          <figcaption className="mt-3 font-mono text-t-xs text-muted">{s.claim}</figcaption>
        </figure>
      ))}
      {mobile.length > 0 && (
        <figure className="m-0 max-w-[640px] w-full">
          <div className="p-3 sm:p-4 bg-strata border border-hairline">
            <div className="grid grid-cols-3 gap-2 sm:gap-4">
              {mobile.map((s) => (
                <div key={s.src} className="p-1 sm:p-1.5 bg-field border border-hairline flex flex-col">
                  <div className="py-1 flex justify-center items-center shrink-0">
                    <div className="w-6 sm:w-8 h-0.5 bg-hairline" />
                  </div>
                  <picture className="block w-full">
                    <source srcSet={s.src} type="image/avif" />
                    <img
                      src={s.fallback}
                      width={s.width}
                      height={s.height}
                      alt={s.alt}
                      sizes="(max-width: 640px) 30vw, 190px"
                      loading="lazy"
                      className="w-full h-auto block border border-hairline"
                    />
                  </picture>
                </div>
              ))}
            </div>
          </div>
          <figcaption className="mt-3 font-mono text-t-xs text-muted">
            Responsive is implemented, not asserted — same routes, 390 px.
          </figcaption>
        </figure>
      )}
    </div>
  );
}
