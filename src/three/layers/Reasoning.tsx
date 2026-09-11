'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { AdditiveBlending, Color } from 'three';
import type { Object3D, ShaderMaterial } from 'three';
import { INTERIOR } from './Device';
import { Exhibit } from '../Exhibit';
import { NodeField } from '../NodeField';

export type ClientMessageType =
  | 'prompt'
  | 'set_model'
  | 'spawn'
  | 'list_sessions'
  | 'switch_session';

export type ServerMessageType =
  | 'roster'
  | 'models'
  | 'session_event'
  | 'session_messages'
  | 'error'
  | 'sessions'
  | 'session_switched';

export type SwitchboardMessageType = ClientMessageType | ServerMessageType;

export const SWITCHBOARD_CLIENT_TYPES: ClientMessageType[] = [
  'prompt',
  'set_model',
  'spawn',
  'list_sessions',
  'switch_session',
];

export const SWITCHBOARD_SERVER_TYPES: ServerMessageType[] = [
  'roster',
  'models',
  'session_event',
  'session_messages',
  'error',
  'sessions',
  'session_switched',
];

export const SWITCHBOARD_MESSAGE_TYPES: SwitchboardMessageType[] = [
  ...SWITCHBOARD_CLIENT_TYPES,
  ...SWITCHBOARD_SERVER_TYPES,
];

function toInterior(obj: Object3D | null) {
  if (obj) obj.layers.set(INTERIOR);
}

const VERTEX_SHADER = `
uniform float uTime;

void main() {
  vec3 pos = position;
  float wave = sin(uTime * 1.2 + pos.x * 0.08 + pos.z * 0.08) * 0.35;
  pos.y += wave;

  vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
  gl_Position = projectionMatrix * mvPosition;
  gl_PointSize = clamp(320.0 / -mvPosition.z, 3.0, 14.0);
}
`;

const FRAGMENT_SHADER = `
uniform vec3 uAccent;

void main() {
  vec2 coord = gl_PointCoord - vec2(0.5);
  float dist = length(coord);
  if (dist > 0.5) discard;
  float alpha = pow(smoothstep(0.5, 0.0, dist), 1.5);
  gl_FragColor = vec4(uAccent, alpha * 1.0);
}
`;

export function Reasoning() {
  const shaderMaterialRef = useRef<ShaderMaterial>(null);

  const isHighTier = useMemo(() => {
    if (typeof document === 'undefined') return true;
    return document.documentElement.dataset.tier === 'high';
  }, []);

  const pointCount = isHighTier ? 6000 : 2400;
  const edgeCount = isHighTier ? 9000 : 3600;

  const { pointPositions, edgePositions } = useMemo(() => {
    let seed = 4294967;
    const rand = () => {
      seed = (seed * 1664525 + 1013904223) % 4294967296;
      return seed / 4294967296;
    };

    const pts = new Float32Array(pointCount * 3);
    for (let i = 0; i < pointCount; i++) {
      pts[i * 3] = (rand() - 0.5) * 140;
      pts[i * 3 + 1] = -248 - rand() * 45;
      pts[i * 3 + 2] = (rand() - 0.5) * 140;
    }

    const edges = new Float32Array(edgeCount * 6);
    let segs = 0;

    for (let i = 0; i < pointCount && segs < edgeCount; i++) {
      const x1 = pts[i * 3];
      const y1 = pts[i * 3 + 1];
      const z1 = pts[i * 3 + 2];

      for (let j = 1; j <= 25 && segs < edgeCount; j++) {
        const targetIdx = (i + j) % pointCount;
        const x2 = pts[targetIdx * 3];
        const y2 = pts[targetIdx * 3 + 1];
        const z2 = pts[targetIdx * 3 + 2];

        const dx = x2 - x1;
        const dy = y2 - y1;
        const dz = z2 - z1;
        const distSq = dx * dx + dy * dy + dz * dz;

        if (distSq < 1200) {
          const base = segs * 6;
          edges[base] = x1;
          edges[base + 1] = y1;
          edges[base + 2] = z1;
          edges[base + 3] = x2;
          edges[base + 4] = y2;
          edges[base + 5] = z2;
          segs++;
        }
      }
    }

    while (segs < edgeCount) {
      const i = Math.floor(rand() * pointCount);
      const j = Math.floor(rand() * pointCount);
      if (i !== j) {
        const base = segs * 6;
        edges[base] = pts[i * 3];
        edges[base + 1] = pts[i * 3 + 1];
        edges[base + 2] = pts[i * 3 + 2];
        edges[base + 3] = pts[j * 3];
        edges[base + 4] = pts[j * 3 + 1];
        edges[base + 5] = pts[j * 3 + 2];
        segs++;
      }
    }

    return { pointPositions: pts, edgePositions: edges };
  }, [pointCount, edgeCount]);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uAccent: { value: new Color('#C8FF6A') },
    }),
    []
  );

  useFrame((state) => {
    if (shaderMaterialRef.current) {
      shaderMaterialRef.current.uniforms.uTime.value = state.clock.getElapsedTime();
    }
  });

  return (
    <group>
      {/* Node field: Points */}
      <points ref={toInterior}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[pointPositions, 3]}
          />
        </bufferGeometry>
        <shaderMaterial
          ref={shaderMaterialRef}
          uniforms={uniforms}
          vertexShader={VERTEX_SHADER}
          fragmentShader={FRAGMENT_SHADER}
          blending={AdditiveBlending}
          depthWrite={false}
          transparent
        />
      </points>

      {/* Edge field: LineSegments */}
      <lineSegments ref={toInterior}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[edgePositions, 3]}
          />
        </bufferGeometry>
        <lineBasicMaterial
          color="#C8FF6A"
          transparent
          opacity={0.65}
          blending={AdditiveBlending}
          depthWrite={false}
        />
      </lineSegments>
      {/* Switchboard NodeField Exhibit at y = -278 */}
      <Exhibit slug="switchboard" depth={-278}>
        <NodeField />
      </Exhibit>
      {/* Bedrock plane at y = -300 */}
      <mesh
        ref={toInterior}
        position={[0, -300, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <planeGeometry args={[400, 400]} />
        <meshStandardMaterial color="#10151C" emissive="#1B2430" roughness={0.8} />
      </mesh>
    </group>
  );
}
