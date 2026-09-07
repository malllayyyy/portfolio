export function KeyboardHelp() {
  const rows: [string, string][] = [
    ['1 – 4', 'jump to a layer datum'],
    ['↑ / ↓', 'step ±10 m'],
    ['Home / End', 'Surface / Bedrock'],
    ['Tab', 'move through every exhibit in depth order'],
    ['Esc', 'close a panel, or release a game'],
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
