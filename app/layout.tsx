import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = {
  title: {
    default: 'کیخسرو ایرانزاد — استودیو',
    template: '%s | کیخسرو ایرانزاد',
  },
  description:
    'استودیو کیخسرو ایرانزاد — عکاسی، مد و روایت تصویری. Keykhosro Iranzad — photography & visual direction.',
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fa" dir="rtl">
      <body>{children}</body>
    </html>
  );
}
