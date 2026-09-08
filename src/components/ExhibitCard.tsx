'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { getMotion, subscribeMotion } from '@/lib/motion-pref';
import type { Project, LayerId, Presentation } from '@/content/types';

export type ExhibitCardProps = {
  /**
   * Optional full Project object. If provided, title, thesis, slug, layer,
   * and presentationKind are derived automatically.
   */
  project?: Project;

  /** Title of the exhibit (overrides project.title). */
  title?: string;

  /** One-line thesis of the exhibit (overrides project.thesis). */
  thesis?: string;

  /** Project slug for deep-linking and detail panels (overrides project.slug). */
  slug?: string;

  /** Layer ID of the exhibit (overrides project.layer). */
  layer?: LayerId;

  /** Presentation kind of the exhibit (overrides project.presentation.kind). */
  presentationKind?: Presentation['kind'];

  /** Explicit override to flag card as an engine card carrying accessibility disclosure. */
  isEngine?: boolean;

  /** Action callback fired when the card or Open affordance is activated. */
  onOpen?: (slug?: string) => void;

  /** Controls card visibility and triggering in/out motion. Default: true. */
  isVisible?: boolean;

  /** Custom container class names. Default provides fixed placement on the right edge. */
  className?: string;

  /**
   * Accessibility tabIndex for the actionable Open affordance button.
   * Default: -1.
   *
   * Accessibility Note (§ 4.1, § 9.1):
   * The exhibit card is supplementary to the exhibit's focusable DOM proxy button
   * (managed in Task 5.1). To prevent duplicate/competing tab stops in document focus order,
   * the card's interactive control defaults to `tabIndex={-1}`. Pointer and touch users can click
   * the card or button directly, while keyboard navigation reaches the exhibit through
   * the Task 5.1 focusable list.
   */
  tabIndex?: number;
};

/**
 * Compact exhibit card (§ 4.1, § 7 row 8) displayed when camera is near an exhibit.
 * Fades in at the right edge with title, thesis, Open affordance, and optional
 * Engine animation accessibility disclosure.
 */
export function ExhibitCard({
  project,
  title,
  thesis,
  slug,
  layer,
  presentationKind,
  isEngine,
  onOpen,
  isVisible = true,
  className,
  tabIndex = -1,
}: ExhibitCardProps) {
  const derivedTitle = title ?? project?.title ?? '';
  const derivedThesis = thesis ?? project?.thesis ?? '';
  const derivedSlug = slug ?? project?.slug;
  const derivedLayer = layer ?? project?.layer;
  const derivedKind = presentationKind ?? project?.presentation?.kind;

  const isEngineCard =
    isEngine ??
    (derivedLayer === 'engine' ||
      derivedKind === 'playable' ||
      derivedSlug === 'pong' ||
      derivedSlug === 'pixel-quest');

  const [isReducedMotion, setIsReducedMotion] = useState(() => getMotion() === 'off');

  useEffect(() => {
    setIsReducedMotion(getMotion() === 'off');
    const unsubscribe = subscribeMotion(() => {
      setIsReducedMotion(getMotion() === 'off');
    });
    return unsubscribe;
  }, []);

  const motionInitial = isReducedMotion
    ? { opacity: 0, y: 0 }
    : { opacity: 0, y: 8 };

  const motionAnimate = { opacity: 1, y: 0 };
  const motionExit = isReducedMotion
    ? { opacity: 0, y: 0 }
    : { opacity: 0, y: 8 };

  const motionTransition = isReducedMotion
    ? { duration: 0 }
    : { duration: 0.24, ease: 'easeOut' as const };

  const accentClass =
    derivedLayer === 'device'
      ? 'text-device-accent'
      : derivedLayer === 'engine'
        ? 'text-engine-accent'
        : derivedLayer === 'reasoning'
          ? 'text-reasoning-accent'
          : 'text-surface-accent';

  const handleClick = () => {
    if (onOpen) {
      onOpen(derivedSlug);
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={motionInitial}
          animate={motionAnimate}
          exit={motionExit}
          transition={motionTransition}
          className={
            className ??
            'fixed right-4 md:right-6 top-1/2 -translate-y-1/2 z-30 w-80 max-w-[calc(100vw-32px)]'
          }
        >
          <div
            onClick={handleClick}
            className="group relative bg-strata border border-hairline rounded p-4 text-light flex flex-col gap-3 cursor-pointer"
          >
            {/* Header row: title and Open affordance */}
            <div className="flex items-start justify-between gap-4">
              <h3 className="font-display text-t-base font-semibold text-light leading-snug">
                {derivedTitle}
              </h3>
              <button
                type="button"
                tabIndex={tabIndex}
                onClick={(e) => {
                  e.stopPropagation();
                  handleClick();
                }}
                className={`font-mono text-t-xs font-medium ${accentClass} group-hover:underline flex-shrink-0 cursor-pointer outline-none`}
                aria-label={`Open ${derivedTitle}`}
              >
                Open ⏎
              </button>
            </div>

            {/* One-line thesis */}
            {derivedThesis && (
              <p className="font-display text-t-sm text-muted leading-normal">
                {derivedThesis}
              </p>
            )}

            {/* Accessibility disclosure for Engine cards (§ 7 row 15) */}
            {isEngineCard && (
              <p className="font-mono text-t-xs text-muted border-t border-hairline pt-2 mt-1">
                Playing this starts an animation
              </p>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
