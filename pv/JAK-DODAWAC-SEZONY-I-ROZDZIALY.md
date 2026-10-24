# Sezony i rozdziały — aktualny sposób

Pracuj według `pv/JAK-EDYTOWAC.md`; to jedyna bieżąca instrukcja.

- Sezony są generowanymi sekcjami na `/odcinki/`, nie osobnymi podstronami.
- Rozdział ma fizyczną podstronę w `public/rozdzialy/<slug>/index.html` oraz rekord `kind: "Rozdział"` w `public/js/wiki-search-index.js`.
- Odcinki przypisuje się do sezonów przez pole `season`, a do głównego rozdziału przez `chapter`. Relacje między wpisami zapisuje się ID w `related`.
- Po zmianie uruchom `node tools/generate-catalog.js`, a następnie `node tools/validate-wiki.js`. Nie edytuj ręcznie `public/sitemap.xml`.
