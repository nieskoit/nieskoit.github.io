# Edycja przez Ctrl+F — aktualna mapa kodu

Dane wiki edytuj w `public/js/wiki-search-index.js`. Wyszukuj te znaczniki:

- `KT10 DODAJ TWÓRCĘ` — rekordy twórców.
- `KT10 DODAJ SEZON` — rekordy sezonów.
- `KT10 DODAJ POSTAĆ` — rekordy postaci.
- `KT10 DODAJ ROZDZIAŁ` — rekordy rozdziałów.
- `KT10 DODAJ ODCINEK` — rekordy odcinków.
- `KT10 GRAFIKI` — pola obrazów w rekordach.

`public/js/catalog-sync.js` to kod renderujący — nie służy do wpisywania danych konkretnego filmu. Zmieniaj go tylko wtedy, gdy naprawiasz mechanizm wyświetlania.

Po dodaniu rekordu zawsze utwórz odpowiadającą mu podstronę HTML z szablonu, a następnie uruchom `node tools/validate-wiki.js`. Walidator sprawdza m.in. duplikaty ID/URL, brakujące strony i grafiki, nieistniejące relacje oraz wersje cache.

Pełna procedura znajduje się w `pv/JAK-EDYTOWAC.md`. Starych plików `pv/SZABLONY-CTRL-F/` nie używaj — zostały usunięte, aby nie dublować wzorów.
