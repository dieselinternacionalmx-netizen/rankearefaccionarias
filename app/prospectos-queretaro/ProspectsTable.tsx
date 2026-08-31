'use client';

import { useMemo, useState } from 'react';
import { ArrowDownUp, ExternalLink, Search } from 'lucide-react';

type Prospect = {
  name: string;
  municipality: string;
  phone: string;
  website: string;
  websiteStatus: string;
  opportunity: string;
  profileUrl: string;
  category: string;
};

type SortKey = keyof Prospect;
type SortDirection = 'asc' | 'desc';
type WebsiteFilter = 'todos' | 'sin-sitio' | 'con-sitio' | 'revisar';

function compareValues(a: string, b: string) {
  return a.localeCompare(b, 'es-MX', { sensitivity: 'base', numeric: true });
}

function statusClassName(item: Prospect) {
  if (!item.website) return 'status-pill status-no-site';
  if (item.opportunity === 'Revisar sitio actual') return 'status-pill status-review-site';
  return 'status-pill status-has-site';
}

export function ProspectsTable({ prospects }: { prospects: Prospect[] }) {
  const [query, setQuery] = useState('');
  const [municipality, setMunicipality] = useState('todos');
  const [websiteFilter, setWebsiteFilter] = useState<WebsiteFilter>('todos');
  const [sortKey, setSortKey] = useState<SortKey>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  const municipalities = useMemo(() => {
    return Array.from(new Set(prospects.map((item) => item.municipality))).sort((a, b) => compareValues(a, b));
  }, [prospects]);

  const stats = useMemo(() => {
    const withWebsite = prospects.filter((item) => item.website).length;
    return {
      withWebsite,
      withoutWebsite: prospects.length - withWebsite,
    };
  }, [prospects]);

  const filteredProspects = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return prospects
      .filter((item) => municipality === 'todos' || item.municipality === municipality)
      .filter((item) => {
        if (websiteFilter === 'sin-sitio') return !item.website;
        if (websiteFilter === 'con-sitio') return Boolean(item.website);
        if (websiteFilter === 'revisar') return item.opportunity === 'Revisar sitio actual';
        return true;
      })
      .filter((item) => {
        if (!normalizedQuery) return true;
        return [item.name, item.municipality, item.phone, item.website, item.websiteStatus, item.opportunity, item.category]
          .join(' ')
          .toLowerCase()
          .includes(normalizedQuery);
      })
      .slice()
      .sort((a, b) => {
        const result = compareValues(String(a[sortKey] || ''), String(b[sortKey] || ''));
        return sortDirection === 'asc' ? result : -result;
      });
  }, [municipality, prospects, query, sortDirection, sortKey, websiteFilter]);

  function setSort(nextKey: SortKey) {
    if (sortKey === nextKey) {
      setSortDirection((current) => current === 'asc' ? 'desc' : 'asc');
      return;
    }
    setSortKey(nextKey);
    setSortDirection('asc');
  }

  const sortLabel = sortDirection === 'asc' ? 'ascendente' : 'descendente';

  return (
    <section className="section prospect-section">
      <div className="wrap">
        <div className="prospect-toolbar" aria-label="Filtros de prospectos">
          <label className="prospect-search">
            <Search size={19} aria-hidden="true" />
            <span className="sr-only">Buscar prospecto</span>
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar por negocio, teléfono, sitio, estatus o categoría"
            />
          </label>

          <label className="prospect-select">
            <span>Municipio</span>
            <select value={municipality} onChange={(event) => setMunicipality(event.target.value)}>
              <option value="todos">Todos</option>
              {municipalities.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </label>

          <label className="prospect-select">
            <span>Sitio</span>
            <select value={websiteFilter} onChange={(event) => setWebsiteFilter(event.target.value as WebsiteFilter)}>
              <option value="todos">Todos</option>
              <option value="sin-sitio">Sin sitio web</option>
              <option value="con-sitio">Con sitio web</option>
              <option value="revisar">Revisar sitio actual</option>
            </select>
          </label>

          <div className="prospect-count">
            <b>{filteredProspects.length}</b>
            <span>{stats.withoutWebsite} sin sitio · {stats.withWebsite} con sitio</span>
          </div>
        </div>

        <div className="prospect-table-wrap">
          <table className="prospect-table">
            <caption>Refaccionarias de Querétaro con sitio web, teléfono y oportunidad comercial</caption>
            <thead>
              <tr>
                <th scope="col">
                  <button type="button" onClick={() => setSort('name')} aria-label={`Ordenar negocio ${sortLabel}`}>
                    Negocio <ArrowDownUp size={14} aria-hidden="true" />
                  </button>
                </th>
                <th scope="col">
                  <button type="button" onClick={() => setSort('municipality')} aria-label={`Ordenar municipio ${sortLabel}`}>
                    Municipio <ArrowDownUp size={14} aria-hidden="true" />
                  </button>
                </th>
                <th scope="col">
                  <button type="button" onClick={() => setSort('phone')} aria-label={`Ordenar teléfono ${sortLabel}`}>
                    Teléfono <ArrowDownUp size={14} aria-hidden="true" />
                  </button>
                </th>
                <th scope="col">
                  <button type="button" onClick={() => setSort('website')} aria-label={`Ordenar sitio web ${sortLabel}`}>
                    Sitio web <ArrowDownUp size={14} aria-hidden="true" />
                  </button>
                </th>
                <th scope="col">
                  <button type="button" onClick={() => setSort('websiteStatus')} aria-label={`Ordenar estatus ${sortLabel}`}>
                    Estatus <ArrowDownUp size={14} aria-hidden="true" />
                  </button>
                </th>
                <th scope="col">
                  <button type="button" onClick={() => setSort('opportunity')} aria-label={`Ordenar oportunidad ${sortLabel}`}>
                    Oportunidad <ArrowDownUp size={14} aria-hidden="true" />
                  </button>
                </th>
                <th scope="col">
                  <button type="button" onClick={() => setSort('category')} aria-label={`Ordenar categoría ${sortLabel}`}>
                    Categoría <ArrowDownUp size={14} aria-hidden="true" />
                  </button>
                </th>
                <th scope="col">Ficha</th>
              </tr>
            </thead>
            <tbody>
              {filteredProspects.map((item) => (
                <tr key={item.profileUrl}>
                  <td><strong>{item.name}</strong></td>
                  <td>{item.municipality}</td>
                  <td>{item.phone || 'Sin teléfono'}</td>
                  <td>
                    {item.website ? (
                      <a href={item.website} target="_blank" rel="noreferrer">
                        {item.website.replace(/^https?:\/\//, '').replace(/\/$/, '')}
                        <ExternalLink size={14} aria-hidden="true" />
                      </a>
                    ) : (
                      <span className="muted-cell">Sin sitio web</span>
                    )}
                  </td>
                  <td><span className={statusClassName(item)}>{item.websiteStatus}</span></td>
                  <td>{item.opportunity}</td>
                  <td>{item.category}</td>
                  <td><a href={item.profileUrl} target="_blank" rel="noreferrer">Ver ficha</a></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
