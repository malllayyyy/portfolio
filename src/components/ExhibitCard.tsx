'use client';

import { useState, useEffect, useRef } from 'react';
import { getMotion } from '@/lib/motion-pref';
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
      derivedSlug === 'pong');

  const [shouldRender, setShouldRender] = useState(isVisible);
  const [isExiting, setIsExiting] = useState(false);
  const cardRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (isVisible) {
      setShouldRender(true);
      setIsExiting(false);
    } else if (shouldRender) {
      if (getMotion() === 'off') {
        setShouldRender(false);
        setIsExiting(false);
      } else {
        setIsExiting(true);
      }
    }
  }, [isVisible]);

  useEffect(() => {
    if (!isExiting) return;

    if (getMotion() === 'off') {
      setIsExiting(false);
      setShouldRender(false);
      return;
    }

    let timer: NodeJS.Timeout | null = null;
    const cardEl = cardRef.current;

    const finishExit = () => {
      if (timer) {
        clearTimeout(timer);
        timer = null;
      }
      if (cardEl) {
        cardEl.removeEventListener('transitionend', handleTransitionEnd);
      }
      setIsExiting(false);
      setShouldRender(false);
    };

    const handleTransitionEnd = (e: TransitionEvent) => {
      if (
        e.target === cardEl &&
        (e.propertyName === 'opacity' || e.propertyName === 'transform')
      ) {
        finishExit();
      }
    };

    if (cardEl) {
      cardEl.addEventListener('transitionend', handleTransitionEnd);
    }

    timer = setTimeout(finishExit, 260);

    return () => {
      if (timer) {
        clearTimeout(timer);
        timer = null;
      }
      if (cardEl) {
        cardEl.removeEventListener('transitionend', handleTransitionEnd);
      }
    };
  }, [isExiting]);

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

  if (!shouldRender) return null;

  const cardStateClass = isVisible && !isExiting ? 'open' : 'exiting';

  return (
    <div
      ref={cardRef}
      className={`${
        className ??
        'fixed right-4 md:right-6 top-1/2 -translate-y-1/2 z-30 w-80 max-w-[calc(100vw-32px)]'
      } exhibit-card-animated ${cardStateClass}`}
    >
      <div
        onClick={handleClick}
        className="group relative bg-strata border border-hairline rounded p-4 text-light flex flex-col gap-3 cursor-pointer hover:border-muted transition-colors duration-120"
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
    </div>
  );
}
