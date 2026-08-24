import fs from 'fs';
import { parse } from 'csv-parse/sync';

const INPUTS = ['data_top100.csv', 'data_top100_url_validated.csv'];
const REPORT = 'docs/reporte-duplicados-refaccionarias.md';
const DISTANCE_DUPLICATE_METERS = 80;

function clean(value) {
  return String(value ?? '').replace(/^\uFEFF/, '').trim();
}

function normalize(value) {
  return clean(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\b(sa de cv|s a de c v|s de rl|spr de rl|sc|cv)\b/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function number(value) {
  const parsed = Number(clean(value));
  return Number.isFinite(parsed) ? parsed : null;
}

function distanceMeters(a, b) {
  const lat1 = number(a.Latitud);
  const lng1 = number(a.Longitud);
  const lat2 = number(b.Latitud);
  const lng2 = number(b.Longitud);
  if (lat1 == null || lng1 == null || lat2 == null || lng2 == null) return Infinity;
  const earthRadius = 6371000;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const s1 = Math.sin(dLat / 2) ** 2;
  const s2 = Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
  return 2 * earthRadius * Math.asin(Math.sqrt(s1 + s2));
}

function csvEscape(value) {
  const text = String(value ?? '');
  return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function stringifyCsv(rows) {
  if (!rows.length) return '';
  const headers = Object.keys(rows[0]);
  return [
    headers.map(csvEscape).join(','),
    ...rows.map((row) => headers.map((header) => csvEscape(row[header])).join(',')),
  ].join('\n') + '\n';
}

function rowLabel(row) {
  return clean(row.public_name || row.Nombre);
}

function rowAddress(row) {
  return clean(row.direccion_completa) || [
    clean(row.Tipo_vialidad),
    clean(row.Calle),
    clean(row.Num_Exterior),
    clean(row.Colonia),
    clean(row.CP),
  ].filter(Boolean).join(', ');
}

function isDuplicate(a, b) {
  const sameName = normalize(rowLabel(a)) === normalize(rowLabel(b));
  if (!sameName) return false;
  const samePhone = clean(a.Telefono) && clean(a.Telefono) === clean(b.Telefono);
  const sameAddress = normalize(rowAddress(a)) && normalize(rowAddress(a)) === normalize(rowAddress(b));
  const closeGeo = distanceMeters(a, b) <= DISTANCE_DUPLICATE_METERS;
  const samePostalArea = clean(a.CP) && clean(a.CP) === clean(b.CP) && normalize(a.Calle) === normalize(b.Calle);
  return Boolean(sameAddress || (samePhone && closeGeo) || (samePhone && samePostalArea));
}

function completeness(row) {
  return [
    clean(row.Num_Exterior),
    clean(row.direccion_completa),
    clean(row.Telefono),
    clean(row.Correo_e),
    clean(row.website_final_url || row.website_normalized || row.Sitio_internet),
    clean(row.Latitud) && clean(row.Longitud),
  ].filter(Boolean).length;
}

function chooseKeeper(rows) {
  return [...rows].sort((a, b) => {
    const score = Number(clean(b.publication_score || b.score_publicabilidad)) - Number(clean(a.publication_score || a.score_publicabilidad));
    if (score) return score;
    return completeness(b) - completeness(a);
  })[0];
}

const primaryRows = parse(fs.readFileSync(INPUTS[1], 'utf8'), { columns: true, skip_empty_lines: true, bom: true });
const groups = new Map();
for (const row of primaryRows) {
  const key = normalize(rowLabel(row));
  if (!groups.has(key)) groups.set(key, []);
  groups.get(key).push(row);
}

const branchGroups = [];
const duplicateGroups = [];
const removeIds = new Set();

for (const [key, rows] of groups) {
  if (rows.length < 2) continue;
  const duplicatePairs = [];
  for (let i = 0; i < rows.length; i += 1) {
    for (let j = i + 1; j < rows.length; j += 1) {
      if (isDuplicate(rows[i], rows[j])) duplicatePairs.push([rows[i], rows[j], Math.round(distanceMeters(rows[i], rows[j]))]);
    }
  }
  if (!duplicatePairs.length) {
    branchGroups.push({ key, rows });
    continue;
  }
  const involved = [...new Set(duplicatePairs.flatMap(([a, b]) => [a, b]))];
  const keeper = chooseKeeper(involved);
  const removed = involved.filter((row) => clean(row.Id || row.CLEE) !== clean(keeper.Id || keeper.CLEE));
  for (const row of removed) removeIds.add(clean(row.Id || row.CLEE));
  duplicateGroups.push({ key, rows: involved, keeper, removed, duplicatePairs });
}

for (const input of INPUTS) {
  const rows = parse(fs.readFileSync(input, 'utf8'), { columns: true, skip_empty_lines: true, bom: true });
  const filtered = rows.filter((row) => !removeIds.has(clean(row.Id || row.CLEE)));
  fs.writeFileSync(input, stringifyCsv(filtered), 'utf8');
}

const report = [
  '# Reporte de duplicados de refaccionarias',
  '',
  `Archivos revisados: ${INPUTS.join(', ')}`,
  `Criterio de duplicado real: mismo nombre normalizado y misma direccion, o mismo telefono con coordenadas a <= ${DISTANCE_DUPLICATE_METERS} m, o mismo telefono con misma calle y CP.`,
  `Registros eliminados: ${removeIds.size}`,
  '',
  '## Duplicados reales eliminados',
  '',
  duplicateGroups.length ? duplicateGroups.map((group) => [
    `### ${rowLabel(group.keeper)}`,
    '',
    `Conservado: ${clean(group.keeper.Id || group.keeper.CLEE)} - ${rowAddress(group.keeper)} - tel. ${clean(group.keeper.Telefono) || 'N/D'}`,
    '',
    ...group.removed.map((row) => `Eliminado: ${clean(row.Id || row.CLEE)} - ${rowAddress(row)} - tel. ${clean(row.Telefono) || 'N/D'}`),
    '',
  ].join('\n')).join('\n') : 'No se eliminaron duplicados reales.',
  '',
  '## Grupos conservados como sucursales',
  '',
  branchGroups.length ? branchGroups.map((group) => [
    `### ${rowLabel(group.rows[0])} (${group.rows.length})`,
    '',
    ...group.rows.map((row) => `- ${clean(row.Id || row.CLEE)} - ${rowAddress(row)} - tel. ${clean(row.Telefono) || 'N/D'}`),
    '',
  ].join('\n')).join('\n') : 'No se detectaron grupos de sucursales.',
  '',
].join('\n');

fs.mkdirSync('docs', { recursive: true });
fs.writeFileSync(REPORT, report, 'utf8');

console.log(`DEDUPE OK removed=${removeIds.size} report=${REPORT}`);
