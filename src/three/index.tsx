'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { ACESFilmicToneMapping, PMREMGenerator, SRGBColorSpace } from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { Scene } from './Scene';

/**
 * § 6.5 — one shared environment for the whole site. Generated in-process from
 * three's bundled RoomEnvironment via PMREM: brushed aluminium is metalness
 * 0.95, and a metal with nothing to reflect renders black no matter how many
 * lights you point at it. Generating it avoids fetching a remote HDR.
 */
function SceneEnvironment() {
  const { gl, scene } = useThree();

  useEffect(() => {
    const pmrem = new PMREMGenerator(gl);
    const room = new RoomEnvironment();
    const env = pmrem.fromScene(room, 0.04);
    scene.environment = env.texture;
    scene.environmentIntensity = 0.35;

    return () => {
      scene.environment = null;
      env.dispose();
      pmrem.dispose();
      room.dispose?.();
    };
  }, [gl, scene]);

  return null;
}

/**
 * The single dynamic-import entry point for all 3D. Every import of `three`,
 * `@react-three/*`, `gsap` and `lenis` lives in this module's subtree and
 * nowhere else, so the whole 3D chunk stays behind one `import()` and low tier
 * never fetches a byte of it (§ 8.3).
 */
export default function CanvasContainer() {
  const [reduced, setReduced] = useState(false);
  const frames = useRef(0);

  const isHighTier = useMemo(() => {
    if (typeof document === 'undefined') return true;
    return document.documentElement.dataset.tier === 'high';
  }, []);

  useEffect(() => {
    const read = () => setReduced(document.documentElement.dataset.motion === 'off');
    read();
    const obs = new MutationObserver(read);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['data-motion'] });
    return () => obs.disconnect();
  }, []);

  return (
    <Canvas
      // § 9.1: the canvas is decorative; every fact it shows exists in the DOM.
      aria-hidden="true"
      role="presentation"
      tabIndex={-1}
      // Reduced motion (§ 9.4): render on demand instead of a continuous loop.
      frameloop={reduced ? 'demand' : 'always'}
      dpr={[1, 2]}
      gl={{
        antialias: isHighTier,
        powerPreference: 'high-performance',
        alpha: false,
        logarithmicDepthBuffer: true,
        // The G3.1 frame-diff criterion needs to read pixels back off the
        // canvas, which is impossible once the drawing buffer is swapped away.
        // Lab route only — it costs performance and the real site never sets it.
        preserveDrawingBuffer:
          typeof document !== 'undefined' && document.documentElement.dataset.lab === '1',
      }}
      camera={{ position: [0, 6, 0], fov: 55, near: 0.02, far: 420 }}
      onCreated={({ gl }) => {
        gl.setClearColor('#06080B');
        gl.toneMapping = ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.05;
        gl.outputColorSpace = SRGBColorSpace;
        frames.current = 0;
      }}
      style={{ position: 'fixed', inset: 0, width: '100vw', height: '100vh', zIndex: 0 }}
    >
      <SceneEnvironment />
      <Scene />
    </Canvas>
  );
}
