export function ScaleStats({ scale }: { scale: { label: string; value: string }[] }) {
  return (
    <dl className="mt-6 font-mono text-t-sm grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 m-0">
      {scale.map((s) => (
        <div key={s.label} className="flex gap-3">
          <dt className="text-muted shrink-0">{s.label}</dt>
          <dd className="text-light m-0">{s.value}</dd>
        </div>
      ))}
    </dl>
  );
}
