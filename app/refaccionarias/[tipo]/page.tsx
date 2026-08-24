import type { Metadata } from 'next';
import { BusinessCard } from '@/components/BusinessCard';
import { getBusinessesByCategory, getCategories } from '@/lib/data';

type Params = Promise<{ tipo: string }>;

function titleFromSlug(slug: string) {
  return slug
    .split('-')
    .filter(Boolean)
    .map((part) => part.length <= 3 ? part.toUpperCase() : part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { tipo } = await params;
  const title = titleFromSlug(tipo);
  return {
    title: `Refaccionarias de ${title} en México | Rankea Refaccionarias`,
    description: `Encuentra refaccionarias y proveedores relacionados con ${title.toLowerCase()} en México. Explora negocios por ciudad, estado y ficha individual.`,
  };
}

export function generateStaticParams() {
  return getCategories().map((category) => ({ tipo: category.slug }));
}

export default async function TipoRefaccionariaPage({ params }: { params: Params }) {
  const { tipo } = await params;
  const category = getCategories().find((item) => item.slug === tipo);
  const title = category?.name || titleFromSlug(tipo);
  const businesses = category ? getBusinessesByCategory(tipo).slice(0, 12) : [];

  return (
    <main>
      <section className="page-hero">
        <div className="wrap">
          <p className="breadcrumb"><a href="/">Inicio</a> / <a href="/refaccionarias/">Refaccionarias</a> / {title}</p>
          <span className="eyebrow">Tipo de refacción</span>
          <h1>Refaccionarias de {title}</h1>
          <p className="lead">Landing preparada para organizar negocios por tipo de refacción, estado y ciudad conforme se amplíe el directorio nacional.</p>
        </div>
      </section>
      <section className="section">
        <div className="wrap">
          {businesses.length ? (
            <div className="cards">{businesses.map((business) => <BusinessCard business={business} key={business.id} />)}</div>
          ) : (
            <div className="empty">Esta categoría está preparada para crecer conforme se agreguen más fichas verificadas al directorio.</div>
          )}
        </div>
      </section>
    </main>
  );
}
