import fs from 'fs';
import { parse } from 'csv-parse/sync';

const files = ['data_top100_url_validated.csv', 'data_nuevo_leon_top100.csv'].filter((file) => fs.existsSync(file));
const rows = files.flatMap((file) => parse(fs.readFileSync(file, 'utf8'), { columns: true, skip_empty_lines: true, bom: true }));
const manualListing = fs.existsSync('diesel-international-manual-listing.json')
  ? JSON.parse(fs.readFileSync('diesel-international-manual-listing.json', 'utf8'))
  : null;
const published = rows.filter((row) => String(row.published_status).trim() === 'published');
const badPrefix = published.filter((row) => String(row.url_path).startsWith('/refaccionarias/'));
const uniqueUrls = new Set(published.map((row) => row.url_path));
const missing = published.filter((row) => !row.url_path || !row.business_slug || !row.municipio_slug || !row.estado_slug);
const states = new Set(published.map((row) => row.estado_slug));

if (published.length < 190) throw new Error(`expected at least 190 published after adding Nuevo León, got ${published.length}`);
if (!manualListing) throw new Error('missing Diesel International manual listing');
if (manualListing.business?.url_path !== '/nuevo-leon/san-nicolas-de-los-garza/diesel-international-san-nicolas-de-los-garza/') throw new Error('unexpected Diesel International URL path');
if (!states.has('queretaro') || !states.has('nuevo-leon')) throw new Error(`expected queretaro and nuevo-leon, got ${Array.from(states).join(', ')}`);
if (badPrefix.length) throw new Error('old /refaccionarias/ prefix found in business ficha url_path');
if (uniqueUrls.size !== published.length) throw new Error('duplicate url_path found');
if (missing.length) throw new Error('missing route fields');

console.log(`VERIFY OK published=${published.length + 1} states=${Array.from(states).join(',')} manual=diesel-international uniqueUrls=${uniqueUrls.size + 1}`);
