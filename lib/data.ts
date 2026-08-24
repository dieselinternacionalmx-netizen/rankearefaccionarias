import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';
import { siteUrl } from './site';

export type Business = {
  id: string;
  name: string;
  publicName: string;
  category: string;
  categorySlug: string;
  municipality: string;
  municipalitySlug: string;
  stateName: string;
  stateSlug: string;
  businessSlug: string;
  urlPath: string;
  canonicalUrl: string;
  phone: string;
  email: string;
  website: string;
  websiteStatus: string;
  websiteStatusDetail: string;
  showWebsiteButton: boolean;
  address: string;
  colony: string;
  lat: string;
  lng: string;
  hasCoordinates: boolean;
  mapsUrl: string;
  seoTitle: string;
  seoDescription: string;
  publicDescription: string;
  source: string;
  lastModified: string;
  priority: string;
  score: string;
  publishedStatus: string;
  contactCompleteness: number;
  validationLabel: string;
  h1: string;
  featured: boolean;
  manualOverride: boolean;
  whatsappList: string[];
  emails: string[];
  branches: BusinessBranch[];
  commercialClaims: string[];
};

export type BusinessBranch = {
  branchName: string;
  address: string;
  colony: string;
  city: string;
  state: string;
  postalCode: string;
  phone: string[];
  whatsapp: string[];
  hours: string;
  mapsUrl: string;
};

export type StateSummary = {
  name: string;
  slug: string;
  count: number;
  cities: { name: string; slug: string; count: number }[];
};

export const STATES = [
  { name: 'Querétaro', slug: 'queretaro' },
  { name: 'Nuevo León', slug: 'nuevo-leon' },
];

function clean(v: unknown) {
  return String(v ?? '').replace(/^\uFEFF/, '').trim();
}

function titleCase(input: string) {
  return input
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word.length <= 3 ? word.toUpperCase() : word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
    .replace(/\bDe\b/g, 'de')
    .replace(/\bDel\b/g, 'del')
    .replace(/\bY\b/g, 'y');
}

function slugify(input: string) {
  return input
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function stateHubUrl(stateSlug: string) {
  return `/refaccionarias/${stateSlug}/`;
}

export function municipalityHubUrl(stateSlug: string, municipalitySlug: string) {
  return `/refaccionarias/${stateSlug}/${municipalitySlug}/`;
}

export function stateCategoryUrl(stateSlug: string, categorySlug: string) {
  return `/refaccionarias/${stateSlug}/${categorySlug}/`;
}

export function categoryUrl(categorySlug: string) {
  return `/categorias/${categorySlug}/`;
}

function stateNameFromSlug(slug: string) {
  return STATES.find((state) => state.slug === slug)?.name || titleCase(slug.replace(/-/g, ' '));
}

function validationLabel(status: string) {
  if (status === 'working') return 'Sitio web validado';
  if (status === 'broken') return 'Sitio web no disponible';
  if (status === 'missing') return 'Sin sitio web publicado';
  return 'Sitio web por validar';
}

function placeLabel(municipality: string, stateName: string) {
  if (!municipality) return stateName;
  if (municipality === stateName) return stateName;
  return `${municipality}, ${stateName}`;
}

function isGenericCategory(category: string) {
  return slugify(category) === 'refacciones-automotrices';
}

function cleanSentence(input: string) {
  return input.replace(/\s+/g, ' ').trim();
}

function buildBusinessSeo(args: {
  publicName: string;
  category: string;
  municipality: string;
  stateName: string;
  address: string;
  phone: string;
  hasCoordinates: boolean;
  hasWhatsapp?: boolean;
}) {
  const place = placeLabel(args.municipality, args.stateName);
  const shortPlace = args.municipality || args.stateName;
  let title = `${args.publicName} | Refaccionaria en ${place}`;
  if (title.length <= 58) title = `${title} | Rankea`;
  if (title.length > 68) title = `${args.publicName} | Refaccionaria en ${shortPlace}`;
  if (title.length > 68) title = `${args.publicName} en ${shortPlace} | Rankea`;

  const comparisonTarget = args.category && !isGenericCategory(args.category)
    ? `opciones de ${args.category.toLowerCase()}`
    : 'opciones de autopartes cerca';
  const available = [
    args.address ? 'dirección' : '',
    args.phone ? 'teléfono' : '',
    args.hasWhatsapp ? 'WhatsApp' : '',
    args.hasCoordinates ? 'mapa' : '',
  ].filter(Boolean);
  const dataPart = available.length
    ? `Consulta ${available.join(', ').replace(/, ([^,]*)$/, ' y $1')}`
    : 'Consulta los datos disponibles';
  const description = cleanSentence(
    `${args.publicName} en ${place}. ${dataPart} para contactar directo y comparar ${comparisonTarget}.`
  );

  return { title, description };
}

function publicCategory(value: string) {
  const category = clean(value);
  if (!category) return 'Refacciones automotrices';
  if (category.toLowerCase() === 'refacciones diesel y camión') return 'Refacciones automotrices';
  return category;
}

function dataFiles() {
  const files = [
    path.join(process.cwd(), 'data_top100_url_validated.csv'),
    path.join(process.cwd(), 'data_nuevo_leon_top100.csv'),
  ].filter((file) => fs.existsSync(/* turbopackIgnore: true */ file));

  return files.length ? files : [path.join(process.cwd(), 'data_top100.csv')];
}

let cache: Business[] | null = null;

function businessFromManualListing(): Business[] {
  const filePath = path.join(process.cwd(), 'diesel-international-manual-listing.json');
  if (!fs.existsSync(/* turbopackIgnore: true */ filePath)) return [];

  const listing = JSON.parse(fs.readFileSync(filePath, 'utf8')) as {
    type?: string;
    source?: string[];
    business: {
      public_name: string;
      category_public: string;
      estado_slug: string;
      municipio: string;
      municipio_slug: string;
      business_slug: string;
      url_path: string;
      website?: string;
      email?: string[];
      featured?: boolean;
      manual_override?: boolean;
    };
    branches?: Array<{
      branch_name: string;
      address_full: string;
      colonia?: string;
      city?: string;
      state?: string;
      postal_code?: string;
      phone?: string[];
      whatsapp?: string[];
      hours?: string;
      latitude?: string | number | null;
      longitude?: string | number | null;
      google_maps_url?: string | null;
    }>;
    seo?: {
      h1?: string;
      title?: string;
      meta_description?: string;
      public_description?: string;
    };
    verified_commercial_claims?: string[];
  };

  const primaryBranch = listing.branches?.[0];
  const stateSlug = listing.business.estado_slug;
  const stateName = stateNameFromSlug(stateSlug);
  const municipality = listing.business.municipio;
  const website = clean(listing.business.website);
  const primaryPhone = clean(primaryBranch?.phone?.[0]);
  const lat = primaryBranch?.latitude == null ? '' : clean(primaryBranch.latitude);
  const lng = primaryBranch?.longitude == null ? '' : clean(primaryBranch.longitude);
  const hasCoordinates = Boolean(lat && lng);
  const category = clean(listing.business.category_public) || 'Refacciones automotrices';
  const urlPath = listing.business.url_path;
  const emails = listing.business.email || [];
  const primaryAddress = clean(primaryBranch?.address_full);
  const branches = (listing.branches || []).map((branch) => ({
    branchName: clean(branch.branch_name),
    address: clean(branch.address_full),
    colony: clean(branch.colonia),
    city: clean(branch.city),
    state: clean(branch.state),
    postalCode: clean(branch.postal_code),
    phone: (branch.phone || []).map(clean).filter(Boolean),
    whatsapp: (branch.whatsapp || []).map(clean).filter(Boolean),
    hours: clean(branch.hours),
    mapsUrl: clean(branch.google_maps_url),
  }));
  const whatsappList = branches.flatMap((branch) => branch.whatsapp);
  const seo = buildBusinessSeo({
    publicName: listing.business.public_name,
    category,
    municipality,
    stateName,
    address: primaryAddress,
    phone: primaryPhone,
    hasCoordinates,
    hasWhatsapp: Boolean(whatsappList.length),
  });

  return [{
    id: `manual-${listing.business.business_slug}`,
    name: listing.business.public_name,
    publicName: listing.business.public_name,
    category,
    categorySlug: slugify(category),
    municipality,
    municipalitySlug: listing.business.municipio_slug,
    stateName,
    stateSlug,
    businessSlug: listing.business.business_slug,
    urlPath,
    canonicalUrl: `${siteUrl}${urlPath}`,
    phone: primaryPhone,
    email: emails[0] || '',
    website,
    websiteStatus: website ? 'working' : 'missing',
    websiteStatusDetail: 'manual_listing',
    showWebsiteButton: Boolean(website),
    address: primaryAddress,
    colony: clean(primaryBranch?.colonia),
    lat,
    lng,
    hasCoordinates,
    mapsUrl: clean(primaryBranch?.google_maps_url) || (hasCoordinates ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${lat},${lng}`)}` : ''),
    seoTitle: seo.title,
    seoDescription: seo.description,
    publicDescription: clean(listing.seo?.public_description) || `${listing.business.public_name} aparece en Rankea Refaccionarias como negocio de ${category.toLowerCase()} en ${municipality}, ${stateName}.`,
    source: (listing.source || ['manual']).join(' / '),
    lastModified: '2026-08-23',
    priority: 'manual',
    score: '100',
    publishedStatus: 'published',
    contactCompleteness: [primaryPhone, website, primaryAddress, emails.length ? 'email' : '', whatsappList.length ? 'whatsapp' : ''].filter(Boolean).length,
    validationLabel: 'Ficha manual',
    h1: clean(listing.seo?.h1) || listing.business.public_name,
    featured: Boolean(listing.business.featured),
    manualOverride: Boolean(listing.business.manual_override),
    whatsappList,
    emails,
    branches,
    commercialClaims: listing.verified_commercial_claims || [],
  }];
}

export function getBusinesses(): Business[] {
  if (cache) return cache;

  const rows = dataFiles().flatMap((file) => parse(fs.readFileSync(file, 'utf8'), {
    columns: true,
    skip_empty_lines: true,
    bom: true,
  }) as Record<string, string>[]);

  const csvBusinesses = rows
    .filter((row) => clean(row.published_status || row.estatus_publicacion).toLowerCase() === 'published')
    .map((row) => {
      const name = clean(row.Nombre);
      const publicName = clean(row.public_name) || titleCase(name);
      const stateSlug = clean(row.estado_slug) || 'queretaro';
      const stateName = stateNameFromSlug(stateSlug);
      const municipality = clean(row.municipio) || stateName;
      const municipalitySlug = clean(row.municipio_slug) || slugify(municipality);
      const businessSlug = clean(row.business_slug) || slugify(`${publicName}-${clean(row.Id || row.CLEE)}`);
      const urlPath = clean(row.url_path) || `/${stateSlug}/${municipalitySlug}/${businessSlug}/`;
      const address = clean(row.direccion_completa) || [clean(row.Tipo_vialidad), clean(row.Calle), clean(row.Num_Exterior), clean(row.Colonia), clean(row.CP), municipality, stateName].filter(Boolean).join(', ');
      const rawWebsite = clean(row.Sitio_internet);
      const websiteStatus = clean(row.website_status);
      const showWebsiteButton = clean(row.show_website_button).toLowerCase() === 'true' || Boolean(rawWebsite && !websiteStatus);
      const website = showWebsiteButton ? clean(row.website_final_url || row.website_normalized || rawWebsite) : '';
      const lat = clean(row.Latitud);
      const lng = clean(row.Longitud);
      const hasCoordinates = Boolean(lat && lng);
      const phone = clean(row.Telefono);
      const category = publicCategory(row.category_public);
      const canonicalUrl = clean(row.canonical_url);
      const contactCompleteness = [phone, address, website, hasCoordinates ? 'coordinates' : ''].filter(Boolean).length;
      const seo = buildBusinessSeo({
        publicName,
        category,
        municipality,
        stateName,
        address,
        phone,
        hasCoordinates,
      });

      return {
        id: clean(row.Id || row.CLEE),
        name,
        publicName,
        category,
        categorySlug: slugify(category),
        municipality,
        municipalitySlug,
        stateName,
        stateSlug,
        businessSlug,
        urlPath,
        canonicalUrl: canonicalUrl.includes('rankearefaccionarias.info') ? canonicalUrl : `${siteUrl}${urlPath}`,
        phone,
        email: clean(row.Correo_e),
        website,
        websiteStatus,
        websiteStatusDetail: clean(row.website_status_detail),
        showWebsiteButton,
        address,
        colony: clean(row.Colonia),
        lat,
        lng,
        hasCoordinates,
        mapsUrl: hasCoordinates ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${lat},${lng}`)}` : '',
        seoTitle: seo.title,
        seoDescription: seo.description,
        publicDescription: clean(row.public_description) || `${publicName} aparece en Rankea Refaccionarias como negocio de ${category.toLowerCase()} en ${municipality}, ${stateName}. En esta ficha puedes revisar dirección, teléfono y sitio web cuando estén disponibles.`,
        source: clean(row.source) || 'DENUE/INEGI',
        lastModified: clean(row.lastmod || row.published_at),
        priority: clean(row.prioridad_comercial),
        score: clean(row.publication_score || row.score_publicabilidad),
        publishedStatus: clean(row.published_status),
        contactCompleteness,
        validationLabel: validationLabel(websiteStatus),
        h1: clean(row.h1) || publicName,
        featured: false,
        manualOverride: false,
        whatsappList: [],
        emails: [clean(row.Correo_e)].filter(Boolean),
        branches: [],
        commercialClaims: [],
      };
    });

  cache = [
    ...csvBusinesses,
    ...businessFromManualListing(),
  ];

  return cache;
}

export function getStates(): StateSummary[] {
  const map = new Map<string, StateSummary>();
  for (const business of getBusinesses()) {
    const existing = map.get(business.stateSlug);
    if (existing) existing.count += 1;
    else map.set(business.stateSlug, { name: business.stateName, slug: business.stateSlug, count: 1, cities: [] });
  }

  for (const state of map.values()) {
    state.cities = getMunicipalities(state.slug);
  }

  return Array.from(map.values()).sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
}

export function getStateBySlug(slug: string) {
  return getStates().find((state) => state.slug === slug) || STATES.find((state) => state.slug === slug);
}

export function getMunicipalities(stateSlug?: string) {
  const map = new Map<string, { name: string; slug: string; count: number }>();
  for (const business of getBusinesses().filter((item) => !stateSlug || item.stateSlug === stateSlug)) {
    const existing = map.get(business.municipalitySlug);
    if (existing) existing.count += 1;
    else map.set(business.municipalitySlug, { name: business.municipality, slug: business.municipalitySlug, count: 1 });
  }
  return Array.from(map.values()).sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
}

export function getFeaturedBusinesses(limit = 8) {
  return getBusinesses()
    .slice()
    .sort((a, b) => b.contactCompleteness - a.contactCompleteness || a.publicName.localeCompare(b.publicName))
    .slice(0, limit);
}

export function getBusinessBySlug(stateOrMunicipio: string, municipioOrSlug: string, maybeSlug?: string) {
  if (maybeSlug) {
    return getBusinesses().find((business) => business.stateSlug === stateOrMunicipio && business.municipalitySlug === municipioOrSlug && business.businessSlug === maybeSlug);
  }
  return getBusinesses().find((business) => business.stateSlug === 'queretaro' && business.municipalitySlug === stateOrMunicipio && business.businessSlug === municipioOrSlug);
}

export function getBusinessesByState(stateSlug: string) {
  return getBusinesses().filter((business) => business.stateSlug === stateSlug);
}

export function getBusinessesByMunicipality(stateOrMunicipio: string, maybeMunicipio?: string) {
  if (maybeMunicipio) return getBusinesses().filter((business) => business.stateSlug === stateOrMunicipio && business.municipalitySlug === maybeMunicipio);
  return getBusinesses().filter((business) => business.stateSlug === 'queretaro' && business.municipalitySlug === stateOrMunicipio);
}

export function getCategories(stateSlug?: string) {
  const map = new Map<string, { name: string; slug: string; count: number }>();
  for (const business of getBusinesses().filter((item) => !stateSlug || item.stateSlug === stateSlug)) {
    const existing = map.get(business.categorySlug);
    if (existing) existing.count += 1;
    else map.set(business.categorySlug, { name: business.category, slug: business.categorySlug, count: 1 });
  }
  return Array.from(map.values()).sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
}

export function getBusinessesByCategory(categorySlug: string, stateSlug?: string) {
  return getBusinesses().filter((business) => business.categorySlug === categorySlug && (!stateSlug || business.stateSlug === stateSlug));
}

export function getSimilarBusinesses(business: Business, limit = 3) {
  return getBusinesses()
    .filter((item) => item.stateSlug === business.stateSlug && item.municipalitySlug === business.municipalitySlug && item.id !== business.id)
    .sort((a, b) => {
      const categoryScore = Number(b.category === business.category) - Number(a.category === business.category);
      if (categoryScore) return categoryScore;
      return b.contactCompleteness - a.contactCompleteness || a.publicName.localeCompare(b.publicName);
    })
    .slice(0, limit);
}

export function formatPhone(phone: string) {
  const digits = phone.replace(/\D/g, '');
  if (!digits) return '';
  if (digits.length === 10) return `${digits.slice(0,3)} ${digits.slice(3,6)} ${digits.slice(6)}`;
  return phone;
}

export function websiteHref(site: string) {
  if (!site) return '';
  return site.startsWith('http') ? site : `https://${site.toLowerCase()}`;
}
