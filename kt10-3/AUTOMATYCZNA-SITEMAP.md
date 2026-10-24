# Automatyczna mapa witryny

Nie edytuj ręcznie `public/sitemap.xml` — generuj ją z fizycznych stron HTML.

## Jak działa generator?

- `tools/generate_sitemap.py` skanuje pliki `.html` w `public/`.
- Pomija `404.html`, zasoby i strony z jawnym `noindex`.
- Zapisuje adresy pod `https://krainatworcow.pl/`.
- Nie wymaga dodatkowych bibliotek; wystarczy Python 3.
- `.github/workflows/generate-sitemap.yml` uruchamia walidator, a następnie generator po zmianach w repozytorium.

## Windows

Uruchom `GENERUJ-SITEMAP.bat` albo z katalogu głównego projektu:

```powershell
py tools/generate_sitemap.py
```

## macOS / Linux

```bash
python3 tools/generate_sitemap.py
```

## Dodawanie nowej strony

1. Utwórz stronę w `public/`.
2. Dodaj odpowiadający rekord do `public/js/wiki-search-index.js`, jeśli jest to encja wiki.
3. Uruchom walidator: `node tools/validate-wiki.js`.
4. Wygeneruj sitemap i sprawdź zmianę w `public/sitemap.xml`.

GitHub Actions wymaga uprawnień zapisu do repozytorium, jeśli ma automatycznie commitować zaktualizowaną sitemapę. Jeśli publikujesz ręcznie, uruchom generator przed przesłaniem `public/` na hosting.
