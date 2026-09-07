import { SITE, RESUME_PDF_PRESENT } from '@/content/site';

export function ResumeLink({ className }: { className?: string }) {
  return RESUME_PDF_PRESENT ? (
    <a className={className} href={SITE.resumePath} download>
      Résumé (PDF)
    </a>
  ) : (
    <a className={className} href="/resume">
      Résumé
    </a>
  );
}
