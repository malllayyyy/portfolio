'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useOpenPanel, setPanel } from '@/lib/store';
import { projectBySlug } from '@/content/projects';
import { ROUTES } from '@/content/routes';
import { ProjectArticle } from './ProjectArticle';
import { getMotion, subscribeMotion } from '@/lib/motion-pref';

export function DetailPanel() {
  const openSlug = useOpenPanel();
  const [prefersReduced, setPrefersReduced] = useState<boolean>(false);
  const triggerRef = useRef<HTMLElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const headingRef = useRef<HTMLHeadingElement | null>(null);
  const prevOpenSlug = useRef<string | null>(null);

  // Motion preference tracking
  useEffect(() => {
    setPrefersReduced(getMotion() === 'off');
    return subscribeMotion(() => {
      setPrefersReduced(getMotion() === 'off');
    });
  }, []);

  // Cold load / direct deep-link initialization
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const path = window.location.pathname;
    if (path.startsWith('/project/')) {
      const slug = path.replace('/project/', '');
      if (projectBySlug(slug)) {
        setPanel(slug);
      }
    }
  }, []);

  const project = openSlug ? projectBySlug(openSlug) : null;

  // Panel closing function
  const handleClose = useCallback(() => {
    if (!openSlug) return;

    const update = () => {
      setPanel(null);
      if (typeof window !== 'undefined' && window.location.pathname.startsWith('/project/')) {
        window.history.pushState(null, '', '/');
      }
    };

    if (
      !prefersReduced &&
      typeof document !== 'undefined' &&
      'startViewTransition' in document
    ) {
      const doc = document as Document & {
        startViewTransition?: (cb: () => void) => void;
      };
      if (typeof doc.startViewTransition === 'function') {
        doc.startViewTransition(update);
      } else {
        update();
      }
    } else {
      update();
    }
  }, [openSlug, prefersReduced]);

  // Open/close lifecycle side effects
  useEffect(() => {
    if (openSlug && project) {
      if (!prevOpenSlug.current) {
        if (typeof document !== 'undefined' && document.activeElement instanceof HTMLElement) {
          triggerRef.current = document.activeElement;
        }
      }
      prevOpenSlug.current = openSlug;

      if (typeof document !== 'undefined') {
        // Drop rAF loop to on-demand rendering (G5.3)
        document.documentElement.dataset.panel = openSlug;

        // Lock document scroll
        document.documentElement.style.overflow = 'hidden';
        document.body.style.overflow = 'hidden';

        // Apply inert to main page landmarks and canvas (G5.5)
        const targets = document.querySelectorAll(
          'main, nav, footer, #scene-mount, [aria-label="Depth navigation"]'
        );
        targets.forEach((el) => el.setAttribute('inert', ''));

        // Update title and live region announcer (§ 9.3)
        const route = ROUTES.find((r) => r.openPanel === openSlug);
        if (route) {
          document.title = route.title;
          const announcer = document.getElementById('route-announcer');
          if (announcer) announcer.textContent = route.title;
        }

        // Focus heading on open (G5.5)
        setTimeout(() => {
          headingRef.current?.focus();
        }, 50);
      }
    } else if (!openSlug && prevOpenSlug.current) {
      prevOpenSlug.current = null;

      if (typeof document !== 'undefined') {
        // Restore continuous rAF loop if motion enabled
        delete document.documentElement.dataset.panel;

        // Unlock scroll
        document.documentElement.style.overflow = '';
        document.body.style.overflow = '';

        // Remove inert from background landmarks
        const targets = document.querySelectorAll('[inert]');
        targets.forEach((el) => el.removeAttribute('inert'));

        // Restore document title
        const defaultRoute = ROUTES.find((r) => r.path === '/');
        if (defaultRoute) {
          document.title = defaultRoute.title;
        }

        // Focus return to exact trigger (G5.5, G5.6)
        if (triggerRef.current && typeof triggerRef.current.focus === 'function') {
          triggerRef.current.focus();
        }
      }
    }
  }, [openSlug, project]);

  // Handle browser navigation (back / forward)
  useEffect(() => {
    const handlePopState = () => {
      if (typeof window === 'undefined') return;
      const path = window.location.pathname;
      const match = ROUTES.find((r) => r.path === path);
      if (match) {
        setPanel(match.openPanel);
      } else {
        setPanel(null);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Trap focus and handle Escape key (G5.5)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      e.stopPropagation();
      handleClose();
      return;
    }

    if (e.key === 'Tab' && panelRef.current) {
      const focusables = panelRef.current.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (focusables.length === 0) return;

      const first = focusables[0];
      const last = focusables[focusables.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === first || document.activeElement === headingRef.current) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }
  };

  const isVisible = !!openSlug && !!project;

  return (
    <div
      className={`detail-panel-wrapper ${isVisible ? 'open' : 'closed'}`}
      style={{
        contentVisibility: isVisible ? 'visible' : 'hidden',
      }}
    >
      <AnimatePresence>
        {isVisible && project && (
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={`panel-heading-${project.slug}`}
            onKeyDown={handleKeyDown}
            initial={prefersReduced ? { opacity: 0 } : { opacity: 0, x: 24 }}
            animate={prefersReduced ? { opacity: 1 } : { opacity: 1, x: 0 }}
            exit={prefersReduced ? { opacity: 0 } : { opacity: 0, x: 24 }}
            transition={prefersReduced ? { duration: 0 } : { duration: 0.3, ease: 'easeOut' }}
            className="detail-panel fixed inset-x-0 bottom-0 z-50 flex h-[92vh] w-full flex-col border-t border-hairline bg-[#10151C] p-6 text-light overflow-y-auto overscroll-contain lg:inset-y-0 lg:left-auto lg:right-0 lg:top-0 lg:h-screen lg:w-[calc(100vw*5/12)] lg:min-w-[420px] lg:border-t-0 lg:border-l lg:p-8 lg:rounded-none"
            data-state={isVisible ? 'open' : 'closed'}
          >
            {/* Mobile drag handle */}
            <div
              className="mx-auto mb-4 h-1.5 w-12 shrink-0 rounded-full bg-[#1B2430] lg:hidden"
              aria-hidden="true"
            />

            {/* Panel Top Control Bar */}
            <div className="mb-6 flex items-center justify-between border-b border-hairline pb-4 shrink-0">
              <h2
                id={`panel-heading-${project.slug}`}
                ref={headingRef}
                tabIndex={-1}
                className="font-display text-t-lg font-semibold text-light outline-none"
              >
                {project.title}
              </h2>
              <button
                type="button"
                onClick={handleClose}
                aria-label="Close detail panel"
                className="flex items-center gap-2 rounded border border-hairline bg-[#0E1116] px-3 py-1.5 font-mono text-t-xs text-muted hover:border-light hover:text-light transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8FD3FF]"
              >
                <span className="hidden sm:inline text-muted/80">Esc</span>
                <span aria-hidden="true" className="text-t-sm font-bold">✕</span>
              </button>
            </div>

            {/* Panel Body: ProjectArticle */}
            <div className="flex-1">
              <ProjectArticle project={project} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
