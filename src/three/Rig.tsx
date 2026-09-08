'use client';

import { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { PerspectiveCamera } from '@react-three/drei';
import { CatmullRomCurve3, Vector3 } from 'three';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { depth } from './depth';
import { getMotion, subscribeMotion } from '../lib/motion-pref';
import { setScrollT } from '../lib/store';
declare global {
  interface Window {
    ScrollTrigger?: typeof ScrollTrigger;
    __rig?: { cameraY: number; t: number };
  }
}


/**
 * § 2.1 — Lateral drift curve (amplitude ±3.2 m).
 * Pre-allocated static control points and temporary vector. Zero frame allocation.
 */
const DRIFT_POINTS = [
  new Vector3(0.0, 0, 0.0),
  new Vector3(1.8, 0, -1.5),
  new Vector3(-2.5, 0, 2.2),
  new Vector3(1.0, 0, -1.0),
  new Vector3(-3.1, 0, 1.8),
  new Vector3(2.6, 0, -2.8),
  new Vector3(-1.8, 0, 2.9),
  new Vector3(0.0, 0, 0.0),
];

const DRIFT_CURVE = new CatmullRomCurve3(DRIFT_POINTS, false, 'centripetal');
const TMP_VEC = new Vector3();

/**
 * Normalised scroll progress t ∈ [0, 1].
 * Document scrollable height S = scrollHeight - innerHeight.
 */
function getT(): number {
  if (typeof window === 'undefined') return 0;
  const scrollHeight = document.documentElement.scrollHeight;
  const innerHeight = window.innerHeight;
  const S = scrollHeight - innerHeight;
  if (S <= 0) return 0;
  const scrollY = window.scrollY || window.pageYOffset || 0;
  return Math.min(Math.max(scrollY / S, 0), 1);
}

/**
 * Task 4.3 — Camera rig.
 * - PerspectiveCamera, fov 55, near 0.1, far 420, up = (0, 0, -1), looking straight down -Y.
 * - camera.position.y = depth(t) assigned via GSAP ScrollTrigger scrub: 0.6 proxy (~600 ms lag).
 * - Lateral drift via Catmull-Rom curve, hard-clamped to ±1.6 m for t ∈ [0.255, 0.345].
 * - Lenis { lerp: 0.09, wheelMultiplier: 1 } (NEVER instantiated under reduced motion).
 * - Scroll restoration: manual.
 */
export function Rig() {
  const { camera, invalidate } = useThree();
  const proxyRef = useRef({ t: 0 });
  const isMotionOnRef = useRef<boolean>(true);
  useEffect(() => {
    if (typeof window !== 'undefined' && 'scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }

    gsap.registerPlugin(ScrollTrigger);
    if (typeof window !== 'undefined') {
      window.ScrollTrigger = ScrollTrigger;
    }
    let lenis: Lenis | null = null;
    let tween: gsap.core.Tween | null = null;
    let tickerCb: ((time: number) => void) | null = null;

    const setupMotion = () => {
      const isMotionOn = getMotion() === 'on';
      isMotionOnRef.current = isMotionOn;

      if (lenis) {
        lenis.destroy();
        lenis = null;
      }
      if (tickerCb) {
        gsap.ticker.remove(tickerCb);
        tickerCb = null;
      }
      if (tween) {
        tween.scrollTrigger?.kill();
        tween.kill();
        tween = null;
      }

      const initialT = getT();
      proxyRef.current.t = initialT;
      if (isMotionOn) {
        lenis = new Lenis({
          lerp: 0.09,
          wheelMultiplier: 1,
        });

        lenis.scrollTo(window.scrollY, { immediate: true });

        lenis.on('scroll', () => {
          ScrollTrigger.update();
          invalidate();
        });

        tickerCb = (time: number) => {
          lenis?.raf(time * 1000);
        };
        gsap.ticker.add(tickerCb);

        ScrollTrigger.update();

        proxyRef.current.t = 0;
        tween = gsap.to(proxyRef.current, {
          t: 1,
          ease: 'none',
          scrollTrigger: {
            trigger: document.documentElement,
            start: 'top top',
            end: 'bottom bottom',
            scrub: 0.6,
            onUpdate: () => {
              invalidate();
            },
          },
        });

        if (tween.scrollTrigger) {
          tween.scrollTrigger.scroll(window.scrollY);
        }
        tween.progress(initialT);
        proxyRef.current.t = initialT;
      } else {
        invalidate();
      }
    };

    setupMotion();

    const handleScroll = () => {
      if (lenis) {
        lenis.scrollTo(window.scrollY, { immediate: true });
      }
      invalidate();
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    const unsubMotion = subscribeMotion(() => {
      setupMotion();
      invalidate();
    });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      unsubMotion();
      if (lenis) {
        lenis.destroy();
        lenis = null;
      }
      if (tickerCb) {
        gsap.ticker.remove(tickerCb);
        tickerCb = null;
      }
      if (tween) {
        tween.scrollTrigger?.kill();
        tween.kill();
        tween = null;
      }
    };
  }, [invalidate]);

  useFrame(() => {
    const isMotionOn = isMotionOnRef.current;
    const t = isMotionOn ? proxyRef.current.t : getT();

    const y = depth(t);
    let x = 0;
    let z = 0;

    if (isMotionOn) {
      DRIFT_CURVE.getPoint(t, TMP_VEC);
      x = TMP_VEC.x;
      z = TMP_VEC.z;

      if (t >= 0.255 && t <= 0.345) {
        x = Math.max(-1.6, Math.min(1.6, x));
        z = Math.max(-1.6, Math.min(1.6, z));
      }
    }

    if (typeof window !== 'undefined') {
      window.__rig = { cameraY: y, t };
    }

    camera.position.set(x, y, z);
    camera.up.set(0, 0, -1);
    camera.lookAt(x, y - 10, z);

    setScrollT(t);
  });

  return (
    <PerspectiveCamera
      makeDefault
      fov={55}
      near={0.02}
      far={420}
      up={[0, 0, -1]}
      position={[0, 6, 0]}
    />
  );
}

export default Rig;
