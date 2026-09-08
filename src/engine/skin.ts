/** § 5.2. The engines' logic is untouched; only these draw constants change. */
export const SKIN = {
  field: '#0E1116',
  grid: '#1B2430',
  net: '#3A4654',
  netDash: [8, 8] as const,
  accent: '#FF5F56', // ball, player paddle, orbs, dialogue stroke
  text: '#EDF1F5',
  panel: '#10151C',
  mono: '14px "JetBrains Mono", ui-monospace, monospace',
  monoTracking: 0.04, // em
  display: '20px "Satoshi", system-ui, sans-serif',
  /** shadowBlur is 0 everywhere. The ball is the single exception (§ 5.2). */
  ballShadowBlur: 4,
} as const;
