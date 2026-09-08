import { ShaderMaterial, Vector2 } from 'three';

/**
 * § 2.6 — the screen quad is a WINDOW, not a screen.
 *
 * The fragment shader samples the interior render target in SCREEN space via
 * `gl_FragCoord`, never via the quad's own UVs. Because pass A was rendered
 * with the same camera matrices as pass B, every texel the quad shows is
 * exactly the texel pass A would have written to that pixel — so the frame
 * where the quad stops being drawn is bit-identical to the frame before it.
 * Sampling `vUv` instead would stretch the interior across the quad and the
 * swap frame would pop. That is the single mistake this file exists to avoid.
 *
 * `toneMapped: false` matters just as much: pass A already went through ACES,
 * and tone-mapping it a second time is its own one-frame value pop.
 */
export function createScreenMaterial(): ShaderMaterial {
  const material = new ShaderMaterial({
    uniforms: {
      uMap: { value: null },
      uResolution: { value: new Vector2(1, 1) },
    },
    vertexShader: /* glsl */ `
      void main() {
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      uniform sampler2D uMap;
      uniform vec2 uResolution;
      void main() {
        vec2 uv = gl_FragCoord.xy / uResolution;   // screen-space, NOT the quad's UV
        gl_FragColor = texture2D(uMap, uv);
      }
    `,
    depthWrite: true,
    transparent: false,
  });

  material.toneMapped = false;
  return material;
}
