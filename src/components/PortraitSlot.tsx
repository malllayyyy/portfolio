import { SITE, PORTRAIT_PRESENT } from '@/content/site';

export function PortraitSlot() {
  if (PORTRAIT_PRESENT) {
    return (
      <picture>
        <source srcSet="/portrait.avif" type="image/avif" />
        <img
          src="/portrait.webp"
          width={280}
          height={350}
          loading="lazy"
          alt={`${SITE.name}, ${SITE.credential}`}
          className="w-[280px] h-[350px] shrink-0 object-cover border border-hairline"
        />
      </picture>
    );
  }
  return (
    <div
      className="w-[280px] h-[350px] shrink-0 bg-strata border border-hairline flex flex-col justify-end p-6"
      role="img"
      aria-label={`${SITE.name}, ${SITE.credential}`}
    >
      <p className="font-display font-semibold text-t-md text-light m-0">{SITE.name}</p>
      <p className="mt-2 font-mono text-t-xs text-muted m-0">{SITE.credential}</p>
    </div>
  );
}
