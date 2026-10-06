import { NextResponse } from 'next/server';
import { adminIdentity } from '@/lib/admin';
import { database, privateHeaders, validOrigin } from '@/lib/inquiries';
import {
  primaryMember,
  readUploadForm,
  safeExternalUrl,
  teamMediaBucket,
  validatedImage,
} from '@/lib/team';

export const runtime = 'edge';

type Existing = {
  id: string;
  object_key: string;
  content_type: string;
  is_primary: number;
  created_at: number;
};

const text = (form: FormData, key: string) => {
  const value = form.get(key);
  return typeof value === 'string' ? value.trim() : '';
};

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  if (!(await adminIdentity(request)))
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!validOrigin(request))
    return NextResponse.json({ error: 'Invalid origin' }, { status: 403 });

  const { id } = await context.params;
  try {
    const existing = await database()
      .prepare(
        'SELECT id, object_key, content_type, is_primary, created_at FROM team_members WHERE id=?',
      )
      .bind(id)
      .first<Existing>();
    if (!existing && id !== primaryMember.id) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 });
    }

    const form = await readUploadForm(request);
    const nameFa = text(form, 'nameFa');
    const nameEn = text(form, 'nameEn');
    const bioFa = text(form, 'bioFa');
    const bioEn = text(form, 'bioEn');
    if (!nameFa || !nameEn || !bioFa || !bioEn) {
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
    const isPrimary =
      existing?.is_primary === 1 || id === primaryMember.id ? 1 : 0;
    let objectKey = existing?.object_key ?? '';
    let contentType = existing?.content_type ?? 'image/webp';
    let newObjectKey = '';
    if (image) {
      const extension =
        image.contentType === 'image/png'
          ? 'png'
          : image.contentType === 'image/jpeg'
            ? 'jpg'
            : 'webp';
      newObjectKey = `team/${id}-${crypto.randomUUID()}.${extension}`;
      await teamMediaBucket().put(newObjectKey, image.bytes, {
        httpMetadata: { contentType: image.contentType },
      });
      objectKey = newObjectKey;
      contentType = image.contentType;
    }

    const now = Date.now();
    try {
      await database()
        .prepare(
          `INSERT INTO team_members
           (id, name_fa, name_en, role_fa, role_en, bio_fa, bio_en, instagram,
            linkedin, website, object_key, content_type, sort_order, is_primary,
            active, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
           ON CONFLICT(id) DO UPDATE SET
             name_fa=excluded.name_fa, name_en=excluded.name_en,
             role_fa=excluded.role_fa, role_en=excluded.role_en,
             bio_fa=excluded.bio_fa, bio_en=excluded.bio_en,
             instagram=excluded.instagram, linkedin=excluded.linkedin,
             website=excluded.website, object_key=excluded.object_key,
             content_type=excluded.content_type, sort_order=excluded.sort_order,
             is_primary=excluded.is_primary, active=excluded.active,
             updated_at=excluded.updated_at`,
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
          contentType,
          isPrimary ? 0 : Number(text(form, 'sortOrder')) || 100,
          isPrimary,
          isPrimary ? 1 : text(form, 'active') === 'false' ? 0 : 1,
          existing?.created_at ?? now,
          now,
        )
        .run();
    } catch (error) {
      if (newObjectKey) await teamMediaBucket().delete(newObjectKey);
      throw error;
    }

    if (newObjectKey && existing?.object_key)
      await teamMediaBucket().delete(existing.object_key);
    return NextResponse.json({ ok: true }, { headers: privateHeaders });
  } catch (error) {
    const code = error instanceof Error ? error.message : '';
    const status =
      code === 'UPLOAD_TOO_LARGE' ? 413 : code === 'INVALID_IMAGE' ? 415 : 500;
    return NextResponse.json(
      { error: code || 'Unable to update member' },
      { status },
    );
  }
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  if (!(await adminIdentity(request)))
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!validOrigin(request))
    return NextResponse.json({ error: 'Invalid origin' }, { status: 403 });
  const { id } = await context.params;
  const existing = await database()
    .prepare('SELECT object_key, is_primary FROM team_members WHERE id=?')
    .bind(id)
    .first<{ object_key: string; is_primary: number }>();
  if (!existing)
    return NextResponse.json({ error: 'Member not found' }, { status: 404 });
  if (existing.is_primary || id === primaryMember.id) {
    return NextResponse.json(
      { error: 'Primary profile cannot be deleted' },
      { status: 400 },
    );
  }
  await database()
    .prepare('DELETE FROM team_members WHERE id=?')
    .bind(id)
    .run();
  if (existing.object_key) await teamMediaBucket().delete(existing.object_key);
  return NextResponse.json({ ok: true }, { headers: privateHeaders });
}
