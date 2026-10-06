import { env } from 'cloudflare:workers';
import { database } from './inquiries';

export type TeamMember = {
  id: string;
  nameFa: string;
  nameEn: string;
  roleFa: string;
  roleEn: string;
  bioFa: string;
  bioEn: string;
  instagram: string;
  linkedin: string;
  website: string;
  imageUrl: string;
  sortOrder: number;
  isPrimary: boolean;
  active: boolean;
};

export const primaryMember: TeamMember = {
  id: 'keykhosro-iranzad',
  nameFa: 'کیخسرو ایرانزاد',
  nameEn: 'Keykhosro Iranzad',
  roleFa: 'عکاس و مدیر هنری',
  roleEn: 'Photographer & Visual Director',
  bioFa:
    'کیخسرو با بیش از یک دهه تجربه در عکاسی پرتره، ادیتوریال و مد، مسیر حرفه‌ای خود را صرف تسلط بر هم‌نشینی ظریف نور، فرم و روایت‌گری مفهومی کرده است. نگاه بصری او بر پژوهشی پیوسته در نورپردازی، ژست و روان‌شناسی قاب بنا شده تا جوهره اصیل سوژه‌هایش را ثبت کند. زیبایی‌شناسی متمایز و پرکنتراست او در رسانه‌هایی چون Marika Magazine دیده شده و فعالیت حرفه‌ای او با شبکه Kavyar نیز پیوند دارد. ده درصد از درآمد عکاسی او به امور خیریه و حمایت از نیازمندان اختصاص می‌یابد.',
  bioEn:
    'With over a decade of experience in portrait, editorial, and fashion photography, Keykhosro has dedicated his practice to the interplay of light, form, and conceptual storytelling. His visual language is shaped by continuous research into lighting, posing, and the psychology of the frame. His high-contrast work has appeared in outlets including Marika Magazine, and his professional practice is connected with Kavyar. Ten percent of his photography income is dedicated to charitable causes and supporting people in need.',
  instagram: 'https://www.instagram.com/keykhosro_iranzad_art/',
  linkedin: 'https://www.linkedin.com/in/keykhosro-iranzad-a0a01942b',
  website: '',
  imageUrl: '/images/about/keykhosro-portrait.webp',
  sortOrder: 0,
  isPrimary: true,
  active: true,
};

type TeamRow = {
  id: string;
  name_fa: string;
  name_en: string;
  role_fa: string;
  role_en: string;
  bio_fa: string;
  bio_en: string;
  instagram: string;
  linkedin: string;
  website: string;
  object_key: string;
  sort_order: number;
  is_primary: number;
  active: number;
};

function mapRow(row: TeamRow): TeamMember {
  return {
    id: row.id,
    nameFa: row.name_fa,
    nameEn: row.name_en,
    roleFa: row.role_fa,
    roleEn: row.role_en,
    bioFa: row.bio_fa,
    bioEn: row.bio_en,
    instagram: row.instagram,
    linkedin: row.linkedin,
    website: row.website,
    imageUrl: row.object_key
      ? `/api/team-media/${encodeURIComponent(row.id)}`
      : row.is_primary
        ? primaryMember.imageUrl
        : '',
    sortOrder: row.sort_order,
    isPrimary: Boolean(row.is_primary),
    active: Boolean(row.active),
  };
}

export function teamMediaBucket() {
  return env.MEDIA;
}

export async function listTeamMembers(includeInactive = false) {
  const { results } = await database()
    .prepare(
      `SELECT id, name_fa, name_en, role_fa, role_en, bio_fa, bio_en,
       instagram, linkedin, website, object_key, sort_order, is_primary, active
       FROM team_members
       ${includeInactive ? '' : 'WHERE active=1'}
       ORDER BY is_primary DESC, sort_order ASC, created_at ASC`,
    )
    .all<TeamRow>();
  const members = results.map(mapRow);
  if (!members.some((member) => member.isPrimary))
    members.unshift(primaryMember);
  return members.sort(
    (a, b) =>
      Number(b.isPrimary) - Number(a.isPrimary) || a.sortOrder - b.sortOrder,
  );
}

export function safeExternalUrl(value: FormDataEntryValue | null) {
  const raw = typeof value === 'string' ? value.trim() : '';
  if (!raw) return '';
  try {
    const url = new URL(raw);
    return url.protocol === 'https:' || url.protocol === 'http:'
      ? url.toString()
      : null;
  } catch {
    return null;
  }
}

export async function readUploadForm(request: Request) {
  const reader = request.body?.getReader();
  if (!reader) throw new Error('EMPTY_UPLOAD');
  const chunks: Uint8Array<ArrayBuffer>[] = [];
  let size = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > 9 * 1024 * 1024) {
      await reader.cancel();
      throw new Error('UPLOAD_TOO_LARGE');
    }
    chunks.push(new Uint8Array(value));
  }
  return new Response(new Blob(chunks), {
    headers: { 'Content-Type': request.headers.get('content-type') ?? '' },
  }).formData();
}

export async function validatedImage(file: FormDataEntryValue | null) {
  if (!(file instanceof File) || !file.size) return null;
  if (file.size > 8 * 1024 * 1024) throw new Error('UPLOAD_TOO_LARGE');
  const bytes = new Uint8Array(await file.arrayBuffer());
  const ascii = (start: number, end: number) =>
    String.fromCharCode(...bytes.slice(start, end));
  const contentType =
    bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255
      ? 'image/jpeg'
      : bytes[0] === 137 && ascii(1, 8) === 'PNG\r\n\u001a\n'
        ? 'image/png'
        : ascii(0, 4) === 'RIFF' && ascii(8, 12) === 'WEBP'
          ? 'image/webp'
          : null;
  if (!contentType || contentType !== file.type)
    throw new Error('INVALID_IMAGE');
  return { bytes, contentType };
}
