import type { Metadata } from 'next';
import { Building2, MapPin, Search, ShieldCheck, Wrench } from 'lucide-react';
import { claimMailto } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Acerca de Rankea Refaccionarias | Directorio de refaccionarias en México',
  description: 'Conoce Rankea Refaccionarias, un directorio especializado para encontrar refaccionarias, autopartes y proveedores por estado, ciudad y categoría en México.',
};

const listingDetails = [
  'Nombre de la refaccionaria.',
  'Dirección.',
  'Estado y municipio.',
  'Teléfono.',
  'Sitio web.',
  'Ubicación.',
  'Horarios.',
  'Categorías o tipos de refacciones.',
  'Fotografías.',
  'Opiniones o calificaciones cuando se encuentran disponibles.',
  'Otros datos útiles para contactar o identificar al negocio.',
];

const locationExamples = [
  ['Refaccionarias en Querétaro', '/queretaro/'],
  ['Refaccionarias en Monterrey', '/nuevo-leon/monterrey/'],
  ['Refaccionarias en Nuevo León', '/nuevo-leon/'],
  ['Refaccionarias en San Juan del Río', '/queretaro/san-juan-del-rio/'],
  ['Refaccionarias en Apodaca', '/nuevo-leon/apodaca/'],
];

const repairTypes = [
  'Motor.',
  'Frenos.',
  'Suspensión.',
  'Dirección.',
  'Transmisión.',
  'Sistema eléctrico.',
  'Baterías.',
  'Filtros.',
  'Lubricantes.',
  'Enfriamiento.',
  'Refacciones diesel.',
  'Refacciones para tractocamión.',
  'Carrocería.',
  'Accesorios automotrices.',
];

export default function AboutPage() {
  return (
    <main>
      <section className="page-hero about-hero">
        <div className="wrap">
          <p className="breadcrumb"><a href="/">Inicio</a> / Acerca de</p>
          <span className="eyebrow"><Building2 size={15} /> Acerca de Rankea Refaccionarias</span>
          <h1>Encontrar una refaccionaria no debería ser complicado</h1>
          <p className="lead">
            <strong>Rankea Refaccionarias es un directorio especializado en refaccionarias, tiendas de autopartes y proveedores relacionados con el sector automotriz en México.</strong>
          </p>
        </div>
      </section>

      <section className="section about-section">
        <div className="wrap about-layout">
          <article className="about-content">
            <p>
              Nuestro objetivo es reunir en un solo lugar información útil para ayudarte a localizar negocios de refacciones por <strong>estado, ciudad, municipio, categoría o tipo de producto</strong>.
            </p>
            <p>
              En lugar de buscar entre decenas de resultados dispersos, Rankea Refaccionarias organiza la información para que puedas encontrar opciones de manera más rápida y consultar los datos disponibles de cada negocio.
            </p>

            <h2>¿Qué información puedes encontrar?</h2>
            <p>Las fichas de Rankea Refaccionarias pueden incluir, dependiendo de la información disponible:</p>
            <ul>
              {listingDetails.map((detail) => <li key={detail}>{detail}</li>)}
            </ul>
            <p>La cantidad de información puede variar entre una refaccionaria y otra.</p>

            <h2>Un directorio pensado para buscar por ubicación</h2>
            <p>
              México tiene miles de negocios dedicados a la venta de refacciones y autopartes. Por eso Rankea Refaccionarias está organizado geográficamente para facilitar búsquedas como:
            </p>
            <div className="about-link-stack" aria-label="Búsquedas por ubicación">
              {locationExamples.map(([label, href]) => <a href={href} key={href}>{label}</a>)}
            </div>
            <p>
              Conforme el directorio crezca iremos incorporando más estados, municipios, ciudades y negocios. Nuestro objetivo es construir progresivamente un directorio de refaccionarias que cubra todo México.
            </p>

            <h2>También puedes buscar por tipo de refacción</h2>
            <p>No todas las personas saben el nombre de una refaccionaria específica. Muchas simplemente saben qué necesitan.</p>
            <p>Por eso el directorio también está diseñado para organizar negocios relacionados con categorías como:</p>
            <ul className="about-columns">
              {repairTypes.map((type) => <li key={type}>{type}</li>)}
            </ul>
            <p>
              A medida que integremos y clasifiquemos más negocios, estas categorías permitirán localizar proveedores especializados de forma más sencilla.
            </p>

            <h2>¿De dónde obtenemos la información?</h2>
            <p>Rankea Refaccionarias reúne y organiza información comercial disponible públicamente y datos proporcionados o actualizados por los propios negocios cuando corresponda.</p>
            <p>Nuestro trabajo consiste en estructurar esa información para convertirla en un directorio más fácil de consultar.</p>
            <p>Siempre buscamos mantener la información lo más clara y útil posible, pero los datos de un negocio pueden cambiar con el tiempo.</p>
            <p>Por ello recomendamos confirmar directamente con cada establecimiento información como horarios, inventario, precios, disponibilidad de productos o condiciones comerciales antes de realizar una visita o compra.</p>

            <h2>No vendemos las refacciones</h2>
            <p><strong>Rankea Refaccionarias es un directorio informativo.</strong></p>
            <p>No somos propietarios ni representantes de las refaccionarias listadas, salvo que se indique expresamente lo contrario.</p>
            <p>Las compras, cotizaciones, garantías, existencias, precios, entregas y cualquier otra operación comercial se realizan directamente entre el usuario y cada negocio.</p>
            <p>Nuestra función es ayudarte a encontrarlos.</p>

            <h2>Para propietarios de refaccionarias</h2>
            <p>Si tienes una refaccionaria, tienda de autopartes o negocio relacionado con el sector automotriz y ya apareces en Rankea Refaccionarias, podrás solicitar la actualización o corrección de la información de tu ficha.</p>
            <p>Si todavía no apareces en el directorio, también puedes solicitar que tu negocio sea agregado.</p>
            <p>Queremos que las fichas sean cada vez más completas y que los usuarios puedan encontrar información útil para ponerse en contacto con cada establecimiento.</p>
            <p><a className="btn" href={claimMailto('Quiero agregar mi refaccionaria')}>Agregar mi refaccionaria</a></p>

            <h2>Un directorio que seguirá creciendo</h2>
            <p>Rankea Refaccionarias comienza concentrando información de negocios en diferentes ciudades de <strong>Querétaro y Nuevo León</strong>, y continuará incorporando progresivamente nuevas ubicaciones.</p>
            <p>La meta es sencilla:</p>
            <p><strong>hacer más fácil encontrar dónde comprar refacciones en México.</strong></p>
            <p>Ya sea que busques una refaccionaria cercana, un proveedor especializado o simplemente opciones para comparar, queremos que Rankea Refaccionarias sea un buen punto de partida.</p>

            <div className="about-explore">
              <h2>Explora Rankea Refaccionarias</h2>
              <div>
                <a href="/refaccionarias/">Refaccionarias en México</a>
                <a href="/queretaro/">Refaccionarias en Querétaro</a>
                <a href="/nuevo-leon/">Refaccionarias en Nuevo León</a>
                <a href="/nuevo-leon/monterrey/">Refaccionarias en Monterrey</a>
                <a href="/refaccionarias/">Buscar por categorías</a>
              </div>
            </div>
          </article>

          <aside className="about-aside" aria-label="Resumen del directorio">
            <div>
              <MapPin size={24} aria-hidden="true" />
              <b>Búsqueda local</b>
              <p>Organización por estado, ciudad y municipio para encontrar opciones cercanas.</p>
            </div>
            <div>
              <Wrench size={24} aria-hidden="true" />
              <b>Categorías automotrices</b>
              <p>Clasificación por tipos de refacción, autopartes y proveedores especializados.</p>
            </div>
            <div>
              <ShieldCheck size={24} aria-hidden="true" />
              <b>Directorio informativo</b>
              <p>Datos estructurados para consultar y contactar directamente a cada negocio.</p>
            </div>
            <div>
              <Search size={24} aria-hidden="true" />
              <b>Cobertura en crecimiento</b>
              <p>El MVP inicia con Querétaro y Nuevo León, con visión nacional.</p>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
