import type { Metadata, Viewport } from 'next';
import localFont from 'next/font/local';
import IconSprite from '@/components/IconSprite';
import { site } from '@/lib/site';
import { getContent } from '@/lib/content';
import './globals.css';
import './motion.css';
import './nav.css';
import './pages.css';

const poppins = localFont({
  src: [
    { path: './fonts/poppins-400.woff2', weight: '400', style: 'normal' },
    { path: './fonts/poppins-400-italic.woff2', weight: '400', style: 'italic' },
    { path: './fonts/poppins-500.woff2', weight: '500', style: 'normal' },
    { path: './fonts/poppins-600.woff2', weight: '600', style: 'normal' },
    { path: './fonts/poppins-700.woff2', weight: '700', style: 'normal' },
    { path: './fonts/poppins-800.woff2', weight: '800', style: 'normal' }
  ],
  variable: '--font-poppins',
  display: 'swap',
  fallback: ['system-ui', 'Segoe UI', 'Arial', 'sans-serif']
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
    <html lang="en-CA" className={poppins.variable}>
      <body>
        <IconSprite />
        {children}
      </body>
    </html>
  );
}
