# Wzory wpisów — katalog wiki

Głównym źródłem danych jest `public/js/wiki-search-index.js`. Każdy wpis musi mieć unikalne `id`, `kind`, `title` i `url`. `related` zawiera ID rekordów, nie tytuły ani adresy.

## Twórca

```js
{
  "id": "creator-nowy-tworca",
  "title": "Nazwa twórcy",
  "kind": "Twórca",
  "url": "/tworca/nowy-tworca/",
  "image": "/assets/creators/nowy-tworca.webp",
  "summary": "Krótki, potwierdzony opis.",
  "creator": "Nazwa twórcy",
  "related": [],
  "aliases": []
}
```

## Sezon

```js
{
  "id": "season-3",
  "title": "Sezon 3",
  "kind": "Sezon",
  "url": "/odcinki/#sezon-3",
  "summary": "Krótki opis sezonu.",
  "season": "Sezon 3",
  "related": [],
  "aliases": []
}
```

Sezon jest sekcją generowaną na `/odcinki/`, nie wymaga osobnej podstrony.

## Postać

```js
{
  "id": "character-nowa-postac",
  "title": "Nazwa postaci",
  "kind": "Postać",
  "url": "/postacie/nowa-postac/",
  "summary": "Krótki opis postaci.",
  "creator": "Nazwa twórcy",
  "season": "Sezon 1",
  "related": ["creator-nowy-tworca", "season-1"],
  "aliases": []
}
```

## Rozdział

```js
{
  "id": "chapter-nowy-rozdzial",
  "title": "Nazwa rozdziału",
  "kind": "Rozdział",
  "url": "/rozdzialy/nowy-rozdzial/",
  "summary": "Krótki opis rozdziału.",
  "creator": "Nazwa twórcy",
  "season": "Sezon 1",
  "related": ["season-1", "episode-id-1"],
  "aliases": []
}
```

## Odcinek

Używaj `pv/SZABLONY-WPISOW/ODCINEK.js.txt` jako jedynego wzoru odcinka.

## Po dodaniu

1. Utwórz stronę HTML z odpowiedniego pliku w `pv/SZABLONY-HTML/` — indeks sam nie tworzy plików stron.
2. Upewnij się, że `url` odpowiada ścieżce fizycznego `index.html`.
3. Upewnij się, że grafiki istnieją pod wskazanymi ścieżkami.
4. Uruchom `node tools/validate-wiki.js`.
