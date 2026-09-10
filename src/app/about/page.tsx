import type { Metadata } from 'next';
import { SITE, PORTRAIT_PRESENT } from '@/content/site';
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
          {PORTRAIT_PRESENT && <PortraitSlot />}
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
        <div className="mt-16">
          <Contact headingLevel="h2" />
        </div>
      </div>
    </main>
  );
}
