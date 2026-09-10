'use client';

import { useEffect, useRef, useState, useMemo, useCallback, useId } from 'react';
import { LAYERS } from '@/content/layers';
import { scrollToExhibitDepth, openExhibit, type ExhibitSlug } from '@/three/exhibit-state';
import { getSnapshot } from '@/lib/store';

export interface DepthPaletteProps {
  exhibits: { slug: ExhibitSlug; title: string; depth: number }[];
  isOpen: boolean;
  onClose: () => void;
}

export type PaletteItem =
  | {
      id: string;
      type: 'layer';
      name: string;
      domain: string;
      depth: number;
      label: string;
      layerId: string;
    }
  | {
      id: string;
      type: 'project';
      slug: ExhibitSlug;
      title: string;
      depth: number;
      label: string;
      layerId: string;
    };

function formatDepthReadout(y: number): string {
  const roundedY = Math.round(y);
  if (roundedY >= 0) return '0 m';
  const absVal = Math.abs(roundedY);
  return `\u2212${absVal} m`;
}

export function DepthPalette({ exhibits, isOpen, onClose }: DepthPaletteProps) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const triggerRef = useRef<HTMLElement | null>(null);

  const titleId = useId();
  const listboxId = useId();

  // Construct items in depth order (0 m down to -300 m)
  const items = useMemo<PaletteItem[]>(() => {
    const list: PaletteItem[] = [];

    LAYERS.forEach((layer) => {
      list.push({
        id: `layer-${layer.id}`,
        type: 'layer',
        name: layer.name,
        domain: layer.domain,
        depth: layer.datum,
        label: layer.domain ? `${layer.name} \u00b7 ${layer.domain}` : layer.name,
        layerId: layer.id,
      });

      const matchingProjects = exhibits.filter((p) => {
        if (layer.id === 'surface' && (p.slug === 'deployment-platform' || p.slug === 'proacademys')) return true;
        if (layer.id === 'device' && p.slug === 'gamezone') return true;
        if (layer.id === 'reasoning' && p.slug === 'switchboard') return true;
        return false;
      });

      matchingProjects.forEach((project) => {
        list.push({
          id: `project-${project.slug}`,
          type: 'project',
          slug: project.slug,
          title: project.title,
          depth: project.depth,
          label: project.title,
          layerId: layer.id,
        });
      });
    });

    list.sort((a, b) => b.depth - a.depth);
    return list;
  }, [exhibits]);

  // Filter items by substring search
  const filteredItems = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((item) => {
      if (item.type === 'layer') {
        return (
          item.name.toLowerCase().includes(q) ||
          item.domain.toLowerCase().includes(q)
        );
      }
      return (
        item.title.toLowerCase().includes(q) ||
        item.slug.toLowerCase().includes(q)
      );
    });
  }, [items, query]);

  // Reset selected index when filtered list changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Activate item handler
  const handleActivate = useCallback(
    (item: PaletteItem) => {
      // 1. Close palette & restore scroll/focus
      onClose();

      // 2. Execute depth navigation / panel opening based on tier
      const tier = getSnapshot().tier;

      if (item.type === 'layer') {
        if (tier === 'low') {
          const el = document.getElementById(item.layerId);
          if (el) el.scrollIntoView();
        } else {
          scrollToExhibitDepth(item.depth);
        }
      } else if (item.type === 'project') {
        if (tier === 'low') {
          const el = document.getElementById(item.slug);
          if (el) el.scrollIntoView();
        } else {
          scrollToExhibitDepth(item.depth);
        }
        openExhibit(item.slug);
      }
    },
    [onClose]
  );

  // Dialog lifecycle: focus management, inert attribute, scroll lock
  useEffect(() => {
    if (!isOpen) return;

    // Capture trigger element for focus restoration
    if (typeof document !== 'undefined' && document.activeElement instanceof HTMLElement) {
      triggerRef.current = document.activeElement;
    }

    // Lock scroll
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';

    // Apply inert to all direct body children except dialog container
    const bodyChildren = Array.from(document.body.children);
    bodyChildren.forEach((child) => {
      if (
        dialogRef.current &&
        !child.contains(dialogRef.current) &&
        child !== dialogRef.current.parentElement
      ) {
        child.setAttribute('inert', '');
      }
    });

    // Auto-focus text input
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 10);

    return () => {
      clearTimeout(timer);
      // Unlock scroll
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';

      // Remove inert
      const targets = document.querySelectorAll('[inert]');
      targets.forEach((el) => el.removeAttribute('inert'));

      // Restore focus
      if (triggerRef.current && typeof triggerRef.current.focus === 'function') {
        triggerRef.current.focus();
      }
    };
  }, [isOpen]);

  // Keyboard navigation inside input / dialog
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        onClose();
        return;
      }

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (filteredItems.length > 0) {
          setSelectedIndex((prev) => (prev >= filteredItems.length - 1 ? 0 : prev + 1));
        }
        return;
      }

      if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (filteredItems.length > 0) {
          setSelectedIndex((prev) => (prev <= 0 ? filteredItems.length - 1 : prev - 1));
        }
        return;
      }

      if (e.key === 'Enter') {
        e.preventDefault();
        const active = filteredItems[selectedIndex];
        if (active) {
          handleActivate(active);
        }
        return;
      }

      // Focus trap for Tab
      if (e.key === 'Tab' && dialogRef.current) {
        const focusables = dialogRef.current.querySelectorAll<HTMLElement>(
          'input, button, [tabindex]:not([tabindex="-1"])'
        );
        if (focusables.length === 0) return;

        const first = focusables[0];
        const last = focusables[focusables.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === first) {
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
    },
    [filteredItems, selectedIndex, handleActivate, onClose]
  );

  if (!isOpen) return null;

  const activeItem = filteredItems[selectedIndex];
  const activeItemId = activeItem ? `palette-item-${activeItem.id}` : undefined;

  return (
    <div
      aria-hidden={!isOpen}
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-void/80 backdrop-none transition-opacity duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onKeyDown={handleKeyDown}
        className="w-full max-w-lg bg-strata border border-hairline rounded-lg p-4 font-mono text-t-sm shadow-none focus:outline-none"
      >
        <h2 id={titleId} className="sr-only">
          Depth Palette
        </h2>

        {/* Input Header */}
        <div className="flex items-center gap-3 border-b border-hairline pb-3">
          <span className="text-muted text-t-xs px-1.5 py-0.5 rounded border border-hairline bg-field">
            ⌘K / Ctrl+K
          </span>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a layer or project name..."
            aria-autocomplete="list"
            aria-controls={listboxId}
            aria-activedescendant={activeItemId}
            className="w-full bg-transparent font-mono text-t-sm text-light placeholder-muted focus:outline-none"
          />
          <button
            type="button"
            onClick={onClose}
            aria-label="Close depth palette"
            className="font-mono text-t-xs text-muted hover:text-light px-2 py-1 rounded border border-hairline hover:bg-field focus:outline-none focus:ring-1 focus:ring-surface-accent"
          >
            Esc
          </button>
        </div>

        {/* Screen Reader Live Region */}
        <div className="sr-only" aria-live="polite" aria-atomic="true">
          {filteredItems.length} result{filteredItems.length === 1 ? '' : 's'}
        </div>

        {/* Results List */}
        <ul
          id={listboxId}
          role="listbox"
          aria-label="Depth options"
          className="mt-3 max-h-80 overflow-y-auto space-y-1 p-0 m-0 list-none"
        >
          {filteredItems.length === 0 ? (
            <li className="px-3 py-4 text-muted font-mono text-t-sm text-center">
              No depth matching &quot;{query}&quot;
            </li>
          ) : (
            filteredItems.map((item, index) => {
              const isSelected = index === selectedIndex;
              return (
                <li
                  key={item.id}
                  id={`palette-item-${item.id}`}
                  role="option"
                  aria-selected={isSelected}
                  className="list-none"
                >
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => handleActivate(item)}
                    onMouseEnter={() => setSelectedIndex(index)}
                    className={`w-full text-left font-mono text-t-sm px-3 py-2 rounded flex items-center justify-between transition-colors focus:outline-none ${
                      isSelected
                        ? 'bg-field text-light ring-1 ring-surface-accent font-semibold'
                        : 'text-muted hover:text-light'
                    }`}
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <span className="text-surface-accent font-mono w-16 text-right shrink-0">
                        {formatDepthReadout(item.depth)}
                      </span>
                      <span
                        className={`truncate ${
                          item.type === 'layer' ? 'font-semibold text-light' : 'pl-2 text-muted'
                        }`}
                      >
                        {item.label}
                      </span>
                    </div>
                    <span className="font-mono text-t-xs text-muted shrink-0 ml-2 uppercase">
                      {item.type === 'layer' ? 'layer' : 'project'}
                    </span>
                  </button>
                </li>
              );
            })
          )}
        </ul>
      </div>
    </div>
  );
}
