import type { Metadata } from 'next';
import { SITE, RESUME_PDF_PRESENT } from '@/content/site';
import { ROUTES } from '@/content/routes';

const route = ROUTES.find((r) => r.path === '/resume')!;
export const metadata: Metadata = { title: route.title, description: route.description };

export default function ResumePage() {
  return (
    <main className="page py-24" data-layer="bedrock">
      <div className="lg:col-span-8 prose-measure">
        <h1 className="font-display font-bold text-t-xl text-light">Résumé</h1>
        {RESUME_PDF_PRESENT ? (
          <>
            <p className="mt-6 font-display text-t-base text-light">
              {SITE.name} — {SITE.credential}.
            </p>
            <p className="mt-6 font-mono text-t-sm">
              <a href={SITE.resumePath} download className="underline decoration-[var(--accent)]">
                Download the PDF
              </a>
            </p>
            <object
              data={SITE.resumePath}
              type="application/pdf"
              className="mt-12 w-full h-[80vh] border border-hairline"
              aria-label={`Résumé of ${SITE.name}`}
            >
              <p className="font-display text-t-base text-muted p-6">
                Your browser will not display the PDF inline.{' '}
                <a href={SITE.resumePath} download className="underline">
                  Download it instead.
                </a>
              </p>
            </object>
          </>
        ) : (
          <>
            <p className="mt-6 font-display text-t-base text-light">
              The PDF is not up yet. Everything it would say is on this site already — the projects,
              the file paths, the numbers — and the fastest way to get the document itself is to ask.
            </p>
            <p className="mt-6 font-mono text-t-sm">
              <a href={`mailto:${SITE.email}`} className="underline decoration-[var(--accent)]">
                {SITE.email}
              </a>
            </p>
            <p className="mt-6 font-mono text-t-sm">
              <a href="/" className="underline decoration-[var(--accent)]">
                Back to the descent
              </a>
            </p>
          </>
        )}
      </div>
    </main>
  );
}
