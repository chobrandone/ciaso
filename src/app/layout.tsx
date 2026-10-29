import type { Metadata, Viewport } from 'next';
import localFont from 'next/font/local';
import IconSprite from '@/components/IconSprite';
import { site } from '@/lib/site';
import { getContent } from '@/lib/content';
import './globals.css';
import './motion.css';
import './nav.css';
import './pages.css';

// Plus Jakarta Sans: clean, smooth sans for text and headings (variable weight)
const jakarta = localFont({
  src: [{ path: './fonts/plus-jakarta-sans-var.woff2', weight: '300 800', style: 'normal' }],
  variable: '--font-sans',
  display: 'swap',
  fallback: ['system-ui', 'Segoe UI', 'Arial', 'sans-serif']
});

// Instrument Serif italic: the stylish accent word in headlines
const serif = localFont({
  src: [{ path: './fonts/instrument-serif-italic.woff2', weight: '400', style: 'italic' }],
  variable: '--font-serif',
  display: 'swap',
  fallback: ['Georgia', 'Times New Roman', 'serif']
});

export async function generateMetadata(): Promise<Metadata> {
  const { images } = await getContent();
  const share = images.shareImage.startsWith('/') ? `${site.url}${images.shareImage}` : images.shareImage;
  return {
  metadataBase: new URL(site.url),
  title: { default: 'CIASO | Newcomer Support in Alberta – Settlement, Employment & Community', template: '%s | CIASO' },
  description: 'CIASO is an Alberta nonprofit connecting newcomers and families to settlement support, employment and skills programs, mentorship and community – so they can build a future in Canada.',
  openGraph: {
    type: 'website',
    siteName: 'CIASO – Canada Integration and Settlement Organization',
    locale: 'en_CA',
    images: [{ url: share, alt: 'CIASO – Canada Integration and Settlement Organization' }]
  },
  twitter: { card: 'summary_large_image' }
  };
}

export const viewport: Viewport = { themeColor: '#CD0E00' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-CA" className={`${jakarta.variable} ${serif.variable}`}>
      <body>
        <IconSprite />
        {children}
      </body>
    </html>
  );
}
