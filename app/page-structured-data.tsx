import { studioFaqs } from './studio-faqs';

const siteUrl = 'https://keykhosro-iranzad.com';
const dateModified = '2026-10-06';

type Props = {
  type: 'ProfilePage' | 'CollectionPage' | 'ContactPage' | 'AboutPage';
  path: string;
  name: string;
  description: string;
  image: string;
};

const serialize = (value: unknown) =>
  JSON.stringify(value).replace(/</g, '\\u003c');

export default function PageStructuredData({
  type,
  path,
  name,
  description,
  image,
}: Props) {
  const url = new URL(path, siteUrl).toString();
  const data = {
    '@context': 'https://schema.org',
    '@type': type,
    '@id': `${url}#webpage`,
    url,
    name,
    description,
    dateModified,
    inLanguage: ['en', 'fa'],
    isPartOf: { '@id': `${siteUrl}/#website` },
    about: { '@id': `${siteUrl}/#person` },
    primaryImageOfPage: {
      '@type': 'ImageObject',
      contentUrl: new URL(image, siteUrl).toString(),
    },
  };
  return (
    <script
      id={`page-structured-data-${type.toLowerCase()}`}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: serialize(data) }}
    />
  );
}

export function FaqStructuredData() {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    '@id': `${siteUrl}/studio#faq`,
    url: `${siteUrl}/studio#faq`,
    dateModified,
    inLanguage: ['en', 'fa'],
    mainEntity: studioFaqs.map((item) => ({
      '@type': 'Question',
      name: item.question.en,
      alternateName: item.question.fa,
      acceptedAnswer: {
        '@type': 'Answer',
        text: `${item.answer.en} ${item.answer.fa}`,
      },
    })),
  };
  return (
    <script
      id="faq-structured-data"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: serialize(data) }}
    />
  );
}
