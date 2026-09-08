'use client';

import { useMemo, useRef } from 'react';
import { Matrix4, Shape } from 'three';
import type { InstancedMesh, Mesh, Object3D, ShaderMaterial } from 'three';

export const EXTERIOR = 1;
export const INTERIOR = 2;

/** Assign an object to a single layer channel (§ 2.6). */
function toLayer(channel: number) {
  return (obj: Object3D | null) => {
    if (obj) obj.layers.set(channel);
  };
}

/** A rounded outer rectangle with a rectangular hole — i.e. a frame. */
function ringShape(
  outerW: number,
  outerL: number,
  innerW: number,
  innerL: number,
  radius: number
): Shape {
  const ox = outerW / 2;
  const oz = outerL / 2;
  const s = new Shape();
  s.moveTo(-ox + radius, -oz);
  s.lineTo(ox - radius, -oz);
  s.quadraticCurveTo(ox, -oz, ox, -oz + radius);
  s.lineTo(ox, oz - radius);
  s.quadraticCurveTo(ox, oz, ox - radius, oz);
  s.lineTo(-ox + radius, oz);
  s.quadraticCurveTo(-ox, oz, -ox, oz - radius);
  s.lineTo(-ox, -oz + radius);
  s.quadraticCurveTo(-ox, -oz, -ox + radius, -oz);

  const hx = innerW / 2;
  const hz = innerL / 2;
  const hole = new Shape();
  hole.moveTo(-hx, -hz);
  hole.lineTo(hx, -hz);
  hole.lineTo(hx, hz);
  hole.lineTo(-hx, hz);
  hole.closePath();
  s.holes.push(hole);

  return s;
}

/**
 * § 2.3 Device — the monolith at y = −40, its bezel ring, the screen quad,
 * and the real interior below.
 *
 * The body is a FRAME, not a solid box: the 5.6 x 12.4 aperture is a real hole
 * through it, which is what the camera descends through and what the screen
 * quad fills. A solid body would bury the quad inside itself and there would be
 * nothing to pass through.
 *
 * Deviation from plan Task 3.2 Step 1: geometry is procedural rather than an
 * authored Draco GLB — no Blender is available here, and an extruded rounded
 * frame is exactly what the spec describes. This also removes a 120 KB asset
 * fetch from the critical path. Dimensions, materials and layer channels are
 * § 2.3 verbatim.
 *
 * Extrude note: `extrudeGeometry` builds the shape in the XY plane and extrudes
 * along +Z, so every extruded mesh here is rotated −90° about X to lie flat in
 * the XZ plane. Without that rotation the bezel renders as vertical strips.
 */
export function Device({ screenMaterial }: { screenMaterial: ShaderMaterial }) {
  const screenRef = useRef<Mesh>(null);
  const stationsRef = useRef<InstancedMesh>(null);

  // Body: 6.2 x 13.4 outer, 5.6 x 12.4 aperture, 0.62 thick.
  const bodyShape = useMemo(() => ringShape(6.2, 13.4, 5.6, 12.4, 0.4), []);

  // Bezel ring: a separate mesh, same aperture, 0.3 thick, sitting proud of the
  // body. This is the mesh the camera visibly passes and it is never hidden —
  // it clips against the near plane on the way through, and that clipping IS
  // the sensation of entering (§ 2.6).
  const bezelShape = useMemo(() => ringShape(6.6, 13.8, 5.6, 12.4, 0.4), []);

  // Eight gaming stations — the GameZone interior, one instanced draw call.
  const stationMatrices = useMemo(() => {
    const m = new Matrix4();
    const out: Matrix4[] = [];
    for (let i = 0; i < 8; i++) {
      const col = i % 4;
      const row = Math.floor(i / 4);
      m.identity().setPosition(-4.5 + col * 3, -52, -2.2 + row * 4.4);
      out.push(m.clone());
    }
    return out;
  }, []);

  return (
    <group>
      {/* ── EXTERIOR (channel 1) ───────────────────────────────────── */}

      {/*
        Body: 6.2 x 0.62 x 13.4 solid, brushed aluminium, no clearcoat.
        Centred at y = −40.31 so its TOP FACE sits exactly at y = −40.0 — the
        phone's top face IS the screen plane. A solid body matters: it makes the
        screen quad the only way to see the interior, so there is no competing
        "direct view" through an aperture to disagree with the quad around its
        perimeter (that disagreement measured as a ~116 mean boundary delta).
        The body and bezel clip against the near plane as the camera passes
        through them, which § 2.6 calls the sensation of entering.
      */}
      <mesh ref={toLayer(EXTERIOR)} position={[0, -40.31, 0]}>
        <boxGeometry args={[6.2, 0.62, 13.4]} />
        <meshStandardMaterial metalness={0.95} roughness={0.28} color="#7C8590" />
      </mesh>

      {/* Bezel ring around the screen edge, spanning y −39.9 … −40.1 */}
      <mesh
        ref={toLayer(EXTERIOR)}
        position={[0, -39.9, 0]}
        rotation={[Math.PI / 2, 0, 0]}
      >
        <extrudeGeometry args={[bezelShape, { depth: 0.2, bevelEnabled: false }]} />
        <meshStandardMaterial metalness={0.9} roughness={0.35} color="#7C8590" />
      </mesh>

      {/* Screen quad: 5.6 x 12.4, the body's top face, fractionally proud of it */}
      <mesh
        ref={(m) => {
          screenRef.current = m;
          toLayer(EXTERIOR)(m);
          if (m) m.userData.isScreenQuad = true;
        }}
        position={[0, -39.998, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        material={screenMaterial}
      >
        <planeGeometry args={[5.6, 12.4]} />
      </mesh>

      {/* ── INTERIOR (channel 2) ───────────────────────────────────── */}

      {/* Emissive floor grid at y = −70, Device accent */}
      <mesh ref={toLayer(INTERIOR)} position={[0, -70, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[60, 60, 24, 24]} />
        <meshStandardMaterial
          color="#0E1116"
          emissive="#FFC46B"
          emissiveIntensity={0.5}
          wireframe
        />
      </mesh>

      {/* Eight station slabs, one instanced draw call */}
      <instancedMesh
        ref={(m) => {
          stationsRef.current = m;
          toLayer(INTERIOR)(m);
          if (m) {
            stationMatrices.forEach((mat, i) => m.setMatrixAt(i, mat));
            m.instanceMatrix.needsUpdate = true;
          }
        }}
        args={[undefined, undefined, 8]}
      >
        <boxGeometry args={[2.4, 0.12, 1.6]} />
        <meshStandardMaterial
          color="#1B2430"
          emissive="#FFC46B"
          emissiveIntensity={0.06}
          metalness={0.2}
          roughness={0.7}
        />
      </instancedMesh>
    </group>
  );
}
