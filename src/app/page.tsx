import { SkipLink } from '@/components/SkipLink';
import { DepthGauge } from '@/components/DepthGauge';
import { Hero } from '@/components/Hero';
import { LayerSection } from '@/components/LayerSection';
import { ProjectArticle } from '@/components/ProjectArticle';
import { PortraitSlot } from '@/components/PortraitSlot';
import { Contact } from '@/components/Contact';
import { KeyboardHelp } from '@/components/KeyboardHelp';
import { SceneMount } from '@/components/SceneMount';
import { DetailPanel } from '@/components/DetailPanel';
import { LAYERS } from '@/content/layers';
import { PROJECTS } from '@/content/projects';
import { SITE } from '@/content/site';

export function Descent() {
  return (
    <>
      <SceneMount />
      <SkipLink />
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
                  Four domains, presented as four depths of one stack: a self-hosted PaaS and a MERN
                  rewrite at the surface, a gaming-cafe POS on the device below it, two Canvas 2D
                  engines below that, and a control plane for AI agents at the bottom. Each layer is
                  causally responsible for the one above it, and the projects are the evidence.
                </p>
              </div>
            </div>
            <div className="mt-24 grid grid-cols-1 lg:grid-cols-2 gap-24">
              <Contact />
              <KeyboardHelp />
            </div>
          </div>
        </section>
      </main>
      <DetailPanel />
    </>
  );
}

export default function Home() {
  return <Descent />;
}
