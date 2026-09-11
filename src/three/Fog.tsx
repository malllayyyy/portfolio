'use client';

import { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Color } from 'three';
import type { AmbientLight, DirectionalLight, FogExp2, PointLight } from 'three';
const FOG_TABLE = [
  { y: 6.0, color: new Color('#1A2430'), density: 0.012 },
  { y: -12.0, color: new Color('#171A1E'), density: 0.018 },
  { y: -40.0, color: new Color('#1E1A12'), density: 0.022 },
  { y: -70.0, color: new Color('#14090A'), density: 0.026 },
  { y: -260.0, color: new Color('#06080B'), density: 0.032 },
] as const;

const ACCENT_COLORS = [
  new Color('#8FD3FF'), // Surface (y > -40)
  new Color('#FFC46B'), // Device (-40 >= y > -150)
  new Color('#C8FF6A'), // Reasoning (y <= -150)
] as const;

const tempFogColor = new Color();

function getFogAtY(y: number, outColor: Color): number {
  if (y >= FOG_TABLE[0].y) {
    outColor.copy(FOG_TABLE[0].color);
    return FOG_TABLE[0].density;
  }
  const lastIdx = FOG_TABLE.length - 1;
  if (y <= FOG_TABLE[lastIdx].y) {
    outColor.copy(FOG_TABLE[lastIdx].color);
    return FOG_TABLE[lastIdx].density;
  }
  for (let i = 0; i < lastIdx; i++) {
    const p1 = FOG_TABLE[i];
    const p2 = FOG_TABLE[i + 1];
    if (y <= p1.y && y >= p2.y) {
      const t = (y - p1.y) / (p2.y - p1.y);
      outColor.lerpColors(p1.color, p2.color, t);
      return p1.density + t * (p2.density - p1.density);
    }
  }
  outColor.copy(FOG_TABLE[lastIdx].color);
  return FOG_TABLE[lastIdx].density;
}

function getDirectionalIntensityAtY(y: number): number {
  if (y >= 0) return 0.9;
  if (y >= -260) return 0.9 + (y / -260) * (0.15 - 0.9);
  return 0.15;
}

/**
 * Index into ACCENT_COLORS, one entry per surviving layer.
 *
 * The Reasoning boundary is -150 rather than its -260 datum because the accent
 * light has to agree with the geometry it is lighting, not with the gauge's
 * label. Reasoning's node cloud spans -248 to -293 and fog visibility is about
 * 100 m, so the field comes into view around -150. Lighting it with Device's
 * amber while it is the only thing on screen turned the whole approach muddy.
 */
function getLayerIndex(y: number): number {
  if (y > -40) return 0; // Surface
  if (y > -150) return 1; // Device, and the empty transit below it
  return 2; // Reasoning, from the moment its field is visible
}

export function Fog() {
  const { camera, gl } = useThree();
  const fogRef = useRef<FogExp2>(null);
  const dirLightRef = useRef<DirectionalLight>(null);
  const pointLightRef = useRef<PointLight>(null);
  const ambientLightRef = useRef<AmbientLight>(null);

  const prevLayerRef = useRef<number | null>(null);

  useFrame((_state, delta) => {
    const cameraY = camera.position.y;
    // 1. Fog color & density + setClearColor
    const density = getFogAtY(cameraY, tempFogColor);

    if (fogRef.current) {
      fogRef.current.color.copy(tempFogColor);
      fogRef.current.density = density;
    }
    gl.setClearColor(tempFogColor);

    // 2. Ambient light (colour = current fog colour, intensity 0.06)
    if (ambientLightRef.current) {
      ambientLightRef.current.color.copy(tempFogColor);
    }

    // 3. Directional light position & intensity
    if (dirLightRef.current) {
      dirLightRef.current.position.set(0, cameraY + 60, 0);
      dirLightRef.current.target.position.set(0, cameraY, 0);
      dirLightRef.current.target.updateMatrixWorld();
      dirLightRef.current.intensity = getDirectionalIntensityAtY(cameraY);
    }
    // 4. Point light position & layer accent color transition
    if (pointLightRef.current) {
      pointLightRef.current.position.set(0, cameraY - 3.0, 0);

      const layerIdx = getLayerIndex(cameraY);
      const targetColor = ACCENT_COLORS[layerIdx];
      if (prevLayerRef.current === null) {
        prevLayerRef.current = layerIdx;
        pointLightRef.current.color.copy(targetColor);
      } else {
        prevLayerRef.current = layerIdx;
        const dt = Math.min(delta, 0.1);
        pointLightRef.current.color.lerp(targetColor, 1 - Math.exp(-dt / 0.18));
      }
    }
  });

  return (
    <>
      <fogExp2 ref={fogRef} attach="fog" args={['#1A2430', 0.012]} />
      <directionalLight
        ref={(node) => {
          if (node) {
            node.layers.enableAll();
            dirLightRef.current = node;
          }
        }}
        position={[0, 60, 0]}
        intensity={0.9}
        color="#EDF1F5"
      />
      <pointLight
        ref={(node) => {
          if (node) {
            node.layers.enableAll();
            pointLightRef.current = node;
          }
        }}
        position={[0, -3, 0]}
        distance={65}
        decay={2}
        intensity={10.0}
      />
      <ambientLight
        ref={(node) => {
          if (node) {
            node.layers.enableAll();
            ambientLightRef.current = node;
          }
        }}
        intensity={0.14}
      />
    </>
  );
}

export default Fog;
