#!/usr/bin/env node
'use strict';

// Synchronizuje cache-busting wersje skryptow JS z ich zawartoscia.
// Uruchom: node tools/update-asset-versions.js
// Sprawdz bez zapisywania: node tools/update-asset-versions.js --check

const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const ROOT = path.resolve(__dirname, '..');
const PUBLIC = path.join(ROOT, 'public');
const TEMPLATE_DIR = path.join(ROOT, 'pv', 'SZABLONY-HTML');
const CHECK_ONLY = process.argv.includes('--check');
const ASSETS = ['main.js', 'catalog-render.js', 'catalog-sync.js'];

function hashFor(asset) {
  const file = path.join(PUBLIC, 'js', asset);
  if (!fs.existsSync(file)) throw new Error(`Brak pliku: ${path.relative(ROOT, file)}`);
  return crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex').slice(0, 12);
}

function listHtml(dir) {
  if (!fs.existsSync(dir)) return [];
  const result = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const file = path.join(dir, entry.name);
    if (entry.isDirectory()) result.push(...listHtml(file));
    else if (entry.isFile() && entry.name.toLowerCase().endsWith('.html')) result.push(file);
  }
  return result;
}

const versions = Object.fromEntries(ASSETS.map(asset => [asset, hashFor(asset)]));
const htmlFiles = [...listHtml(PUBLIC), ...listHtml(TEMPLATE_DIR)];
let changed = 0;
let stale = 0;

for (const file of htmlFiles) {
  const original = fs.readFileSync(file, 'utf8');
  let updated = original;

  for (const [asset, version] of Object.entries(versions)) {
    const escaped = asset.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    // Zmieniamy tylko lokalne odwolania do /js/<asset>, niezaleznie od starego query stringa.
    const pattern = new RegExp(`(\\/js\\/${escaped})(?:\\?v=[^\\"'\\s<>]*)?`, 'g');
    updated = updated.replace(pattern, `$1?v=${version}`);
  }

  if (updated !== original) {
    stale++;
    if (!CHECK_ONLY) {
      fs.writeFileSync(file, updated, 'utf8');
      changed++;
    }
  }
}

for (const [asset, version] of Object.entries(versions)) {
  console.log(`${asset}: ${version}`);
}
if (CHECK_ONLY && stale) {
  console.error(`Nieaktualne wersje cache w ${stale} plikach HTML/szablonach.`);
  process.exit(1);
}
console.log(CHECK_ONLY
  ? `Wersje cache są aktualne (${htmlFiles.length} plików HTML/szablonów sprawdzonych).`
  : `Zaktualizowano ${changed} plików HTML/szablonów (${htmlFiles.length} sprawdzonych).`);
