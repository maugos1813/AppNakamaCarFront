import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import Script from 'next/script';
import { ServiceWorkerRegistration } from '@/components/ServiceWorkerRegistration';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });

export const metadata: Metadata = {
  title: 'NakamaCar — Carrozzeria e Servizi Auto',
  description: 'Panel de gestión y portal de seguimiento de NakamaCar.',
  manifest: '/manifest.json',
  // The favicon itself needs light/dark variants (a red mark barely reads on
  // a red background) — Next's typed `icons` field has no `media` option, so
  // these are hand-written <link> tags below instead, not this field.
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#141414' },
  ],
};

// Runs before hydration so the stored theme applies on first paint — no flash of the wrong theme.
const themeInitScript = `
(function () {
  try {
    var stored = localStorage.getItem('nakamacar-theme');
    if (stored === 'light' || stored === 'dark') {
      document.documentElement.setAttribute('data-theme', stored);
    }
  } catch (e) {}
})();
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={inter.variable} suppressHydrationWarning>
      <head>
        <Script id="theme-init" strategy="beforeInteractive">
          {themeInitScript}
        </Script>
        {/* Followed by the browser/OS color scheme, not the in-app toggle —
            favicons render in browser chrome, outside the page's reach. */}
        <link rel="icon" type="image/png" sizes="192x192" href="/icons/icon-192.png" media="(prefers-color-scheme: light)" />
        <link rel="icon" type="image/png" sizes="512x512" href="/icons/icon-512.png" media="(prefers-color-scheme: light)" />
        <link rel="icon" type="image/png" sizes="192x192" href="/icons/icon-dark-192.png" media="(prefers-color-scheme: dark)" />
        <link rel="icon" type="image/png" sizes="512x512" href="/icons/icon-dark-512.png" media="(prefers-color-scheme: dark)" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
      </head>
      <body>
        {children}
        <ServiceWorkerRegistration />
      </body>
    </html>
  );
}
