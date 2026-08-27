import type { MetadataRoute } from 'next';
import { getBusinesses, getCategories, getMunicipalities, getStates } from '@/lib/data';
import { siteUrl } from '@/lib/site';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${siteUrl}/`, priority: 1 },
    { url: `${siteUrl}/acerca-de/`, priority: 0.7 },
    { url: `${siteUrl}/refaccionarias/`, priority: 0.9 },
    ...getStates().map((state) => ({ url: `${siteUrl}/${state.slug}/`, priority: 0.9 })),
    ...getStates().flatMap((state) => getMunicipalities(state.slug).map((municipality) => ({ url: `${siteUrl}/${state.slug}/${municipality.slug}/`, priority: 0.75 }))),
    ...getCategories().map((category) => ({ url: `${siteUrl}/refaccionarias/${category.slug}/`, priority: 0.7 })),
    ...getStates().flatMap((state) => getCategories(state.slug).map((category) => ({ url: `${siteUrl}/${state.slug}/${category.slug}/`, priority: 0.7 }))),
    ...getBusinesses().map((business) => ({ url: `${siteUrl}${business.urlPath}`, priority: 0.6 })),
  ];
}
