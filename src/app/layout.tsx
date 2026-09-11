import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { SITE, SITE_URL } from '@/content/site';
import { TierBoot } from '@/components/TierBoot';
import { TierToggle } from '@/components/TierToggle';
import { TIER_BOOT_SCRIPT } from '@/lib/tier';
import './globals.css';
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: 'Malay Chaudhary — Substrate', template: '%s' },
  description: SITE.metaDescription,
  openGraph: {
    type: 'website',
    siteName: 'Malay Chaudhary — Substrate',
    title: 'Malay Chaudhary — Substrate',
    description: SITE.ogDescription,
  },
  twitter: { card: 'summary_large_image', description: SITE.ogDescription },
  alternates: { canonical: '/' },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  const personJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: SITE.name,
    url: SITE_URL,
    email: SITE.email,
    alumniOf: {
      '@type': 'EducationalOrganization',
      name: 'IIIT Naya Raipur',
    },
    sameAs: [SITE.github, SITE.linkedin],
  };

  const websiteJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: `${SITE.name} — Substrate`,
    url: SITE_URL,
  };

  return (
    <html lang="en">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: TIER_BOOT_SCRIPT,
          }}
        />
        <link
          rel="preload"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
          href="/fonts/Satoshi-Variable.subset.woff2"
        />
        <meta name="theme-color" content="#06080B" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
      </head>
      <body>
        <TierBoot />
        {children}
        <footer className="page py-8 border-t border-hairline font-mono text-t-xs text-muted">
          <TierToggle />
        </footer>
        <noscript>
          <p className="page py-12 font-mono text-t-sm">
            <a href="/resume">Résumé</a> · <a href={`mailto:${SITE.email}`}>{SITE.email}</a>
          </p>
        </noscript>
        {/* § 9.3: route changes announce the new title here. Populated in Phase 5. */}
        <div id="route-announcer" role="status" aria-live="polite" className="sr-only" />
      </body>
    </html>
  );
}
