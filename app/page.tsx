import type { Metadata } from 'next';
import PageStructuredData from './page-structured-data';
import StudioSite from './studio-site';

const description =
  'پورتفولیوی رسمی کیخسرو ایرانزاد؛ روایت‌های تصویری سینمایی در عکاسی پرتره، مد و ادیتوریال با تمرکز بر نور، فرم و هویت.';

export const metadata: Metadata = {
  title: { absolute: 'کیخسرو ایرانزاد | عکاس پرتره، مد و ادیتوریال' },
  description,
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    url: '/',
    title: 'کیخسرو ایرانزاد | عکاس پرتره، مد و ادیتوریال',
    description,
    images: [{ url: '/images/vision-with-impact.jpg', alt: 'Vision with Impact' }],
  },
};

export default function Home() {
  return (
    <>
      <PageStructuredData
        type="ProfilePage"
        path="/"
        name="Keykhosro Iranzad — Photography Studio"
        description={description}
        image="/images/vision-with-impact.jpg"
      />
      <StudioSite page="home" />
    </>
  );
}
