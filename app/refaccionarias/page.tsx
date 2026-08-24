import type { Metadata } from 'next';
import { MapPin, Search, SlidersHorizontal, Sparkles } from 'lucide-react';
import { BusinessCard } from '@/components/BusinessCard';
import { getCategories, getFeaturedBusinesses, getStates } from '@/lib/data';

export const metadata: Metadata = {
  title: 'Refaccionarias en México | Rankea Refaccionarias',
  description: 'Explora refaccionarias, tiendas de autopartes y proveedores automotrices por estado, ciudad y tipo de refacción en México.',
};

export default function RefaccionariasPage() {
  const states = getStates();
  const categories = getCategories();
  const featured = getFeaturedBusinesses(8);

  return (
    <main>
      <section className="page-hero">
        <div className="wrap">
          <p className="breadcrumb"><a href="/">Inicio</a> / Refaccionarias</p>
          <span className="eyebrow">Directorio nacional</span>
          <h1>Refaccionarias en México</h1>
          <p className="lead">Busca negocios de autopartes por ubicación, categoría y ficha individual conforme el directorio crece a más estados.</p>
          <form className="searchbox" action={`/${states[0]?.slug || 'queretaro'}/`}>
            <Search className="search-icon" aria-hidden="true" size={22}/>
            <input name="q" placeholder="Buscar refaccionaria, municipio, colonia o categoría" type="search" />
            <button className="btn">Buscar</button>
          </form>
        </div>
      </section>
      <section className="section">
        <div className="wrap">
          <div className="section-title"><div><h2>Estados disponibles</h2><p className="sub">Ubicaciones activas dentro del directorio.</p></div></div>
          <div className="location-grid">
            {states.map((state) => <a className="location-card" href={`/${state.slug}/`} key={state.slug}><span>{state.name}</span><strong>Refaccionarias en {state.name}</strong><small>{state.count} negocios disponibles</small></a>)}
          </div>
        </div>
      </section>
      <section className="section city-section">
        <div className="wrap">
          <div className="section-title"><div><span className="eyebrow"><MapPin size={15}/> Ciudades</span><h2>Ciudades principales</h2><p className="sub">Municipios con fichas disponibles en la base actual.</p></div></div>
          <div className="city-list">
            {states.flatMap((state) => state.cities.map((city) => <a href={`/${state.slug}/${city.slug}/`} key={`${state.slug}-${city.slug}`}>{city.name}, {state.name}<span>{city.count}</span></a>))}
          </div>
        </div>
      </section>
      <section className="section type-section">
        <div className="wrap">
          <div className="section-title"><div><span className="eyebrow"><SlidersHorizontal size={15}/> Categorías</span><h2>Tipos de refaccionaria</h2><p className="sub">Categorías disponibles desde los datos publicados.</p></div></div>
          <div className="type-grid">
            {categories.map((category) => <a className="type-link" href={`/refaccionarias/${category.slug}/`} key={category.slug}>{category.name}<span>{category.count}</span></a>)}
          </div>
        </div>
      </section>
      <section className="section">
        <div className="wrap">
          <div className="section-title"><div><span className="eyebrow"><Sparkles size={15}/> Selección</span><h2>Refaccionarias destacadas</h2><p className="sub">Fichas con mejor disponibilidad de datos para contacto y ubicación.</p></div></div>
          <div className="cards featured-cards">{featured.map((business) => <BusinessCard business={business} key={business.id} />)}</div>
        </div>
      </section>
      <section className="section editorial-section">
        <div className="wrap editorial">
          <div>
            <span className="eyebrow">Directorio útil</span>
            <h2>Busca por lugar, categoría o negocio</h2>
          </div>
          <div className="editorial-copy">
            <p>Rankea Refaccionarias organiza fichas de negocios de autopartes con datos verificables disponibles: teléfono, dirección, sitio web, municipio y categoría.</p>
            <p>El directorio se construye como una base nacional en crecimiento. Cada estado y municipio se muestra únicamente cuando existe inventario real en los datos.</p>
          </div>
        </div>
      </section>
    </main>
  );
}
