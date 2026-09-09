import type { Metadata } from 'next';
import { SITE, RESUME_PDF_PRESENT } from '@/content/site';
import { ROUTES } from '@/content/routes';
import { LAYERS } from '@/content/layers';
import { PROJECTS } from '@/content/projects';

const route = ROUTES.find((r) => r.path === '/resume')!;
export const metadata: Metadata = { title: route.title, description: route.description };

export default function ResumePage() {
  return (
    <main className="page py-24" data-layer="bedrock">
      <div className="lg:col-span-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between border-b border-hairline pb-8 gap-4">
          <div>
            <h1 className="font-display font-bold text-t-xl text-light">{SITE.name}</h1>
            <p className="mt-2 font-mono text-t-sm text-muted">{SITE.credential}</p>
          </div>
          <div className="font-mono text-t-xs flex flex-wrap gap-4 text-muted">
            <a
              href={`mailto:${SITE.email}`}
              className="hover:text-light transition-colors underline decoration-[var(--accent)]"
            >
              {SITE.email}
            </a>
            <a
              href={SITE.github}
              target="_blank"
              rel="noreferrer"
              className="hover:text-light transition-colors underline decoration-[var(--accent)]"
            >
              GitHub
            </a>
            <a
              href={SITE.linkedin}
              target="_blank"
              rel="noreferrer"
              className="hover:text-light transition-colors underline decoration-[var(--accent)]"
            >
              LinkedIn
            </a>
          </div>
        </div>

        {/* Conditional PDF download section when RESUME_PDF_PRESENT is true */}
        {RESUME_PDF_PRESENT && (
          <div className="mt-8 p-4 border border-hairline bg-[#10151C] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <p className="font-mono text-t-sm text-light m-0">
              PDF version available for download.
            </p>
            <a
              href={SITE.resumePath}
              download
              className="inline-flex items-center px-4 py-2 border border-hairline bg-[#0E1116] font-mono text-t-xs text-light hover:border-light transition-colors"
            >
              Download PDF ↵
            </a>
          </div>
        )}

        {/* Summary */}
        <section className="mt-12">
          <h2 className="font-mono text-t-xs text-muted uppercase tracking-widest">Summary</h2>
          <p className="mt-4 font-display text-t-base text-light max-w-[68ch]">
            {SITE.hero} {SITE.heroSub}
          </p>
        </section>

        {/* Architectural Layers */}
        <section className="mt-12">
          <h2 className="font-mono text-t-xs text-muted uppercase tracking-widest">
            Architecture & Layers
          </h2>
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {LAYERS.filter((l) => l.id !== 'bedrock').map((layer) => (
              <div
                key={layer.id}
                className="p-4 border border-hairline bg-[#10151C] flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-baseline justify-between">
                    <span className="font-mono text-t-xs text-muted">{layer.datum} m</span>
                    <span className="font-mono text-t-xs font-semibold text-light">
                      {layer.domain}
                    </span>
                  </div>
                  <h3 className="mt-2 font-display font-semibold text-t-md text-light">
                    {layer.name}
                  </h3>
                </div>
                <p className="mt-4 font-display text-t-xs text-muted leading-relaxed">
                  {layer.thesis}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Projects & Systems */}
        <section className="mt-12">
          <h2 className="font-mono text-t-xs text-muted uppercase tracking-widest">
            Projects & Technical Scope
          </h2>
          <div className="mt-6 flex flex-col gap-8">
            {PROJECTS.map((project) => (
              <div key={project.slug} className="p-6 border border-hairline bg-[#10151C]">
                <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 border-b border-hairline pb-4">
                  <h3 className="font-display font-bold text-t-md text-light">{project.title}</h3>
                  <span className="font-mono text-t-xs text-muted uppercase">
                    Layer: {project.layer} ({project.depth} m)
                  </span>
                </div>
                <p className="mt-4 font-display text-t-base text-light">{project.thesis}</p>

                {/* Technical Scale / Specs */}
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono text-t-xs">
                  {project.scale.map((s) => (
                    <div key={s.label} className="flex gap-2">
                      <span className="text-muted">{s.label}:</span>
                      <span className="text-light">{s.value}</span>
                    </div>
                  ))}
                </div>

                {/* Key Engineering Decisions */}
                <div className="mt-4 pt-4 border-t border-hairline flex flex-col gap-2">
                  {project.decisions.map((d, i) => (
                    <p key={i} className="font-display text-t-xs text-muted">
                      • {d.body}
                    </p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Education */}
        <section className="mt-12">
          <h2 className="font-mono text-t-xs text-muted uppercase tracking-widest">Education</h2>
          <div className="mt-4 p-6 border border-hairline bg-[#10151C] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="font-display font-semibold text-t-md text-light">IIIT Naya Raipur</h3>
              <p className="mt-1 font-mono text-t-sm text-muted">
                Bachelor of Technology in Computer Science and Engineering
              </p>
            </div>
            <span className="font-mono text-t-xs text-muted">B.Tech CSE</span>
          </div>
        </section>

        {/* PDF Embed when RESUME_PDF_PRESENT is true */}
        {RESUME_PDF_PRESENT && (
          <section className="mt-12">
            <h2 className="font-mono text-t-xs text-muted uppercase tracking-widest">
              PDF Document
            </h2>
            <object
              data={SITE.resumePath}
              type="application/pdf"
              className="mt-4 w-full h-[80vh] border border-hairline"
              aria-label={`Résumé of ${SITE.name}`}
            >
              <p className="font-display text-t-base text-muted p-6">
                Your browser will not display the PDF inline.{' '}
                <a href={SITE.resumePath} download className="underline text-light">
                  Download it instead.
                </a>
              </p>
            </object>
          </section>
        )}
      </div>
    </main>
  );
}
