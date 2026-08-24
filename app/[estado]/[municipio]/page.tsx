import { notFound } from 'next/navigation';
import { MapPin, Search, SlidersHorizontal, Tags } from 'lucide-react';
import { BusinessCard } from '@/components/BusinessCard';
import { getBusinessesByCategory, getBusinessesByMunicipality, getCategories, getMunicipalities, getStateBySlug, getStates } from '@/lib/data';

type Params = Promise<{ estado: string; municipio: string }>;
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
  return getStates().flatMap((state) => [
    ...getMunicipalities(state.slug).map((municipality) => ({ estado: state.slug, municipio: municipality.slug })),
    ...getCategories(state.slug).map((category) => ({ estado: state.slug, municipio: category.slug })),
  ]);
}

export async function generateMetadata({ params }: { params: Params }) {
  const { estado, municipio } = await params;
  const state = getStateBySlug(estado);
  const municipality = getMunicipalities(estado).find((item) => item.slug === municipio);
  const category = getCategories(estado).find((item) => item.slug === municipio);
  if (category && state) {
    return {
      title: `${category.name} en ${state.name} | Rankea Refaccionarias`,
      description: `Directorio de ${category.name.toLowerCase()} en ${state.name}. Consulta fichas con dirección, teléfono y ubicación cuando estén disponibles.`,
    };
  }
  return {
    title: municipality && state ? `Refaccionarias en ${municipality.name}, ${state.name} | Rankea Refaccionarias` : 'Refaccionarias | Rankea Refaccionarias',
    description: `Directorio de refaccionarias y autopartes en ${municipality?.name || 'el municipio'}.`,
  };
}

export default async function MunicipalityPage({ params, searchParams }: { params: Params; searchParams?: SearchParams }) {
  const { estado, municipio } = await params;
  const queryParams = searchParams ? await searchParams : {};
  const state = getStateBySlug(estado);
  if (!state) notFound();

  const category = getCategories(state.slug).find((item) => item.slug === municipio);
  const businesses = category ? getBusinessesByCategory(municipio, state.slug) : getBusinessesByMunicipality(state.slug, municipio);
  if (!businesses.length) notFound();
  const totalPages = Math.max(1, Math.ceil(businesses.length / PAGE_SIZE));
  const page = pageFrom(queryParams.page, totalPages);
  const visibleBusinesses = businesses.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const municipalityName = businesses[0].municipality;
  const withPhone = businesses.filter((business) => business.phone).length;
  const withWebsite = businesses.filter((business) => business.website).length;
  const withCoordinates = businesses.filter((business) => business.hasCoordinates).length;
  const categories = categorySummary(businesses);
  const basePath = category ? `/${state.slug}/${category.slug}/` : `/${state.slug}/${municipio}/`;
  const showingFrom = (page - 1) * PAGE_SIZE + 1;
  const showingTo = Math.min(page * PAGE_SIZE, businesses.length);

  if (category) {
    return (
      <main>
        <section className="page-hero">
          <div className="wrap">
            <div className="breadcrumb"><a href="/">Inicio</a> / <a href={`/${state.slug}/`}>{state.name}</a> / {category.name}</div>
            <span className="eyebrow"><Tags size={15}/> Tipo de refaccionaria</span>
            <h1 className="h1">{category.name} en {state.name}</h1>
            <p className="lead">Refaccionarias clasificadas dentro de {category.name.toLowerCase()} en {state.name}. Revisa dirección, teléfono y ubicación cuando estén disponibles.</p>
            <div className="statgrid">
              <div className="stat"><b>{businesses.length}</b><span>fichas en este tipo</span></div>
              <div className="stat"><b>{withPhone}</b><span>con teléfono</span></div>
              <div className="stat"><b>{withWebsite}</b><span>con sitio web</span></div>
            </div>
          </div>
        </section>
        <section className="section compact-section">
          <div className="wrap editorial-panel">
            <p>Este hub reúne {businesses.length} fichas de {category.name.toLowerCase()} en {state.name}. La selección se construye con negocios disponibles en la base de Rankea Refaccionarias y prioriza datos accionables como dirección, teléfono y ubicación.</p>
            <p>Actualmente {withPhone} fichas tienen teléfono y {withCoordinates} incluyen coordenadas para revisar la zona antes de contactar. Usa la paginación para explorar el inventario completo sin depender de filtros o resultados incompletos.</p>
          </div>
        </section>
        <section className="section">
          <div className="wrap">
            <div className="section-title">
              <div><h2>Negocios disponibles</h2><p className="sub">Listado por tipo de refaccionaria para facilitar búsquedas de autopartes y servicios relacionados.</p></div>
            </div>
            <div className="resultbar"><span>Mostrando {showingFrom}-{showingTo} de {businesses.length}</span><span>Página {page} de {totalPages}</span></div>
            <div className="cards">{visibleBusinesses.map((business) => <BusinessCard key={business.id} business={business} />)}</div>
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
          <div className="breadcrumb"><a href="/">Inicio</a> / <a href={`/${state.slug}/`}>{state.name}</a> / {municipalityName}</div>
          <span className="eyebrow"><MapPin size={15}/> Hub municipal</span>
          <h1 className="h1">Refaccionarias en {municipalityName}, {state.name}</h1>
          <p className="lead">Proveedores automotrices y refaccionarias ubicadas en {municipalityName}. Usa las fichas para llamar, revisar zona y comparar opciones disponibles.</p>
          <form className="searchbox" action={`/${state.slug}/`}>
            <Search className="search-icon" aria-hidden="true" size={22}/>
            <input name="q" placeholder="Buscar otra refaccionaria, zona o municipio" type="search" />
            <button className="btn">Buscar</button>
          </form>
          <div className="statgrid">
            <div className="stat"><b>{businesses.length}</b><span>fichas en {municipalityName}</span></div>
            <div className="stat"><b>{withPhone}</b><span>con teléfono</span></div>
            <div className="stat"><b>{withWebsite}</b><span>con sitio web</span></div>
          </div>
        </div>
      </section>
      <section className="section compact-section">
        <div className="wrap editorial-panel">
          <p>En {municipalityName}, Rankea Refaccionarias agrupa {businesses.length} fichas de negocios relacionados con autopartes y refacciones. Este hub sirve para comparar opciones por nombre, zona, categoría y datos de contacto disponibles.</p>
          <p>{categories.length ? `Dentro del inventario local aparecen categorías como ${joinList(categories)}. ` : ''}De las fichas disponibles, {withPhone} incluyen teléfono y {withCoordinates} tienen coordenadas, lo que ayuda a validar cercanía antes de visitar o llamar.</p>
        </div>
      </section>
      <section className="section">
        <div className="wrap">
          <div className="section-title"><div><span className="eyebrow"><SlidersHorizontal size={15}/> Resultados</span><h2>Negocios disponibles</h2><p className="sub">Cards compactas con acciones reales. No inventamos horarios, inventario ni reseñas.</p></div></div>
          <div className="filters"><span className="chip">Con teléfono · {withPhone}</span><span className="chip">Con sitio web · {withWebsite}</span><span className="chip">Datos públicos</span></div>
          <div className="resultbar"><span>Mostrando {showingFrom}-{showingTo} de {businesses.length}</span><span>Página {page} de {totalPages}</span></div>
          <div className="cards">{visibleBusinesses.map((business) => <BusinessCard key={business.id} business={business} />)}</div>
          <Pagination basePath={basePath} page={page} totalPages={totalPages} />
        </div>
      </section>
    </main>
  );
}
