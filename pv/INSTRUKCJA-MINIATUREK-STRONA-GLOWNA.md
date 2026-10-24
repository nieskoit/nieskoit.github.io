# Miniaturki na stronie głównej — instrukcja

## Dlaczego wcześniej powtarzał się avatar?

Skrypt strony głównej wybierał obraz twórcy (`image` z rekordu Twórca), zamiast najpierw sprawdzać miniaturkę konkretnego odcinka. Dlatego karty odcinków Nieskota miały tę samą grafikę.

## Jak ustawić własną miniaturkę

1. Umieść plik graficzny w `public/assets/episodes/`, np. `nieskot-1.webp`.
2. Otwórz `public/js/wiki-search-index.js`.
3. Naciśnij `Ctrl+F` i wpisz `episode-nieskot-1`.
4. W rekordzie tego odcinka dodaj pole:
   ```js
   "thumbnail": "/assets/episodes/nieskot-1.webp",
   ```
5. Zachowaj przecinek po polu, jeśli po nim występują kolejne pola w obiekcie.
6. Zapisz plik i odśwież stronę przez `Ctrl+F5`.

Powtórz dla kolejnych odcinków, zmieniając nazwę pliku i identyfikator odcinka.

## Kolejność wyboru grafiki

1. `thumbnail` — miniaturka danego odcinka.
2. `image` — starsze pole obrazka, jeśli istnieje.
3. `image` twórcy — zapasowy avatar twórcy.
4. `/assets/kt.webp` — lokalna grafika zastępcza.

Wszystkie używane ścieżki muszą zaczynać się od `/assets/`. Nie używaj adresów `i.ytimg.com` ani innych zewnętrznych miniaturek.

## Ważne

Pliki `hero-1.webp` i `hero-2.webp` są grafikami sekcji hero. Można ich użyć jako miniatur, ale zalecane jest trzymanie miniaturek odcinków w `public/assets/episodes/`, żeby łatwo je odnaleźć.
