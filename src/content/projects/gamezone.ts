import type { Project } from '../types';

export const gamezone: Project = {
  slug: 'gamezone',
  title: 'GameZone',
  layer: 'device',
  depth: -52,
  thesis: 'A gaming-cafe POS \u2014 station timers, session billing, cafeteria orders \u2014 running as an Android app and a desktop web app off one build.',
  decisions: [
    {
      body: 'It runs on the cafe\u2019s own machine: Windows 7, a spinning disk, Node v13.14.0. So SQLite is set to WAL with synchronous NORMAL, temp_store MEMORY and cache_size -10000, and the startup seeding all happens inside one transaction. On that disk every extra flush is a pause somebody is standing at the counter waiting through.',
      evidence: ['backend/database.js'],
    },
    {
      body: 'A player can move from Snooker to a PS5 halfway through a session without the station being freed and re-billed. The server works out how much of the first activity was already played and takes it off the new one.',
    },
  ],
  links: [],
  honesty: 'Private repo \u2014 it runs a real business, so there is nothing to link to and no demo to try. No screenshots either; this one never had a marketing surface.',
  presentation: { kind: 'diagram', component: 'gamezone' },
};
