export function KeyboardHelp() {
  // Shortcuts restored in later phases:
  // - Esc: Phase 2 (release game) & Phase 5 (close panel)
  // - 1 – 4, ↑ / ↓, Home / End: Phase 4 (3D camera depth navigation)
  const rows: [string, string][] = [
    ['Tab', 'move through every exhibit in depth order'],
  ];
  return (
    <div>
      <h3 className="font-display font-semibold text-t-lg text-light m-0">Keyboard</h3>
      <dl className="mt-6 font-mono text-t-sm grid grid-cols-[auto_1fr] gap-x-6 gap-y-3 m-0">
        {rows.map(([k, v]) => (
          <div key={k} className="contents">
            <dt className="text-light">{k}</dt>
            <dd className="text-muted m-0">{v}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-6 font-display text-t-base text-muted prose-measure">
        All of these are additive. The site is complete with Tab and Enter alone.
      </p>
    </div>
  );
}
