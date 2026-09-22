const urls = [
  { path: '', changeFrequency: 'weekly', priority: '1.0' },
  { path: '/works', changeFrequency: 'weekly', priority: '0.9' },
  { path: '/studio', changeFrequency: 'monthly', priority: '0.8' },
];

export function GET() {
  const entries = urls
    .map(
      ({ path, changeFrequency, priority }) => `  <url>
    <loc>https://keykhosro-iranzad.com${path}</loc>
    <changefreq>${changeFrequency}</changefreq>
    <priority>${priority}</priority>
  </url>`,
    )
    .join('\n');

  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries}
</urlset>`,
    {
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=3600',
      },
    },
  );
}
