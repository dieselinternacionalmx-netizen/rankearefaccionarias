import { getCategories, getMunicipalities, getStates } from '@/lib/data';
import { siteUrl } from '@/lib/site';

function escapeXml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export function GET() {
  const urls = [
    `${siteUrl}/`,
    `${siteUrl}/acerca-de/`,
    `${siteUrl}/refaccionarias/`,
    ...getStates().map((state) => `${siteUrl}/${state.slug}/`),
    ...getStates().flatMap((state) => getMunicipalities(state.slug).map((municipality) => `${siteUrl}/${state.slug}/${municipality.slug}/`)),
    ...getCategories().map((category) => `${siteUrl}/refaccionarias/${category.slug}/`),
    ...getStates().flatMap((state) => getCategories(state.slug).map((category) => `${siteUrl}/${state.slug}/${category.slug}/`)),
  ];

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((url) => `  <url><loc>${escapeXml(url)}</loc></url>`).join('\n')}
</urlset>`;

  return new Response(body, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=0, must-revalidate',
    },
  });
}
