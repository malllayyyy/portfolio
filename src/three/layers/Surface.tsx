'use client';

import { useMemo } from 'react';
import {
  BufferGeometry,
  CanvasTexture,
  DoubleSide,
  Float32BufferAttribute,
  RepeatWrapping,
} from 'three';
import type { Object3D } from 'three';
import { EXTERIOR } from './Device';

/** Assign an object to a single layer channel (§ 2.6). */
function toLayer(channel: number) {
  return (obj: Object3D | null) => {
    if (obj) obj.layers.set(channel);
  };
}

/**
 * § 2.3 Surface — depth y ∈ [0, −12]
 * - Strata ceiling: PlaneGeometry(240, 240, 1, 1) facing DOWN at y = 0 with a procedural alpha grid (1 draw call).
 * - Two exhibit plates: BoxGeometry(18, 0.06, 26) at y = −2 and y = −8, offset ±7 m in x.
 * - 24 suspension LineSegments merged into one buffer geometry (1 draw call).
 *
 * All meshes are assigned to EXTERIOR (channel 1).
 */
export function Surface() {
  const isHighTier = useMemo(() => {
    if (typeof document === 'undefined') return true;
    return document.documentElement.dataset.tier === 'high';
  }, []);

  // Procedural 2048² alpha grid for the strata ceiling plane (1 draw call).
  const gridTexture = useMemo(() => {
    if (typeof document === 'undefined') return null;
    const canvas = document.createElement('canvas');
    canvas.width = 2048;
    canvas.height = 2048;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, 2048, 2048);
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 4;
      const step = 64;
      ctx.beginPath();
      for (let x = 0; x <= 2048; x += step) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, 2048);
      }
      for (let y = 0; y <= 2048; y += step) {
        ctx.moveTo(0, y);
        ctx.lineTo(2048, y);
      }
      ctx.stroke();
    }
    const tex = new CanvasTexture(canvas);
    tex.wrapS = RepeatWrapping;
    tex.wrapT = RepeatWrapping;
    tex.repeat.set(12, 12);
    return tex;
  }, []);

  // 24 suspension lines merged into one BufferGeometry (1 draw call).
  const suspensionGeometry = useMemo(() => {
    const positions: number[] = [];

    const w = 9; // 18 / 2
    const d = 13; // 26 / 2

    // Plate 1: center [-7, -2, 0], top face y = -1.97
    const p1X = -7;
    const p1Y = -1.97;
    const p1Z = 0;
    const c1 = [p1X - w, p1Y, p1Z - d];
    const c2 = [p1X + w, p1Y, p1Z - d];
    const c3 = [p1X + w, p1Y, p1Z + d];
    const c4 = [p1X - w, p1Y, p1Z + d];

    // Plate 2: center [7, -8, 0], top face y = -7.97
    const p2X = 7;
    const p2Y = -7.97;
    const p2Z = 0;
    const c5 = [p2X - w, p2Y, p2Z - d];
    const c6 = [p2X + w, p2Y, p2Z - d];
    const c7 = [p2X + w, p2Y, p2Z + d];
    const c8 = [p2X - w, p2Y, p2Z + d];

    const addSegment = (from: number[], to: number[]) => {
      positions.push(...from, ...to);
    };

    // Plate 1: 12 line segments
    addSegment([c1[0], 0, c1[2]], c1);
    addSegment([c2[0], 0, c2[2]], c2);
    addSegment([c3[0], 0, c3[2]], c3);
    addSegment([c4[0], 0, c4[2]], c4);
    addSegment([c1[0] - 2, 0, c1[2] - 2], c1);
    addSegment([c2[0] + 2, 0, c2[2] - 2], c2);
    addSegment([c3[0] + 2, 0, c3[2] + 2], c3);
    addSegment([c4[0] - 2, 0, c4[2] + 2], c4);
    addSegment([p1X, 0, p1Z - d - 2], [p1X, p1Y, p1Z - d]);
    addSegment([p1X, 0, p1Z + d + 2], [p1X, p1Y, p1Z + d]);
    addSegment([p1X - w - 2, 0, p1Z], [p1X - w, p1Y, p1Z]);
    addSegment([p1X + w + 2, 0, p1Z], [p1X + w, p1Y, p1Z]);

    // Plate 2: 12 line segments
    addSegment([c5[0], 0, c5[2]], c5);
    addSegment([c6[0], 0, c6[2]], c6);
    addSegment([c7[0], 0, c7[2]], c7);
    addSegment([c8[0], 0, c8[2]], c8);
    addSegment([c5[0] - 2, 0, c5[2] - 2], c5);
    addSegment([c6[0] + 2, 0, c6[2] - 2], c6);
    addSegment([c7[0] + 2, 0, c7[2] + 2], c7);
    addSegment([c8[0] - 2, 0, c8[2] + 2], c8);
    addSegment([p2X, 0, p2Z - d - 2], [p2X, p2Y, p2Z - d]);
    addSegment([p2X, 0, p2Z + d + 2], [p2X, p2Y, p2Z + d]);
    addSegment([p2X - w - 2, 0, p2Z], [p2X - w, p2Y, p2Z]);
    addSegment([p2X + w + 2, 0, p2Z], [p2X + w, p2Y, p2Z]);

    const geom = new BufferGeometry();
    geom.setAttribute('position', new Float32BufferAttribute(positions, 3));
    return geom;
  }, []);

  return (
    <group>
      {/* 1. Strata ceiling at y = 0.1 facing down (1 draw call) */}
      <mesh
        ref={toLayer(EXTERIOR)}
        position={[0, 0.1, 0]}
        rotation={[Math.PI / 2, 0, 0]}
      >
        <planeGeometry args={[240, 240, 1, 1]} />
        <meshBasicMaterial
          color="#8FD3FF"
          alphaMap={gridTexture ?? undefined}
          transparent
          depthWrite={false}
          side={DoubleSide}
        />
      </mesh>

      {/* 2. Exhibit Plate 1 at y = −2, offset −7 m in x (1 draw call) */}
      <mesh ref={toLayer(EXTERIOR)} position={[-7, -2, 0]}>
        <boxGeometry args={[18, 0.06, 26]} />
        {isHighTier ? (
          <meshPhysicalMaterial
            transmission={0.9}
            thickness={0.4}
            roughness={0.22}
            ior={1.45}
            color="#EDF1F5"
            transparent
          />
        ) : (
          <meshStandardMaterial
            opacity={0.55}
            transparent
            roughness={0.22}
            color="#EDF1F5"
          />
        )}
      </mesh>

      {/* 3. Exhibit Plate 2 at y = −8, offset +7 m in x (1 draw call) */}
      <mesh ref={toLayer(EXTERIOR)} position={[7, -8, 0]}>
        <boxGeometry args={[18, 0.06, 26]} />
        {isHighTier ? (
          <meshPhysicalMaterial
            transmission={0.9}
            thickness={0.4}
            roughness={0.22}
            ior={1.45}
            color="#EDF1F5"
            transparent
          />
        ) : (
          <meshStandardMaterial
            opacity={0.55}
            transparent
            roughness={0.22}
            color="#EDF1F5"
          />
        )}
      </mesh>

      {/* 4. 24 suspension lines merged into 1 buffer geometry (1 draw call) */}
      <lineSegments ref={toLayer(EXTERIOR)} geometry={suspensionGeometry}>
        <lineBasicMaterial color="#8FA0B0" transparent opacity={0.6} />
      </lineSegments>
    </group>
  );
}
