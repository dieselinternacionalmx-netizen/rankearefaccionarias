import { notFound } from 'next/navigation';
import { Building2, MapPin, Search, SlidersHorizontal, Sparkles } from 'lucide-react';
import { BusinessCard } from '@/components/BusinessCard';
import { getBusinessesByState, getCategories, getMunicipalities, getStateBySlug, getStates } from '@/lib/data';

type Params = Promise<{ estado: string }>;
type SearchParams = Promise<{ q?: string; page?: string }>;
const PAGE_SIZE = 24;

function pageFrom(value: string | undefined, totalPages: number) {
  const requestedPage = Number(value || 1);
  if (!Number.isFinite(requestedPage) || requestedPage < 1) return 1;
  return Math.min(Math.floor(requestedPage), totalPages);
}

function paginationHref(basePath: string, page: number, q: string) {
  const params = new URLSearchParams();
  if (q) params.set('q', q);
  if (page > 1) params.set('page', String(page));
  const query = params.toString();
  return query ? `${basePath}?${query}` : basePath;
}

function Pagination({ basePath, page, totalPages, q }: { basePath: string; page: number; totalPages: number; q: string }) {
  if (totalPages <= 1) return null;
  return (
    <nav className="pagination" aria-label="Paginación">
      <a className={`page-btn ${page === 1 ? 'disabled' : ''}`} href={paginationHref(basePath, page - 1, q)}>Anterior</a>
      {Array.from({ length: totalPages }, (_, index) => index + 1).map((item) => (
        <a className={`page-num ${item === page ? 'active' : ''}`} href={paginationHref(basePath, item, q)} key={item}>{item}</a>
      ))}
      <a className={`page-btn ${page === totalPages ? 'disabled' : ''}`} href={paginationHref(basePath, page + 1, q)}>Siguiente</a>
    </nav>
  );
}

export function generateStaticParams() {
  return getStates().map((state) => ({ estado: state.slug }));
}

export async function generateMetadata({ params }: { params: Params }) {
  const { estado } = await params;
  const state = getStateBySlug(estado);
  if (!state) return {};
  return {
    title: `Refaccionarias en ${state.name} | Rankea Refaccionarias`,
    description: `Directorio de refaccionarias, autopartes y proveedores automotrices en ${state.name}, organizado por municipio y ficha individual.`,
  };
}

export default async function StateHub({ params, searchParams }: { params: Params; searchParams?: SearchParams }) {
  const { estado } = await params;
  const state = getStateBySlug(estado);
  if (!state) notFound();

  const queryParams = searchParams ? await searchParams : {};
  const q = (queryParams.q || '').toLowerCase();
  const all = getBusinessesByState(state.slug);
  const businesses = q ? all.filter((business) => `${business.publicName} ${business.category} ${business.colony} ${business.municipality}`.toLowerCase().includes(q)) : all;
  const totalPages = Math.max(1, Math.ceil(businesses.length / PAGE_SIZE));
  const page = pageFrom(queryParams.page, totalPages);
  const visibleBusinesses = businesses.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const showingFrom = businesses.length ? (page - 1) * PAGE_SIZE + 1 : 0;
  const showingTo = Math.min(page * PAGE_SIZE, businesses.length);
  const municipalities = getMunicipalities(state.slug);
  const categories = getCategories(state.slug);
  const featured = all.slice().sort((a, b) => b.contactCompleteness - a.contactCompleteness || a.publicName.localeCompare(b.publicName)).slice(0, 8);

  return (
    <main>
      <section className="page-hero">
        <div className="wrap">
          <div className="breadcrumb"><a href="/">Inicio</a> / {state.name}</div>
          <span className="eyebrow"><MapPin size={15}/> Directorio estatal</span>
          <h1 className="h1">Refaccionarias en {state.name}</h1>
          <p className="lead">Encuentra refaccionarias, autopartes y proveedores en {state.name}. Explora negocios por municipio, categoría o ubicación.</p>
          <form className="searchbox">
            <Search className="search-icon" aria-hidden="true" size={22}/>
            <input name="q" defaultValue={q} placeholder="Filtra por nombre, municipio, colonia o especialidad" type="search" />
            <button className="btn">Filtrar</button>
          </form>
          <div className="state-stats">
            <div><b>{all.length}</b><span>fichas disponibles</span></div>
            <div><b>{municipalities.length}</b><span>municipios con fichas</span></div>
            <div><b>{categories.length}</b><span>categorías activas</span></div>
          </div>
        </div>
      </section>

      <section className="section state-overview">
        <div className="wrap overview-grid">
          <div>
            <span className="eyebrow"><Building2 size={15}/> Datos del directorio</span>
            <h2>Inventario disponible en {state.name}</h2>
            <p className="sub">Estos datos provienen únicamente de la base actual de Rankea Refaccionarias. No asumimos inventario, horarios, reseñas ni jerarquías comerciales sin una fuente verificable.</p>
          </div>
          <div className="metric-panel">
            <div><span>{all.filter((business) => business.phone).length}</span><b>con teléfono</b></div>
            <div><span>{all.filter((business) => business.website).length}</span><b>con sitio web</b></div>
            <div><span>{all.filter((business) => business.hasCoordinates).length}</span><b>con coordenadas</b></div>
          </div>
        </div>
      </section>

      <section className="section location-section">
        <div className="wrap">
          <div className="section-title"><div><span className="eyebrow"><MapPin size={15}/> Municipios</span><h2>Explora refaccionarias por municipio</h2><p className="sub">Solo mostramos municipios con fichas disponibles dentro de nuestra base.</p></div></div>
          <div className="municipios">{municipalities.map((municipality) => <a className="mun" href={`/${state.slug}/${municipality.slug}/`} key={municipality.slug}><span>{municipality.name}</span><b>{municipality.count}</b></a>)}</div>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <div className="section-title"><div><span className="eyebrow"><Sparkles size={15}/> Selección</span><h2>Refaccionarias destacadas</h2><p className="sub">Fichas seleccionadas por disponibilidad de datos, no como ranking de calidad.</p></div></div>
          <div className="cards">{featured.map((business) => <BusinessCard key={business.id} business={business} />)}</div>
        </div>
      </section>

      <section className="section type-section">
        <div className="wrap">
          <div className="section-title"><div><span className="eyebrow"><SlidersHorizontal size={15}/> Categorías</span><h2>Buscar por categoría</h2><p className="sub">Categorías derivadas de datos disponibles o clasificación manual.</p></div></div>
          <div className="type-grid">{categories.map((category) => <a className="type-link" href={`/${state.slug}/${category.slug}/`} key={category.slug}>{category.name}<span>{category.count}</span></a>)}</div>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <div className="section-title"><div><h2>{q ? `${businesses.length} resultados` : 'Listado de refaccionarias'}</h2><p className="sub">{q ? 'Resultados encontrados con el filtro aplicado.' : 'Explora el inventario disponible por páginas, municipios, categorías o búsqueda.'}</p></div></div>
          {businesses.length ? <div className="resultbar"><span>Mostrando {showingFrom}-{showingTo} de {businesses.length}</span><span>Página {page} de {totalPages}</span></div> : null}
          {visibleBusinesses.length ? <div className="cards">{visibleBusinesses.map((business) => <BusinessCard key={business.id} business={business} />)}</div> : <div className="empty">No encontramos refaccionarias con ese filtro. Intenta buscar por municipio o nombre.</div>}
          <Pagination basePath={`/${state.slug}/`} page={page} totalPages={totalPages} q={q} />
        </div>
      </section>
    </main>
  );
}
