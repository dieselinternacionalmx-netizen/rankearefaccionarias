import { ArrowRight, Building2, LocateFixed, MapPin, Phone, Search, SlidersHorizontal, Sparkles, Wrench } from 'lucide-react';
import { BusinessCard } from '@/components/BusinessCard';
import { getBusinesses, getCategories, getFeaturedBusinesses, getStates } from '@/lib/data';
import { claimMailto } from '@/lib/site';

const repairTypes = [
  'Motor',
  'Frenos',
  'Suspensión',
  'Dirección',
  'Transmisión',
  'Embrague',
  'Sistema eléctrico',
  'Baterías',
  'Filtros',
  'Lubricantes',
  'Enfriamiento',
  'Partes diesel',
  'Refacciones para tractocamión',
  'Carrocería',
  'Accesorios',
];

function slugify(input: string) {
  return input
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export default function Home() {
  const businesses = getBusinesses();
  const states = getStates();
  const categories = getCategories();
  const featured = getFeaturedBusinesses(8);
  const knownCategories = new Map(categories.map((category) => [category.name.toLowerCase(), category.slug]));

  return (
    <main>
      <section className="home-hero">
        <div className="hero-bg" aria-hidden="true" />
        <div className="hero-overlay" aria-hidden="true" />
        <div className="wrap hero-content">
          <div className="hero-panel">
            <img className="hero-logo" src="/logo_horizontal.png" alt="Rankea Refaccionarias" />
            <p className="eyebrow"><MapPin size={15} /> Directorio nacional de autopartes</p>
            <h1 className="h1">Encuentra la refacción. Encuentra quién la vende.</h1>
            <p className="hero-copy">Busca refaccionarias, autopartes y proveedores por ciudad, estado o tipo de refacción.</p>

            <form className="hero-search" action={`/${states[0]?.slug || 'queretaro'}/`}>
              <label className="search-field" htmlFor="main-search">
                <Search aria-hidden="true" size={22} />
                <span className="sr-only">Qué refacción o refaccionaria buscas</span>
                <input id="main-search" name="q" type="search" placeholder="¿Qué refacción o refaccionaria buscas?" />
              </label>
              <label className="search-field location-field" htmlFor="main-location">
                <MapPin aria-hidden="true" size={21} />
                <span className="sr-only">Ciudad o estado</span>
                <select id="main-location" name="ubicacion" defaultValue={states[0]?.slug || 'mexico'}>
                  {states.map((state) => <option key={state.slug} value={state.slug}>{state.name}</option>)}
                  <option value="mexico">México</option>
                </select>
              </label>
              <button className="btn hero-search-btn" type="submit">Buscar</button>
            </form>

            <div className="search-examples" aria-label="Búsquedas sugeridas">
              {['Frenos', 'Suspensión', 'Motor', 'Diesel', 'Transmisión'].map((term) => (
                <a key={term} href={`/refaccionarias/${slugify(term)}/`}>{term}</a>
              ))}
            </div>
            <p className="hero-note">Explora negocios de autopartes en todo México.</p>
          </div>
        </div>
      </section>

      <section className="section location-section" id="estados">
        <div className="wrap">
          <div className="section-title">
            <div>
              <span className="eyebrow"><Building2 size={15} /> Ubicaciones</span>
              <h2>Encuentra refaccionarias por ubicación</h2>
              <p className="sub">Explora negocios de autopartes y refacciones en las principales ciudades de México.</p>
            </div>
          </div>
          <div className="location-grid">
            {states.map((state) => (
              <a className="location-card" href={`/${state.slug}/`} key={state.slug}>
                <div className="location-photo" aria-hidden="true" />
                <div className="location-copy">
                  <span>{state.name}</span>
                  <strong>Refaccionarias en {state.name}</strong>
                  <small>{state.count} negocios disponibles</small>
                </div>
                <ArrowRight aria-hidden="true" size={20} />
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className="section city-section" id="ciudades">
        <div className="wrap">
          <div className="section-title">
            <div>
              <span className="eyebrow"><MapPin size={15} /> Ciudades</span>
              <h2>Ciudades principales</h2>
              <p className="sub">Enlaces limpios hacia las ciudades y municipios con fichas disponibles.</p>
            </div>
          </div>
          <div className="city-list">
            {states.flatMap((state) => state.cities.map((city) => (
              <a href={`/${state.slug}/${city.slug}/`} key={`${state.slug}-${city.slug}`}>{city.name}, {state.name}<span>{city.count}</span></a>
            )))}
          </div>
        </div>
      </section>

      <section className="section type-section" id="categorias">
        <div className="wrap">
          <div className="section-title">
            <div>
              <span className="eyebrow"><SlidersHorizontal size={15} /> Tipos de refacción</span>
              <h2>¿Qué refacción estás buscando?</h2>
              <p className="sub">Categorías preparadas para convertirse en landings SEO por refacción, estado y ciudad.</p>
            </div>
          </div>
          <div className="type-grid">
            {repairTypes.map((type) => {
              const existingSlug = knownCategories.get(type.toLowerCase());
              const href = existingSlug ? `/refaccionarias/${existingSlug}/` : `/refaccionarias/${slugify(type)}/`;
              return <a className="type-link" href={href} key={type}>{type}</a>;
            })}
          </div>
        </div>
      </section>

      <section className="section" id="refaccionarias">
        <div className="wrap">
          <div className="section-title">
            <div>
              <span className="eyebrow"><Sparkles size={15} /> Directorio</span>
              <h2>Refaccionarias destacadas</h2>
              <p className="sub">Fichas con mejor disponibilidad de datos para contactar, revisar ubicación y entrar a la ficha.</p>
            </div>
          </div>
          <div className="cards featured-cards">{featured.map((business) => <BusinessCard key={business.id} business={business} />)}</div>
        </div>
      </section>

      <section className="section compact-section">
        <div className="wrap">
          <div className="section-title">
            <div>
              <span className="eyebrow"><Wrench size={15} /> Cómo funciona</span>
              <h2>Encuentra la refacción que necesitas</h2>
            </div>
          </div>
          <div className="steps">
            <div><b>1. Busca</b><p>Escribe una refacción, categoría o negocio.</p></div>
            <div><b>2. Compara</b><p>Consulta ubicación, teléfonos, reseñas y servicios.</p></div>
            <div><b>3. Contacta</b><p>Habla directamente con la refaccionaria.</p></div>
          </div>
        </div>
      </section>

      <section className="section nearby-section">
        <div className="wrap nearby">
          <div>
            <span className="eyebrow"><LocateFixed size={15} /> Cerca de ti</span>
            <h2>Refaccionarias cerca de ti</h2>
            <p>Descubre tiendas de autopartes y refaccionarias en tu zona.</p>
          </div>
          <a className="btn dark" href={`/${states[0]?.slug || 'queretaro'}/`}><LocateFixed aria-hidden="true" size={18} /> Usar mi ubicación</a>
        </div>
      </section>

      <section className="section editorial-section">
        <div className="wrap editorial">
          <div>
            <span className="eyebrow"><Search size={15} /> Guía automotriz</span>
            <h2>Encuentra las mejores opciones para tu auto</h2>
          </div>
          <div className="editorial-copy">
            <p>Rankea Refaccionarias reúne información de negocios de autopartes y refacciones automotrices en México para ayudarte a encontrar opciones cerca de ti.</p>
            <p>Consulta refaccionarias por ciudad, ubicación o tipo de refacción y encuentra teléfonos, direcciones, horarios y opiniones de otros clientes conforme se integren nuevas fuentes de datos.</p>
          </div>
        </div>
      </section>

      <section className="section" id="agregar">
        <div className="wrap claim owner-cta">
          <div>
            <span className="eyebrow"><Phone size={15} /> Para negocios</span>
            <h2>¿Tienes una refaccionaria?</h2>
            <p>Haz que más clientes encuentren tu negocio.</p>
          </div>
          <a className="btn" href={claimMailto('Quiero agregar mi refaccionaria')}>Agregar mi refaccionaria</a>
        </div>
      </section>
    </main>
  );
}
