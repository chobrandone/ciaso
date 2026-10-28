// Verifies every internal link, asset and #anchor in dist/ resolves. Usage: node scripts/check-links.mjs
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const DIST = join(dirname(fileURLToPath(import.meta.url)), '..', 'dist');
const pages = [];
(function walk(d) { for (const f of readdirSync(d)) { const p = join(d, f); statSync(p).isDirectory() ? walk(p) : p.endsWith('.html') && pages.push(p); } })(DIST);

const idsOf = (html) => new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]));
const fileFor = (path) => { const p = join(DIST, decodeURIComponent(path)); return existsSync(p) && statSync(p).isDirectory() ? join(p, 'index.html') : p; };
let problems = 0, checked = 0;
for (const page of pages) {
  const html = readFileSync(page, 'utf8');
  const own = idsOf(html);
  const rel = page.slice(DIST.length).split('\\').join('/');
  for (const [, attr, url] of html.matchAll(/\s(href|src)="([^"]+)"/g)) {
    if (/^(https?:|mailto:|tel:|data:)/.test(url)) continue;
    checked++;
    const [pathAndQuery, hash] = url.split('#');
    const path = pathAndQuery.split('?')[0];
    if (!path) { if (hash && !own.has(hash)) { console.log(`${rel}: missing anchor #${hash}`); problems++; } continue; }
    const target = fileFor(path);
    if (!existsSync(target)) { console.log(`${rel}: broken ${attr} ${url}`); problems++; continue; }
    if (hash && target.endsWith('.html') && !idsOf(readFileSync(target, 'utf8')).has(hash)) { console.log(`${rel}: missing anchor ${url}`); problems++; }
  }
  // duplicate ids
  const all = [...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]);
  const dup = all.filter((v, i) => all.indexOf(v) !== i);
  if (dup.length) { console.log(`${rel}: duplicate ids ${[...new Set(dup)].join(', ')}`); problems++; }
  // images need alt
  for (const [tag] of html.matchAll(/<img\b[^>]*>/g)) if (!/\salt="/.test(tag)) { console.log(`${rel}: img without alt ${tag.slice(0, 80)}`); problems++; }
  // one h1 per page
  const h1 = (html.match(/<h1\b/g) || []).length;
  if (h1 !== 1) { console.log(`${rel}: ${h1} <h1> elements`); problems++; }
}
console.log(`${pages.length} pages, ${checked} internal references checked, ${problems} problem(s).`);
process.exit(problems ? 1 : 0);
