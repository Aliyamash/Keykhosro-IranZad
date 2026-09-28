import type { Metadata } from 'next';
import PageStructuredData, { FaqStructuredData } from '../page-structured-data';
import StudioSite from '../studio-site';
import { listPhotos } from '@/lib/photos';
export const dynamic = 'force-dynamic';
const description =
  'برای پروژه‌های پرتره، فشن، ادیتوریال، کانسپچوال و همکاری‌های تجاری با استودیو کیخسرو ایرانزاد در ارتباط باشید.';
export const metadata: Metadata = {
  title: 'استودیو و درخواست همکاری / Studio',
  description,
  alternates: { canonical: '/studio' },
  openGraph: {
    type: 'website',
    url: '/studio',
    title: 'Studio & Contact — Keykhosro Iranzad',
    description,
    images: [{ url: '/images/about/keykhosro-studio.webp', alt: 'Keykhosro Iranzad in the photography studio' }],
  },
};
export default async function Studio() {
  return (
    <>
      <PageStructuredData type="ContactPage" path="/studio" name="Studio & Contact — Keykhosro Iranzad" description={description} image="/images/about/keykhosro-studio.webp" />
      <FaqStructuredData />
      <StudioSite page="studio" photos={await listPhotos()} />
    </>
  );
}
