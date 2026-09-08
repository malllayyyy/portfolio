'use client';

import { useMemo } from 'react';
import { ExhibitCard } from './ExhibitCard';
import { useActiveExhibit, openExhibit, type ExhibitSlug } from '@/three/exhibit-state';
import { PROJECTS } from '@/content/projects';

/**
 * Binds the active-exhibit external store to the presentational `ExhibitCard`.
 * Renders nothing until the 3D descent reports an exhibit within camera range,
 * so it — and the `motion` dependency it pulls through `ExhibitCard` — is loaded
 * lazily via `DeferredOverlays`, never on the initial route.
 */
export function ActiveExhibitCard() {
  const { activeSlug } = useActiveExhibit();
  const activeProject = useMemo(
    () => PROJECTS.find((p) => p.slug === activeSlug),
    [activeSlug]
  );

  return (
    <ExhibitCard
      project={activeProject}
      isVisible={!!activeProject}
      onOpen={(slug) => {
        if (slug) openExhibit(slug as ExhibitSlug);
      }}
      tabIndex={-1}
    />
  );
}
