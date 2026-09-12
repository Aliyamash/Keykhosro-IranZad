import StudioSite from '../studio-site';
import { listPhotos } from '@/lib/photos';
export const dynamic = 'force-dynamic';
export const metadata = { title: 'منتخب آثار / Selected Work' };
export default async function Works() {
  return <StudioSite page="works" photos={await listPhotos()} />;
}
