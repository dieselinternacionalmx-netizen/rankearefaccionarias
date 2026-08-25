import { siteUrl } from '@/lib/site';

function xmlDate() {
  return new Date().toISOString();
}

export function GET() {
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>${siteUrl}/sitemap-pages.xml</loc>
    <lastmod>${xmlDate()}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${siteUrl}/sitemap-refaccionarias.xml</loc>
    <lastmod>${xmlDate()}</lastmod>
  </sitemap>
</sitemapindex>`;

  return new Response(body, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=0, must-revalidate',
    },
  });
}
