# Grafiki postaci

Portrety postaci dodawaj jako lokalne pliki WebP.

1. Przygotuj kwadratowy portret i zapisz go w `public/assets/characters/`, np. `xbajzel.webp`.
2. Otwórz `public/js/wiki-search-index.js` i znajdź rekord postaci (np. `character-xbajzel`).
3. Dodaj pole `"image": "/assets/characters/xbajzel.webp",` w obiekcie tej postaci.
4. Uruchom `node tools/validate-wiki.js`, a potem sprawdź `/postacie/` oraz profil postaci. Katalog i profil wykorzystają ten sam plik; na profilu placeholder zostanie zastąpiony portretem.
5. Nie dodawaj obrazów do `public/assets/characters/` pod inną nazwą niż ta wskazana w polu `image`. Wielkość liter w nazwie pliku ma znaczenie na hostingu.

Jeśli nie ma jeszcze grafiki, pomiń pole `image` — strona pokaże placeholder.
