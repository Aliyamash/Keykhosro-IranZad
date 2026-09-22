import type { Metadata } from 'next';
import StudioSite from '../studio-site';
import { listPhotos } from '@/lib/photos';
export const dynamic = 'force-dynamic';
export const metadata: Metadata = {
  title: 'استودیو و درخواست همکاری / Studio',
  description:
    'برای پروژه‌های پرتره، فشن، ادیتوریال، کانسپچوال و همکاری‌های تجاری با استودیو کیخسرو ایرانزاد در ارتباط باشید.',
  alternates: { canonical: '/studio' },
};
export default async function Studio() {
  return <StudioSite page="studio" photos={await listPhotos()} />;
}
