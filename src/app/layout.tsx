import type { ReactNode } from 'react';
import './globals.css';

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
      <body>{children}</body>
    </html>
  );
}
