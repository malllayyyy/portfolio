'use client';

import { useMemo, useRef, useState } from 'react';
import {
  BufferAttribute,
  AdditiveBlending,
} from 'three';
import type {
  Object3D,
} from 'three';
import { INTERIOR } from './layers/Device';
import { SWITCHBOARD_TRACE } from '@/content/site';
import type { TraceFixture } from '@/content/types';
import {
  CLIENT_MESSAGES,
  SERVER_MESSAGES,
} from '@/content/projects/switchboard';

export type ClientMessageType = (typeof CLIENT_MESSAGES)[number];
export type ServerMessageType = (typeof SERVER_MESSAGES)[number];
export type SwitchboardMessageType = ClientMessageType | ServerMessageType;

export const SWITCHBOARD_MESSAGE_TYPES: SwitchboardMessageType[] = [
  ...CLIENT_MESSAGES,
  ...SERVER_MESSAGES,
];

const trace: TraceFixture | null = SWITCHBOARD_TRACE;

/** Node positions in 3D space around y = -278 */
const NODE_POSITIONS: Record<SwitchboardMessageType, [number, number, number]> = {
  // Client Messages (X < 0)
  prompt: [-7.5, -277.2, -5.0],
  set_model: [-8.2, -277.8, -2.5],
  spawn: [-8.5, -278.0, 0.0],
  list_sessions: [-8.2, -278.2, 2.5],
  switch_session: [-7.5, -278.8, 5.0],

  // Server Messages (X > 0)
  roster: [7.5, -277.0, -6.0],
  models: [8.0, -277.3, -4.0],
  session_event: [8.5, -277.7, -2.0],
  session_messages: [8.5, -278.0, 0.0],
  error: [8.2, -278.3, 2.0],
  sessions: [7.8, -278.6, 4.0],
  session_switched: [7.0, -279.0, 6.0],
};

/** Directed protocol edges (from -> to) */
const PROTOCOL_EDGES: Array<[SwitchboardMessageType, SwitchboardMessageType]> = [
  ['prompt', 'session_event'],
  ['prompt', 'session_messages'],
  ['prompt', 'error'],
  ['set_model', 'models'],
  ['set_model', 'session_event'],
  ['set_model', 'error'],
  ['spawn', 'roster'],
  ['spawn', 'session_event'],
  ['spawn', 'error'],
  ['list_sessions', 'sessions'],
  ['list_sessions', 'error'],
  ['switch_session', 'session_switched'],
  ['switch_session', 'session_messages'],
  ['switch_session', 'error'],
  ['roster', 'session_event'],
  ['sessions', 'session_switched'],
  ['session_event', 'session_messages'],
  ['session_messages', 'error'],
];

function toInterior(obj: Object3D | null) {
  if (obj) obj.layers.set(INTERIOR);
}

/**
 * § 2.3 / § 3.4 TracePath component.
 * Renders a Line of <= 60 vertices lit to full #C8FF6A (1 draw call).
 * Mounted ONLY when a real recorded session trace exists.
 */
export function TracePath({ steps }: { steps: TraceFixture['steps'] }) {
  const lineRef = useRef<Object3D | null>(null);

  const positions = useMemo(() => {
    const count = Math.min(steps.length, 60);
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const step = steps[i];
      const fromPos = NODE_POSITIONS[step.from as SwitchboardMessageType] || [0, -278, 0];
      const toPos = NODE_POSITIONS[step.to as SwitchboardMessageType] || [0, -278, 0];
      const t = count > 1 ? i / (count - 1) : 0.5;
      arr[i * 3] = fromPos[0] + (toPos[0] - fromPos[0]) * t;
      arr[i * 3 + 1] = fromPos[1] + (toPos[1] - fromPos[1]) * t;
      arr[i * 3 + 2] = fromPos[2] + (toPos[2] - fromPos[2]) * t;
    }
    return arr;
  }, [steps]);

  return (
    <line
      ref={(obj: unknown) => {
        const o = obj as Object3D | null;
        lineRef.current = o;
        toInterior(o);
      }}
    >
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <lineBasicMaterial
        color="#C8FF6A"
        linewidth={2}
        transparent
        opacity={1.0}
        blending={AdditiveBlending}
        depthWrite={false}
      />
    </line>
  );
}

interface NodeFieldProps {
  selectedType?: SwitchboardMessageType | null;
  onSelectType?: (type: SwitchboardMessageType | null) => void;
}

export function NodeField({ selectedType: externalSelected, onSelectType }: NodeFieldProps) {
  const [internalSelected, setInternalSelected] = useState<SwitchboardMessageType | null>(null);
  const selectedType = externalSelected !== undefined ? externalSelected : internalSelected;

  const pointsRef = useRef<Object3D | null>(null);
  const linesRef = useRef<Object3D | null>(null);

  // 1. Points geometry (1 draw call)
  const pointPositions = useMemo(() => {
    const arr = new Float32Array(SWITCHBOARD_MESSAGE_TYPES.length * 3);
    SWITCHBOARD_MESSAGE_TYPES.forEach((type, idx) => {
      const pos = NODE_POSITIONS[type];
      arr[idx * 3] = pos[0];
      arr[idx * 3 + 1] = pos[1];
      arr[idx * 3 + 2] = pos[2];
    });
    return arr;
  }, []);

  // Point colors (accent #C8FF6A = [0.784, 1.0, 0.416])
  const pointColors = useMemo(() => {
    const arr = new Float32Array(SWITCHBOARD_MESSAGE_TYPES.length * 3);
    for (let i = 0; i < SWITCHBOARD_MESSAGE_TYPES.length; i++) {
      arr[i * 3] = 0.784;
      arr[i * 3 + 1] = 1.0;
      arr[i * 3 + 2] = 0.416;
    }
    return arr;
  }, []);

  // 2. LineSegments geometry (1 draw call)
  const { edgePositions, edgeColors } = useMemo(() => {
    const numEdges = PROTOCOL_EDGES.length;
    const posArr = new Float32Array(numEdges * 6);
    const colArr = new Float32Array(numEdges * 6);

    PROTOCOL_EDGES.forEach(([from, to], idx) => {
      const p1 = NODE_POSITIONS[from];
      const p2 = NODE_POSITIONS[to];
      const base = idx * 6;

      posArr[base] = p1[0];
      posArr[base + 1] = p1[1];
      posArr[base + 2] = p1[2];

      posArr[base + 3] = p2[0];
      posArr[base + 4] = p2[1];
      posArr[base + 5] = p2[2];

      // Default color: subtle accent [0.35, 0.5, 0.2]
      colArr[base] = 0.35;
      colArr[base + 1] = 0.5;
      colArr[base + 2] = 0.2;
      colArr[base + 3] = 0.35;
      colArr[base + 4] = 0.5;
      colArr[base + 5] = 0.2;
    });

    return { edgePositions: posArr, edgeColors: colArr };
  }, []);

  // Update edge colors when selectedType changes without reallocating buffers
  const colorAttributeRef = useRef<BufferAttribute>(null);
  useMemo(() => {
    if (!colorAttributeRef.current) return;
    const colArr = colorAttributeRef.current.array as Float32Array;

    PROTOCOL_EDGES.forEach(([from, to], idx) => {
      const isConnected =
        !selectedType || from === selectedType || to === selectedType;
      const base = idx * 6;

      const r = isConnected ? 0.784 : 0.08;
      const g = isConnected ? 1.0 : 0.12;
      const b = isConnected ? 0.416 : 0.15;

      colArr[base] = r;
      colArr[base + 1] = g;
      colArr[base + 2] = b;
      colArr[base + 3] = r;
      colArr[base + 4] = g;
      colArr[base + 5] = b;
    });

    colorAttributeRef.current.needsUpdate = true;
  }, [selectedType]);

  return (
    <group>
      {/* 12 Node Classes Points (1 draw call) */}
      <points
        ref={(obj: unknown) => {
          const o = obj as Object3D | null;
          pointsRef.current = o;
          toInterior(o);
        }}
      >
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[pointPositions, 3]}
          />
          <bufferAttribute
            attach="attributes-color"
            args={[pointColors, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          size={10}
          sizeAttenuation
          vertexColors
          transparent
          opacity={0.9}
          depthWrite={false}
          blending={AdditiveBlending}
        />
      </points>

      {/* Protocol Edges LineSegments (1 draw call) */}
      <lineSegments
        ref={(obj: unknown) => {
          const o = obj as Object3D | null;
          linesRef.current = o;
          toInterior(o);
        }}
      >
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[edgePositions, 3]}
          />
          <bufferAttribute
            ref={colorAttributeRef}
            attach="attributes-color"
            args={[edgeColors, 3]}
          />
        </bufferGeometry>
        <lineBasicMaterial
          vertexColors
          transparent
          opacity={0.85}
          depthWrite={false}
          blending={AdditiveBlending}
        />
      </lineSegments>

      {/* Trace path drop-in seam: mounted ONLY when a real trace exists */}
      {trace && <TracePath steps={trace.steps} />}
    </group>
  );
}

export default NodeField;
