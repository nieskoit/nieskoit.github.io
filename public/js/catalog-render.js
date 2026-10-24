((root, factory) => {
  const renderers = factory();
  if (typeof module === 'object' && module.exports) module.exports = renderers;
  else root.KT_CATALOG_RENDERERS = renderers;
})(typeof globalThis === 'object' ? globalThis : this, () => {
  'use strict';

  const esc = value => String(value ?? '').replace(/[&<>"']/g, ch => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  })[ch]);
  const slug = value => String(value || '')
    .toLocaleLowerCase('pl')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  const localAsset = value => typeof value === 'string' && value.startsWith('/assets/') && !value.includes('..')
    ? value
    : '/assets/kt.webp';
  const imageFor = item => localAsset(item && (item.thumbnail || item.image));

  const renderEpisodeDirectory = all => {
    const episodes = all.filter(item => item.kind === 'Odcinek' && item.url);
    const seasons = all.filter(item => item.kind === 'Sezon' && item.url);
    const creators = all.filter(item => item.kind === 'Twórca' && item.url);
    const episodeNumber = item => episodes
      .filter(candidate => slug(candidate.creator) === slug(item.creator))
      .findIndex(candidate => candidate.id === item.id) + 1;
    const episodeBadge = item => `<span class="episode-order episode-number-badge" aria-label="Odcinek ${episodeNumber(item)}">Odcinek ${episodeNumber(item)}</span>`;

    if (!episodes.length) return '<p class="muted-text">Nie dodano jeszcze odcinków do indeksu wiki.</p>';

    const seasonNavigation = `<nav class="season-jump-nav" aria-label="Przejdź do sezonu">${seasons.map(season => `<a href="#${esc(slug(season.slug || season.title))}">${esc(season.title)}</a>`).join('')}</nav>`;
    const seasonSections = seasons.map(season => {
      const seasonSlug = slug(season.slug || season.title);
      const items = episodes.filter(item => slug(item.season) === seasonSlug || item.season === season.title);
      const groups = creators
        .map(creator => ({
          creator,
          items: items.filter(item => slug(item.creator) === slug(creator.title))
        }))
        .filter(group => group.items.length);
      const cover = (season.thumbnail || season.image) && (season.thumbnail || season.image).startsWith('/assets/')
        ? `<img class="season-cover" alt="Grafika sezonu: ${esc(season.title)}" loading="lazy" src="${esc(imageFor(season))}">`
        : '';

      return `<section class="season-block" id="${esc(seasonSlug)}"><header class="season-block-heading">${cover}<div><h2>${esc(season.title)}</h2><p>${esc(season.summary || '')}</p></div><span>${items.length} odcinków</span></header><div class="season-grid">${groups.map(group => `<section class="season-creator"><header><img alt="${esc(group.creator.title)}" loading="lazy" src="${esc(imageFor(group.creator))}"><div><h3><a href="/tworca/${esc(slug(group.creator.title))}/">${esc(group.creator.title)}</a></h3></div></header><ol class="season-episode-list">${group.items.map(item => `<li><a class="season-episode-image" href="${esc(item.url)}" aria-label="Otwórz odcinek: ${esc(item.title)}"><img src="${esc(imageFor(item))}" alt="Miniatura odcinka: ${esc(item.title)}" loading="lazy"></a><div class="season-episode-info"><a class="episode-title-line" href="${esc(item.url)}">${episodeBadge(item)}<span>${esc(item.title)}</span></a><span class="episode-time-meta">${item.year ? `<span>${esc(item.year)}</span>` : ''}${item.duration ? `<span>${esc(item.duration)}</span>` : ''}</span><p>${esc(item.summary || '')}</p></div></li>`).join('')}</ol></section>`).join('') || '<p>Brak odcinków przypisanych do tego sezonu.</p>'}</div></section>`;
    }).join('') || '<p>Nie dodano jeszcze sezonów.</p>';

    return seasonNavigation + seasonSections;
  };

  const renderSearchFallback = all => all
    .filter(item => item && item.title && item.url)
    .map(item => {
      const creatorLink = item.creator
        ? `<span>Twórca: <a href="/tworca/${esc(slug(item.creator))}/">${esc(item.creator)}</a></span>`
        : '';
      const seasonLink = item.season
        ? `<span><a href="/odcinki/#${esc(slug(item.season))}">${esc(item.season)}</a></span>`
        : '';
      return `<article class="wiki-result"><span class="result-kind">${esc(item.kind || 'Hasło')}</span><h3><a href="${esc(item.url)}">${esc(item.title)}</a></h3><p>${esc(item.summary || '')}</p><div class="wiki-result-meta">${creatorLink}${seasonLink}</div></article>`;
    })
    .join('');

  return { renderEpisodeDirectory, renderSearchFallback };
});
