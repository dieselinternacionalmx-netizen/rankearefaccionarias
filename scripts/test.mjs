import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';

const SITE_URL = 'https://www.rankearefaccionarias.info';
const ROOT = process.cwd();
const DATA_FILES = ['data_top100_url_validated.csv', 'data_nuevo_leon_top100.csv'].filter((file) => fs.existsSync(path.join(ROOT, file)));
const MANUAL_LISTING_FILE = 'diesel-international-manual-listing.json';

function fail(message) {
  throw new Error(message);
}

function read(file) {
  return fs.readFileSync(path.join(ROOT, file), 'utf8');
}

function assert(condition, message) {
  if (!condition) fail(message);
}

function listFiles(dir, extensions, ignored = new Set(['node_modules', '.next'])) {
  const entries = fs.readdirSync(path.join(ROOT, dir), { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    if (ignored.has(entry.name)) continue;
    const relative = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...listFiles(relative, extensions, ignored));
    else if (extensions.has(path.extname(entry.name))) files.push(relative);
  }
  return files;
}

function norm(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

const packageJson = JSON.parse(read('package.json'));
const packageLock = JSON.parse(read('package-lock.json'));
const allDependencySpecs = [
  ...Object.values(packageJson.dependencies || {}),
  ...Object.values(packageJson.devDependencies || {}),
];

assert(packageJson.name === 'rankea-refaccionarias', 'package name should match national brand');
assert(packageLock.name === packageJson.name, 'package-lock name should match package.json');
assert(!allDependencySpecs.includes('latest'), 'package.json must not use latest dependency ranges');

const textFiles = [
  ...listFiles('app', new Set(['.ts', '.tsx'])),
  ...listFiles('components', new Set(['.ts', '.tsx'])),
  ...listFiles('lib', new Set(['.ts', '.tsx'])),
  ...listFiles('scripts', new Set(['.mjs'])).filter((file) => file !== path.join('scripts', 'test.mjs')),
  'README-MVP.md',
  'url_validation_report.md',
];

for (const file of textFiles) {
  const contents = read(file);
  assert(!/directorio\.example\.com|refaccionesqro\.com|ventas@example\.com|Refacciones Qro/.test(contents), `${file} contains old placeholder or brand`);
  assert(!/(Ã©|Ã¡|Ã³|Ã­|Ãº|Â¿|Â¡|Â·|â€”|â€œ|â€)/.test(contents), `${file} appears to contain mojibake`);
}

assert(read('lib/site.ts').includes(SITE_URL), 'site config must default to official domain');
assert(read('app/layout.tsx').includes('Rankea Refaccionarias'), 'layout should use national brand');
assert(read('app/page.tsx').includes('Encuentra la refacción. Encuentra quién la vende.'), 'home should present national search intent');
assert(read('app/page.tsx').includes('Explora negocios de autopartes en todo México'), 'home should present national scope');
assert(DATA_FILES.includes('data_nuevo_leon_top100.csv'), 'Nuevo León CSV must be present');
assert(fs.existsSync(path.join(ROOT, MANUAL_LISTING_FILE)), 'Diesel International manual listing must be present');

const rows = DATA_FILES.flatMap((file) => {
  const raw = read(file);
  assert(!/(Ã©|Ã¡|Ã³|Ã­|Ãº|Â¿|Â¡|Â·|â€”|â€œ|â€)/.test(raw), `${file} appears to contain mojibake`);
  assert(!raw.includes('directorio.example.com') && !raw.includes('refaccionesqro.com'), `${file} contains stale canonical domain`);
  return parse(raw, { columns: true, skip_empty_lines: true, bom: true });
});

const published = rows.filter((row) => String(row.published_status).trim() === 'published');
const urlPaths = published.map((row) => String(row.url_path || '').trim());
const states = new Set(published.map((row) => String(row.estado_slug || '').trim()));

assert(published.length >= 190, `expected at least 190 published rows after adding Nuevo León, got ${published.length}`);
assert(states.has('queretaro'), 'published rows must include Querétaro');
assert(states.has('nuevo-leon'), 'published rows must include Nuevo León');
assert(new Set(urlPaths).size === urlPaths.length, 'published url_path values must be unique');

const businessFingerprints = new Set();
for (const row of published) {
  const name = norm(row.public_name || row.Nombre);
  const phone = norm(row.Telefono);
  const address = norm(row.direccion_completa);
  const lat = Number(row.Latitud);
  const lng = Number(row.Longitud);
  const geo = Number.isFinite(lat) && Number.isFinite(lng) ? `${lat.toFixed(4)},${lng.toFixed(4)}` : '';
  const fingerprint = [name, phone, address || geo].join('|');
  assert(!businessFingerprints.has(fingerprint), `${row.public_name || row.Nombre} appears to be a duplicate business record`);
  businessFingerprints.add(fingerprint);
}

for (const [index, row] of published.entries()) {
  const rowLabel = row.public_name || row.Nombre || `row ${index + 1}`;
  const stateSlug = String(row.estado_slug || '').trim();
  assert(['queretaro', 'nuevo-leon'].includes(stateSlug), `${rowLabel} has unsupported estado_slug ${stateSlug}`);
  assert(row.url_path?.startsWith(`/${stateSlug}/`), `${rowLabel} must keep state-first route`);
  assert(!row.url_path?.startsWith('/refaccionarias/'), `${rowLabel} must not use old /refaccionarias prefix for individual fichas`);
  assert(row.business_slug && row.municipio_slug, `${rowLabel} is missing slug fields`);
  assert(String(row.canonical_url || '').trim() === `${SITE_URL}${row.url_path}`, `${rowLabel} canonical_url must match official domain and url_path`);
}

const manualListing = JSON.parse(read(MANUAL_LISTING_FILE));
assert(manualListing.business?.public_name === 'Diesel International', 'manual listing should be Diesel International');
assert(manualListing.business?.url_path === '/nuevo-leon/san-nicolas-de-los-garza/diesel-international-san-nicolas-de-los-garza/', 'manual listing URL path is unexpected');
assert(manualListing.business?.estado_slug === 'nuevo-leon', 'manual listing must be assigned to Nuevo León');
assert((manualListing.branches || []).length >= 2, 'manual listing should include branch data');

console.log(`TEST OK published=${published.length}+1 manual states=${Array.from(states).join(',')} domain=${SITE_URL} duplicateBusinesses=false`);
