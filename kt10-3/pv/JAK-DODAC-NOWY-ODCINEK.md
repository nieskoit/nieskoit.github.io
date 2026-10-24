# Szybka instrukcja: dodanie odcinka

1. Skopiuj rekord z `pv/SZABLONY-WPISOW/ODCINEK.js.txt` do `public/js/wiki-search-index.js`.
2. Uzupełnij wszystkie znane dane i usuń pola, których nie znasz. Nie kopiuj starego linku, czasu ani miniatury z innego filmu.
3. Utwórz podstronę pod ścieżką podaną w polu `url`, kopiując `pv/SZABLONY-HTML/SZABLON-ODCINKA.html`.
4. Miniaturę umieść w `public/assets/episodes/`; dodaj `thumbnail` i krótki `thumbnailAlt`. Jeśli grafika nie jest gotowa, pomiń oba pola.
5. W `related` dodaj `creator-...` i ewentualne ID rozdziału/postaci. Rozdział przypisz polem `chapter` tylko wtedy, gdy jest potwierdzony.
6. Z głównego katalogu uruchom `node tools/generate-catalog.js`, a potem `node tools/validate-wiki.js`. Napraw wszystkie błędy.
7. Sprawdź `/odcinki/`, profil twórcy, podstronę odcinka i `/szukaj/`. Potem zrób commit/push.

**Ważne:** sam wpis w indeksie nie tworzy fizycznej strony. Oba elementy — rekord i plik `index.html` — są wymagane.


## Odcinek przygotowany, ale jeszcze nieopublikowany

W rekordzie odcinka ustaw `"published": false`. Uruchom `node tools/generate-catalog.js`. Strona odcinka zostanie zachowana w `pv/drafts/odcinki/`, a usunięta z katalogu `public`, więc nie będzie dostępna przez publiczny hosting. Odcinek nie pojawi się w katalogu, wyszukiwarce ani w powiązanych listach.

Gdy będzie gotowy, zmień wartość na `"published": true` (albo usuń pole `published`) i ponownie uruchom `node tools/generate-catalog.js`. Generator odtworzy stronę z kopii roboczej i przywróci odcinek do katalogu. Następnie uruchom `python tools/generate_sitemap.py`, `node tools/validate-wiki.js` i opublikuj zmiany.
