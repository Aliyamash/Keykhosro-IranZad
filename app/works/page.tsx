import type { Metadata } from 'next';
import PageStructuredData from '../page-structured-data';
import StudioSite from '../studio-site';
import { listPhotos } from '@/lib/photos';
export const dynamic = 'force-dynamic';
const description =
  'مجموعه‌ای منتخب از عکاسی پرتره، مد، ادیتوریال و فاین‌آرت کیخسرو ایرانزاد؛ تصاویری با کنتراست بالا و روایت بصری متمایز.';
export const metadata: Metadata = {
  title: 'منتخب آثار / Selected Work',
  description,
  alternates: { canonical: '/works' },
  openGraph: {
    type: 'website',
    url: '/works',
    title: 'Selected Works — Keykhosro Iranzad',
    description,
    images: [{ url: '/images/portfolio/landscape-dress.webp', alt: 'Selected photography by Keykhosro Iranzad' }],
  },
};
export default async function Works() {
  return (
    <>
      <PageStructuredData type="CollectionPage" path="/works" name="Selected Works — Keykhosro Iranzad" description={description} image="/images/portfolio/landscape-dress.webp" />
      <StudioSite page="works" photos={await listPhotos()} />
    </>
  );
}
