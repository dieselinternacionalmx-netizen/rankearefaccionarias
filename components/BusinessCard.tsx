import { ExternalLink, MapPin, Phone, ShieldCheck, Store } from 'lucide-react';
import { Business, formatPhone, websiteHref } from '@/lib/data';

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
}

export function BusinessBadge({ children, variant = 'basic' }: { children: React.ReactNode; variant?: 'basic' | 'trust' | 'signal' }) {
  return <span className={`badge ${variant}`}>{children}</span>;
}

export function BusinessCard({ business }: { business: Business }) {
  return (
    <article className="card">
      <a className="card-photo" href={business.urlPath} aria-label={`Ver ficha de ${business.publicName}`}>
        <span>{initials(business.publicName)}</span>
      </a>

      <div className="badges">
        <BusinessBadge variant="signal">{business.category}</BusinessBadge>
      </div>

      <h3><a href={business.urlPath}>{business.publicName}</a></h3>

      <div className="meta">
        <p className="meta-row"><MapPin aria-hidden="true" /><span><b>{business.municipality}, {business.stateName}</b>{business.colony ? ` · ${business.colony}` : ''}</span></p>
        <p className="meta-row"><Store aria-hidden="true" /><span>{business.address || 'Dirección por validar'}</span></p>
      </div>

      <div className="actions">
        <a className="btn dark" href={business.urlPath}>Ver refaccionaria</a>
        {business.phone ? <a className="icon-btn" href={`tel:${business.phone}`} aria-label={`Llamar a ${business.publicName}`}><Phone aria-hidden="true" size={17}/><span>{formatPhone(business.phone)}</span></a> : null}
        {business.website ? <a className="icon-btn" target="_blank" rel="noreferrer" href={websiteHref(business.website)} aria-label={`Abrir sitio web de ${business.publicName}`}><ExternalLink aria-hidden="true" size={17}/><span>Sitio</span></a> : null}
      </div>
    </article>
  );
}

export function TrustPanel() {
  return (
    <div className="trust-panel">
      <div className="trust-item"><ShieldCheck size={20} color="#0f7a5a"/><b>Datos públicos</b><p className="sub">Fichas base tomadas de DENUE/INEGI y preparadas para validación.</p></div>
      <div className="trust-item"><Phone size={20} color="#d62828"/><b>Contacto rápido</b><p className="sub">Teléfono y sitio web aparecen solo cuando están disponibles.</p></div>
      <div className="trust-item"><MapPin size={20} color="#102033"/><b>Organizado por zona</b><p className="sub">Rutas por estado, municipio y negocio.</p></div>
    </div>
  );
}
