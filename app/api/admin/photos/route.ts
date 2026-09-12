import { adminIdentity } from '@/lib/admin';
import { database, validOrigin, privateHeaders } from '@/lib/inquiries';
import { listPhotos, mediaBucket } from '@/lib/photos';
export async function GET() {
  if (!(await adminIdentity()))
    return Response.json(
      { error: 'Unauthorized' },
      { status: 403, headers: privateHeaders },
    );
  return Response.json(
    { items: await listPhotos() },
    { headers: privateHeaders },
  );
}
export async function POST(request: Request) {
  if (!(await adminIdentity()))
    return Response.json({ error: 'Unauthorized' }, { status: 403 });
  if (!validOrigin(request))
    return Response.json({ error: 'Invalid origin' }, { status: 403 });
  const reader = request.body?.getReader();
  if (!reader) return Response.json({ error: 'Empty upload' }, { status: 400 });
  const chunks: Uint8Array<ArrayBuffer>[] = [];
  let size = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > 9 * 1024 * 1024) {
      await reader.cancel();
      return Response.json({ error: 'Maximum 8 MB' }, { status: 413 });
    }
    chunks.push(new Uint8Array(value));
  }
  let data: FormData;
  try {
    data = await new Response(new Blob(chunks), {
      headers: { 'Content-Type': request.headers.get('content-type') ?? '' },
    }).formData();
  } catch {
    return Response.json({ error: 'Invalid upload' }, { status: 400 });
  }
  const file = data.get('file'),
    section = data.get('section');
  const fa = String(data.get('title_fa') ?? '').trim(),
    en = String(data.get('title_en') ?? '').trim();
  if (
    !(file instanceof File) ||
    !['works', 'gallery'].includes(String(section)) ||
    !fa ||
    !en ||
    fa.length > 120 ||
    en.length > 120 ||
    !file.size ||
    file.size > 8 * 1024 * 1024
  )
    return Response.json({ error: 'Invalid image or title' }, { status: 400 });
  const bytes = new Uint8Array(await file.arrayBuffer());
  const ascii = (start: number, end: number) =>
    String.fromCharCode(...bytes.slice(start, end));
  const type =
    bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255
      ? 'image/jpeg'
      : bytes[0] === 137 && ascii(1, 8) === 'PNG\r\n\u001a\n'
        ? 'image/png'
        : ascii(0, 4) === 'RIFF' && ascii(8, 12) === 'WEBP'
          ? 'image/webp'
          : null;
  if (!type || type !== file.type)
    return Response.json({ error: 'Use JPEG, PNG or WebP' }, { status: 400 });
  const id = crypto.randomUUID(),
    key = `photos/${id}`;
  await mediaBucket().put(key, bytes, { httpMetadata: { contentType: type } });
  try {
    await database()
      .prepare(
        'INSERT INTO photos (id, section, title_fa, title_en, object_key, content_type, deleted, created_at) VALUES (?, ?, ?, ?, ?, ?, 0, ?)',
      )
      .bind(id, section, fa, en, key, type, Date.now())
      .run();
  } catch (error) {
    await mediaBucket().delete(key);
    throw error;
  }
  return Response.json({ id }, { status: 201, headers: privateHeaders });
}
