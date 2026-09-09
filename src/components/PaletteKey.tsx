'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import type { ComponentType } from 'react';
import type { ExhibitSlug } from '@/three/exhibit-state';
import type { DepthPaletteProps } from './DepthPalette';

interface PaletteKeyProps {
  exhibits: { slug: ExhibitSlug; title: string; depth: number }[];
}

export function PaletteKey({ exhibits }: PaletteKeyProps) {
  const [isOpen, setIsOpen] = useState(false);
  const PaletteCompRef = useRef<ComponentType<DepthPaletteProps> | null>(null);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && (e.key === 'k' || e.key === 'K')) {
        if (typeof document === 'undefined') return;

        // 1. Panel is open
        if (document.documentElement.dataset.panel) return;

        // 2. Active element is an editable input or field
        const active = document.activeElement as HTMLElement | null;
        if (active) {
          const tag = active.tagName;
          if (
            tag === 'INPUT' ||
            tag === 'TEXTAREA' ||
            tag === 'SELECT' ||
            active.isContentEditable
          ) {
            return;
          }
        }

        // 3. Captured game canvas
        const capturedCanvas = document.querySelector('canvas[data-captured="true"]');
        if (capturedCanvas) return;

        // Intercept shortcut only when opening
        e.preventDefault();

        if (PaletteCompRef.current) {
          setIsOpen(true);
        } else {
          import('./DepthPalette').then((mod) => {
            PaletteCompRef.current = mod.DepthPalette;
            setIsOpen(true);
          });
        }
      }
    },
    []
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const handleClose = useCallback(() => {
    setIsOpen(false);
  }, []);

  if (!isOpen || !PaletteCompRef.current) return null;

  const PaletteComp = PaletteCompRef.current;
  return <PaletteComp exhibits={exhibits} isOpen={isOpen} onClose={handleClose} />;
}
