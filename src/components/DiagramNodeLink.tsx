'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import { getMotion } from '@/lib/motion-pref';

export function DiagramNodeLink({ children }: { children: ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const handlePointerUp = (e: PointerEvent) => {
      const target = e.target as HTMLElement | SVGElement | null;
      if (!target) return;

      const nodeEl = target.closest('[data-node]');
      if (!nodeEl) return;

      const nodeId = nodeEl.getAttribute('data-node');
      if (!nodeId) return;

      const detailsEl = el.querySelector<HTMLDetailsElement>(`details#node-idx-${nodeId}`);
      if (!detailsEl) return;

      detailsEl.open = true;

      const prefersReduced = getMotion();
      detailsEl.scrollIntoView({
        behavior: prefersReduced ? 'auto' : 'smooth',
        block: 'nearest',
      });
    };

    el.addEventListener('pointerup', handlePointerUp);
    return () => {
      el.removeEventListener('pointerup', handlePointerUp);
    };
  }, []);

  return (
    <div ref={containerRef} className="diagram-node-link-wrapper">
      {children}
    </div>
  );
}
