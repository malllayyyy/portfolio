import type { Metadata } from 'next';
import { SITE } from '@/content/site';
import { ROUTES } from '@/content/routes';
import { PortraitSlot } from '@/components/PortraitSlot';
import { Contact } from '@/components/Contact';

const route = ROUTES.find((r) => r.path === '/about')!;
export const metadata: Metadata = { title: route.title, description: route.description };

export default function AboutPage() {
  return (
    <main className="page py-24" data-layer="bedrock">
      <div className="lg:col-span-12">
        <h1 className="font-display font-bold text-t-xl text-light">About</h1>
        <div className="mt-12 flex flex-col gap-12 lg:flex-row lg:gap-24">
          <PortraitSlot />
          <div className="prose-measure">
            <p className="font-display text-t-base text-light">
              {SITE.name} — {SITE.credential}.
            </p>
            <p className="mt-6 font-display text-t-base text-light">
              Four domains, presented as four depths of one stack: a self-hosted PaaS and a MERN
              rewrite at the surface, a gaming-cafe POS on the device below it, a Canvas 2D
              engine below that, and a control plane for AI agents at the bottom. Each layer is
              causally responsible for the one above it, and the projects are the evidence.
            </p>
          </div>
        </div>
        <div className="mt-16">
          <Contact headingLevel="h2" />
        </div>
      </div>
    </main>
  );
}
