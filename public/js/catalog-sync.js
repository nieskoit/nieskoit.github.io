/* Wspólne renderowanie katalogów na podstawie public/js/wiki-search-index.js. */
(() => {
  'use strict';
  const all = (Array.isArray(window.KT_WIKI_INDEX) ? window.KT_WIKI_INDEX : []).filter(item => item && item.published !== false);
  const byKind = kind => all.filter(item => item.kind === kind && item.url);
  const episodes = byKind('Odcinek');
  const seasons = byKind('Sezon');
  const chapters = byKind('Rozdział');
  const creators = byKind('Twórca');
  const characters = byKind('Postać');
  const esc = value => String(value ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const slug = value => String(value || '').toLocaleLowerCase('pl').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
  const pathNow = location.pathname.replace(/index\.html$/, '').replace(/\/{2,}/g, '/');
  const findByUrl = (items, path) => items.find(item => item.url && item.url.replace(/index\.html$/, '').replace(/\/$/, '/') === path);
  const relates = (item, other) => (item.related || []).includes(other.id) || (other.related || []).includes(item.id);
  // Grafiki katalogu pochodzą wyłącznie z lokalnego /assets/. Nigdy nie używamy miniaturek YouTube ani zewnętrznych URL-i.
  const localAsset = value => typeof value === 'string' && value.startsWith('/assets/') && !value.includes('..') ? value : '/assets/kt.webp';
  const imageFor = item => localAsset(item && (item.thumbnail || item.image));
  const youtubeFor = item => {
    const url = String(item?.youtube || '').trim();
    return /^https?:\/\/(?:www\.)?(?:youtube\.com\/(?:watch\?v=|shorts\/)|youtu\.be\/)/i.test(url) ? url : '';
  };
  const metaFor = item => [item.year, item.duration].filter(Boolean).map(esc).join(' · ');
  // Numeracja jest osobna dla każdego twórcy i zachowuje kolejność rekordów w indeksie.
  const episodeNumber = item => episodes.filter(candidate => slug(candidate.creator) === slug(item.creator)).findIndex(candidate => candidate.id === item.id) + 1;
  const episodeBadge = item => `<span class="episode-order episode-number-badge" aria-label="Odcinek ${episodeNumber(item)}">Odcinek ${episodeNumber(item)}</span>`;
  // Resolve chapter from the episode's explicit primary field first, then either side of the relationship.
  const chapterLinksFor = item => {
    const primaryId = String(item?.chapter || '').trim();
    const primary = chapters.find(chapter => chapter.id === primaryId);
    if (primary) return [primary];
    return chapters.filter(chapter => (item?.related || []).includes(chapter.id) || (chapter.related || []).includes(item?.id));
  };
  const episodeCard = (item, number, compact = false) => {
    const chapter = chapterLinksFor(item)[0];
    const image = imageFor(item);
    const meta = metaFor(item);
    const youtube = youtubeFor(item);
    const youtubeButton = youtube ? `<a class="button button-primary" href="${esc(youtube)}" target="_blank" rel="noopener noreferrer">Obejrzyj na YouTube</a>` : '';
    if (compact) return `<li class="episode-row" data-creator="${esc(slug(item.creator))}"><a class="episode-row-thumb" href="${esc(item.url)}" aria-label="Otwórz: ${esc(item.title)}"><img alt="${esc(item.thumbnailAlt || `Miniatura odcinka: ${item.title}`)}" loading="lazy" src="${esc(image)}"></a><div class="episode-row-main"><h3><span class="episode-title-line">${episodeBadge(item)}<a href="${esc(item.url)}">${esc(item.title)}</a></span></h3>${meta ? `<p class="episode-row-meta episode-row-meta-data">${meta}</p>` : ''}<p>${esc(item.summary || 'Opis odcinka zostanie uzupełniony.')}</p>${chapter ? `<p class="episode-row-meta">Rozdział: <a href="${esc(chapter.url)}">${esc(chapter.title)}</a></p>` : ''}</div><div class="episode-row-actions"><a class="button button-secondary" href="${esc(item.url)}">Szczegóły odcinka</a>${youtubeButton}</div></li>`;
    return `<article class="lore-card wiki-result-card episode-catalog-card" data-creator="${esc(slug(item.creator))}" data-entity="episode"><a class="episode-card-thumb" href="${esc(item.url)}" aria-label="Otwórz: ${esc(item.title)}"><img alt="${esc(item.thumbnailAlt || `Miniatura odcinka: ${item.title}`)}" loading="lazy" src="${esc(image)}"></a><div class="episode-card-content"><h3><span class="episode-title-line">${episodeBadge(item)}<a href="${esc(item.url)}">${esc(item.title)}</a></span></h3>${meta ? `<p class="episode-row-meta-data">${meta}</p>` : ''}<p>${esc(item.summary || 'Opis odcinka zostanie uzupełniony.')}</p><p class="card-relations"><span>Twórca: <a href="/tworca/${esc(slug(item.creator))}/">${esc(item.creator || 'Nieznany')}</a></span>${chapter ? `<span>Rozdział: <a href="${esc(chapter.url)}">${esc(chapter.title)}</a></span>` : ''}</p></div><div class="episode-card-actions"><a class="button button-secondary episode-card-read" href="${esc(item.url)}">Szczegóły odcinka <span aria-hidden="true">↗</span></a>${youtube ? `<a class="button button-primary episode-card-youtube" href="${esc(youtube)}" target="_blank" rel="noopener noreferrer">Obejrzyj na YouTube <span aria-hidden="true">↗</span></a>` : ''}</div></article>`;
  };
  const chapterCard = chapter => `<article class="lore-card wiki-result-card" data-entity="chapter"><a class="episode-card-thumb chapter-card-thumb" href="${esc(chapter.url)}"><img alt="Okładka: ${esc(chapter.title)}" loading="lazy" src="${esc(imageFor(chapter))}"></a><h3><a href="${esc(chapter.url)}">${esc(chapter.title)}</a></h3><p>${esc(chapter.summary || '')}</p><p class="card-relations">${chapter.creator ? `<span>Twórca: <a href="/tworca/${esc(slug(chapter.creator))}/">${esc(chapter.creator)}</a></span>` : ''}${chapter.season ? `<span>Sezon: <a href="/odcinki/#${esc(slug(chapter.season))}">${esc(chapter.season)}</a></span>` : ''}</p><a class="text-link" href="${esc(chapter.url)}">Otwórz rozdział</a></article>`;
  const renderLinkedList = (heading, items, emptyText, linkLabel = item => item.title, options = {}) => {
    if (!heading) return;
    const isEpisodeList = items.length > 0 && items.every(item => item.kind === 'Odcinek');
    let list = heading.nextElementSibling;
    if (!list || !list.matches('ul,ol')) { list = document.createElement(isEpisodeList ? 'ol' : 'ul'); list.className = 'linked-list'; heading.insertAdjacentElement('afterend', list); }
    list.className = `linked-list${isEpisodeList ? ' episode-linked-list' : ''}`;
    list.innerHTML = items.map(item => {
      const creatorLink = options.showEpisodeCreator && item.creator
        ? `<span class="appearance-creator">u <a href="/tworca/${esc(slug(item.creator))}/">${esc(item.creator)}</a></span>`
        : '';
      return `<li>${isEpisodeList && !options.hideEpisodeNumbers ? episodeBadge(item) : ''}<a href="${esc(item.url)}">${esc(linkLabel(item))}</a>${creatorLink}</li>`;
    }).join('') || `<li>${esc(emptyText)}</li>`;
  };
  const replaceSectionContent = (heading, node) => {
    if (!heading || !node) return;
    let sibling = heading.nextElementSibling;
    while (sibling && !/^H[1-6]$/.test(sibling.tagName)) {
      const next = sibling.nextElementSibling;
      sibling.remove();
      sibling = next;
    }
    heading.insertAdjacentElement('afterend', node);
  };
  document.addEventListener('DOMContentLoaded', () => {
    // Karty twórców na stronie głównej też pochodzą z indeksu.
    if (pathNow === '/') {
      const grid = document.querySelector('.home .creators .creator-grid, .creators .creator-grid');
      if (grid) grid.innerHTML = creators.map(item => `<a class="creator-card" href="${esc(item.url)}"><span class="avatar-wrap"><img class="creator-avatar" alt="${esc(item.title)}" loading="lazy" src="${esc(imageFor(item))}"></span><span class="creator-meta"><strong>${esc(item.title)}</strong></span></a>`).join('');
    }
    if (pathNow === '/odcinki/') {
      const container = document.querySelector('.episode-seasons-directory');
      const renderer = window.KT_CATALOG_RENDERERS?.renderEpisodeDirectory;
      if (!container || !renderer) throw new Error('Brakuje wygenerowanego katalogu odcinków lub współdzielonego renderera.');
      container.innerHTML = renderer(all);
      if (location.hash) {
        const target = document.getElementById(decodeURIComponent(location.hash.slice(1)));
        if (target) requestAnimationFrame(() => target.scrollIntoView({ block: 'start' }));
      }
    }

    // Katalog rozdziałów: usuwa statyczne, potencjalnie nieaktualne kopie kart.
    if (pathNow === '/rozdzialy/') {
      const pageHeading = document.querySelector('.page-intro h1');
      if (pageHeading) pageHeading.textContent = 'Rozdziały';
      document.querySelectorAll('.catalog-section').forEach(section => {
      const heading = section.querySelector('h2'); if (!heading) return;
      // [CTRL+F: KT10 ROZDZIAŁY — DOPASOWANIE TWÓRCY]
      // Nagłówki są odmienione gramatycznie (np. „Rozdziały Nieskota”),
      // dlatego sprawdzamy w nagłówku tytuły i aliasy twórców, a potem filtrujemy
      // po kanonicznym tytule znalezionego twórcy.
      const headingText = heading.textContent.trim();
      const normalizedHeading = headingText.toLocaleLowerCase('pl');
      const owner = creators.find(item =>
        [item.title, ...(item.aliases || [])]
          .some(name => normalizedHeading.includes(name.toLocaleLowerCase('pl')))
      );
      const match = headingText.match(/(?:Rozdziały|Wątki)\s+(.+)/i);
      if (!owner && !match) return;
      const creatorName = owner ? owner.title : match[1].trim();
      const creatorDisplayName = {
        nieskot: 'Nieskota',
        dombeek: 'Dombka',
        kaicek: 'Kaicka'
      }[slug(creatorName)] || creatorName;
      // Creator-specific sections describe story arcs; avoid repeating the page title.
      heading.textContent = `Rozdziały ${creatorDisplayName}`;
      const related = chapters.filter(item => slug(item.creator) === slug(creatorName));
      const note = section.querySelector('.wiki-note');
      let grid = section.querySelector('.catalog-grid');
      if (!grid) { grid = document.createElement('div'); grid.className = 'catalog-grid'; if (note) note.replaceWith(grid); else section.appendChild(grid); }
      grid.innerHTML = related.map(chapterCard).join('');
      if (!related.length) grid.innerHTML = '<p class="wiki-note">Nie dodano jeszcze rozdziałów.</p>';
      });
    }
    // [CTRL+F: KT10 SZCZEGÓŁY ODCINKA]
    // Szczegóły odcinka: tytuł, opis, czas i miniatura są nadpisywane danymi katalogu.
    const currentEpisode = findByUrl(episodes, pathNow);
    if (currentEpisode) {
      const h1 = document.querySelector('.page-intro h1'); if (h1) h1.textContent = currentEpisode.title;
      const pageIntro = document.querySelector('.page-intro');
      let intro = pageIntro && (pageIntro.querySelector('.episode-summary') || [...pageIntro.querySelectorAll(':scope > p')].find(p => !p.classList.contains('breadcrumbs')));
      if (!intro) {
        intro = document.createElement('p');
        if (h1) h1.insertAdjacentElement('afterend', intro);
      }
      intro.classList.add('episode-summary');
      intro.textContent = currentEpisode.summary || 'Opis odcinka zostanie uzupełniony.';
      const title = document.querySelector('head title'); if (title) title.textContent = `${currentEpisode.title} | Kraina Twórców`;
      const desc = document.querySelector('meta[name="description"]'); if (desc) desc.content = currentEpisode.summary || '';
      const context = document.querySelector('.episode-context');
      if (context) context.innerHTML = `<div class="episode-meta-row" aria-label="Informacje o odcinku"><span class="episode-meta-group episode-meta-publication"><strong>Odcinek ${episodeNumber(currentEpisode)}</strong>${currentEpisode.year ? `<span>Rok wydania: ${esc(currentEpisode.year)}</span>` : ''}${currentEpisode.duration ? `<span class="episode-meta-separator" aria-hidden="true">·</span><span>Czas trwania: ${esc(currentEpisode.duration)}</span>` : ''}</span><span class="episode-meta-group">Twórca: <a href="/tworca/${esc(slug(currentEpisode.creator))}/">${esc(currentEpisode.creator)}</a></span>${currentEpisode.season ? `<span class="episode-meta-group">Sezon: <a href="/odcinki/#${esc(slug(currentEpisode.season))}">${esc(currentEpisode.season)}</a></span>` : ''}</div>`;
      const image = document.querySelector('.episode-thumb img'); if (image) { image.src = imageFor(currentEpisode); image.alt = currentEpisode.thumbnailAlt || `Grafika odcinka: ${currentEpisode.title}`; }
      const overlay = document.querySelector('.episode-thumb-overlay'); if (overlay) overlay.remove();
      const youtubeButton = document.querySelector('.episode-actions a[href]');
      const youtubeUrl = youtubeFor(currentEpisode);
      if (youtubeButton) {
        if (youtubeUrl) { youtubeButton.href = youtubeUrl; youtubeButton.hidden = false; }
        else youtubeButton.remove();
      }
      const creatorSidebar = [...document.querySelectorAll('.lore-sidebar > section')].find(section => /więcej odcinków/i.test(section.querySelector('h2')?.textContent || ''));
      if (creatorSidebar) {
        const creatorName = currentEpisode.creator || 'twórcy';
        const sidebarHeading = creatorSidebar.querySelector('h2');
        const sidebarParagraph = creatorSidebar.querySelector('p');
        const sidebarLink = creatorSidebar.querySelector('a');
        if (sidebarHeading) sidebarHeading.textContent = `Więcej odcinków twórcy: ${creatorName}`;
        if (sidebarParagraph) sidebarParagraph.textContent = `Poznaj pozostałe odcinki opublikowane przez twórcę ${creatorName}.`;
        if (sidebarLink) { sidebarLink.href = `/tworca/${esc(slug(creatorName))}/`; sidebarLink.textContent = 'Zobacz profil twórcy'; }
      }
      // The shared index is the source of truth; never leave copied text from a different episode.
      const article = document.querySelector('.lore-article');
      const descriptionHeading = article && [...article.querySelectorAll('h2')].find(h => /o czym jest ten odcinek|opis odcinka/i.test(h.textContent));
      if (descriptionHeading) {
        let description = descriptionHeading.nextElementSibling;
        if (!description || description.tagName !== 'P') { description = document.createElement('p'); descriptionHeading.insertAdjacentElement('afterend', description); }
        description.textContent = currentEpisode.description || 'Pełny opis fabuły zostanie uzupełniony.';
      }
      const characterHeading = article && [...article.querySelectorAll('h2')].find(h => /ważne postacie/i.test(h.textContent));
      if (characterHeading) {
        let list = characterHeading.nextElementSibling;
        if (!list || !list.matches('.episode-character-list')) {
          list = document.createElement('ul'); list.className = 'episode-character-list';
          characterHeading.insertAdjacentElement('afterend', list);
        }
        const people = all.filter(item => ['Postać', 'Twórca'].includes(item.kind) && relates(currentEpisode, item));
        list.innerHTML = people.map(item => `<li>${item.url ? `<a class="character-link${item.kind === 'Twórca' ? ' creator-character-link' : ''}" href="${esc(item.url)}">${esc(item.title)}</a>` : `<span class="character-unlinked">${esc(item.title)}</span>`}</li>`).join('') || '<li class="character-unlinked">Nie dodano ważnych postaci.</li>';
      }
      const chapterHeading = article && [...article.querySelectorAll('h2')].find(h => /powiązany rozdział/i.test(h.textContent));
      const primaryChapter = chapterLinksFor(currentEpisode)[0];
      if (chapterHeading) { let chapterPara = chapterHeading.nextElementSibling; if (!chapterPara || chapterPara.tagName !== 'P') { chapterPara = document.createElement('p'); chapterHeading.insertAdjacentElement('afterend', chapterPara); } chapterPara.innerHTML = primaryChapter ? `<a href="${esc(primaryChapter.url)}">${esc(primaryChapter.title)}</a>` : 'Nie przypisano rozdziału.'; }
    }
    // [CTRL+F: KT10 SZCZEGÓŁY ROZDZIAŁU]
    // Szczegóły rozdziału: opis, okładka i lista odcinków są generowane z indeksu.
    const chapter = findByUrl(chapters, pathNow);
    if (chapter) {
      const h1 = document.querySelector('.page-intro h1'); if (h1) h1.textContent = chapter.title;
      const intro = document.querySelector('.page-intro > h1 + p'); if (intro) intro.textContent = chapter.summary || '';
      const title = document.querySelector('head title'); if (title) title.textContent = `${chapter.title} | Kraina Twórców`;
      const desc = document.querySelector('meta[name="description"]'); if (desc) desc.content = chapter.summary || '';
      const context = document.querySelector('.episode-context');
      if (context) {
        const seasonMeta = [...context.querySelectorAll('span')].find(span => /^\s*Sezon:/i.test(span.textContent));
        if (seasonMeta && chapter.season) seasonMeta.innerHTML = `Sezon: <a href="/odcinki/#${esc(slug(chapter.season))}">${esc(chapter.season)}</a>`;
        else if (seasonMeta && !chapter.season) seasonMeta.remove();
        const creatorMeta = [...context.querySelectorAll('span')].find(span => /^\s*Twórca:/i.test(span.textContent));
        if (creatorMeta && chapter.creator) creatorMeta.innerHTML = `Twórca: <a href="/tworca/${esc(slug(chapter.creator))}/">${esc(chapter.creator)}</a>`;
      }
      const bodyHeading = [...document.querySelectorAll('.lore-article h2')].find(h => /o rozdziale/i.test(h.textContent));
      if (bodyHeading?.nextElementSibling?.matches('p')) bodyHeading.nextElementSibling.textContent = chapter.summary || '';
      if ((chapter.thumbnail || chapter.image) && (chapter.thumbnail || chapter.image).startsWith('/assets/')) {
        let image = document.querySelector('.chapter-cover');
        // Keep the chapter summary directly under the title, matching the episode detail layout.
        const summary = document.querySelector('.page-intro > h1 + p');
        if (!image && summary) { image = document.createElement('img'); image.className = 'chapter-cover'; summary.insertAdjacentElement('afterend', image); }
        else if (!image && h1) { image = document.createElement('img'); image.className = 'chapter-cover'; h1.insertAdjacentElement('afterend', image); }
        else if (image && summary && image.previousElementSibling !== summary) summary.insertAdjacentElement('afterend', image);
        if (image) { image.src = imageFor(chapter); image.alt = `Okładka: ${chapter.title}`; image.loading = 'lazy'; }
      }
      const article = document.querySelector('.lore-article');
      const heading = article && [...article.querySelectorAll('h2')].find(h => /^odcinki(?:\s+rozdziału)?$/i.test(h.textContent.trim()));
      const items = episodes.filter(item => relates(item, chapter));
      renderLinkedList(heading, items, 'Brak odcinków przypisanych do tego rozdziału.');
      const sidebar = document.querySelector('.lore-sidebar');
      if (sidebar) {
        const characterSection = [...sidebar.querySelectorAll(':scope > section')].find(section => /postacie/i.test(section.querySelector('h2')?.textContent || ''));
        const relatedCharacters = all.filter(item => item.kind === 'Postać' && relates(item, chapter));
        if (characterSection) {
          const heading = characterSection.querySelector('h2');
          let list = heading?.nextElementSibling;
          if (heading) {
            if (!list || !list.matches('ul,ol')) { list = document.createElement('ul'); heading.insertAdjacentElement('afterend', list); }
            list.className = 'linked-list';
            list.innerHTML = relatedCharacters.map(item => `<li>${item.url ? `<a href="${esc(item.url)}">${esc(item.title)}</a>` : esc(item.title)}</li>`).join('') || '<li>Brak przypisanych postaci.</li>';
          }
        }
      }
    }
    // Profile twórców: opis i lista wszystkich odcinków, w których twórca występuje.
    const creator = findByUrl(creators, pathNow);
    if (creator) {
      const article = document.querySelector('.profile-layout .lore-article');
      if (article) {
        const headings = [...article.querySelectorAll(':scope > h2')];
        const episodesHeading = headings.find(h => /^odcinki$/i.test(h.textContent.trim()));
        const creatorEpisodes = episodes.filter(item => slug(item.creator) === slug(creator.title));
        if (episodesHeading) {
          if (creatorEpisodes.length) {
            const list = document.createElement('ol');
            list.className = 'episode-order-list';
            list.innerHTML = creatorEpisodes.map(item => episodeCard(item, episodeNumber(item), true)).join('');
            replaceSectionContent(episodesHeading, list);
          } else {
            const note = document.createElement('p');
            note.className = 'muted-text';
            note.textContent = 'Odcinki tego twórcy nie są obecnie opublikowane w katalogu.';
            replaceSectionContent(episodesHeading, note);
          }
        }
        const chaptersHeading = headings.find(h => /^rozdziały$/i.test(h.textContent.trim()));
        const creatorChapters = chapters.filter(item => slug(item.creator) === slug(creator.title));
        if (chaptersHeading) {
          const list = document.createElement('ul');
          list.className = 'linked-list';
          list.innerHTML = creatorChapters.map(item => `<li><a href="${esc(item.url)}">${esc(item.title)}</a></li>`).join('') || '<li>Brak przypisanych rozdziałów.</li>';
          replaceSectionContent(chaptersHeading, list);
        }
      }
      const heading = document.querySelector('.profile-heading');
      if (heading) {
        const title = heading.querySelector('h1');
        if (title) title.textContent = creator.title;
        let description = heading.querySelector('.creator-profile-description');
        if (!description) {
          description = document.createElement('p');
          description.className = 'creator-profile-description';
          if (title) title.insertAdjacentElement('afterend', description);
        }
        description.textContent = 'Twórca uniwersum Krainy Twórców.';
        if (article) {
          let historyHeading = [...article.querySelectorAll(':scope > h2')].find(h => /^historia$/i.test(h.textContent.trim()));
          if (!historyHeading) {
            historyHeading = document.createElement('h2');
            historyHeading.textContent = 'Historia';
            article.prepend(historyHeading);
          }
          let historyText = historyHeading.nextElementSibling;
          if (!historyText || !historyText.matches('.creator-history')) {
            historyText = document.createElement('p');
            historyText.className = 'creator-history';
            historyHeading.insertAdjacentElement('afterend', historyText);
          }
          historyText.textContent = creator.summary || '';
        }
      }
      const sidebar = document.querySelector('.lore-sidebar');
      if (sidebar) {
        let appearanceSection = [...sidebar.querySelectorAll(':scope > section')].find(section => /wystąpienia/i.test(section.querySelector('h2')?.textContent || ''));
        if (!appearanceSection) {
          appearanceSection = document.createElement('section');
          appearanceSection.innerHTML = '<h2>Wystąpienia</h2><ul></ul>';
          sidebar.prepend(appearanceSection);
        }
        // Wystąpienia to wyłącznie odcinki OPUBLIKOWANE PRZEZ INNYCH TWÓRCÓW,
        // w których dany twórca jest jawnie powiązany w indeksie wiki.
        // Nie pokazujemy tu własnych filmów — są już wymienione w głównej sekcji „Odcinki”.
        const appearanceEpisodes = episodes.filter(item =>
          slug(item.creator) !== slug(creator.title) && relates(creator, item)
        );
        renderLinkedList(
          appearanceSection.querySelector('h2'),
          appearanceEpisodes,
          'Nie odnotowano jeszcze wystąpień u innych twórców.',
          item => item.title,
          { hideEpisodeNumbers: true, showEpisodeCreator: true }
        );

        // Rozdziały wyświetlamy tylko wtedy, gdy są przypisane do odcinków,
        // w których twórca występuje u kogoś innego.
        let appearanceChapterSection = [...sidebar.querySelectorAll(':scope > section')]
          .find(section => /rozdziały, w których wystąpił|rozdziały wystąpień/i.test(section.querySelector('h2')?.textContent || ''));
        if (!appearanceChapterSection) {
          appearanceChapterSection = document.createElement('section');
          appearanceChapterSection.innerHTML = '<h2>Rozdziały, w których wystąpił</h2><ul class="linked-list"></ul>';
          appearanceSection.insertAdjacentElement('afterend', appearanceChapterSection);
        }
        const ownedChapterIds = new Set(chapters.filter(item => slug(item.creator) === slug(creator.title)).map(item => item.id));
        const appearanceChapters = [...new Map(
          appearanceEpisodes.flatMap(item => chapterLinksFor(item))
            .filter(item => !ownedChapterIds.has(item.id))
            .map(item => [item.id, item])
        ).values()];
        renderLinkedList(
          appearanceChapterSection.querySelector('h2'),
          appearanceChapters,
          'Brak rozdziałów powiązanych z wystąpieniami u innych twórców.'
        );
      }
    }

    // Postacie: powiązane rozdziały i wystąpienia nie pozostają już na sztywno w HTML.
    const character = findByUrl(characters, pathNow);
    if (character) {
      const h1 = document.querySelector('.profile-heading h1'); if (h1) h1.textContent = character.title;
      const intro = document.querySelector('.profile-heading p'); if (intro) intro.textContent = character.summary || '';
      let image = document.querySelector('.profile-heading img.profile-image');
      const placeholder = document.querySelector('.profile-heading .profile-placeholder');
      if (character.image && character.image.startsWith('/assets/')) {
        if (!image) {
          image = document.createElement('img');
          image.className = 'profile-image';
          image.alt = character.title;
          image.loading = 'lazy';
          if (placeholder) placeholder.replaceWith(image);
          else document.querySelector('.profile-heading')?.prepend(image);
        }
        image.src = localAsset(character.image);
        image.alt = character.title;
      }
      const sidebar = document.querySelector('.lore-sidebar');
      if (sidebar) {
        const sections = [...sidebar.querySelectorAll(':scope > section')];
        const chapterSection = sections.find(section => /rozdziały/i.test(section.querySelector('h2')?.textContent || ''));
        const episodeSection = sections.find(section => /wystąpienia/i.test(section.querySelector('h2')?.textContent || ''));
        const relatedChaptersForCharacter = chapters.filter(item => relates(character, item));
        const relatedEpisodes = episodes.filter(item => relates(character, item));
        if (chapterSection) renderLinkedList(chapterSection.querySelector('h2'), relatedChaptersForCharacter, 'Brak przypisanych rozdziałów.');
        if (episodeSection) renderLinkedList(
          episodeSection.querySelector('h2'),
          relatedEpisodes,
          'Brak przypisanych odcinków.',
          item => item.title,
          { hideEpisodeNumbers: true, showEpisodeCreator: true }
        );
        // Twórca jest widoczny przy każdym odcinku; osobna sekcja byłaby redundantna.
        const redundantCreatorSection = sections.find(section => /występuje u twórcy/i.test(section.querySelector('h2')?.textContent || ''));
        if (redundantCreatorSection) redundantCreatorSection.remove();
      }
    }
    // Katalog postaci: synchronizuj karty i miniatury z indeksu.
    if (pathNow === '/postacie/') {
      const grid = document.querySelector('.catalog-grid');
      if (grid) grid.innerHTML = characters.map(item => `<a class="lore-card wiki-result-card catalog-entity-card" data-entity="character" href="${esc(item.url)}"><span class="catalog-profile-head">${(item.thumbnail || item.image) && (item.thumbnail || item.image).startsWith('/assets/') ? `<img class="catalog-profile-avatar" src="${esc(imageFor(item))}" alt="${esc(item.title)}" loading="lazy">` : `<span class="catalog-profile-placeholder" aria-hidden="true">✦</span>`}<strong>${esc(item.title)}</strong></span><p>${esc(item.summary || '')}</p><span class="text-link">Otwórz profil <span aria-hidden="true">→</span></span></a>`).join('');
    }
  });
})();
