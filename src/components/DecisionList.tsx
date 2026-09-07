import type { Decision } from '@/content/types';

export function DecisionList({ decisions }: { decisions: Decision[] }) {
  return (
    <ol className="mt-6 flex flex-col gap-6 list-none p-0 m-0">
      {decisions.map((d, i) => (
        <li key={i} className="prose-measure">
          <p className="font-display text-t-base text-light m-0">{d.body}</p>
          <p className="mt-3 font-mono text-t-sm text-muted m-0">
            {d.evidence.join('  ·  ')}
          </p>
        </li>
      ))}
    </ol>
  );
}
