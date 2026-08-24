import { notFound } from 'next/navigation';
import { ExternalLink, MapPin, Phone, ShieldCheck } from 'lucide-react';
import { BusinessCard } from '@/components/BusinessCard';
import { getBusinessBySlug, getBusinessesByState, getSimilarBusinesses, formatPhone, websiteHref } from '@/lib/data';
import { claimMailto, siteUrl } from '@/lib/site';

type Params = Promise<{ municipio: string; businessSlug: string }>;

export function generateStaticParams() { return getBusinessesByState('queretaro').map(b => ({ municipio: b.municipalitySlug, businessSlug: b.businessSlug })); }

export async function generateMetadata({ params }: { params: Params }) {
  const { municipio, businessSlug } = await params;
  const b = getBusinessBySlug(municipio, businessSlug);
  if (!b) return {};
  return { title: b.seoTitle, description: b.seoDescription, alternates: { canonical: b.canonicalUrl || `${siteUrl}${b.urlPath}` } };
}

export default async function BusinessPage({ params }: { params: Params }) {
  const { municipio, businessSlug } = await params;
  const b = getBusinessBySlug(municipio, businessSlug);
  if (!b) notFound();
  const similar = getSimilarBusinesses(b);
  const absoluteUrl = b.canonicalUrl || `${siteUrl}${b.urlPath}`;
  const phoneText = b.phone ? formatPhone(b.phone) : '';
  const faq = [
    {
      question: `¿Cómo puedo contactar a ${b.publicName}?`,
      answer: b.phone
        ? `Puedes llamar al ${phoneText}. Valida horarios, disponibilidad y piezas antes de trasladarte.`
        : `No hay teléfono disponible en esta ficha. Puedes usar los datos de ubicación y reclamar la ficha si tienes información actualizada.`,
    },
    {
      question: `¿Dónde está ${b.publicName}?`,
      answer: b.address
        ? `${b.publicName} aparece ubicado en ${b.address}, ${b.municipality}, ${b.stateName}.`
        : `${b.publicName} aparece en ${b.municipality}, ${b.stateName}, pero la dirección completa requiere validación.`,
    },
    {
      question: `¿La información de ${b.publicName} está verificada?`,
      answer: `Esta ficha usa datos públicos de ${b.source}. La información puede requerir actualización o validación directa por el negocio.`,
    },
  ];
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'AutoPartsStore',
        '@id': `${absoluteUrl}#business`,
        name: b.publicName,
        url: absoluteUrl,
        address: b.address || undefined,
        telephone: b.phone || undefined,
        geo: b.hasCoordinates ? { '@type':'GeoCoordinates', latitude: b.lat, longitude: b.lng } : undefined,
        areaServed: [b.municipality, b.stateName].filter(Boolean).join(', '),
        sameAs: b.websiteStatus === 'working' && b.website ? websiteHref(b.website) : undefined,
      },
      {
        '@type': 'FAQPage',
        '@id': `${absoluteUrl}#faq`,
        mainEntity: faq.map((item) => ({
          '@type': 'Question',
          name: item.question,
          acceptedAnswer: { '@type': 'Answer', text: item.answer },
        })),
      },
    ],
  };
  return (
    <main className="section">
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify(jsonLd)}}/>
      <div className="wrap">
        <div className="breadcrumb"><a href="/">Inicio</a> / <a href={`/${b.stateSlug}/`}>{b.stateName}</a> / <a href={`/${b.stateSlug}/${b.municipalitySlug}/`}>{b.municipality}</a> / {b.publicName}</div>
        <div className="detail">
          <article>
            <section className="profile-head">
              <h1>{b.publicName}</h1>
              <div className="badges">
                <a className="badge signal" href={`/${b.stateSlug}/${b.categorySlug}/`}>{b.category}</a>
              </div>
            </section>
            <div className="info">
              <div className="infobox"><b><MapPin size={17}/> Dirección</b>{b.address || 'Dirección por validar'}</div>
              <div className="infobox"><b>Municipio y zona</b>{b.municipality}, {b.stateName}{b.colony ? ` · ${b.colony}` : ''}</div>
              <div className="infobox"><b>Categoría</b>{b.category}</div>
              <div className="infobox"><b>Datos de contacto</b>{b.phone ? `Teléfono: ${phoneText}` : 'Teléfono no disponible'}</div>
              <div className="notice"><ShieldCheck size={18}/> Esta ficha usa datos públicos disponibles. La información puede requerir validación por el negocio.</div>
            </div>

            <section className="similar">
              <div className="section-title"><div><h2>Preguntas frecuentes</h2></div></div>
              <div className="info">
                {faq.map((item) => <div className="infobox" key={item.question}><b>{item.question}</b>{item.answer}</div>)}
              </div>
            </section>

            {similar.length ? <section className="similar"><div className="section-title"><div><h2>Negocios similares cerca</h2><p className="sub">Más opciones en {b.municipality} para comparar por zona, categoría y datos de contacto disponibles.</p></div></div><div className="cards">{similar.map(item => <BusinessCard key={item.id} business={item}/>)}</div></section> : null}
          </article>
          <aside className="side-panel">
            <h2>Contactar</h2>
            <p className="sub">Usa los datos disponibles y valida antes de trasladarte.</p>
            <div className="actions">
              {b.phone ? <a className="btn" href={`tel:${b.phone}`}><Phone size={17}/> Llamar {phoneText}</a> : <span className="btn secondary">Teléfono no disponible</span>}
              {b.website ? <a className="btn link" target="_blank" rel="noreferrer" href={websiteHref(b.website)}><ExternalLink size={17}/> Visitar sitio</a> : null}
              {b.mapsUrl ? <a className="btn secondary" target="_blank" rel="noreferrer" href={b.mapsUrl}><MapPin size={17}/> Ver mapa</a> : null}
            </div>
            <div className="claim" style={{display:'block',marginTop:16,padding:18}}>
              <b>¿Eres dueño o encargado?</b>
              <p>Reclama esta ficha para corregir datos, agregar información de contacto y mejorar cómo aparece tu negocio.</p>
              <a className="btn" href={claimMailto(`Reclamar ficha ${b.publicName}`)}>Reclamar mi ficha</a>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
