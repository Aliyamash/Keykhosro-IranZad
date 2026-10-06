import type { Metadata } from 'next';
import PageStructuredData from '../page-structured-data';
import StudioSite from '../studio-site';
import { listTeamMembers } from '@/lib/team';

export const dynamic = 'force-dynamic';

const description =
  'درباره کیخسرو ایرانزاد، عکاس و مدیر هنری، و همکاران خلاق استودیو؛ بیوگرافی، رویکرد هنری و راه‌های ارتباطی.';

export const metadata: Metadata = {
  title: 'درباره من و همکاران / About',
  description,
  alternates: { canonical: '/about' },
  openGraph: {
    type: 'profile',
    url: '/about',
    title: 'About Keykhosro Iranzad & Collaborators',
    description,
    images: [
      {
        url: '/images/about/keykhosro-portrait.webp',
        alt: 'Keykhosro Iranzad, photographer and visual director',
      },
    ],
  },
};

export default async function AboutPage() {
  const members = await listTeamMembers();
  return (
    <>
      <PageStructuredData
        type="AboutPage"
        path="/about"
        name="About Keykhosro Iranzad & Collaborators"
        description={description}
        image="/images/about/keykhosro-portrait.webp"
      />
      <StudioSite page="about" teamMembers={members} />
    </>
  );
}
