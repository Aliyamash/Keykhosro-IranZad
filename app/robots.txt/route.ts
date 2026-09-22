const body = `User-agent: *
Allow: /
Disallow: /admin
Disallow: /api/

Sitemap: https://keykhosro-iranzad.com/sitemap.xml
Host: https://keykhosro-iranzad.com
`;

export function GET() {
  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
