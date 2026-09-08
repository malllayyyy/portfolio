'use client';

import { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import gsap from 'gsap';
import { Color } from 'three';
import type { AmbientLight, DirectionalLight, FogExp2, PointLight } from 'three';

const FOG_TABLE = [
  { y: 6.0, color: new Color('#1A2430'), density: 0.012 },
  { y: -12.0, color: new Color('#171A1E'), density: 0.018 },
  { y: -40.0, color: new Color('#1E1A12'), density: 0.022 },
  { y: -70.0, color: new Color('#14090A'), density: 0.028 },
  { y: -150.0, color: new Color('#0A0C10'), density: 0.034 },
  { y: -260.0, color: new Color('#06080B'), density: 0.042 },
] as const;

const ACCENT_COLORS = [
  new Color('#8FD3FF'), // Surface (y > -40)
  new Color('#FFC46B'), // Device (-40 >= y > -70)
  new Color('#FF5F56'), // Engine (-70 >= y > -150)
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
  if (y >= 0) return 2.4;
  if (y >= -150) return 2.4 + (y / -150) * (0.15 - 2.4);
  if (y >= -260) return 0.15 + ((y + 150) / -110) * (0 - 0.15);
  return 0;
}

function getLayerIndex(y: number): number {
  if (y > -40) return 0;
  if (y > -70) return 1;
  if (y > -150) return 2;
  return 3;
}

export function Fog() {
  const { camera, gl } = useThree();

  const fogRef = useRef<FogExp2>(null);
  const dirLightRef = useRef<DirectionalLight>(null);
  const pointLightRef = useRef<PointLight>(null);
  const ambientLightRef = useRef<AmbientLight>(null);

  const prevLayerRef = useRef<number | null>(null);

  useFrame(() => {
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
      if (prevLayerRef.current === null) {
        prevLayerRef.current = layerIdx;
        pointLightRef.current.color.copy(ACCENT_COLORS[layerIdx]);
      } else if (prevLayerRef.current !== layerIdx) {
        prevLayerRef.current = layerIdx;
        const targetColor = ACCENT_COLORS[layerIdx];
        gsap.to(pointLightRef.current.color, {
          r: targetColor.r,
          g: targetColor.g,
          b: targetColor.b,
          duration: 0.7,
          ease: 'power2.out',
          overwrite: 'auto',
        });
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
        intensity={2.4}
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
        distance={42}
        decay={2}
        intensity={6.0}
      />
      <ambientLight
        ref={(node) => {
          if (node) {
            node.layers.enableAll();
            ambientLightRef.current = node;
          }
        }}
        intensity={0.06}
      />
    </>
  );
}

export default Fog;
