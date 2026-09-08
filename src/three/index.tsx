'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { ACESFilmicToneMapping, PMREMGenerator, SRGBColorSpace } from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import type { Object3D, PerspectiveCamera } from 'three';
import { Device } from './layers/Device';
import { PassThrough } from './PassThrough';
import { createScreenMaterial } from './ScreenMaterial';

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
 *
 * Phase 3 scope only: the prototype sweep from y = −30 to y = −44. No depth
 * gauge, no other layers, no exhibits — Phase 4 adds those.
 */

const TOP = -30;
const BOTTOM = -44;

/** Maps document scroll linearly onto camera.y ∈ [−30, −44]. */
function ScrollCamera() {
  const camera = useThree((s) => s.camera) as PerspectiveCamera;

  useEffect(() => {
    // near is NEVER animated: changing it mid-descent shifts the depth-buffer
    // distribution and z-fights the Engine wireframes in Phase 4.
    // 0.02 rather than 0.1 so the screen quad stays inside the frustum until
    // the camera is ~1 frame from the screen plane.
    camera.near = 0.02;
    camera.far = 420;
    camera.fov = 55;
    camera.up.set(0, 0, -1); // looking straight down −Y
    camera.updateProjectionMatrix();

    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const t = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      const y = TOP + (BOTTOM - TOP) * t;
      camera.position.set(0, y, 0); // zero lateral drift in the prototype
      camera.lookAt(0, y - 1, 0);
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [camera]);

  return null;
}
/**
 * Lights live on channel 0 but must reach every channel. Camera layers decide
 * what is RENDERED; light layers decide what is LIT. Without this, pinning
 * meshes to channel 1/2 leaves them completely unlit and the scene renders black.
 */
function litEverywhere(light: Object3D | null) {
  if (light) light.layers.enableAll();
}


export default function Scene() {
  const screenMaterial = useMemo(() => createScreenMaterial(), []);
  const [reduced, setReduced] = useState(false);
  const frames = useRef(0);

  useEffect(() => {
    const read = () => setReduced(document.documentElement.dataset.motion === 'off');
    read();
    const obs = new MutationObserver(read);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['data-motion'] });
    return () => obs.disconnect();
  }, []);

  useEffect(() => () => screenMaterial.dispose(), [screenMaterial]);

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
        antialias: true,
        powerPreference: 'high-performance',
        alpha: false,
        // The G3.1 frame-diff criterion needs to read pixels back off the
        // canvas, which is impossible once the drawing buffer is swapped away.
        // Lab route only — it costs performance and the real site never sets it.
        preserveDrawingBuffer:
          typeof document !== 'undefined' && document.documentElement.dataset.lab === '1',
      }}
      camera={{ position: [0, TOP, 0], fov: 55, near: 0.02, far: 420 }}
      onCreated={({ gl }) => {
        gl.setClearColor('#06080B');
        gl.toneMapping = ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.05;
        gl.outputColorSpace = SRGBColorSpace;
        frames.current = 0;
      }}
      style={{ position: 'fixed', inset: 0, width: '100vw', height: '100vh' }}
    >
      <ScrollCamera />
      <SceneEnvironment />

      {/*
        Lights sit on channel 0 but must reach every channel: a light only
        illuminates an object when their layer masks intersect, so a channel-0
        light would light NOTHING once every mesh is pinned to channel 1 or 2.
        Hence enableAll(). Camera layers decide what is RENDERED; light layers
        decide what is LIT. They are separate systems.

        The key light is positioned just above the monolith rather than aimed at
        the world origin — the origin is 40 m above the phone, so an
        origin-targeted light only grazes it.
      */}
      <directionalLight
        ref={litEverywhere}
        position={[7, -33, 9]}
        intensity={2.4}
        color="#EDF1F5"
      />
      {/*
        Travelling interior light. Intensity is high because three's physically
        correct point lights fall off with distance squared and the stations sit
        ~6 m below it; at intensity 40 the interior read as near-black.
      */}
      <pointLight
        ref={litEverywhere}
        position={[0, -47, 0]}
        intensity={900}
        distance={60}
        decay={2}
        color="#FFC46B"
      />
      <ambientLight ref={litEverywhere} intensity={0.35} />

      <Device screenMaterial={screenMaterial} />
      <PassThrough screenMaterial={screenMaterial} />
    </Canvas>
  );
}
