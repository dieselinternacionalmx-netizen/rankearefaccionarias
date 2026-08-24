import { notFound } from 'next/navigation';
import { ExternalLink, MapPin, Phone, ShieldCheck } from 'lucide-react';
import { BusinessCard } from '@/components/BusinessCard';
import { getBusinessBySlug, getBusinesses, getSimilarBusinesses, formatPhone, websiteHref } from '@/lib/data';
import { claimMailto, siteUrl } from '@/lib/site';

type Params = Promise<{ estado: string; municipio: string; businessSlug: string }>;

export function generateStaticParams() {
  return getBusinesses()
    .filter((business) => business.stateSlug !== 'queretaro')
    .map((business) => ({ estado: business.stateSlug, municipio: business.municipalitySlug, businessSlug: business.businessSlug }));
}

export async function generateMetadata({ params }: { params: Params }) {
  const { estado, municipio, businessSlug } = await params;
  const business = getBusinessBySlug(estado, municipio, businessSlug);
  if (!business) return {};
  return {
    title: business.seoTitle,
    description: business.seoDescription,
    alternates: { canonical: business.canonicalUrl || `${siteUrl}${business.urlPath}` },
  };
}

export default async function BusinessPage({ params }: { params: Params }) {
  const { estado, municipio, businessSlug } = await params;
  const business = getBusinessBySlug(estado, municipio, businessSlug);
  if (!business) notFound();

  const similar = getSimilarBusinesses(business);
  const absoluteUrl = business.canonicalUrl || `${siteUrl}${business.urlPath}`;
  const primaryWhatsapp = business.whatsappList[0];
  const primaryPhone = primaryWhatsapp || business.phone;
  const phoneText = primaryPhone ? formatPhone(primaryPhone) : '';
  const faq = [
    {
      question: `¿Cómo puedo contactar a ${business.publicName}?`,
      answer: primaryPhone
        ? `Puedes llamar al ${phoneText}. Valida horarios, disponibilidad y piezas antes de trasladarte.`
        : `No hay teléfono disponible en esta ficha. Puedes usar los datos de ubicación y reclamar la ficha si tienes información actualizada.`,
    },
    {
      question: `¿Dónde está ${business.publicName}?`,
      answer: business.address
        ? `${business.publicName} aparece ubicado en ${business.address}.`
        : `${business.publicName} aparece en ${business.municipality}, ${business.stateName}, pero la dirección completa requiere validación.`,
    },
    {
      question: `¿La información de ${business.publicName} está verificada?`,
      answer: `Esta ficha usa datos públicos de ${business.source}. La información puede requerir actualización o validación directa por el negocio.`,
    },
  ];
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'AutoPartsStore',
        '@id': `${absoluteUrl}#business`,
        name: business.publicName,
        url: absoluteUrl,
        address: business.address || undefined,
        telephone: primaryPhone || undefined,
        geo: business.hasCoordinates ? { '@type':'GeoCoordinates', latitude: business.lat, longitude: business.lng } : undefined,
        areaServed: [business.municipality, business.stateName].filter(Boolean).join(', '),
        sameAs: business.website ? websiteHref(business.website) : undefined,
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
        <div className="breadcrumb"><a href="/">Inicio</a> / <a href={`/${business.stateSlug}/`}>{business.stateName}</a> / <a href={`/${business.stateSlug}/${business.municipalitySlug}/`}>{business.municipality}</a> / {business.publicName}</div>
        <div className="detail">
          <article>
            <section className="profile-head">
              <h1>{business.publicName}</h1>
              <div className="badges">
                <a className="badge signal" href={`/${business.stateSlug}/${business.categorySlug}/`}>{business.category}</a>
              </div>
            </section>
            <div className="info">
              <div className="infobox"><b><MapPin size={17}/> Dirección</b>{business.address || 'Dirección por validar'}</div>
              <div className="infobox"><b>Municipio y zona</b>{business.municipality}, {business.stateName}{business.colony ? ` · ${business.colony}` : ''}</div>
              <div className="infobox"><b>Categoría</b>{business.category}</div>
              <div className="infobox"><b>Datos de contacto</b>{primaryPhone ? `Teléfono: ${phoneText}` : 'Teléfono no disponible'}</div>
              <div className="notice"><ShieldCheck size={18}/> Esta ficha usa datos públicos disponibles. La información puede requerir validación por el negocio.</div>
            </div>

            {business.branches.length ? (
              <section className="similar">
                <div className="section-title"><div><h2>Sucursales</h2><p className="sub">Direcciones y teléfonos disponibles para contactar a {business.publicName}.</p></div></div>
                <div className="cards">
                  {business.branches.map((branch) => (
                    <article className="card" key={branch.branchName}>
                      <h3>{branch.branchName}</h3>
                      <div className="meta">
                        <p className="meta-row"><MapPin aria-hidden="true" /><span>{branch.address}</span></p>
                        {branch.hours ? <p><b>Horario:</b> {branch.hours}</p> : null}
                        {branch.whatsapp.length ? <p><b>WhatsApp:</b> {branch.whatsapp.map(formatPhone).join(' · ')}</p> : null}
                        {branch.phone.length ? <p><b>Teléfono:</b> {branch.phone.map(formatPhone).join(' · ')}</p> : null}
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            ) : null}

            {business.commercialClaims.length ? (
              <section className="similar">
                <div className="section-title"><div><h2>Datos comerciales destacados</h2><p className="sub">Puntos declarados en la ficha manual para enriquecer el perfil.</p></div></div>
                <div className="filters">{business.commercialClaims.slice(0, 8).map((claim) => <span className="chip" key={claim}>{claim}</span>)}</div>
              </section>
            ) : null}

            <section className="similar">
              <div className="section-title"><div><h2>Preguntas frecuentes</h2></div></div>
              <div className="info">
                {faq.map((item) => <div className="infobox" key={item.question}><b>{item.question}</b>{item.answer}</div>)}
              </div>
            </section>

            {similar.length ? <section className="similar"><div className="section-title"><div><h2>Negocios similares cerca</h2><p className="sub">Más opciones en {business.municipality} para comparar por zona, categoría y datos de contacto disponibles.</p></div></div><div className="cards">{similar.map((item) => <BusinessCard key={item.id} business={item}/>)}</div></section> : null}
          </article>
          <aside className="side-panel">
            <h2>Contactar</h2>
            <p className="sub">Usa los datos disponibles y valida antes de trasladarte.</p>
            <div className="actions">
              {primaryWhatsapp ? <a className="btn" href={`https://wa.me/52${primaryWhatsapp.replace(/\D/g, '')}`} target="_blank" rel="noreferrer"><Phone size={17}/> WhatsApp {formatPhone(primaryWhatsapp)}</a> : null}
              {business.phone ? <a className="btn secondary" href={`tel:${business.phone}`}><Phone size={17}/> Llamar {formatPhone(business.phone)}</a> : primaryWhatsapp ? null : <span className="btn secondary">Teléfono no disponible</span>}
              {business.website ? <a className="btn link" target="_blank" rel="noreferrer" href={websiteHref(business.website)}><ExternalLink size={17}/> Visitar sitio</a> : null}
              {business.mapsUrl ? <a className="btn secondary" target="_blank" rel="noreferrer" href={business.mapsUrl}><MapPin size={17}/> Ver mapa</a> : null}
            </div>
            <div className="claim" style={{display:'block',marginTop:16,padding:18}}>
              <b>¿Eres dueño o encargado?</b>
              <p>Reclama esta ficha para corregir datos, agregar información de contacto y mejorar cómo aparece tu negocio.</p>
              <a className="btn" href={claimMailto(`Reclamar ficha ${business.publicName}`)}>Reclamar mi ficha</a>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
