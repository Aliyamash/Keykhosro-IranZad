import type { Metadata } from 'next';
import './globals.css';
import SeoStructuredData from './seo-structured-data';

const siteUrl = 'https://keykhosro-iranzad.com';
const defaultDescription =
  'وب‌سایت رسمی کیخسرو ایرانزاد؛ عکاس پرتره، مد و ادیتوریال با رویکردی سینمایی و داستان‌محور. Keykhosro Iranzad — portrait, fashion and editorial photographer.';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'کیخسرو ایرانزاد | عکاس پرتره، مد و ادیتوریال',
    template: '%s | کیخسرو ایرانزاد',
  },
  description: defaultDescription,
  keywords: [
    'کیخسرو ایرانزاد',
    'Keykhosro Iranzad',
    'عکاس پرتره',
    'عکاسی مد',
    'عکاسی ادیتوریال',
    'portrait photographer',
    'fashion photographer',
    'editorial photography',
    'visual direction',
  ],
  authors: [{ name: 'Keykhosro Iranzad', url: siteUrl }],
  creator: 'Keykhosro Iranzad',
  publisher: 'Keykhosro Iranzad Studio',
  category: 'Photography',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'fa_IR',
    url: siteUrl,
    siteName: 'Keykhosro Iranzad Studio',
    title: 'کیخسرو ایرانزاد | عکاس پرتره، مد و ادیتوریال',
    description: defaultDescription,
    images: [
      {
        url: '/images/vision-with-impact.jpg',
        alt: 'Keykhosro Iranzad Studio — Vision with Impact',
      },
    ],
  },
  icons: {
    icon: [{ url: '/favicon.svg', type: 'image/svg+xml' }],
  },
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fa" dir="rtl">
      <head>
        <link
          rel="preload"
          href="/fonts/doran-medium.ttf"
          as="font"
          type="font/ttf"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/fonts/doran-bold.ttf"
          as="font"
          type="font/ttf"
          crossOrigin="anonymous"
        />
      </head>
      <body>
        <SeoStructuredData />
        {children}
      </body>
    </html>
  );
}
