import { env } from 'cloudflare:workers';
import { database } from './inquiries';
import { defaultPhotos, type Photo } from './photo-types';
export function mediaBucket() {
  return env.MEDIA;
}
export async function listPhotos(): Promise<Photo[]> {
  const { results } = await database()
    .prepare('SELECT * FROM photos ORDER BY created_at DESC, id DESC')
    .all<{
      id: string;
      section: Photo['section'];
      title_fa: string;
      title_en: string;
      deleted: number;
    }>();
  const overridden = new Set(results.map((p) => p.id));
  return [
    ...results
      .filter((p) => !p.deleted)
      .map((p) => ({
        id: p.id,
        section: p.section,
        title_fa: p.title_fa,
        title_en: p.title_en,
        url: `/api/photos/${p.id}`,
      })),
    ...defaultPhotos.filter((p) => !overridden.has(p.id)),
  ];
}
