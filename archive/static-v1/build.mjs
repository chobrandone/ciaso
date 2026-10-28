// CIASO static site build: assembles src/pages/*.html with shared partials into dist/.
// No dependencies. Usage: node build.mjs   (set SITE_URL to change canonical origin)
import { readFileSync, writeFileSync, mkdirSync, readdirSync, statSync, copyFileSync, rmSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(fileURLToPath(import.meta.url));
const SRC = join(root, 'src');
const OUT = join(root, 'dist');
const SITE_URL = (process.env.SITE_URL || 'https://ciaso.ca').replace(/\/$/, '');
const BUILD_VERSION = Date.now().toString(36);

const read = (p) => readFileSync(p, 'utf8');
const partial = (name) => read(join(SRC, 'partials', `${name}.html`));
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

function copyDir(from, to) {
  mkdirSync(to, { recursive: true });
  for (const entry of readdirSync(from)) {
    const a = join(from, entry), b = join(to, entry);
    statSync(a).isDirectory() ? copyDir(a, b) : copyFileSync(a, b);
  }
}

const organizationLd = {
  '@context': 'https://schema.org',
  '@type': 'NGO',
  name: 'Canada Integration and Settlement Organization (CIASO)',
  alternateName: 'CIASO',
  url: SITE_URL + '/',
  logo: SITE_URL + '/assets/img/ciaso-logo.png',
  email: 'admin@ciaso.ca',
  telephone: '+1-587-813-5155',
  address: {
    '@type': 'PostalAddress',
    streetAddress: '19716 28 Ave NW',
    addressLocality: 'Edmonton',
    addressRegion: 'AB',
    postalCode: 'T6M 1M1',
    addressCountry: 'CA'
  },
  areaServed: 'Alberta, Canada',
  sameAs: ['https://www.facebook.com/share/1TfgWEkRNP/', 'https://www.linkedin.com/company/ciaso/']
};

function head(meta) {
  const url = SITE_URL + meta.path;
  const title = meta.path === '/' ? meta.title : `${meta.title} | CIASO`;
  const img = SITE_URL + (meta.ogImage || '/assets/img/og-image.jpg');
  const ld = [];
  if (meta.path === '/') ld.push(organizationLd);
  if (meta.crumbs) {
    ld.push({
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [['Home', '/'], ...meta.crumbs].map(([name, href], i) => ({
        '@type': 'ListItem', position: i + 1, name, item: SITE_URL + (href || meta.path)
      }))
    });
  }
  if (meta.faq) ld.push(meta.faq);
  return `<!doctype html>
<html lang="en-CA">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(meta.description)}">
<link rel="canonical" href="${url}">
${meta.noindex ? '<meta name="robots" content="noindex">' : '<meta name="robots" content="index, follow">'}
<meta name="theme-color" content="#CD0E00">
<meta property="og:type" content="website">
<meta property="og:site_name" content="CIASO – Canada Integration and Settlement Organization">
<meta property="og:locale" content="en_CA">
<meta property="og:title" content="${esc(meta.ogTitle || meta.title)}">
<meta property="og:description" content="${esc(meta.description)}">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${img}">
<meta property="og:image:alt" content="A diverse group of adults standing together and smiling">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="/assets/img/favicon.svg" type="image/svg+xml">
<link rel="alternate" hreflang="fr-CA" href="https://ciaso.ca/home-francais/">
<link rel="preload" href="/assets/fonts/archivo-var.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/assets/fonts/inter-var.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="/assets/css/main.css?v=${BUILD_VERSION}">
<script>document.documentElement.classList.add('js')</script>
${ld.map((o) => `<script type="application/ld+json">${JSON.stringify(o)}</script>`).join('\n')}
</head>`;
}

function breadcrumbs(meta) {
  if (!meta.crumbs) return '';
  const items = [['Home', '/'], ...meta.crumbs];
  return `<nav class="breadcrumbs container" aria-label="Breadcrumb"><ol>${items
    .map(([label, href], i) => (i === items.length - 1
      ? `<li><span aria-current="page">${label}</span></li>`
      : `<li><a href="${href}">${label}</a></li>`))
    .join('')}</ol></nav>`;
}

function render(file) {
  let src = read(join(SRC, 'pages', file));
  const m = src.match(/^<!--page\s+([\s\S]*?)-->\s*/);
  if (!m) throw new Error(`${file}: missing <!--page {...} --> header`);
  const meta = JSON.parse(m[1]);
  src = src.slice(m[0].length);

  // <!-- include:name --> pulls in src/partials/name.html
  src = src.replace(/<!--\s*include:([\w-]+)\s*-->/g, (_, n) => partial(n));

  let header = partial('header');
  // Mark the active nav link
  header = header.replace(new RegExp(`(<a [^>]*data-nav="${meta.nav}")`, 'g'), '$1 aria-current="page"');

  const scripts = (meta.scripts || []).map((s) => `<script src="/assets/js/${s}?v=${BUILD_VERSION}" defer></script>`).join('\n');
  const html = `${head(meta)}
<body class="${meta.bodyClass || ''}">
${partial('icons')}
${header}
<main id="main" tabindex="-1">
${breadcrumbs(meta)}
${src}
</main>
${partial('footer').replace('{{year}}', new Date().getFullYear())}
<script src="/assets/js/config.js?v=${BUILD_VERSION}" defer></script>
${scripts}
<script src="/assets/js/main.js?v=${BUILD_VERSION}" defer></script>
</body>
</html>
`;
  const outPath = meta.outFile ? join(OUT, meta.outFile) : join(OUT, meta.path, 'index.html');
  mkdirSync(dirname(outPath), { recursive: true });
  writeFileSync(outPath, html);
  return meta;
}

if (existsSync(OUT)) rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });
copyDir(join(SRC, 'assets'), join(OUT, 'assets'));

const pages = readdirSync(join(SRC, 'pages')).filter((f) => f.endsWith('.html')).map(render);

const today = new Date().toISOString().slice(0, 10);
const indexed = pages.filter((p) => !p.noindex);
writeFileSync(join(OUT, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${indexed.map((p) => `  <url><loc>${SITE_URL}${p.path}</loc><lastmod>${today}</lastmod></url>`).join('\n')}
</urlset>
`);
writeFileSync(join(OUT, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${SITE_URL}/sitemap.xml\n`);

console.log(`Built ${pages.length} pages -> dist/ (canonical origin ${SITE_URL})`);
