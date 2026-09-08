'use client';

import { useMemo, useRef } from 'react';
import { Matrix4, MeshStandardMaterial, Shape } from 'three';
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
 * § 2.3 Device — the monolith whose top face sits at y = −40, its bezel ring,
 * the screen quad, and the real interior below.
 *
 * The body is a SOLID box. That matters: it makes the screen quad the only way
 * to see the interior, so there is no competing direct view through an aperture
 * to disagree with the quad around its perimeter. An earlier frame-with-a-hole
 * version produced exactly that disagreement and measured a ~116 mean delta at
 * each window boundary. The camera passes straight through the solid body and
 * bezel, which clip against the near plane on the way — § 2.6 calls that
 * clipping the sensation of entering.
 *
 * Deviation from plan Task 3.2 Step 1: geometry is procedural rather than an
 * authored Draco GLB — no Blender is available here, and § 2.3 specifies a
 * `BoxGeometry` body anyway. This also removes a 120 KB asset fetch from the
 * critical path.
 *
 * Extrude note: `extrudeGeometry` builds its shape in the XY plane and extrudes
 * along +Z, so the bezel is rotated 90° about X to lie flat in the XZ plane.
 * Without that rotation it renders as two vertical strips.
 */
export function Device({ screenMaterial }: { screenMaterial: ShaderMaterial }) {
  const screenRef = useRef<Mesh>(null);
  const stationsRef = useRef<InstancedMesh>(null);

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

  // BoxGeometry face order: +X, −X, +Y, −Y, +Z, −Z. Index 2 (+Y) is the screen.
  const bodyMaterials = useMemo(() => {
    const metal = new MeshStandardMaterial({
      metalness: 0.95,
      roughness: 0.28,
      color: '#8FA0B0',
    });
    return [metal, metal, screenMaterial, metal, metal, metal];
  }, [screenMaterial]);

  return (
    <group>
      {/* ── EXTERIOR (channel 1) ───────────────────────────────────── */}

      {/*
        Body: 6.2 x 0.62 x 13.4, centred at y = −40.31 so its TOP FACE sits
        exactly at y = −40.0 — the screen plane.

        The screen is not a separate mesh. It is this box's +Y face, via a
        per-face material array. That removes an entire class of bug: a separate
        quad coplanar with the face z-fights (0.002 m of separation lost the
        fight and the "screen" showed the body's own specular highlight, a
        constant 220,227,232 at every depth); gapping them by 0.06 m instead
        exposed the body face for 0.06 m of travel once the quad hid, measuring a
        477 mean seam; and resolving it with polygonOffset produced intermittent
        z-fight flicker (~490 mean spikes at scattered depths). One surface
        cannot fight or reveal itself.

        BoxGeometry emits its face groups in the order +X, −X, +Y, −Y, +Z, −Z, so
        index 2 is the top face and takes the screen material.

        Because the screen is the body, the camera passing y = −40.0 puts the
        face behind it and the interior becomes directly visible in the same
        frame — no hide step, nothing to sequence. The body and bezel clip
        against the near plane on the way through, which § 2.6 calls the
        sensation of entering.
      */}
      <mesh
        ref={(m) => {
          screenRef.current = m;
          toLayer(EXTERIOR)(m);
        }}
        position={[0, -40.31, 0]}
        material={bodyMaterials}
      >
        <boxGeometry args={[6.2, 0.62, 13.4]} />
      </mesh>

      {/* Bezel ring around the screen edge, spanning y −39.9 … −40.1 */}
      <mesh
        ref={toLayer(EXTERIOR)}
        position={[0, -39.9, 0]}
        rotation={[Math.PI / 2, 0, 0]}
      >
        <extrudeGeometry args={[bezelShape, { depth: 0.2, bevelEnabled: false }]} />
        <meshStandardMaterial metalness={0.9} roughness={0.35} color="#8FA0B0" />
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
