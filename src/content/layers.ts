import type { Layer } from './types';

export const LAYERS: Layer[] = [
  {
    id: 'surface', name: 'SURFACE', domain: 'Web', datum: 0, t: 0.030,
    accentVar: '--color-surface-accent',
    thesis: 'The layer everyone sees is the one with the least of my code in it \u2014 and the most of other people\u2019s.',
  },
  {
    id: 'device', name: 'DEVICE', domain: 'App', datum: -40, t: 0.300,
    accentVar: '--color-device-accent',
    thesis: 'Software that has to run on a Windows 7 machine with a spinning disk is a harder constraint than any framework I\u2019ve ever picked.',
  },
  {
    id: 'engine', name: 'ENGINE', domain: 'Game', datum: -120, t: 0.600,
    accentVar: '--color-engine-accent',
    thesis: 'Everything above this is a frame that can afford to be late. Down here it can\u2019t.',
  },
  {
    id: 'reasoning', name: 'REASONING', domain: 'Agentic AI', datum: -260, t: 0.870,
    accentVar: '--color-reasoning-accent',
    thesis: 'The layer that decides what the other three should do. It has no UI of its own \u2014 so I built one.',
  },
  {
    id: 'bedrock', name: 'BEDROCK', domain: '', datum: -300, t: 1.0,
    accentVar: '--color-surface-accent',
    thesis: '',
  },
];
