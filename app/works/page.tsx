import type { Metadata } from 'next';
import StudioSite from '../studio-site';
import { listPhotos } from '@/lib/photos';
export const dynamic = 'force-dynamic';
export const metadata: Metadata = {
  title: 'منتخب آثار / Selected Work',
  description:
    'مجموعه‌ای منتخب از عکاسی پرتره، مد، ادیتوریال و فاین‌آرت کیخسرو ایرانزاد؛ تصاویری با کنتراست بالا و روایت بصری متمایز.',
  alternates: { canonical: '/works' },
};
export default async function Works() {
  return <StudioSite page="works" photos={await listPhotos()} />;
}
