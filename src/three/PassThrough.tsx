'use client';

import { useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { SRGBColorSpace, UnsignedByteType, WebGLRenderTarget } from 'three';
import type { ShaderMaterial } from 'three';
import { EXTERIOR, INTERIOR } from './layers/Device';

/**
 * The quad carries the interior for the whole approach: with a solid body it is
 * the only way to see in, so there is no competing direct view to disagree with.
 * The prototype sweep starts at −30, so the window opens there.
 */
const WINDOW_TOP = -30.0;
const WINDOW_BOTTOM = -40.0;

/**
 * The quad must stop carrying the interior before it crosses the near plane, or
 * it gets clipped and pass B has nothing to sample (measured as a 0.4 m black
 * band). With `camera.near` at 0.02 this margin is about one frame of travel,
 * which is the single frame § 2.6 allows.
 */
const QUAD_NEAR_MARGIN = 0.015;


/**
 * § 2.6 — the two-pass render.
 *
 * One scene, one camera, one set of world coordinates. There is no second world
 * and no second camera; separation is `THREE.Layers` alone.
 *
 * Inside the window:
 *   pass A — channel 2 (INTERIOR) into a render target, from the real camera
 *   pass B — channel 1 (EXTERIOR) to screen, with the quad sampling pass A
 *
 * Outside it there is one pass. Because both passes share the camera matrices,
 * the quad samples in screen space, and `ScreenMaterial` reproduces the canvas
 * colour pipeline, the frame where the quad stops being drawn matches the frame
 * before it.
 *
 * `renderPriority: 1` takes the render loop away from R3F, so every draw here is
 * explicit.
 */
export function PassThrough({ screenMaterial }: { screenMaterial: ShaderMaterial }) {
  const { gl, scene, camera, size, viewport } = useThree();

  // dprCap: 2 on high tier, 1.5 on mid (§ 2.6).
  const dprCap = useMemo(() => {
    if (typeof document === 'undefined') return 1.5;
    return document.documentElement.dataset.tier === 'high' ? 2 : 1.5;
  }, []);

  const rt = useRef<WebGLRenderTarget | null>(null);

  /**
   * Allocates or resizes the render target. Safe to call every frame: it
   * no-ops when the dimensions already match.
   *
   * Called unconditionally rather than only when the target is missing, because
   * resize, OS zoom and orientation change all alter the drawing-buffer size —
   * and a stale `uResolution` breaks the screen-space sampling the whole
   * mechanic depends on.
   */
  const allocate = () => {
    const dpr = Math.min(viewport.dpr || 1, dprCap);
    const w = Math.max(1, Math.floor(size.width * dpr));
    const h = Math.max(1, Math.floor(size.height * dpr));

    if (rt.current) {
      if (rt.current.width === w && rt.current.height === h) return;
      rt.current.dispose();
    }

    // UnsignedByteType, NOT HalfFloatType. A half-float colour attachment needs
    // EXT_color_buffer_float to be renderable; where that is missing the
    // framebuffer is incomplete and the quad samples undefined data — it read
    // as a constant ACES-tonemapped white (220,227,232) at every depth, with
    // uMap bound and the quad visible. A byte target is renderable everywhere.
    //
    // No MSAA either: the canvas is already antialiased and the quad samples
    // this texture 1:1 in screen space, so multisampling buys nothing and adds
    // another resolve-path hazard.
    rt.current = new WebGLRenderTarget(w, h, {
      samples: 0,
      depthBuffer: true,
      type: UnsignedByteType,
    });

    // Declares the encoding three applies when writing into the target, so the
    // stored pixels are display-ready and the quad can pass them straight
    // through (see ScreenMaterial).
    rt.current.texture.colorSpace = SRGBColorSpace;

    screenMaterial.uniforms.uResolution.value.set(w, h);
  };

  useEffect(() => {
    return () => {
      rt.current?.dispose();
      rt.current = null;

    };
  }, []);

  useFrame(() => {
    const y = camera.position.y;
    const inWindow = y <= WINDOW_TOP && y > WINDOW_BOTTOM + QUAD_NEAR_MARGIN;

    if (!inWindow) {
      if (y > WINDOW_TOP) {
        camera.layers.set(EXTERIOR);
        camera.layers.enable(INTERIOR);
      } else {
        // Past the screen plane. Rendering channel 2 alone is what § 2.6 says,
        // but it is wrong for this geometry: the body spans y −40.0 … −40.62 and
        // the bezel −39.9 … −40.1, so they are still partly in front of the
        // camera. Dropping channel 1 made them vanish mid-frame — measured as a
        // 147.2 mean / 575 worst delta on the swap pair against a 4.0 non-swap
        // mean, the exact seam G3.1 exists to catch. Keeping both channels lets
        // them clip against the near plane instead, which § 2.6 calls the
        // sensation of entering.
        camera.layers.set(INTERIOR);
        camera.layers.enable(EXTERIOR);
      }
      screenMaterial.uniforms.uHasMap.value = 0.0;
      gl.setRenderTarget(null);
      gl.render(scene, camera);
      return;
    }

    allocate();
    const target = rt.current;
    if (!target) return;

    // pass A — the world below, from the real camera
    camera.layers.set(INTERIOR);
    gl.setRenderTarget(target);
    gl.clear();
    gl.render(scene, camera);

    // pass B — phone + bezel + quad, the quad sampling pass A in screen space
    gl.setRenderTarget(null);
    camera.layers.set(EXTERIOR);
    screenMaterial.uniforms.uHasMap.value = 1.0;
    screenMaterial.uniforms.uMap.value = target.texture;
    gl.render(scene, camera);
  }, 1);

  return null;
}
