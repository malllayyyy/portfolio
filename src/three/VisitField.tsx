'use client';

import { useMemo, useRef, useEffect, useSyncExternalStore } from 'react';
import { AdditiveBlending, BufferAttribute } from 'three';
import type { Object3D } from 'three';
import { INTERIOR } from './layers/Device';
import { subscribeVisit, getVisitSnapshot, getVisitServerSnapshot } from '@/lib/visit';

function toInterior(obj: Object3D | null) {
  if (obj) obj.layers.set(INTERIOR);
}

// 12 nodes in 2 columns of 6
const NODE_COUNT = 12;
const GRID_POSITIONS = new Float32Array(NODE_COUNT * 3);
for (let i = 0; i < 6; i++) {
  const z = -3.75 + i * 1.5;
  // Col 0
  GRID_POSITIONS[i * 3 + 0] = -1.0;
  GRID_POSITIONS[i * 3 + 1] = 0.0;
  GRID_POSITIONS[i * 3 + 2] = z;
  // Col 1
  GRID_POSITIONS[(i + 6) * 3 + 0] = 1.0;
  GRID_POSITIONS[(i + 6) * 3 + 1] = 0.0;
  GRID_POSITIONS[(i + 6) * 3 + 2] = z;
}

// 16 connecting edges between nodes
const EDGE_INDICES: Array<[number, number]> = [
  // Col 0 vertical
  [0, 1], [1, 2], [2, 3], [3, 4], [4, 5],
  // Col 1 vertical
  [6, 7], [7, 8], [8, 9], [9, 10], [10, 11],
  // Crossbars
  [0, 6], [1, 7], [2, 8], [3, 9], [4, 10], [5, 11],
];

const EDGE_POSITIONS = new Float32Array(EDGE_INDICES.length * 2 * 3);
for (let e = 0; e < EDGE_INDICES.length; e++) {
  const [a, b] = EDGE_INDICES[e];
  EDGE_POSITIONS[e * 6 + 0] = GRID_POSITIONS[a * 3 + 0];
  EDGE_POSITIONS[e * 6 + 1] = GRID_POSITIONS[a * 3 + 1];
  EDGE_POSITIONS[e * 6 + 2] = GRID_POSITIONS[a * 3 + 2];

  EDGE_POSITIONS[e * 6 + 3] = GRID_POSITIONS[b * 3 + 0];
  EDGE_POSITIONS[e * 6 + 4] = GRID_POSITIONS[b * 3 + 1];
  EDGE_POSITIONS[e * 6 + 5] = GRID_POSITIONS[b * 3 + 2];
}

const DARK_COLOR = [0.106, 0.145, 0.196]; // #1B2430
const LIT_COLOR = [0.784, 1.0, 0.416];   // #C8FF6A

export function VisitField() {
  const snapshot = useSyncExternalStore(
    subscribeVisit,
    getVisitSnapshot,
    getVisitServerSnapshot
  );

  const pointColorsRef = useRef<BufferAttribute>(null!);
  const lineColorsRef = useRef<BufferAttribute>(null!);

  const pointColors = useMemo(() => new Float32Array(NODE_COUNT * 3), []);
  const lineColors = useMemo(() => new Float32Array(EDGE_INDICES.length * 2 * 3), []);

  useEffect(() => {
    if (!pointColorsRef.current || !lineColorsRef.current) return;

    // Check lit/dark state for each of the 12 nodes
    const isLit = [
      !snapshot.tier.dark,
      !snapshot.cores.dark,
      !snapshot.deviceMemory.dark,
      !snapshot.pixelRatio.dark,
      !snapshot.viewportPointer.dark,
      !snapshot.reducedMotion.dark,
      !snapshot.saveData.dark,
      !snapshot.fcp.dark,
      !snapshot.lcp.dark,
      !snapshot.documentTransfer.dark,
      !snapshot.deferred3D.dark,
      !snapshot.frameMean.dark,
    ];

    // Update point colors
    for (let i = 0; i < NODE_COUNT; i++) {
      const c = isLit[i] ? LIT_COLOR : DARK_COLOR;
      pointColors[i * 3 + 0] = c[0];
      pointColors[i * 3 + 1] = c[1];
      pointColors[i * 3 + 2] = c[2];
    }
    pointColorsRef.current.needsUpdate = true;

    // Update line colors
    for (let e = 0; e < EDGE_INDICES.length; e++) {
      const [a, b] = EDGE_INDICES[e];
      const bothLit = isLit[a] && isLit[b];
      const c = bothLit ? LIT_COLOR : DARK_COLOR;

      lineColors[e * 6 + 0] = c[0];
      lineColors[e * 6 + 1] = c[1];
      lineColors[e * 6 + 2] = c[2];

      lineColors[e * 6 + 3] = c[0];
      lineColors[e * 6 + 4] = c[1];
      lineColors[e * 6 + 5] = c[2];
    }
    lineColorsRef.current.needsUpdate = true;
  }, [snapshot, pointColors, lineColors]);

  return (
    <group position={[-8.0, -272.0, 0.0]}>
      <points ref={toInterior}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[GRID_POSITIONS, 3]}
          />
          <bufferAttribute
            ref={pointColorsRef}
            attach="attributes-color"
            args={[pointColors, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.4}
          vertexColors
          transparent
          blending={AdditiveBlending}
          depthWrite={false}
        />
      </points>
      <lineSegments ref={toInterior}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[EDGE_POSITIONS, 3]}
          />
          <bufferAttribute
            ref={lineColorsRef}
            attach="attributes-color"
            args={[lineColors, 3]}
          />
        </bufferGeometry>
        <lineBasicMaterial
          vertexColors
          transparent
          opacity={0.65}
          blending={AdditiveBlending}
          depthWrite={false}
        />
      </lineSegments>
    </group>
  );
}
