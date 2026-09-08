'use client';

import { useEffect, useMemo } from 'react';
import { Rig } from './Rig';
import { Fog } from './Fog';
import { Surface } from './layers/Surface';
import { Device } from './layers/Device';
import { Engine } from './layers/Engine';
import { Reasoning } from './layers/Reasoning';
import { PassThrough } from './PassThrough';
import { createScreenMaterial } from './ScreenMaterial';

/**
 * Task 4.2 / Phase 4 — Full Descent Scene Composition.
 * Composes Rig, Fog, Surface, Device, Engine, Reasoning, and PassThrough.
 */
export function Scene() {
  const screenMaterial = useMemo(() => createScreenMaterial(), []);

  useEffect(() => {
    return () => {
      screenMaterial.dispose();
    };
  }, [screenMaterial]);

  return (
    <>
      <Rig />
      <Fog />
      <Surface />
      <Device screenMaterial={screenMaterial} />
      <Engine />
      <Reasoning />
      <PassThrough screenMaterial={screenMaterial} />
    </>
  );
}

export default Scene;
