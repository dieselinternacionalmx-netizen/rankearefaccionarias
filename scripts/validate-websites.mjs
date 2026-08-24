import fs from 'fs';
import { parse } from 'csv-parse/sync';

const INPUT = process.argv[2] || 'data_top100.csv';
const OUTPUT = process.argv[3] || 'data_top100_url_validated.csv';
const REPORT = process.argv[4] || 'url_validation_report.md';
const TIMEOUT_MS = Number(process.env.URL_CHECK_TIMEOUT_MS || 9000);
const CONCURRENCY = Number(process.env.URL_CHECK_CONCURRENCY || 8);

function clean(value) {
  return String(value ?? '').replace(/^\uFEFF/, '').trim();
}

function normalizeWebsite(raw) {
  const value = clean(raw);
  if (!value) return { normalized: '', reason: 'empty' };
  if (/^(mailto:|tel:|whatsapp:)/i.test(value)) return { normalized: '', reason: 'not_http_url' };
  const withProtocol = /^https?:\/\//i.test(value) ? value : `https://${value.toLowerCase()}`;
  try {
    const url = new URL(withProtocol);
    if (!['http:', 'https:'].includes(url.protocol)) return { normalized: '', reason: 'not_http_url' };
    return { normalized: url.toString(), reason: '' };
  } catch {
    return { normalized: '', reason: 'malformed_url' };
  }
}

async function fetchWithTimeout(url, method = 'HEAD') {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      method,
      redirect: 'follow',
      signal: controller.signal,
      headers: {
        'user-agent': 'Mozilla/5.0 URL validator for local directory QA',
        'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
    });
    return res;
  } finally {
    clearTimeout(timeout);
  }
}

async function checkUrl(rawWebsite) {
  const { normalized, reason } = normalizeWebsite(rawWebsite);
  if (!normalized) {
    return {
      website_normalized: '',
      website_status: 'invalid',
      website_status_detail: reason,
      website_http_status: '',
      website_final_url: '',
      show_website_button: 'false',
    };
  }

  let lastError = '';
  for (const candidate of [normalized, normalized.replace(/^https:\/\//i, 'http://')]) {
    try {
      let res = await fetchWithTimeout(candidate, 'HEAD');
      if ([405, 403, 400].includes(res.status)) res = await fetchWithTimeout(candidate, 'GET');
      const ok = res.status >= 200 && res.status < 400;
      return {
        website_normalized: normalized,
        website_status: ok ? 'working' : 'broken',
        website_status_detail: ok ? 'ok' : `http_${res.status}`,
        website_http_status: String(res.status),
        website_final_url: res.url || candidate,
        show_website_button: ok ? 'true' : 'false',
      };
    } catch (error) {
      lastError = error?.name === 'AbortError' ? 'timeout' : String(error?.cause?.code || error?.code || error?.message || error);
    }
  }

  return {
    website_normalized: normalized,
    website_status: 'broken',
    website_status_detail: lastError || 'connection_error',
    website_http_status: '',
    website_final_url: '',
    show_website_button: 'false',
  };
}

async function mapLimit(items, limit, mapper) {
  const results = new Array(items.length);
  let index = 0;
  async function worker() {
    while (index < items.length) {
      const current = index++;
      results[current] = await mapper(items[current], current);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return results;
}

function countBy(rows, field) {
  return rows.reduce((acc, row) => {
    const key = row[field] || '(empty)';
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
}

function csvEscape(value) {
  const text = String(value ?? '');
  return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function stringifyCsv(rowsToWrite) {
  if (!rowsToWrite.length) return '';
  const headers = Object.keys(rowsToWrite[0]);
  return [
    headers.map(csvEscape).join(','),
    ...rowsToWrite.map((row) => headers.map((header) => csvEscape(row[header])).join(',')),
  ].join('\n') + '\n';
}

const raw = fs.readFileSync(INPUT, 'utf8');
const rows = parse(raw, { columns: true, skip_empty_lines: true, bom: true });
const uniqueSites = [...new Set(rows.map((r) => clean(r.Sitio_internet)).filter(Boolean))];
console.log(`Validando ${uniqueSites.length} URLs únicas en ${rows.length} fichas...`);

const checkedPairs = await mapLimit(uniqueSites, CONCURRENCY, async (site, i) => {
  const result = await checkUrl(site);
  console.log(`[${i + 1}/${uniqueSites.length}] ${site} -> ${result.website_status} (${result.website_status_detail})`);
  return [site, result];
});
const checked = new Map(checkedPairs);

const enrichedRows = rows.map((row) => {
  const site = clean(row.Sitio_internet);
  const result = site ? checked.get(site) : {
    website_normalized: '',
    website_status: 'missing',
    website_status_detail: 'empty',
    website_http_status: '',
    website_final_url: '',
    show_website_button: 'false',
  };
  return { ...row, ...result };
});

fs.writeFileSync(OUTPUT, stringifyCsv(enrichedRows), 'utf8');

const statusCounts = countBy(enrichedRows, 'website_status');
const detailCounts = countBy(enrichedRows, 'website_status_detail');
const hidden = enrichedRows.filter((r) => r.show_website_button !== 'true');
const working = enrichedRows.filter((r) => r.show_website_button === 'true');
const report = `# Reporte de validación de URLs\n\n` +
  `Fuente: \`${INPUT}\`\n\n` +
  `Salida: \`${OUTPUT}\`\n\n` +
  `Total de fichas: ${enrichedRows.length}\n\n` +
  `URLs únicas no vacías revisadas: ${uniqueSites.length}\n\n` +
  `Botón de sitio visible: ${working.length}\n\n` +
  `Botón de sitio oculto: ${hidden.length}\n\n` +
  `## Conteo por estado\n\n` +
  Object.entries(statusCounts).map(([k, v]) => `- ${k}: ${v}`).join('\n') +
  `\n\n## Conteo por detalle\n\n` +
  Object.entries(detailCounts).map(([k, v]) => `- ${k}: ${v}`).join('\n') +
  `\n\n## Primeras fichas sin botón\n\n` +
  hidden.slice(0, 30).map((r) => `- ${clean(r.Nombre)} — ${clean(r.Sitio_internet) || '(sin URL)'} — ${r.website_status_detail}`).join('\n') +
  `\n`;
fs.writeFileSync(REPORT, report, 'utf8');
console.log(`Listo: ${OUTPUT}`);
console.log(`Reporte: ${REPORT}`);
