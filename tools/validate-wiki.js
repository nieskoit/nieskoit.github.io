
#!/usr/bin/env node
'use strict';

/** Static integrity checks for the Kraina Twórców wiki. Run: node tools/validate-wiki.js */

const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { spawnSync } = require('node:child_process');

const ROOT = path.resolve(__dirname, '..');
const PUBLIC = path.join(ROOT, 'public');
const errors = [];
const warnings = [];

const fail = message => errors.push(message);
const warn = message => warnings.push(message);
const read = file => fs.readFileSync(file, 'utf8');

const indexFile = path.join(PUBLIC, 'js', 'wiki-search-index.js');

if (!fs.existsSync(indexFile)) {
  console.error('BŁĄD: Brak public/js/wiki-search-index.js');
  process.exit(1);
}

const context = { window: {} };

try {
  vm.runInNewContext(read(indexFile), context, {
    filename: indexFile,
    timeout: 1000,
  });
} catch (error) {
  fail(`Indeks wiki ma błąd składni: ${error.message}`);
}

const items = Array.isArray(context.window.KT_WIKI_INDEX)
  ? context.window.KT_WIKI_INDEX
  : [];

if (!items.length) {
  fail('Indeks wiki jest pusty albo nie definiuje window.KT_WIKI_INDEX.');
}

const ids = new Map();
const urls = new Map();

for (const item of items) {
  if (!item || typeof item !== 'object') {
    fail('Indeks zawiera rekord, który nie jest obiektem.');
    continue;
  }

  if (!item.id) {
    fail(`Rekord bez id: ${item.title || '(bez tytułu)'}`);
  } else if (ids.has(item.id)) {
    fail(`Powielone id "${item.id}".`);
  } else {
    ids.set(item.id, item);
  }

  if (!item.title) {
    fail(`Rekord ${item.id || '(bez id)'} nie ma title.`);
  }

  if (!item.kind) {
    fail(`Rekord ${item.id || item.title} nie ma kind.`);
  }

  if (!item.url || !item.url.startsWith('/')) {
    fail(`Rekord ${item.id || item.title} nie ma lokalnego url zaczynającego się od /.`);
  } else if (urls.has(item.url)) {
    fail(`Powielony url "${item.url}" w rekordach ${urls.get(item.url)} i ${item.id}.`);
  } else {
    urls.set(item.url, item.id);
  }

  for (const rel of item.related || []) {
    if (typeof rel !== 'string') {
      fail(`Relacja w ${item.id} nie jest tekstowym id.`);
    }
  }

  for (const field of ['image', 'thumbnail']) {
    const value = item[field];

    if (typeof value === 'string' && value.startsWith('/assets/')) {
      const file = path.join(PUBLIC, value.replace(/^\//, ''));

      if (!fs.existsSync(file)) {
        fail(`${item.id}: ${field} wskazuje na nieistniejący plik ${value}.`);
      }
    }
  }

  if (item.kind === 'Odcinek') {
    if (!item.creator) {
      fail(`${item.id}: odcinek nie ma przypisanego twórcy.`);
    }

    if (!item.summary || /zostanie uzupełniony|uzupełnić|placeholder|TODO/i.test(item.summary)) {
      warn(`${item.id}: opis odcinka wymaga uzupełnienia lub weryfikacji.`);
    }

    if (!item.thumbnail) {
      warn(`${item.id}: nie dodano jeszcze miniatury.`);
    }

    if (!item.duration) {
      warn(`${item.id}: nie dodano czasu trwania.`);
    }

    if (!item.youtube) {
      warn(`${item.id}: nie dodano bezpośredniego linku YouTube.`);
    }

    if (item.thumbnailAlt && /do zmiany|TODO|placeholder/i.test(item.thumbnailAlt)) {
      warn(`${item.id}: opis miniatury wygląda na tymczasowy.`);
    }

    if (
      item.youtube &&
      !/^https?:\/\/(?:www\.)?(?:youtube\.com\/|youtu\.be\/)/i.test(item.youtube)
    ) {
      fail(`${item.id}: niepoprawny adres YouTube.`);
    }
  }
}

for (const item of items) {
  for (const rel of item.related || []) {
    if (!ids.has(rel)) {
      fail(`${item.id}: relacja wskazuje na nieistniejące id "${rel}".`);
    }
  }

  if (item.kind === 'Odcinek' && item.creator) {
    const creator = items.find(
      candidate =>
        candidate.kind === 'Twórca' &&
        candidate.title.toLocaleLowerCase('pl') ===
          String(item.creator).toLocaleLowerCase('pl')
    );

    if (!creator) {
      fail(`${item.id}: nie znaleziono rekordu twórcy "${item.creator}".`);
    } else if (!(item.related || []).includes(creator.id)) {
      warn(`${item.id}: dodaj "${creator.id}" do related, aby relacje były jawne.`);
    }
  }

  if (item.url && item.kind !== 'Sezon' && item.published !== false) {
    const pathname = item.url.split('#')[0].split('?')[0];
    const route = pathname.endsWith('/') ? `${pathname}index.html` : pathname;
    const target = path.join(PUBLIC, route.replace(/^\//, ''));

    if (!fs.existsSync(target)) {
      fail(`${item.id}: brak strony HTML dla url ${item.url} (oczekiwano ${route}).`);
    }
  }
}

const htmlFiles = [];

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      walk(full);
    } else if (entry.isFile() && entry.name.endsWith('.html')) {
      htmlFiles.push(full);
    }
  }
}

walk(PUBLIC);

const expectedVersions = {
  'main.css': '20261024-episode-title-white2',
  'main.js': '20261024-publish1',
  'catalog-render.js': '20261023-polish1',
  'catalog-sync.js': '20261024-publish1',
};

// Wersja indeksu wyszukiwania jest numeryczna i może zmieniać się przy bumpowaniu.
// Sprawdzamy, czy wszystkie strony używają dokładnie tej samej wersji.
let expectedSearchIndexVersion = null;

for (const file of htmlFiles) {
  const html = read(file);
  const relative = path.relative(PUBLIC, file).split(path.sep).join('/');

  for (const match of html.matchAll(/(?:src|href)=["'](\/[^"']*)["']/g)) {
    const raw = match[1];
    const pathname = raw.split(/[?#]/)[0];

    if (!pathname) continue;

    let route = pathname;

    if (route.endsWith('/')) {
      route += 'index.html';
    }

    const target = path.join(PUBLIC, route.replace(/^\//, ''));

    if (!fs.existsSync(target)) {
      fail(`${relative}: lokalny odnośnik nie wskazuje na istniejący plik: ${raw}.`);
    }
  }

  for (const asset of [
    'main.css',
    'wiki-search-index.js',
    'catalog-render.js',
    'catalog-sync.js',
    'main.js',
  ]) {
    const escapedAsset = asset.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    const refs = [
      ...html.matchAll(
        new RegExp(`(?:src|href)=["']([^"']*${escapedAsset}[^"']*)["']`, 'g')
      ),
    ].map(match => match[1]);

    for (const ref of refs) {
      if (asset === 'wiki-search-index.js') {
        const versionMatch = ref.match(/[?&]v=(\d+)(?:&|$)/);

        if (!versionMatch) {
          fail(`${relative}: ${asset} nie ma numerycznej wersji cache: ${ref}.`);
        } else if (expectedSearchIndexVersion === null) {
          expectedSearchIndexVersion = versionMatch[1];
        } else if (versionMatch[1] !== expectedSearchIndexVersion) {
          fail(
            `${relative}: ${asset} ma niespójną wersję cache: ${ref}; ` +
            `oczekiwano ?v=${expectedSearchIndexVersion}.`
          );
        }
      } else if (!ref.includes(`?v=${expectedVersions[asset]}`)) {
        fail(`${relative}: ${asset} ma niespójną wersję cache: ${ref}.`);
      }

      const pathname = ref.split(/[?#]/)[0];

      if (
        pathname.startsWith('/') &&
        !fs.existsSync(path.join(PUBLIC, pathname.slice(1)))
      ) {
        fail(`${relative}: brak pliku skryptu/stylu ${pathname}.`);
      }
    }
  }
}

const generatedPagesCheck = spawnSync(
  process.execPath,
  [path.join(ROOT, 'tools', 'generate-catalog.js'), '--check'],
  {
    cwd: ROOT,
    encoding: 'utf8',
  }
);

if (generatedPagesCheck.status !== 0) {
  fail(
    `Wygenerowane katalogi są nieaktualne lub nie można ich sprawdzić: ${
      (generatedPagesCheck.stderr || generatedPagesCheck.error?.message || '').trim()
    }`
  );
}

// Documentation/template consistency checks.
const currentDocs = [
  path.join(ROOT, 'AUTOMATYCZNA-SITEMAP.md'),
  path.join(ROOT, 'pv', 'README.md'),
  path.join(ROOT, 'pv', 'JAK-EDYTOWAC.md'),
  path.join(ROOT, 'pv', 'JAK-DODAC-NOWY-ODCINEK.md'),
];

for (const file of currentDocs) {
  if (!fs.existsSync(file)) {
    fail(`Brak podstawowego dokumentu: ${path.relative(ROOT, file)}.`);
    continue;
  }

  const doc = read(file);
  const relative = path.relative(ROOT, file).split(path.sep).join('/');

  if (/tools_generate_sitemap\.py/.test(doc)) {
    fail(`${relative}: dokumentacja zawiera nieaktualną ścieżkę tools_generate_sitemap.py.`);
  }

  if (/py tools_generate_sitemap/.test(doc)) {
    fail(`${relative}: komenda generatora sitemap jest nieaktualna.`);
  }
}

const templateDir = path.join(ROOT, 'pv', 'SZABLONY-HTML');

if (fs.existsSync(templateDir)) {
  for (const file of fs.readdirSync(templateDir).filter(name => name.endsWith('.html'))) {
    const template = read(path.join(templateDir, file));

    for (const required of [
      '/js/wiki-search-index.js',
      '/js/catalog-sync.js',
      '/js/main.js',
    ]) {
      if (!template.includes(required)) {
        fail(`Szablon ${file} nie ładuje wymaganego skryptu ${required}.`);
      }
    }

    if (!template.includes('/css/main.css')) {
      fail(`Szablon ${file} nie ładuje /css/main.css.`);
    }
  }
}

const sitemapGenerator = path.join(ROOT, 'tools', 'generate_sitemap.py');

if (!fs.existsSync(sitemapGenerator)) {
  fail('Brak narzędzia tools/generate_sitemap.py.');
}

const workflow = path.join(ROOT, '.github', 'workflows', 'generate-sitemap.yml');

if (fs.existsSync(workflow) && !read(workflow).includes('tools/generate_sitemap.py')) {
  fail('Workflow sitemap nie używa aktualnej ścieżki tools/generate_sitemap.py.');
}

console.log(`Rekordy indeksu: ${items.length}`);
console.log(`Strony HTML: ${htmlFiles.length}`);
console.log(`Błędy: ${errors.length} | Ostrzeżenia: ${warnings.length}`);

for (const message of warnings) {
  console.warn(`OSTRZEŻENIE: ${message}`);
}

for (const message of errors) {
  console.error(`BŁĄD: ${message}`);
}

if (errors.length) {
  process.exit(1);
}

console.log('Kontrola indeksu, relacji, lokalnych grafik, stron i wersji cache zakończona poprawnie.');
