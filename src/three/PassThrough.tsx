'use client';

import { useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { SRGBColorSpace, UnsignedByteType, WebGLRenderTarget } from 'three';
import type { Object3D, ShaderMaterial } from 'three';
import { EXTERIOR, INTERIOR } from './layers/Device';

/**
 * The quad carries the interior for the whole approach: with a solid body it is
 * the ONLY way to see in, so there is no competing direct view to disagree with.
 * The prototype sweep starts at −30, so the window opens there.
 */
const WINDOW_TOP = -30.0;
const WINDOW_BOTTOM = -40.0;

/**
 * The quad must stop carrying the interior before it crosses the near plane,
 * or it gets clipped and pass B has nothing to sample (a black band). With
 * camera.near at 0.02 this margin is ~1 frame of travel, which is the single
 * frame § 2.6 allows.
 */
const QUAD_NEAR_MARGIN = 0.03;


declare global {
  interface Window {
    __lab?: {
      y: number;
      inWindow: boolean;
      calls: number;
      triangles: number;
      rt: string | null;
    };
  }
}

/**
 * Phase 3 go/no-go instrumentation. Writes nothing unless the lab route opts
 * in via `data-lab="1"`, so the real site never carries a debug global.
 */
function reportLab(
  y: number,
  inWindow: boolean,
  calls: number,
  triangles: number,
  rt: string | null
) {
  if (document.documentElement.dataset.lab !== '1') return;
  window.__lab = { y: +y.toFixed(2), inWindow, calls, triangles, rt };
}

let cachedQuad: Object3D | null = null;

/** Find the screen quad once and cache it; traversing every frame is wasteful. */
function screenQuad(scene: Object3D): Object3D | null {
  if (cachedQuad?.parent) return cachedQuad;
  cachedQuad = null;
  scene.traverse((o) => {
    if (o.userData.isScreenQuad) cachedQuad = o;
  });
  return cachedQuad;
}
/**
 * § 2.6 — the two-pass render.
 *
 * One scene, one camera, one set of world coordinates. There is no second
 * world and no second camera; separation is `THREE.Layers` alone.
 *
 * Inside the window:
 *   pass A — channel 2 (INTERIOR) into a render target, from the real camera
 *   pass B — channel 1 (EXTERIOR) to screen, with the quad sampling pass A
 *
 * Outside it there is exactly one pass: channel 1 above −36 m, channel 2 at
 * and below −40 m. Because both passes share the camera matrices and the quad
 * samples in screen space, the frame where the quad stops being drawn is
 * identical to the frame before it — the swap has nothing to see.
 *
 * `renderPriority: 1` takes the render loop away from R3F, so every draw in
 * this file is explicit.
 */
export function PassThrough({ screenMaterial }: { screenMaterial: ShaderMaterial }) {
  const { gl, scene, camera, size, viewport } = useThree();

  // dprCap: 2 on high tier, 1.5 on mid (§ 2.6). Read the tier the boot script set.
  const dprCap = useMemo(() => {
    if (typeof document === 'undefined') return 1.5;
    return document.documentElement.dataset.tier === 'high' ? 2 : 1.5;
  }, []);

  const rt = useRef<WebGLRenderTarget | null>(null);

  const allocate = () => {
    const dpr = Math.min(viewport.dpr || 1, dprCap);
    const w = Math.max(1, Math.floor(size.width * dpr));
    const h = Math.max(1, Math.floor(size.height * dpr));

    if (rt.current) {
      if (rt.current.width === w && rt.current.height === h) return;
      rt.current.dispose();
    }
    rt.current = new WebGLRenderTarget(w, h, {
      samples: document.documentElement.dataset.tier === 'high' ? 4 : 0,
      depthBuffer: true,
      // UnsignedByteType, not HalfFloatType. three keeps FLOAT targets linear
      // and only applies the output colour-space encoding to byte targets, so a
      // half-float target handed the quad LINEAR pixels while the direct view
      // was sRGB-encoded. That measured as a 2.1x / 2.7x / 4.3x per-channel
      // brightness jump on the swap frame — non-uniform, which is the signature
      // of a missing transfer function rather than a content difference. There
      // is no post-processing here, so byte precision costs nothing.
      type: UnsignedByteType,
    });

    // Declares the encoding three applies when writing into the target, so the
    // quad's raw texture2D sample matches the directly-rendered view.
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

    // The quad only carries the interior during the approach. Outside the
    // window it is hidden and the aperture shows the interior directly — which
    // is identical output, because the quad samples in screen space. Leaving it
    // visible up close made it fill the frame and render a 0.4 m black band.
    const quad = screenQuad(scene);
    if (quad) quad.visible = inWindow;

    if (!inWindow) {
      if (y > WINDOW_TOP) {
        // Far above: exterior plus interior, so the aperture reads as a hole
        // with the lit interior behind it rather than a black rectangle.
        camera.layers.set(EXTERIOR);
        camera.layers.enable(INTERIOR);
      } else {
        // Past the screen plane. Rendering channel 2 alone is what § 2.6 says,
        // but it is wrong for this geometry: the body spans y −39.69 … −40.31
        // and the bezel −39.9 … −40.1, so they are still partly in front of the
        // camera. Dropping channel 1 made them vanish mid-frame — measured as a
        // 147.2 mean / 575 worst delta on the swap pair against a 4.0 non-swap
        // mean, the exact seam G3.1 exists to catch. Keeping both channels lets
        // them clip against the near plane instead, which § 2.6 calls the
        // sensation of entering.
        camera.layers.set(INTERIOR);
        camera.layers.enable(EXTERIOR);
      }
      gl.setRenderTarget(null);
      gl.render(scene, camera);
      reportLab(y, false, gl.info.render.calls, gl.info.render.triangles, null);
      return;
    }

    if (!rt.current) allocate();
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
    screenMaterial.uniforms.uMap.value = target.texture;
    gl.render(scene, camera);

    reportLab(y, true, gl.info.render.calls, gl.info.render.triangles, `${target.width}x${target.height}`);
  }, 1);

  return null;
}
