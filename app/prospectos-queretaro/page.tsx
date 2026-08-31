import type { Metadata } from 'next';
import { Globe2 } from 'lucide-react';
import { getBusinesses, websiteHref } from '@/lib/data';
import { siteUrl } from '@/lib/site';
import { ProspectsTable } from './ProspectsTable';

export const metadata: Metadata = {
  title: 'Prospectos Querétaro | Rankea Refaccionarias',
  description: 'Tabla interna de refaccionarias de Querétaro con sitio web y teléfono.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function QueretaroProspectsPage() {
  const prospects = getBusinesses()
    .filter((business) => business.stateSlug === 'queretaro' && business.website)
    .map((business) => ({
      name: business.publicName,
      municipality: business.municipality,
      phone: business.phone,
      website: websiteHref(business.website),
      profileUrl: `${siteUrl}${business.urlPath}`,
      category: business.category,
    }))
    .sort((a, b) => a.name.localeCompare(b.name, 'es-MX', { sensitivity: 'base' }));

  return (
    <main>
      <section className="page-hero prospect-hero">
        <div className="wrap">
          <p className="breadcrumb"><a href="/">Inicio</a> / Prospectos Querétaro</p>
          <span className="eyebrow"><Globe2 size={15} /> Prospección</span>
          <h1>Refaccionarias de Querétaro con sitio web</h1>
          <p className="lead">
            Tabla interna para revisar sitios web y teléfonos de refaccionarias en Querétaro.
          </p>
        </div>
      </section>
      <ProspectsTable prospects={prospects} />
    </main>
  );
}
