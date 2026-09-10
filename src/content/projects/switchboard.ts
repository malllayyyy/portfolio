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
  thesis: 'A control plane for Oh My Pi subagents \u2014 steer a running agent directly, swap its model mid-conversation, watch the roster.',
  decisions: [
    {
      body: 'Sending a prompt through the orchestrator costs a whole turn before the subagent even sees it. Switchboard keeps the live AgentSession objects in process memory and calls .steer() or .prompt() on the target directly, so the orchestrator is never in the path.',
      evidence: ['server/agent-manager.ts'],
    },
    {
      body: 'You can change a session\u2019s model while it is mid-conversation, over the socket. No restart, no config edit, no lost context.',
    },
  ],
  links: [
    { label: 'GitHub', href: 'https://github.com/malllayyyy/swtchboard' },
  ],
  honesty: 'Still being built. There is no demo yet, so the protocol is the exhibit.',
  presentation: { kind: 'node-field' },
};
