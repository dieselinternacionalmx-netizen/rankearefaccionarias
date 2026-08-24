import { notFound } from 'next/navigation';
import { MapPin, Search, SlidersHorizontal, Tags } from 'lucide-react';
import { BusinessCard } from '@/components/BusinessCard';
import { getBusinessesByCategory, getBusinessesByMunicipality, getCategories, getMunicipalities } from '@/lib/data';

type Params = Promise<{ municipio: string }>;
type SearchParams = Promise<{ page?: string }>;
const PAGE_SIZE = 24;

function pageFrom(value: string | undefined, totalPages: number) {
  const requestedPage = Number(value || 1);
  if (!Number.isFinite(requestedPage) || requestedPage < 1) return 1;
  return Math.min(Math.floor(requestedPage), totalPages);
}

function paginationHref(basePath: string, page: number) {
  return page <= 1 ? basePath : `${basePath}?page=${page}`;
}

function categorySummary(businesses: ReturnType<typeof getBusinessesByMunicipality>) {
  const categories = new Map<string, number>();
  for (const business of businesses) categories.set(business.category, (categories.get(business.category) || 0) + 1);
  return Array.from(categories.entries())
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, 3)
    .map(([name]) => name.toLowerCase());
}

function joinList(items: string[]) {
  if (items.length <= 1) return items[0] || '';
  return `${items.slice(0, -1).join(', ')} y ${items[items.length - 1]}`;
}

function Pagination({ basePath, page, totalPages }: { basePath: string; page: number; totalPages: number }) {
  if (totalPages <= 1) return null;
  return (
    <nav className="pagination" aria-label="Paginación">
      <a className={`page-btn ${page === 1 ? 'disabled' : ''}`} href={paginationHref(basePath, page - 1)}>Anterior</a>
      {Array.from({ length: totalPages }, (_, index) => index + 1).map((item) => (
        <a className={`page-num ${item === page ? 'active' : ''}`} href={paginationHref(basePath, item)} key={item}>{item}</a>
      ))}
      <a className={`page-btn ${page === totalPages ? 'disabled' : ''}`} href={paginationHref(basePath, page + 1)}>Siguiente</a>
    </nav>
  );
}

export function generateStaticParams() {
  return [
    ...getMunicipalities('queretaro').map(m => ({ municipio: m.slug })),
    ...getCategories('queretaro').map(c => ({ municipio: c.slug })),
  ];
}

export async function generateMetadata({ params }: { params: Params }) {
  const { municipio } = await params;
  const mun = getMunicipalities('queretaro').find(m => m.slug === municipio);
  const category = getCategories('queretaro').find(c => c.slug === municipio);
  if (category) {
    return {
      title: `${category.name} en Querétaro | Rankea Refaccionarias`,
      description: `Directorio de ${category.name.toLowerCase()} en Querétaro. Consulta fichas con dirección, teléfono y ubicación cuando estén disponibles.`,
    };
  }
  return { title: mun ? `Refaccionarias en ${mun.name}, Querétaro` : 'Refaccionarias en Querétaro', description: `Directorio de refaccionarias y autopartes en ${mun?.name || 'Querétaro'}.` };
}

export default async function MunicipalityPage({ params, searchParams }: { params: Params; searchParams?: SearchParams }) {
  const { municipio } = await params;
  const queryParams = searchParams ? await searchParams : {};
  const category = getCategories('queretaro').find(c => c.slug === municipio);
  const businesses = category ? getBusinessesByCategory(municipio, 'queretaro') : getBusinessesByMunicipality(municipio);
  if (!businesses.length) notFound();
  const totalPages = Math.max(1, Math.ceil(businesses.length / PAGE_SIZE));
  const page = pageFrom(queryParams.page, totalPages);
  const visibleBusinesses = businesses.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const mun = businesses[0].municipality;
  const stateName = businesses[0].stateName;
  const withPhone = businesses.filter(b => b.phone).length;
  const withWebsite = businesses.filter(b => b.website).length;
  const withCoordinates = businesses.filter(b => b.hasCoordinates).length;
  const categories = categorySummary(businesses);
  const basePath = category ? `/queretaro/${category.slug}/` : `/queretaro/${municipio}/`;
  const showingFrom = (page - 1) * PAGE_SIZE + 1;
  const showingTo = Math.min(page * PAGE_SIZE, businesses.length);
  if (category) {
    return (
      <main>
        <section className="page-hero">
          <div className="wrap">
            <div className="breadcrumb"><a href="/">Inicio</a> / <a href="/queretaro/">Querétaro</a> / {category.name}</div>
            <span className="eyebrow"><Tags size={15}/> Tipo de refaccionaria</span>
            <h1 className="h1">{category.name} en Querétaro</h1>
            <p className="lead">Refaccionarias clasificadas dentro de {category.name.toLowerCase()} en Querétaro. Revisa dirección, teléfono y ubicación cuando estén disponibles.</p>
            <div className="statgrid">
              <div className="stat"><b>{businesses.length}</b><span>fichas en este tipo</span></div>
              <div className="stat"><b>{withPhone}</b><span>con teléfono</span></div>
              <div className="stat"><b>{withWebsite}</b><span>con sitio web</span></div>
            </div>
          </div>
        </section>
        <section className="section compact-section">
          <div className="wrap editorial-panel">
            <p>Este hub reúne {businesses.length} fichas de {category.name.toLowerCase()} en Querétaro. La selección se construye con negocios disponibles en la base de Rankea Refaccionarias y prioriza datos accionables como dirección, teléfono y ubicación.</p>
            <p>Actualmente {withPhone} fichas tienen teléfono y {withCoordinates} incluyen coordenadas para revisar la zona antes de contactar. Usa la paginación para explorar el inventario completo sin depender de filtros o resultados incompletos.</p>
          </div>
        </section>
        <section className="section">
          <div className="wrap">
            <div className="section-title">
              <div><h2>Negocios disponibles</h2><p className="sub">Listado por tipo de refaccionaria para facilitar búsquedas de autopartes y servicios relacionados.</p></div>
            </div>
            <div className="resultbar"><span>Mostrando {showingFrom}-{showingTo} de {businesses.length}</span><span>Página {page} de {totalPages}</span></div>
            <div className="cards">{visibleBusinesses.map(b => <BusinessCard key={b.id} business={b} />)}</div>
            <Pagination basePath={basePath} page={page} totalPages={totalPages} />
          </div>
        </section>
      </main>
    );
  }
  return (
    <main>
      <section className="page-hero">
        <div className="wrap">
          <div className="breadcrumb"><a href="/">Inicio</a> / <a href="/queretaro/">Querétaro</a> / {mun}</div>
          <span className="eyebrow"><MapPin size={15}/> Hub municipal</span>
          <h1 className="h1">Refaccionarias en {mun}, {stateName}</h1>
          <p className="lead">Proveedores automotrices y refaccionarias ubicadas en {mun}. Usa las fichas para llamar, revisar zona y comparar opciones disponibles.</p>
          <form className="searchbox" action="/queretaro/">
            <Search className="search-icon" aria-hidden="true" size={22}/>
            <input name="q" placeholder="Buscar otra refaccionaria, zona o municipio" type="search" />
            <button className="btn">Buscar</button>
          </form>
          <div className="statgrid">
            <div className="stat"><b>{businesses.length}</b><span>fichas en {mun}</span></div>
            <div className="stat"><b>{withPhone}</b><span>con teléfono</span></div>
            <div className="stat"><b>{withWebsite}</b><span>con sitio web</span></div>
          </div>
        </div>
      </section>
      <section className="section compact-section">
        <div className="wrap editorial-panel">
          <p>En {mun}, Rankea Refaccionarias agrupa {businesses.length} fichas de negocios relacionados con autopartes y refacciones. Este hub sirve para comparar opciones por nombre, zona, categoría y datos de contacto disponibles.</p>
          <p>{categories.length ? `Dentro del inventario local aparecen categorías como ${joinList(categories)}. ` : ''}De las fichas disponibles, {withPhone} incluyen teléfono y {withCoordinates} tienen coordenadas, lo que ayuda a validar cercanía antes de visitar o llamar.</p>
        </div>
      </section>
      <section className="section">
        <div className="wrap">
          <div className="section-title"><div><span className="eyebrow"><SlidersHorizontal size={15}/> Resultados</span><h2>Negocios disponibles</h2><p className="sub">Cards compactas con acciones reales. No inventamos horarios, inventario ni reseñas.</p></div></div>
          <div className="filters"><span className="chip">Con teléfono · {withPhone}</span><span className="chip">Con sitio web · {withWebsite}</span><span className="chip">Datos públicos</span></div>
          <div className="resultbar"><span>Mostrando {showingFrom}-{showingTo} de {businesses.length}</span><span>Página {page} de {totalPages}</span></div>
          <div className="cards">{visibleBusinesses.map(b => <BusinessCard key={b.id} business={b} />)}</div>
          <Pagination basePath={basePath} page={page} totalPages={totalPages} />
        </div>
      </section>
    </main>
  );
}
