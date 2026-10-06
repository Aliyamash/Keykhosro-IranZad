import { NextResponse } from 'next/server';
import { adminIdentity } from '@/lib/admin';
import { database, privateHeaders, validOrigin } from '@/lib/inquiries';
import {
  listTeamMembers,
  readUploadForm,
  safeExternalUrl,
  teamMediaBucket,
  validatedImage,
} from '@/lib/team';

export const runtime = 'edge';

const text = (form: FormData, key: string) => {
  const value = form.get(key);
  return typeof value === 'string' ? value.trim() : '';
};

export async function GET(request: Request) {
  if (!(await adminIdentity(request)))
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  return NextResponse.json(
    { members: await listTeamMembers(true) },
    { headers: privateHeaders },
  );
}

export async function POST(request: Request) {
  if (!(await adminIdentity(request)))
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!validOrigin(request))
    return NextResponse.json({ error: 'Invalid origin' }, { status: 403 });

  try {
    const form = await readUploadForm(request);
    const nameFa = text(form, 'nameFa');
    const nameEn = text(form, 'nameEn');
    const bioFa = text(form, 'bioFa');
    const bioEn = text(form, 'bioEn');
    if (!nameFa || !bioFa) {
      return NextResponse.json(
        { error: 'Required fields are missing' },
        { status: 400 },
      );
    }

    const instagram = safeExternalUrl(form.get('instagram'));
    const linkedin = safeExternalUrl(form.get('linkedin'));
    const website = safeExternalUrl(form.get('website'));
    if (instagram === null || linkedin === null || website === null) {
      return NextResponse.json(
        { error: 'Invalid social URL' },
        { status: 400 },
      );
    }

    const image = await validatedImage(form.get('image'));
    if (!image)
      return NextResponse.json({ error: 'Photo is required' }, { status: 400 });

    const id = crypto.randomUUID();
    const extension =
      image.contentType === 'image/png'
        ? 'png'
        : image.contentType === 'image/jpeg'
          ? 'jpg'
          : 'webp';
    const objectKey = `team/${id}.${extension}`;
    await teamMediaBucket().put(objectKey, image.bytes, {
      httpMetadata: { contentType: image.contentType },
    });

    const now = Date.now();
    try {
      await database()
        .prepare(
          `INSERT INTO team_members
           (id, name_fa, name_en, role_fa, role_en, bio_fa, bio_en, instagram,
            linkedin, website, object_key, content_type, sort_order, is_primary,
            active, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?, ?)`,
        )
        .bind(
          id,
          nameFa,
          nameEn,
          text(form, 'roleFa'),
          text(form, 'roleEn'),
          bioFa,
          bioEn,
          instagram,
          linkedin,
          website,
          objectKey,
          image.contentType,
          Number(text(form, 'sortOrder')) || 100,
          text(form, 'active') === 'false' ? 0 : 1,
          now,
          now,
        )
        .run();
    } catch (error) {
      await teamMediaBucket().delete(objectKey);
      throw error;
    }
    return NextResponse.json(
      { ok: true, id },
      { status: 201, headers: privateHeaders },
    );
  } catch (error) {
    const code = error instanceof Error ? error.message : '';
    const status =
      code === 'UPLOAD_TOO_LARGE' ? 413 : code === 'INVALID_IMAGE' ? 415 : 500;
    return NextResponse.json(
      { error: code || 'Unable to save member' },
      { status },
    );
  }
}
