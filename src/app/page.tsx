import { SkipLink } from '@/components/SkipLink';
import { DepthGauge } from '@/components/DepthGauge';
import { Hero } from '@/components/Hero';
import { LayerSection } from '@/components/LayerSection';
import { ProjectArticle } from '@/components/ProjectArticle';
import { PortraitSlot } from '@/components/PortraitSlot';
import { Contact } from '@/components/Contact';
import { KeyboardHelp } from '@/components/KeyboardHelp';
import { DescentProfile } from '@/components/DescentProfile';
import { SceneMount } from '@/components/SceneMount';
import { DeferredOverlays } from '@/components/DeferredOverlays';
import { PaletteKey } from '@/components/PaletteKey';
import { ExhibitProxyNav } from '@/three/exhibit-state';
import { LAYERS } from '@/content/layers';
import { PROJECTS } from '@/content/projects';
import { SITE } from '@/content/site';

/**
 * `Descent` is a server component: every layer section, project article,
 * diagram and the Bedrock block is real DOM in the first HTML response with
 * zero JS (§ 8). The only client islands are the descent HUD (`SceneMount`,
 * `ExhibitProxyNav`, `DepthGauge`) and the deferred overlays.
 */
export function Descent() {
  return (
    <>
      <SceneMount />
      <SkipLink />
      <ExhibitProxyNav
        exhibits={PROJECTS.map((p) => ({ slug: p.slug, title: p.title, depth: p.depth }))}
      />
      <PaletteKey
        exhibits={PROJECTS.map((p) => ({ slug: p.slug, title: p.title, depth: p.depth }))}
      />
      <DepthGauge />
      <Hero />
      <main className="relative min-h-[900vh]">
        {LAYERS.filter((l) => l.id !== 'bedrock').map((layer) => (
          <LayerSection key={layer.id} layer={layer}>
            {PROJECTS.filter((p) => p.layer === layer.id).map((p) => (
              <ProjectArticle key={p.slug} project={p} />
            ))}
          </LayerSection>
        ))}
        <section
          id="bedrock"
          data-layer="bedrock"
          aria-labelledby="bedrock-h"
          className="page border-t border-hairline py-24"
        >
          <div className="lg:col-span-12">
            <p className="font-mono text-t-xs text-muted">−300 m · BEDROCK</p>
            <h2 id="bedrock-h" className="mt-3 font-display font-semibold text-t-xl text-light">
              About
            </h2>
            <div className="mt-12 flex flex-col gap-12 lg:flex-row lg:gap-24">
              <PortraitSlot />
              <div className="prose-measure">
                <p className="font-display text-t-base text-light">
                  {SITE.name} — {SITE.credential}.
                </p>
                <p className="mt-6 font-display text-t-base text-light">
                  Four domains, four depths of one stack: a self-hosted PaaS and a client rewrite at the
                  surface, a gaming-cafe POS below that, the games I learned on further down, and a
                  control plane for AI agents at the bottom.
                </p>
              </div>
            </div>
            <div className="mt-24 grid grid-cols-1 lg:grid-cols-2 gap-24">
              <Contact />
              <KeyboardHelp />
            </div>
            <DescentProfile />
          </div>
        </section>
      </main>
      <DeferredOverlays />
    </>
  );
}

export default function Home() {
  return <Descent />;
}
