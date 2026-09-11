import { SITE } from '@/content/site';
import { LAYERS } from '@/content/layers';
import { ResumeLink } from './ResumeLink';

const DEPTH_LAYERS = LAYERS.filter((l) => l.id !== 'bedrock');

export function Hero() {
  return (
    <header className="page pt-24 pb-32" data-layer="surface">
      <div className="lg:col-span-9 prose-measure">
        <h1 className="font-display font-bold text-t-2xl lg:text-t-3xl text-light">
          {SITE.hero}
        </h1>
        <p className="mt-6 font-display text-t-md text-light/90 prose-measure">
          {SITE.heroSub}
        </p>
        <p className="mt-6 font-display text-t-base text-muted prose-measure">
          {SITE.standing}
        </p>
        <p className="mt-6 font-mono text-t-sm flex flex-wrap gap-x-6 gap-y-3">
          <ResumeLink className="underline decoration-[var(--accent)]" />
          <a className="underline decoration-[var(--accent)]" href={SITE.github}>
            GitHub
          </a>
          <a className="underline decoration-[var(--accent)]" href={`mailto:${SITE.email}`}>
            Email
          </a>
        </p>
        <p className="mt-3 font-mono text-t-sm flex flex-wrap gap-x-6 gap-y-3">
          {DEPTH_LAYERS.map((layer) => (
            <a
              key={layer.id}
              className="underline decoration-[var(--accent)]"
              href={`/layer/${layer.id}`}
            >
              {layer.datum} m &middot; {layer.domain}
            </a>
          ))}
        </p>
      </div>
    </header>
  );
}
