import StudioSite from '../studio-site';
import { listPhotos } from '@/lib/photos';
export const dynamic = 'force-dynamic';
export const metadata = { title: 'استودیو و درخواست همکاری / Studio' };
export default async function Studio() {
  return <StudioSite page="studio" photos={await listPhotos()} />;
}
