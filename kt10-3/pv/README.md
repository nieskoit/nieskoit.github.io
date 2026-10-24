# Dokumentacja robocza wiki Krainy Twórców

To jest punkt wejścia do dokumentacji. Jeśli instrukcja w innym pliku przeczy temu dokumentowi lub `JAK-EDYTOWAC.md`, nie stosuj jej w ciemno — sprawdź datę i zgłoś rozbieżność.

## Pliki bieżące — używaj ich do edycji

- **`JAK-EDYTOWAC.md`** — główna, aktualna procedura edycji.
- **`SZABLONY-WPISOW/ODCINEK.js.txt`** — wzór rekordu odcinka do `public/js/wiki-search-index.js`.
- **`SZABLONY-WPISOW/ROZDZIAL.js.txt`** — wzór rekordu rozdziału.
- **`SZABLONY-WPISOW/SEZON.js.txt`** — wzór rekordu sezonu.
- **`SZABLONY-WPISOW/WZORY-WPISOW-DO-INDEKSU.md`** — porównanie pól i relacji rekordów.
- **`SZABLONY-HTML/`** — szablony stron, które trzeba skopiować tylko przy tworzeniu nowej fizycznej podstrony.
- **`PROMPT-DO-OPISOW-ODCINKOW.txt`** i **`SZABLON-OPISU-ODCINKA.md`** — materiały pomocnicze do opracowania opisu; nie są źródłem danych wiki.
- **`../tools/validate-wiki.js`** — kontrola techniczna przed publikacją.
- **`../tools/generate-catalog.js`** — generuje statyczny katalog odcinków i listę haseł wyszukiwarki.
- **`../tools/generate_sitemap.py`** — generator mapy witryny.

## Raporty historyczne — nie traktuj ich jak instrukcji

Pliki zaczynające się od `RAPORT-` lub `POPRAWKI-` dokumentują stan projektu w danym dniu. Mogą opisywać problemy już naprawione. Nie wykonuj opisanych w nich kroków bez sprawdzenia aktualnego kodu.

## Zasady

1. Źródłem danych wiki jest `public/js/wiki-search-index.js`.
2. Mechanizm prezentacji danych znajduje się w `public/js/catalog-sync.js`.
3. `public/` to zawartość publikowanej strony; `pv/` to dokumentacja robocza; `tools/` to narzędzia developerskie.
4. Po zmianach uruchom `node tools/generate-catalog.js`, a potem `node tools/validate-wiki.js`.
5. Nie wpisuj wymyślonych adresów YouTube, czasu trwania ani opisów. Brak danych oznacz jako brak, a nie zastępuj zgadywaniem.
