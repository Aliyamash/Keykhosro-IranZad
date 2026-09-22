const siteUrl = 'https://keykhosro-iranzad.com';

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
      publisher: { '@id': `${siteUrl}/#studio` },
    },
    {
      '@type': 'Person',
      '@id': `${siteUrl}/#person`,
      name: 'Keykhosro Iranzad',
      alternateName: 'کیخسرو ایرانزاد',
      url: siteUrl,
      image: `${siteUrl}/images/about/keykhosro-portrait.webp`,
      jobTitle: 'Photographer & Visual Director',
      description:
        'Portrait, editorial and fashion photographer known for cinematic, high-contrast visual storytelling.',
      knowsAbout: [
        'Portrait Photography',
        'Fashion Photography',
        'Editorial Photography',
        'Fine Art Photography',
        'Visual Direction',
      ],
      worksFor: { '@id': `${siteUrl}/#studio` },
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
