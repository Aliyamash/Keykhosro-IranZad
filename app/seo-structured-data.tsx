const siteUrl = 'https://keykhosro-iranzad.com';
const dateModified = '2026-09-28';
const socialProfiles = [
  'https://www.instagram.com/keykhosro_iranzad_art/',
  'https://www.linkedin.com/in/keykhosro-iranzad-a0a01942b',
];

const structuredData = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebSite',
      '@id': `${siteUrl}/#website`,
      url: siteUrl,
      name: 'کیخسرو ایرانزاد | Keykhosro Iranzad',
      description:
        'Official portfolio of Keykhosro Iranzad, portrait, fashion and editorial photographer.',
      inLanguage: ['fa', 'en'],
      dateModified,
      publisher: { '@id': `${siteUrl}/#organization` },
    },
    {
      '@type': 'Organization',
      '@id': `${siteUrl}/#organization`,
      name: 'Keykhosro Iranzad Studio',
      alternateName: 'استودیو کیخسرو ایرانزاد',
      url: siteUrl,
      logo: `${siteUrl}/favicon.svg`,
      image: `${siteUrl}/images/about/keykhosro-portrait.webp`,
      description:
        'An independent photography studio working across portrait, fashion, editorial, fine-art and conceptual photography.',
      founder: { '@id': `${siteUrl}/#person` },
      sameAs: socialProfiles,
    },
    {
      '@type': 'Person',
      '@id': `${siteUrl}/#person`,
      name: 'Keykhosro Iranzad',
      alternateName: 'کیخسرو ایرانزاد',
      url: siteUrl,
      image: `${siteUrl}/images/about/keykhosro-portrait.webp`,
      jobTitle: 'Photographer & Visual Director',
      sameAs: socialProfiles,
      description:
        'Portrait, editorial and fashion photographer known for cinematic, high-contrast visual storytelling.',
      knowsAbout: [
        'Portrait Photography',
        'Fashion Photography',
        'Editorial Photography',
        'Fine Art Photography',
        'Visual Direction',
      ],
      worksFor: { '@id': `${siteUrl}/#organization` },
    },
    {
      '@type': 'ProfessionalService',
      '@id': `${siteUrl}/#studio`,
      name: 'Keykhosro Iranzad Studio',
      alternateName: 'استودیو کیخسرو ایرانزاد',
      url: siteUrl,
      image: `${siteUrl}/images/about/keykhosro-portrait.webp`,
      description:
        'Portrait, fashion, editorial and conceptual photography studio.',
      founder: { '@id': `${siteUrl}/#person` },
      parentOrganization: { '@id': `${siteUrl}/#organization` },
      areaServed: 'Worldwide',
      serviceType: [
        'Portrait Photography',
        'Fashion Photography',
        'Editorial Photography',
        'Conceptual Photography',
        'Visual Direction',
      ],
    },
  ],
};

export default function SeoStructuredData() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(structuredData).replace(/</g, '\\u003c'),
      }}
    />
  );
}
