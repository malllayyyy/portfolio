import Link from 'next/link';
import dynamic from 'next/dynamic';
import { NotFoundMessage, NotFoundExitLink } from '@/components/NotFoundClient';

const GameMount = dynamic(() => import('@/components/GameMount').then((m) => m.GameMount), {
  ssr: true,
});

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

        <NotFoundMessage />

        <GameMount game="pong" />

        <p className="mt-4 font-mono text-t-xs text-muted">
          Engine sourced from the{' '}
          <Link href="/project/pong" className="underline decoration-[var(--accent)] text-light">
            Pong project
          </Link>{' '}
          at −120 m.
        </p>

        <NotFoundExitLink />
      </div>
    </main>
  );
}
