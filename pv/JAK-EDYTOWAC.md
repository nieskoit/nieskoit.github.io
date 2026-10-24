# Jak edytować wiki — instrukcja główna

Ta instrukcja opisuje aktualny proces. Zanim zaczniesz, otwórz repozytorium w edytorze i upewnij się, że pracujesz na najnowszej wersji.

## Zasada podstawowa

**Dane katalogowe edytuje się w jednym miejscu: `public/js/wiki-search-index.js`.** `public/js/catalog-sync.js` czyta indeks i aktualizuje widoki interaktywne, a `tools/generate-catalog.js` zapisuje katalog `/odcinki/` oraz bazową listę haseł `/szukaj/` jako gotowy HTML. Nie dopisuj ręcznie kart w innych plikach.

HTML podstrony nadal jest potrzebny: rekord w indeksie nie tworzy automatycznie nowego pliku `index.html`. Przy dodawaniu nowej strony skopiuj odpowiedni szablon z `pv/SZABLONY-HTML/`, a następnie dostosuj tytuł, tekst zapasowy, adres kanoniczny i metadane do danego rekordu. Szablon powinien zachować wspólne pliki CSS/JS i ich aktualną wersję cache.

## Dodawanie odcinka

1. Otwórz `public/js/wiki-search-index.js` i dodaj rekord według `pv/SZABLONY-WPISOW/ODCINEK.js.txt`.
2. Nadaj unikalne `id`, np. `episode-kaicek-2`. Nie zmieniaj istniejących ID bez aktualizacji wszystkich relacji.
3. Uzupełnij prawdziwe dane: `title`, `url`, `summary`, `description`, `creator`, `season`, `year`, `duration`, `youtube`, `thumbnail`, `thumbnailAlt` i `related`, zgodnie z polami używanymi w istniejących rekordach. Nie zgaduj brakujących informacji.
4. `url` musi odpowiadać fizycznej stronie, którą utworzysz, np. `/odcinki/kaicek/nazwa-odcinka/`.
5. Utwórz folder odpowiadający URL-owi i skopiuj `pv/SZABLONY-HTML/SZABLON-ODCINKA.html` jako `index.html`. Zmień statyczne wartości zapasowe, aby zgadzały się z rekordem. Strona powinna ładować `wiki-search-index.js`, `catalog-sync.js` i `main.js` w tej kolejności, a CSS z `public/css/main.css`.
6. Pole `creator` powinno odpowiadać nazwie twórcy z indeksu, a `related` powinno zawierać identyfikator rekordu twórcy, np. `creator-kaicek`.
7. Ustaw `chapter` i relację do rozdziału tylko wtedy, gdy odcinek faktycznie do niego należy. Zadbaj o zgodne relacje w obu rekordach zgodnie z wzorem w `SZABLONY-WPISOW/`.
8. Jeśli masz miniaturę, umieść ją w `public/assets/episodes/` i użyj ścieżki zaczynającej się od `/assets/`. `thumbnailAlt` ma krótko opisywać widoczną treść grafiki. Jeśli miniatury nie ma, nie wskazuj fikcyjnego pliku.
9. Wygeneruj statyczny katalog odcinków i uruchom walidator:

   ```bash
   node tools/generate-catalog.js
   node tools/validate-wiki.js
   ```

10. Otwórz stronę odcinka, `/odcinki/`, profil twórcy i `/szukaj/`. Sprawdź też konsolę przeglądarki. Przed publikacją przejrzyj diff i dopiero potem wykonaj commit/push.
11. Sitemap generuj poleceniem `py tools/generate_sitemap.py` w Windows albo `python3 tools/generate_sitemap.py` na macOS/Linux. Możesz też uruchomić `GENERUJ-SITEMAP.bat`.

## Krótki i pełny opis odcinka

- `summary` to krótki opis katalogowy (zwykle 25–45 słów). Jest wyświetlany na listach `/odcinki/`, profilach twórców i w wynikach wyszukiwania.
- `description` to pełne streszczenie fabuły. Jest wyświetlane w sekcji „O czym jest ten odcinek” na stronie danego odcinka.
- Nie wpisuj tego samego tekstu w oba pola. Do przygotowania obu opisów użyj `pv/PROMPT-DO-OPISOW-ODCINKOW.txt`, wklejając scenariusz lub transkrypcję. Prompt domyślnie zwraca oba pola.
- Jeśli pełny opis nie jest jeszcze gotowy, zostaw `description` puste lub pomiń pole; strona pokaże komunikat zastępczy. Nie kopiuj automatycznie `summary` do `description`.

## Co aktualizuje się z indeksu?

- `/odcinki/` i wyszukiwarka — katalog odcinków.
- `/tworca/nazwa/` — własne odcinki, rozdziały oraz wystąpienia w treściach innych twórców, jeśli relacje są zapisane w indeksie.
- `/rozdzialy/nazwa/` — odcinki powiązane z rozdziałem.
- profile postaci — powiązane treści wynikające z relacji.

Jeśli rekord istnieje w indeksie, a nie pokazuje się na stronie, sprawdź poprawność `kind`, `related`, `creator`, `chapter`, `season` i URL. Następnie sprawdź konsolę oraz czy strona ładuje aktualny skrypt synchronizacji.

## Dodawanie sezonu

1. Skopiuj rekord z `pv/SZABLONY-WPISOW/SEZON.js.txt` i nadaj mu unikalne ID.
2. Zachowaj zgodność `title`, `season` i URL-u z konwencją istniejących rekordów.
3. Przypisuj odcinki do sezonu przez pole `season`, używając dokładnie tej samej wartości.
4. Uruchom walidator i sprawdź `/odcinki/`.

## Dodawanie rozdziału

1. Utwórz `public/rozdzialy/slug/index.html` z `pv/SZABLONY-HTML/SZABLON-ROZDZIALU.html`.
2. Dodaj rekord rozdziału według `pv/SZABLONY-WPISOW/ROZDZIAL.js.txt`.
3. W odcinkach ustaw odpowiednie `chapter` i relacje `related`. Nie dodawaj powiązań wyłącznie dlatego, że treści wydają się podobne.
4. Uruchom walidator i sprawdź profil rozdziału oraz katalog odcinków.

## Dodawanie twórcy lub postaci

1. Utwórz stronę z odpowiedniego szablonu HTML.
2. Dodaj rekord do indeksu z unikalnym ID, poprawnym `kind` i URL-em prowadzącym do strony.
3. Wskazuj tylko istniejące grafiki. Po dodaniu obrazu uruchom walidator.
4. Relacje `related` zapisuj jako identyfikatory rekordów, nie tytuły ani adresy URL.

## Aktualizacja cache

Po zmianie JS/CSS zwiększ wspólny parametr `?v=` we wszystkich stronach i szablonach, które ładują zmieniony zasób. Walidator sprawdza spójność wersji. Nie zmieniaj numeru cache bez potrzeby przy samej edycji danych indeksu.

## Dostępność i miniatury

`alt` ma przekazywać istotną informację z grafiki. Dla miniatury napisz krótko, kto/co jest widoczne i co się dzieje. Nie przepisuj tytułu filmu i nie dopowiadaj rzeczy niewidocznych na obrazie. Dla grafiki dekoracyjnej stosuje się pusty `alt=""`. Jeśli prześlesz miniaturę, mogę zaproponować krótki opis.

## Publikacja i bezpieczeństwo

- Publikowana jest zawartość `public/`; `pv/` i `tools/` są materiałami roboczymi.
- Nie umieszczaj haseł, tokenów ani kluczy w HTML/JS.
- Nie edytuj ręcznie `public/sitemap.xml`; generuj ją narzędziem.
- Raporty `RAPORT-*` i `POPRAWKI-*` są historyczne, nie zastępują tej instrukcji.
