#!/usr/bin/env node
'use strict';

const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const ROOT = path.resolve(__dirname, '..');
const INDEX = path.join(ROOT, 'public', 'js', 'wiki-search-index.js');
const { renderSearchFallback, renderEpisodeDirectory } = require('../public/js/catalog-render.js');
const PAGES = [
  {
    path: path.join(ROOT, 'public', 'odcinki', 'index.html'),
    start: '<!-- GENERATED EPISODE CATALOG: START -->',
    end: '<!-- GENERATED EPISODE CATALOG: END -->',
    content: items => `\n<section class="section-container seasons-list episode-seasons-directory" aria-label="Odcinki według sezonów">\n${renderEpisodeDirectory(items)}\n</section>\n`
  },
  {
    path: path.join(ROOT, 'public', 'szukaj', 'index.html'),
    start: '<!-- GENERATED SEARCH FALLBACK: START -->',
    end: '<!-- GENERATED SEARCH FALLBACK: END -->',
    content: items => `\n${renderSearchFallback(items)}\n`
  }
];

const read = file => fs.readFileSync(file, 'utf8');
const context = { window: {} };
vm.runInNewContext(read(INDEX), context, { filename: INDEX, timeout: 1000 });
const items = context.window.KT_WIKI_INDEX;
if (!Array.isArray(items)) throw new Error('Indeks wiki nie definiuje window.KT_WIKI_INDEX.');
const visibleItems = items.filter(item => item && item.published !== false);

// Nieopublikowane odcinki i rozdziały zachowujemy poza katalogiem publicznym.
// Zmiana published na true i ponowne uruchomienie generatora przywraca stronę.
const DRAFTS = path.join(ROOT, 'pv', 'drafts');
const publicationTypes = [
  { kind: 'Odcinek', publicPrefix: '/odcinki/', draftPrefix: path.join(DRAFTS, 'odcinki') },
  { kind: 'Rozdział', publicPrefix: '/rozdzialy/', draftPrefix: path.join(DRAFTS, 'rozdzialy') }
];
for (const type of publicationTypes) {
  for (const item of items.filter(item => item && item.kind === type.kind && item.published === false)) {
    const pathname = String(item.url || '').split(/[?#]/)[0];
    if (!pathname.startsWith(type.publicPrefix)) continue;
    const publicPage = path.join(ROOT, 'public', pathname.replace(/^\//, ''), 'index.html');
    const draftPage = path.join(type.draftPrefix, pathname.slice(type.publicPrefix.length), 'index.html');
    if (fs.existsSync(publicPage)) {
      fs.mkdirSync(path.dirname(draftPage), { recursive: true });
      fs.copyFileSync(publicPage, draftPage);
      fs.rmSync(publicPage);
    }
  }
  for (const item of items.filter(item => item && item.kind === type.kind && item.published !== false)) {
    const pathname = String(item.url || '').split(/[?#]/)[0];
    if (!pathname.startsWith(type.publicPrefix)) continue;
    const publicPage = path.join(ROOT, 'public', pathname.replace(/^\//, ''), 'index.html');
    const draftPage = path.join(type.draftPrefix, pathname.slice(type.publicPrefix.length), 'index.html');
    if (!fs.existsSync(publicPage) && fs.existsSync(draftPage)) {
      fs.mkdirSync(path.dirname(publicPage), { recursive: true });
      fs.copyFileSync(draftPage, publicPage);
    }
  }
}
let stale = false;
const outputs = [];
for (const page of PAGES) {
  const html = read(page.path);
  const start = html.indexOf(page.start);
  const end = html.indexOf(page.end);
  if (start < 0 || end < 0 || end < start || html.indexOf(page.start, start + page.start.length) >= 0 || html.indexOf(page.end, end + page.end.length) >= 0) {
    throw new Error(`${path.relative(ROOT, page.path)} musi zawierać dokładnie jedną poprawną parę znaczników generatora.`);
  }
  const output = `${html.slice(0, start + page.start.length)}${page.content(visibleItems)}${html.slice(end)}`;
  if (output !== html) {
    stale = true;
    outputs.push([page.path, output]);
  }
}

if (process.argv.includes('--check') && stale) {
  console.error('Wygenerowane strony są nieaktualne. Uruchom: node tools/generate-catalog.js');
  process.exit(1);
}
if (!process.argv.includes('--check')) {
  for (const [file, output] of outputs) fs.writeFileSync(file, output);
}
console.log(process.argv.includes('--check')
  ? 'Wygenerowane strony są aktualne.'
  : 'Wygenerowano katalog odcinków i statyczną listę haseł wyszukiwarki.');
