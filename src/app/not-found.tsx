import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="page min-h-screen py-24 flex flex-col justify-center">
      <div className="lg:col-span-8 prose-measure">
        <p className="font-mono text-t-xs text-muted">404 · NOT FOUND</p>
        <h1 className="mt-3 font-display font-semibold text-t-xl text-light">
          This depth does not exist.
        </h1>
        <p className="mt-6 font-display text-t-base text-muted">
          The requested path is not part of the stack.
        </p>
        <p className="mt-6 font-mono text-t-sm">
          <Link href="/" className="underline decoration-[var(--accent)] text-light">
            Return to Surface
          </Link>
        </p>
      </div>
    </main>
  );
}
