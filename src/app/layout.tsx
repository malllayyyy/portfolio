import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { SITE, SITE_URL } from '@/content/site';
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
  return (
    <html lang="en">
      <head>
        <link
          rel="preload"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
          href="/fonts/Satoshi-Variable.woff2"
        />
        <link
          rel="preload"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
          href="/fonts/JetBrainsMono-Variable.woff2"
        />
        <meta name="theme-color" content="#06080B" />
      </head>
      <body>
        {children}
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
