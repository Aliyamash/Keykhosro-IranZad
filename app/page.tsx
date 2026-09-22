import type { Metadata } from 'next';
import StudioSite from './studio-site';

export const metadata: Metadata = {
  title: { absolute: 'کیخسرو ایرانزاد | عکاس پرتره، مد و ادیتوریال' },
  description:
    'پورتفولیوی رسمی کیخسرو ایرانزاد؛ روایت‌های تصویری سینمایی در عکاسی پرتره، مد و ادیتوریال با تمرکز بر نور، فرم و هویت.',
  alternates: { canonical: '/' },
};

export default function Home() {
  return <StudioSite page="home" />;
}
