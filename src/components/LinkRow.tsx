export function LinkRow({ links }: { links: { label: string; href: string }[] }) {
  if (links.length === 0) return null;
  return (
    <p className="mt-6 font-mono text-t-sm flex flex-wrap gap-x-6 gap-y-3">
      {links.map((l) => (
        <a key={l.href} href={l.href} className="underline decoration-[var(--accent)]">
          {l.label}
        </a>
      ))}
    </p>
  );
}
