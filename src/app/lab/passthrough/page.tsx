import type { Metadata } from 'next';
import { SceneMount } from '@/components/SceneMount';

export const metadata: Metadata = {
  title: 'Pass-through prototype — lab',
  description: 'Phase 3 isolation prototype: the camera descending through the device screen.',
  robots: { index: false, follow: false },
};

/**
 * Phase 3 — the pass-through prototype, in isolation.
 *
 * A 400 vh document whose scroll maps linearly to camera.y ∈ [−30, −44].
 * The phone monolith, the bezel, the screen quad, the two-pass render and the
 * Device interior. Nothing else: no panels, no other layers, no depth gauge,
 * no exhibits. This route exists to answer one question — does going through
 * the screen feel like descending into a device? — before any other 3D is built.
 */
export default function PassThroughLab() {
  return (
    <>
      {/* Opts this route into the Phase 3 render instrumentation. */}
      <script
        dangerouslySetInnerHTML={{ __html: "document.documentElement.dataset.lab='1'" }}
      />
      <SceneMount />
      <main className="relative" style={{ height: '400vh' }}>
        <div className="page pointer-events-none sticky top-0 pt-12">
          <p className="font-mono text-t-xs text-muted lg:col-span-12">
            LAB · PASS-THROUGH PROTOTYPE · scroll maps to y &minus;30 m → &minus;44 m
          </p>
        </div>
      </main>
    </>
  );
}
