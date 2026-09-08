'use client';

import { useMemo, useRef, useLayoutEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import {
  BufferGeometry,
  CanvasTexture,
  Color,
  DoubleSide,
  Float32BufferAttribute,
  LineBasicMaterial,
  MeshMatcapMaterial,
  Object3D,
  ShaderMaterial,
  WireframeGeometry,
} from 'three';
import type { InstancedMesh } from 'three';
import { INTERIOR } from './Device';

/** Assign an object and all its children to layer channel 2 (INTERIOR) (§ 2.6). */
function toInterior(obj: Object3D | null) {
  if (obj) {
    obj.layers.set(INTERIOR);
    obj.traverse((child) => child.layers.set(INTERIOR));
  }
}

/** Vertex shader for 40 instanced wireframe collider ghosts. */
const GHOST_VERTEX_SHADER = `
uniform float uTime;
attribute vec3 aOffset;
attribute vec3 aScale;
attribute vec3 aSpeed;

void main() {
  vec3 pos = position * aScale;
  float t = uTime * aSpeed.x + aOffset.x;
  pos.x += sin(t) * 1.5;
  pos.y += cos(uTime * aSpeed.y + aOffset.y) * 1.2;
  pos.z += sin(uTime * aSpeed.z + aOffset.z) * 1.5;

  vec4 worldPosition = instanceMatrix * vec4(pos, 1.0);
  gl_Position = projectionMatrix * modelViewMatrix * worldPosition;
}
`;

/** Fragment shader for wireframe collider ghosts. */
const GHOST_FRAGMENT_SHADER = `
uniform vec3 uColor;

void main() {
  gl_FragColor = vec4(uColor, 0.85);
}
`;

/**
 * Creates an open-topped box BufferGeometry (16 m x 10 m, height 1.6 m).
 * 5 faces: bottom floor (facing +Y inside), back, front, left, right walls.
 */
function createOpenBoxGeometry(w = 16, h = 1.6, d = 10): BufferGeometry {
  const hw = w / 2;
  const hh = h / 2;
  const hd = d / 2;

  // 5 faces * 4 vertices = 20 vertices
  const positions = new Float32Array([
    // Floor (y = -hh)
    -hw, -hh, -hd,   hw, -hh, -hd,   hw, -hh,  hd,  -hw, -hh,  hd,
    // Back wall (z = -hd)
    -hw, -hh, -hd,   hw, -hh, -hd,   hw,  hh, -hd,  -hw,  hh, -hd,
    // Front wall (z = hd)
    -hw, -hh,  hd,   hw, -hh,  hd,   hw,  hh,  hd,  -hw,  hh,  hd,
    // Left wall (x = -hw)
    -hw, -hh, -hd,  -hw, -hh,  hd,  -hw,  hh,  hd,  -hw,  hh, -hd,
    // Right wall (x = hw)
    hw, -hh, -hd,    hw, -hh,  hd,    hw,  hh,  hd,    hw,  hh, -hd,
  ]);

  const normals = new Float32Array([
    // Floor
    0, 1, 0,  0, 1, 0,  0, 1, 0,  0, 1, 0,
    // Back
    0, 0, 1,  0, 0, 1,  0, 0, 1,  0, 0, 1,
    // Front
    0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1,
    // Left
    1, 0, 0,  1, 0, 0,  1, 0, 0,  1, 0, 0,
    // Right
    -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0,
  ]);

  const uvs = new Float32Array([
    0, 0,  1, 0,  1, 1,  0, 1,
    0, 0,  1, 0,  1, 1,  0, 1,
    0, 0,  1, 0,  1, 1,  0, 1,
    0, 0,  1, 0,  1, 1,  0, 1,
    0, 0,  1, 0,  1, 1,  0, 1,
  ]);

  const indices = new Uint16Array([
    // Floor
    0, 1, 2,  0, 2, 3,
    // Back
    4, 5, 6,  4, 6, 7,
    // Front
    8, 10, 9, 8, 11, 10,
    // Left
    12, 13, 14, 12, 14, 15,
    // Right
    16, 18, 17, 16, 19, 18,
  ]);

  const geo = new BufferGeometry();
  geo.setAttribute('position', new Float32BufferAttribute(positions, 3));
  geo.setAttribute('normal', new Float32BufferAttribute(normals, 3));
  geo.setAttribute('uv', new Float32BufferAttribute(uvs, 2));
  geo.setIndex(new Float32BufferAttribute(indices, 1));
  return geo;
}

export interface EngineProps {
  /** Phase 5 seam: Game CanvasTexture quad for Pong at y = −124 */
  pongGameQuad?: React.ReactNode;
  /** Phase 5 seam: Game CanvasTexture quad for Pixel Quest at y = −134 */
  pixelQuestGameQuad?: React.ReactNode;
}

/**
 * § 2.3 Engine — depth y ∈ [−112, −150]
 * - Shared procedural 256² matcap texture (MeshMatcapMaterial)
 * - Visible camera frustum wireframe at y = −150, apex-up (1 draw call)
 * - Two 16 x 10 m play volume boxes at y = −124 (Pong) and y = −134 (Pixel Quest) (2 instanced draw calls)
 * - 40 instanced wireframe collider ghosts on shared uTime uniform (1 draw call)
 *
 * All meshes are assigned to INTERIOR (layer channel 2).
 */
export function Engine({ pongGameQuad, pixelQuestGameQuad }: EngineProps = {}) {
  const ghostMaterialRef = useRef<ShaderMaterial | null>(null);
  const ghostMeshRef = useRef<InstancedMesh | null>(null);
  const playVolumeMatcapRef = useRef<InstancedMesh | null>(null);
  const playVolumeWireframeRef = useRef<InstancedMesh | null>(null);

  // Procedural 256² matcap texture using canvas radial gradient (closed palette tokens).
  const matcapTexture = useMemo(() => {
    if (typeof document === 'undefined') return null;
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      const grad = ctx.createRadialGradient(96, 96, 0, 128, 128, 128);
      grad.addColorStop(0, '#EDF1F5');
      grad.addColorStop(0.3, '#FFC46B');
      grad.addColorStop(0.65, '#FF5F56');
      grad.addColorStop(1.0, '#10151C');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 256, 256);
    }
    return new CanvasTexture(canvas);
  }, []);

  const matcapMaterial = useMemo(() => {
    return new MeshMatcapMaterial({
      matcap: matcapTexture,
      side: DoubleSide,
    });
  }, [matcapTexture]);

  const wireframeMaterial = useMemo(() => {
    return new LineBasicMaterial({
      color: '#FF5F56',
    });
  }, []);

  // 1. Camera frustum wireframe (apex-up at y = -150, 1 draw call).
  const frustumPositions = useMemo(() => {
    const apex = [0, -150, 0];
    const b1 = [-16, -174, -10];
    const b2 = [16, -174, -10];
    const b3 = [16, -174, 10];
    const b4 = [-16, -174, 10];

    const m1 = [-5.33, -158, -3.33];
    const m2 = [5.33, -158, -3.33];
    const m3 = [5.33, -158, 3.33];
    const m4 = [-5.33, -158, 3.33];

    const pos: number[] = [
      // Rays from apex to base corners
      ...apex, ...b1,
      ...apex, ...b2,
      ...apex, ...b3,
      ...apex, ...b4,
      // Base rectangle
      ...b1, ...b2,
      ...b2, ...b3,
      ...b3, ...b4,
      ...b4, ...b1,
      // Intermediate plane rectangle
      ...m1, ...m2,
      ...m2, ...m3,
      ...m3, ...m4,
      ...m4, ...m1,
    ];
    return new Float32Array(pos);
  }, []);

  // 2. Play volumes (open-topped boxes 16 x 10 m).
  const openBoxGeo = useMemo(() => createOpenBoxGeometry(16, 1.6, 10), []);
  const openBoxWireframeGeo = useMemo(
    () => new WireframeGeometry(openBoxGeo),
    [openBoxGeo]
  );

  // Position instances for the 2 play volumes (Pong at y = -124, Pixel Quest at y = -134).
  useLayoutEffect(() => {
    const obj = new Object3D();

    // Volume 0: Pong (y = -124, offset x = -3)
    obj.position.set(-3, -124, 0);
    obj.updateMatrix();
    playVolumeMatcapRef.current?.setMatrixAt(0, obj.matrix);
    playVolumeWireframeRef.current?.setMatrixAt(0, obj.matrix);

    // Volume 1: Pixel Quest (y = -134, offset x = 3)
    obj.position.set(3, -134, 0);
    obj.updateMatrix();
    playVolumeMatcapRef.current?.setMatrixAt(1, obj.matrix);
    playVolumeWireframeRef.current?.setMatrixAt(1, obj.matrix);

    if (playVolumeMatcapRef.current) {
      playVolumeMatcapRef.current.instanceMatrix.needsUpdate = true;
      toInterior(playVolumeMatcapRef.current);
    }
    if (playVolumeWireframeRef.current) {
      playVolumeWireframeRef.current.instanceMatrix.needsUpdate = true;
      toInterior(playVolumeWireframeRef.current);
    }
  }, []);

  // 3. 40 Instanced collider ghosts shader & attributes (1 draw call).
  const ghostAttributes = useMemo(() => {
    const offsets = new Float32Array(40 * 3);
    const scales = new Float32Array(40 * 3);
    const speeds = new Float32Array(40 * 3);

    for (let i = 0; i < 40; i++) {
      const seed = i * 1.61803398875;
      offsets[i * 3] = ((Math.sin(seed * 12.9898) * 43758.5453) % 1) * 6.28;
      offsets[i * 3 + 1] = ((Math.sin(seed * 78.233) * 43758.5453) % 1) * 6.28;
      offsets[i * 3 + 2] = ((Math.sin(seed * 39.346) * 43758.5453) % 1) * 6.28;

      const sc = 0.7 + Math.abs((Math.sin(seed * 4.12) * 43758.5453) % 1) * 0.8;
      scales[i * 3] = sc;
      scales[i * 3 + 1] = sc * 0.6;
      scales[i * 3 + 2] = sc;

      speeds[i * 3] = 0.4 + Math.abs((Math.sin(seed * 9.1) * 43758.5453) % 1) * 0.6;
      speeds[i * 3 + 1] = 0.3 + Math.abs((Math.sin(seed * 15.3) * 43758.5453) % 1) * 0.5;
      speeds[i * 3 + 2] = 0.4 + Math.abs((Math.sin(seed * 27.8) * 43758.5453) % 1) * 0.6;
    }

    return { offsets, scales, speeds };
  }, []);

  const ghostGeometry = useMemo(() => {
    const baseGeo = createOpenBoxGeometry(1.6, 1.0, 1.6);
    const wireGeo = new WireframeGeometry(baseGeo);
    wireGeo.setAttribute(
      'aOffset',
      new Float32BufferAttribute(ghostAttributes.offsets, 3)
    );
    wireGeo.setAttribute(
      'aScale',
      new Float32BufferAttribute(ghostAttributes.scales, 3)
    );
    wireGeo.setAttribute(
      'aSpeed',
      new Float32BufferAttribute(ghostAttributes.speeds, 3)
    );
    return wireGeo;
  }, [ghostAttributes]);

  const ghostMaterial = useMemo(() => {
    const mat = new ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uColor: { value: new Color('#FF5F56') },
      },
      vertexShader: GHOST_VERTEX_SHADER,
      fragmentShader: GHOST_FRAGMENT_SHADER,
      wireframe: true,
      transparent: true,
      depthWrite: false,
    });
    ghostMaterialRef.current = mat;
    return mat;
  }, []);

  useLayoutEffect(() => {
    if (!ghostMeshRef.current) return;
    const obj = new Object3D();
    for (let i = 0; i < 40; i++) {
      const seed = i * 1.61803398875;
      const x = (((Math.sin(seed * 12.9898) * 43758.5453) % 1) - 0.5) * 36;
      const y = -115 - Math.abs((Math.sin(seed * 78.233) * 43758.5453) % 1) * 30;
      const z = (((Math.sin(seed * 39.346) * 43758.5453) % 1) - 0.5) * 24;

      obj.position.set(x, y, z);
      obj.rotation.set(seed, seed * 0.7, seed * 0.3);
      obj.updateMatrix();
      ghostMeshRef.current.setMatrixAt(i, obj.matrix);
    }
    ghostMeshRef.current.instanceMatrix.needsUpdate = true;
    toInterior(ghostMeshRef.current);
  }, []);

  // Update shared uTime uniform in useFrame (ZERO allocation per frame).
  useFrame((state) => {
    if (ghostMaterialRef.current) {
      ghostMaterialRef.current.uniforms.uTime.value = state.clock.getElapsedTime();
    }
  });

  return (
    <group>
      {/* 1. Camera frustum wireframe (apex-up at y = -150) */}
      <lineSegments ref={toInterior}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[frustumPositions, 3]}
          />
        </bufferGeometry>
        <lineBasicMaterial color="#FF5F56" />
      </lineSegments>

      {/* 2. Play volume matcap bodies (2 instanced open-topped boxes) */}
      <instancedMesh
        ref={playVolumeMatcapRef}
        args={[openBoxGeo, matcapMaterial, 2]}
      />

      {/* Play volume wireframe overlays (2 instanced wireframes) */}
      <instancedMesh
        ref={playVolumeWireframeRef}
        args={[openBoxWireframeGeo, wireframeMaterial, 2]}
      />

      {/* Phase 5 seams: Game CanvasTexture quads mounted inside volumes at floor level */}
      <group position={[-3, -124 - 0.79, 0]} ref={toInterior}>
        {pongGameQuad ?? (
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[15.6, 9.6]} />
            <meshBasicMaterial color="#10151C" />
          </mesh>
        )}
      </group>

      <group position={[3, -134 - 0.79, 0]} ref={toInterior}>
        {pixelQuestGameQuad ?? (
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[15.6, 9.6]} />
            <meshBasicMaterial color="#10151C" />
          </mesh>
        )}
      </group>

      {/* 3. 40 Instanced wireframe collider ghosts */}
      <instancedMesh
        ref={ghostMeshRef}
        args={[ghostGeometry, ghostMaterial, 40]}
      />
    </group>
  );
}
