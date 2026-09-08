import { ShaderMaterial, Vector2 } from 'three';

/**
 * § 2.6 — the screen quad is a WINDOW, not a screen.
 *
 * The fragment shader samples the interior render target in SCREEN space via
 * `gl_FragCoord`, never via the quad's own UVs. Because pass A was rendered with
 * the same camera matrices as pass B, every texel the quad shows is the texel
 * pass A would have written to that pixel. Sampling `vUv` would stretch the
 * interior across the quad and the swap frame would pop. That is the single
 * mistake this file exists to avoid.
 *
 * The sample is passed through untouched, and `toneMapped` is false, because the
 * render target is a byte target declaring `SRGBColorSpace` — three writes into
 * it through the same encoding path the canvas uses, so the stored pixels are
 * already display-ready. Applying the ACES curve or the sRGB transfer a second
 * time here is its own one-frame value pop.
 *
 * This pairing is measured, not assumed: with it, the swap frame diffs at 6.6
 * mean against a 13.85 median, and both window boundaries are clean. See
 * docs/measurements.md § Phase 3.
 */
export function createScreenMaterial(): ShaderMaterial {
  const material = new ShaderMaterial({
    uniforms: {
      uMap: { value: null },
      uHasMap: { value: 0.0 },
      uResolution: { value: new Vector2(1, 1) },
    },
    vertexShader: /* glsl */ `
      void main() {
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      uniform sampler2D uMap;
      uniform float uHasMap;
      uniform vec2 uResolution;
      void main() {
        if (uHasMap < 0.5) {
          gl_FragColor = vec4(0.055, 0.067, 0.086, 1.0);
        } else {
          vec2 uv = gl_FragCoord.xy / uResolution;   // screen-space, NOT the quad's UV
          gl_FragColor = texture2D(uMap, uv);
        }
      }
    `,
    depthWrite: true,
    transparent: false,
  });

  material.toneMapped = false;
  return material;
}
