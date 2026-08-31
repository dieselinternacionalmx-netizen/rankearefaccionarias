import type { Metadata } from 'next';
import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';
import { Globe2 } from 'lucide-react';
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

function clean(value: unknown) {
  return String(value ?? '').replace(/^\uFEFF/, '').trim();
}

function websiteHref(site: string) {
  if (!site) return '';
  return site.startsWith('http') ? site : `https://${site.toLowerCase()}`;
}

function websiteStatusLabel(row: Record<string, string>, website: string) {
  const status = clean(row.website_status).toLowerCase();
  const showWebsite = clean(row.show_website_button).toLowerCase() === 'true';

  if (!website) return 'Sin sitio web';
  if (showWebsite || status === 'working') return 'Sitio web disponible';
  if (status === 'broken') return 'Sitio registrado no disponible';
  return 'Sitio web detectado';
}

function opportunityLabel(status: string) {
  if (status === 'Sin sitio web') return 'Vender sitio nuevo';
  if (status === 'Sitio registrado no disponible') return 'Revisar sitio actual';
  return 'Prospecto con sitio';
}

export default function QueretaroProspectsPage() {
  const rows = parse(fs.readFileSync(path.join(process.cwd(), 'data_top100_url_validated.csv'), 'utf8'), {
    columns: true,
    skip_empty_lines: true,
    bom: true,
  }) as Record<string, string>[];

  const prospects = rows
    .filter((row) => clean(row.published_status).toLowerCase() === 'published' && clean(row.estado_slug) === 'queretaro')
    .map((row) => {
      const website = websiteHref(clean(row.website_final_url || row.website_normalized || row.Sitio_internet));
      const websiteStatus = websiteStatusLabel(row, website);
      return {
        name: clean(row.public_name || row.Nombre),
        municipality: clean(row.municipio) || 'Querétaro',
        phone: clean(row.Telefono),
        website,
        websiteStatus,
        opportunity: opportunityLabel(websiteStatus),
        profileUrl: `${siteUrl}${clean(row.url_path)}`,
        category: clean(row.category_public) || 'Refacciones automotrices',
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name, 'es-MX', { sensitivity: 'base' }));

  return (
    <main>
      <section className="page-hero prospect-hero">
        <div className="wrap">
          <p className="breadcrumb"><a href="/">Inicio</a> / Prospectos Querétaro</p>
          <span className="eyebrow"><Globe2 size={15} /> Prospección</span>
          <h1>Refaccionarias de Querétaro para prospección</h1>
          <p className="lead">
            Tabla interna con teléfonos, sitios web registrados y oportunidades para contactar refaccionarias de Querétaro.
          </p>
        </div>
      </section>
      <ProspectsTable prospects={prospects} />
    </main>
  );
}
