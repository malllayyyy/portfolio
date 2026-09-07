import { SITE } from '@/content/site';
import { ResumeLink } from './ResumeLink';

export function Contact() {
  return (
    <div id="contact">
      <h3 className="font-display font-semibold text-t-lg text-light m-0">Contact</h3>
      <p className="mt-6 font-mono text-t-sm flex flex-col gap-3 m-0">
        <a href={`mailto:${SITE.email}`} className="underline decoration-[var(--accent)]">
          {SITE.email}
        </a>
        <a href={SITE.github} className="underline decoration-[var(--accent)]">
          github.com/malllayyyy
        </a>
        <a href={SITE.linkedin} className="underline decoration-[var(--accent)]">
          linkedin.com/in/malay-chaudhary-959077328
        </a>
        <ResumeLink className="underline decoration-[var(--accent)]" />
      </p>
    </div>
  );
}
