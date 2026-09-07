import type { Project } from '../types';

/** § 3.4: the 12 protocol message types are the node-field taxonomy AND, per the
 *  OQ3 deferral, the Reasoning exhibit in full. Order is protocol order. */
export const CLIENT_MESSAGES = [
  'prompt', 'set_model', 'spawn', 'list_sessions', 'switch_session',
] as const;
export const SERVER_MESSAGES = [
  'roster', 'models', 'session_event', 'session_messages', 'error', 'sessions', 'session_switched',
] as const;

export const switchboard: Project = {
  slug: 'switchboard',
  title: 'Switchboard',
  layer: 'reasoning',
  depth: -278,
  thesis: 'A real-time control plane for Oh My Pi subagents — steer a running agent directly, swap its model mid-conversation, watch the roster.',
  decisions: [
    {
      body: 'Routing a prompt through the orchestrator costs a turn and the latency of one. Switchboard holds live `AgentSession` references in Bun process memory via `AgentRegistry.global()` and calls `.steer()` or `.prompt()` on the target subagent directly, bypassing the orchestrator entirely.',
      evidence: ['server/index.ts', 'server/agent-manager.ts'],
    },
    {
      body: '`AgentSession.setModel()` is called on an active session mid-conversation, over the WebSocket. No restart, no file edit, no lost context.',
      evidence: ['server/agent-manager.ts', 'shared/protocol.ts'],
    },
    {
      body: 'Parked and background subagents outlive the dashboard. `registerPersistedSubagents` and `ensurePersistedRoster` periodically resync the roster from the `~/.omp/agent/sessions/*.jsonl` transcripts, so a restart does not lose the board.',
      evidence: ['server/agent-manager.ts'],
    },
  ],
  scale: [
    { label: 'source files',    value: '~15 TS/TSX' },
    { label: 'LOC',             value: '~1,800' },
    { label: 'database tables', value: '0 — live in-memory state plus .jsonl transcripts' },
    { label: 'protocol',        value: '5 client message types, 7 server message types' },
  ],
  links: [
    { label: 'GitHub', href: 'https://github.com/malllayyyy/swtchboard' },
  ],
  honesty: 'Still being built. The exhibit is the protocol itself — 12 message types — not a recording of a session I have not finished having.',
  presentation: { kind: 'node-field' },
};
