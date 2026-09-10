import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '404 \u2014 Depth Not Found \u2014 Malay Chaudhary',
};

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

        <NotFoundMessage />

        <GameMount game="pong" />

        <p className="mt-4 font-mono text-t-xs text-muted">
          I wrote this Pong when I was starting out, learning game dev. Hope you like it.
        </p>

        <NotFoundExitLink />
      </div>
    </main>
  );
}
