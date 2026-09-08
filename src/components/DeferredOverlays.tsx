'use client';

import dynamic from 'next/dynamic';

/**
 * The detail panel and the active-exhibit card are the only two pieces of the
 * descent that depend on `motion` (~41 KB gz). Neither renders anything until a
 * panel is opened or the 3D scene reports an exhibit in range, so both — and
 * `motion` with them — load in a deferred chunk that never counts against the
 * initial-route budget (§ 8.1). On a deep-link route the store already carries
 * `panel` from the URL (see `lib/store.ts`), so the panel still opens on cold
 * load, one microtask after this chunk resolves.
 */
const DetailPanel = dynamic(() => import('./DetailPanel').then((m) => m.DetailPanel), {
  ssr: false,
});
const ActiveExhibitCard = dynamic(
  () => import('./ActiveExhibitCard').then((m) => m.ActiveExhibitCard),
  { ssr: false }
);

export function DeferredOverlays() {
  return (
    <>
      <ActiveExhibitCard />
      <DetailPanel />
    </>
  );
}
