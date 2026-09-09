'use client';

import dynamic from 'next/dynamic';

/**
 * The detail panel and active-exhibit card overlays are loaded in a deferred chunk
 * via next/dynamic with ssr: false so they never block initial route rendering.
 * On a deep-link route the store already carries `panel` from the URL, so the panel
 * still opens on cold load, one microtask after this chunk resolves.
 */
const DetailPanel = dynamic(() => import('./DetailPanel').then((m) => m.DetailPanel), {
  ssr: false,
});
const ActiveExhibitCard = dynamic(
  () => import('./ActiveExhibitCard').then((m) => m.ActiveExhibitCard),
  { ssr: false }
);
const VisitReadout = dynamic(
  () => import('./VisitReadout').then((m) => m.VisitReadout),
  { ssr: false }
);
export function DeferredOverlays() {
  return (
    <>
      <ActiveExhibitCard />
      <DetailPanel />
      <VisitReadout />
    </>
  );
}
