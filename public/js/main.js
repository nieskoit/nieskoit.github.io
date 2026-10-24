document.addEventListener("DOMContentLoaded", () => {
  const nav = document.querySelector(".nav");
  const menuToggle = document.querySelector(".menu-toggle");
  const navLinks = document.querySelector(".nav-links");

  // The homepage has two meaningful navigation destinations: the top-level universe
  // and the creators section. Keep aria-current and the visual active state in sync.
  const syncNavCurrent = () => {
    if (window.location.pathname !== "/" && window.location.pathname !== "/index.html") return;
    const links = [...(navLinks?.querySelectorAll(":scope > a") || [])];
    const universe = links.find(link => link.getAttribute("href") === "/");
    const creators = links.find(link => link.getAttribute("href") === "#tworcy" || link.getAttribute("href") === "/#tworcy");
    const onCreators = window.location.hash === "#tworcy";
    universe?.removeAttribute("aria-current");
    creators?.removeAttribute("aria-current");
    (onCreators ? creators : universe)?.setAttribute("aria-current", "page");
  };
  syncNavCurrent();
  window.addEventListener("hashchange", syncNavCurrent);
  navLinks?.querySelectorAll('a[href="/#tworcy"], a[href="#tworcy"]').forEach(link => {
    link.addEventListener("click", () => window.setTimeout(syncNavCurrent, 0));
  });

  function handleScroll() {
    nav.classList.toggle("scrolled", window.scrollY > 20);
  }

  window.addEventListener("scroll", handleScroll, { passive: true });
  handleScroll();

  const closeMenu = ({ restoreFocus = false } = {}) => {
    if (!navLinks || !menuToggle) return;
    navLinks.classList.remove("open");
    nav?.classList.remove("menu-open");
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Otwórz menu nawigacji");
    document.body.style.overflow = "";
    if (restoreFocus) menuToggle.focus();
  };

  menuToggle?.addEventListener("click", () => {
    const isOpen = navLinks.classList.toggle("open");
    nav?.classList.toggle("menu-open", isOpen);
    menuToggle.setAttribute("aria-expanded", String(isOpen));
    menuToggle.setAttribute("aria-label", isOpen ? "Zamknij menu nawigacji" : "Otwórz menu nawigacji");
    document.body.style.overflow = isOpen ? "hidden" : "";
    if (isOpen) navLinks.querySelector("a, summary")?.focus({ preventScroll: true });
  });

  navLinks?.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => closeMenu());
  });

  // A mobile menu behaves like a real navigation drawer: Escape/outside click close it,
  // and nested History links stay usable without trapping the user on the page.
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      const historyGroup = navLinks?.querySelector(".nav-group[open]");
      if (historyGroup) { historyGroup.removeAttribute("open"); historyGroup.querySelector("summary")?.focus(); return; }
      if (navLinks?.classList.contains("open")) closeMenu({ restoreFocus: true });
    }
    if (event.key === "Tab" && navLinks?.classList.contains("open") && window.matchMedia("(max-width: 900px)").matches) {
      const focusable = [...navLinks.querySelectorAll('a[href], summary, button:not([disabled]), [tabindex]:not([tabindex="-1"])')].filter(el => el.offsetParent !== null);
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }
  });
  document.addEventListener("pointerdown", (event) => {
    if (navLinks?.classList.contains("open") && !nav?.contains(event.target)) closeMenu();
  });
  // The dimmed backdrop is a pseudo-element on the nav; clicking it closes the drawer.
  nav?.addEventListener("click", event => {
    if (navLinks?.classList.contains("open") && event.target === nav) closeMenu();
  });
  navLinks?.querySelectorAll(".nav-group").forEach((group) => {
    group.querySelector("summary")?.addEventListener("click", () => {
      if (window.matchMedia("(max-width: 900px)").matches) {
        navLinks.querySelectorAll(".nav-group[open]").forEach(other => { if (other !== group) other.removeAttribute("open"); });
      }
    });
  });
  window.addEventListener("resize", () => {
    if (window.matchMedia("(min-width: 901px)").matches) closeMenu();
  }, { passive: true });

  const heroImages = [
    "assets/hero/hero-1.webp",
    "assets/hero/hero-2.webp",
  ];
  const heroLayers = [...document.querySelectorAll(".hero-background-image")];

  if (heroLayers.length === 2 && heroImages.length > 0) {
    const loadImage = (src) => new Promise((resolve) => {
      const image = new Image();
      image.onload = () => resolve(src);
      image.onerror = () => resolve(null);
      image.src = src;
    });

    Promise.all(heroImages.map(loadImage)).then((results) => {
      const availableImages = results.filter(Boolean);
      if (availableImages.length === 0) return;

      let currentImage = 0;
      let activeLayer = 0;
      heroLayers[0].src = availableImages[0];

      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || availableImages.length === 1) return;

      window.setInterval(() => {
        currentImage = (currentImage + 1) % availableImages.length;
        const nextLayer = activeLayer === 0 ? 1 : 0;

        heroLayers[nextLayer].src = availableImages[currentImage];
        heroLayers[nextLayer].classList.add("is-active");
        heroLayers[activeLayer].classList.remove("is-active");
        activeLayer = nextLayer;
      }, 10000);
    });
  }
});


// Local archive filtering. Supports query links from the global wiki search.
document.addEventListener("DOMContentLoaded", () => {
  const input = document.querySelector("#catalogSearch");
  const catalog = document.querySelector("[data-catalog]");
  if (input && catalog) {
    const cards = [...catalog.querySelectorAll(".lore-card")];
    const status = document.querySelector(".search-status");
    const empty = document.querySelector(".empty-state");
    const initial = new URLSearchParams(window.location.search).get("q");
    if (initial) input.value = initial;
    const update = () => {
      const q = input.value.trim().toLocaleLowerCase("pl");
      let count = 0;
      cards.forEach(card => {
        const show = card.textContent.toLocaleLowerCase("pl").includes(q);
        card.hidden = !show;
        card.classList.toggle("search-match", Boolean(q && show));
        if (show) count++;
      });
      if (status) status.textContent = q ? `${count} z ${cards.length} pasujących pozycji` : `${cards.length} pozycji`;
      if (empty) empty.hidden = count !== 0;
    };
    input.addEventListener("input", update);
    update();
  }
});

// Global wiki search: prioritize direct matches and explain only a few verified relationships.
document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("#wikiSearchForm");
  const input = document.querySelector("#wikiSearchInput");
  const typeFilter = document.querySelector("#wikiTypeFilter");
  const creatorFilter = document.querySelector("#wikiCreatorFilter");
  const results = document.querySelector("#wikiResultsList");
  if (!form || !input || !results || !Array.isArray(window.KT_WIKI_INDEX)) return;
  const index = window.KT_WIKI_INDEX.filter(item => item && item.published !== false);
  const byId = new Map(index.map(item => [item.id, item]));
  const params = new URLSearchParams(window.location.search);
  input.value = params.get("q") || "";
  if (typeFilter && params.get("type")) typeFilter.value = params.get("type");
  if (creatorFilter && params.get("creator")) creatorFilter.value = params.get("creator");
  const norm = value => String(value || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("pl");
  const esc = value => String(value ?? "").replace(/[&<>"']/g, ch => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));
  // Security boundary for URLs from the wiki index: allow same-site paths only.
  const safeLocalUrl = value => {
    if (typeof value !== "string" || !value || value.startsWith("//") || /[\\\s\u0000-\u001f\u007f]/.test(value) || /%(?:2f|5c|00|0[0-9a-f]|1[0-9a-f]|7f)/i.test(value)) return "/";
    let parsed;
    try { parsed = new URL(value, window.location.origin); } catch (_) { return "/"; }
    if (parsed.origin !== window.location.origin || !parsed.pathname.startsWith("/") || /(?:^|\/)\.{1,2}(?:\/|$)/.test(parsed.pathname)) return "/";
    return `${parsed.pathname}${parsed.search}${parsed.hash}`;
  };
  const safeAsset = value => {
    if (typeof value !== "string" || !value.startsWith("/assets/") || value.startsWith("//") || /[\\\s\u0000-\u001f\u007f]/.test(value) || /%(?:2f|5c|00|0[0-9a-f]|1[0-9a-f]|7f)/i.test(value)) return "/assets/kt.webp";
    let parsed;
    try { parsed = new URL(value, window.location.origin); } catch (_) { return "/assets/kt.webp"; }
    if (parsed.origin !== window.location.origin || !parsed.pathname.startsWith("/assets/") || parsed.pathname.split("/").some(part => part === "." || part === "..")) return "/assets/kt.webp";
    return `${parsed.pathname}${parsed.search}${parsed.hash}`;
  };
  const safeYouTubeUrl = value => {
    if (typeof value !== "string") return "";
    try {
      const parsed = new URL(value);
      const host = parsed.hostname.toLowerCase().replace(/^www\./, "");
      if (parsed.protocol !== "https:" || !["youtube.com", "m.youtube.com", "youtu.be"].includes(host)) return "";
      if (host === "youtu.be" && !parsed.pathname.slice(1)) return "";
      if (host.endsWith("youtube.com") && !["/watch", "/shorts/", "/embed/"].some(prefix => parsed.pathname.startsWith(prefix))) return "";
      return parsed.href;
    } catch (_) { return ""; }
  };
  const highlight = (value, query) => {
    let html = esc(value);
    const terms = query.trim().split(/\s+/).filter(term => term.length > 1).sort((a,b) => b.length-a.length);
    terms.forEach(term => {
      const safe = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      try { html = html.replace(new RegExp(`(${safe})`, "ig"), "<mark>$1</mark>"); } catch (_) {}
    });
    return html;
  };
  const relationReason = (item, rel) => {
    if (rel.kind === "Twórca" && item.creator && rel.title === item.creator) return `Odcinek lub wątek z perspektywy ${rel.title}.`;
    if (item.kind === "Odcinek" && rel.kind === "Postać") return `Ta postać pojawia się w opisie odcinka „${item.title}”.`;
    if (item.kind === "Odcinek" && rel.kind === "Rozdział") return `Ten odcinek jest przypisany do rozdziału „${rel.title}”.`;
    if (item.kind === "Rozdział" && rel.kind === "Odcinek") return `Ten odcinek jest częścią rozdziału „${item.title}”.`;
    if (item.kind === "Postać" && rel.kind === "Odcinek") return `W opisie tego odcinka pojawia się ${item.title}.`;
    if (item.kind === "Postać" && rel.kind === "Rozdział") return `Rozdział „${rel.title}” obejmuje wątek tej postaci.`;
    if (item.kind === "Rozdział" && rel.kind === "Postać") return `Ta postać jest związana z wydarzeniami rozdziału „${item.title}”.`;
    if (item.kind === "Twórca" && rel.kind === "Odcinek" && rel.creator === item.title) return `To odcinek z perspektywy ${item.title}.`;
    if (item.kind === "Twórca" && rel.kind === "Rozdział" && rel.creator === item.title) return `Rozdział z perspektywy ${item.title}.`;
    if (rel.kind === "Sezon") return `To hasło jest przypisane do ${rel.title}.`;
    return "";
  };
  const render = () => {
    const query = input.value.trim();
    const q = norm(query);
    const type = typeFilter?.value || "all";
    const creator = creatorFilter?.value || "all";
    const scored = index.map(item => {
      const title = norm(item.title);
      const text = norm([item.summary, ...(item.aliases||[]), item.creator, item.season].join(" "));
      let score = 0;
      if (q) {
        if (title === q) score += 150;
        else if (title.includes(q)) score += 90;
        if ((item.aliases||[]).some(alias => norm(alias) === q)) score += 100;
        if (text.includes(q)) score += 25;
        const terms = q.split(/\s+/).filter(Boolean);
        if (terms.length > 1 && terms.every(term => (title+' '+text).includes(term))) score += 10;
      }
      return {item, score};
    }).filter(({item,score}) => (!q || score>0) && (type==='all'||item.kind===type) && (creator==='all'||item.creator===creator));
    scored.sort((a,b) => b.score-a.score || a.item.title.localeCompare(b.item.title,'pl'));
    const searching = Boolean(q || type !== 'all' || creator !== 'all');
    const directRows = searching ? scored.filter(row=>!q || row.score>0) : [];
    results.innerHTML = directRows.map(({item}) => {
      const relations = (item.related||[])
        .map(id=>byId.get(id)).filter(Boolean)
        .filter(rel => rel.id !== item.id && rel.kind !== 'Sezon' && (type==='all'||rel.kind===type) && (creator==='all'||rel.creator===creator))
        .map(rel => ({rel, reason: relationReason(item, rel)}))
        .filter(entry => entry.reason)
        .filter((entry, i, arr) => arr.findIndex(other => other.rel.id===entry.rel.id)===i)
        .slice(0,3);
      const relationBlock = relations.length ? `<div class="wiki-relations"><strong>Dlaczego powiązane?</strong><ul>${relations.map(({rel,reason})=>`<li><a class="relation-chip" href="${esc(safeLocalUrl(rel.url))}">${esc(rel.title)}</a><span>${esc(reason)}</span></li>`).join("")}</ul></div>` : "";
      const creatorLink = item.creator ? `<span>Twórca: <a href="/#tworcy${norm(item.creator)==='kaicek'?'kaicek':norm(item.creator)==='dombeek'?'dombeek':'nieskot'}/">${esc(item.creator)}</a></span>` : "";
      const seasonLink = item.season ? `<span><a href="/odcinki/#${norm(item.season).replace(/\s+/g,'-')}">${esc(item.season)}</a></span>` : "";
      return `<article class="wiki-result is-direct"><span class="result-kind">${esc(item.kind)}</span><h3><a href="${esc(safeLocalUrl(item.url))}">${highlight(item.title,query)}</a></h3><p>${highlight(item.summary,query)}</p><div class="wiki-result-meta">${creatorLink}${seasonLink}</div>${relationBlock}</article>`;
    }).join("");
    const title = document.querySelector("#wikiResultsTitle");
    const count = document.querySelector("#wikiResultsCount");
    const empty = document.querySelector("#wikiNoResults");
    if (title) title.textContent = query ? `Wyniki dla „${query}”` : searching ? "Wyniki wyszukiwania" : "Znajdź hasło";
    if (count) count.textContent = q ? `${directRows.length} dopasowanych haseł. Powiązania pokazuję tylko tam, gdzie mogę wyjaśnić ich sens.` : searching ? `${directRows.length} haseł pasuje do wybranych filtrów.` : "Wpisz frazę albo wybierz filtr.";
    if (empty) { empty.hidden = directRows.length !== 0; empty.textContent = searching ? "Nie znaleziono pasujących haseł. Spróbuj krótszej frazy albo wybierz inny typ wpisu." : "Wpisz nazwę filmu, postaci, twórcy lub pojęcia, aby zobaczyć wyniki."; }
  };
  form.addEventListener("submit", event => {
    event.preventDefault();
    const next = new URL(window.location.href);
    if (input.value.trim()) next.searchParams.set("q",input.value.trim()); else next.searchParams.delete("q");
    if(typeFilter?.value && typeFilter.value!=='all')next.searchParams.set('type',typeFilter.value);else next.searchParams.delete('type');
    if(creatorFilter?.value&&creatorFilter.value!=='all')next.searchParams.set('creator',creatorFilter.value);else next.searchParams.delete('creator');
    window.history.replaceState({},'',next); render();
  });
  input.addEventListener("input",render);
  typeFilter?.addEventListener("change",render);
  creatorFilter?.addEventListener("change",render);
  render();
});

// If a search query is carried into a page, gently highlight matching text and related entries.
document.addEventListener("DOMContentLoaded", () => {
  const query = new URLSearchParams(window.location.search).get("q");
  if (!query || query.length < 2 || document.querySelector("#wikiSearchForm")) return;
  const terms = query.toLocaleLowerCase("pl").split(/\s+/).filter(term=>term.length>1);
  document.querySelectorAll(".lore-article a, .lore-sidebar a, .card-relations a, .episode-context a, .breadcrumbs a").forEach(link=>{
    if (terms.some(term=>link.textContent.toLocaleLowerCase("pl").includes(term))) link.classList.add("query-related-highlight");
  });
  const title = document.querySelector("h1");
  if (title && terms.some(term=>title.textContent.toLocaleLowerCase("pl").includes(term))) title.classList.add("query-title-highlight");
});



// Homepage recommendations are generated from the shared wiki index.
// Adding a published episode to js/wiki-search-index.js automatically makes it eligible.
document.addEventListener("DOMContentLoaded", () => {
  const grid = document.querySelector("#featured-grid");
  if (!grid) return;
  const index = (Array.isArray(window.KT_WIKI_INDEX) ? window.KT_WIKI_INDEX : []).filter(item => item && item.published !== false);
  const creatorImages = Object.fromEntries(index
    .filter(item => item.kind === "Twórca" && item.image)
    .map(item => [item.title, item.image]));
  const items = index.filter(item => item.kind === "Odcinek" && item.url && item.creator).map(item => {
    const search = new URLSearchParams({search_query: `${item.creator} ${item.title}`});
    const episodeImage = [item.thumbnail, item.image]
      .find(src => typeof src === "string" && src.startsWith("/assets/") && !src.includes(".."));
    const image = safeAsset(episodeImage || creatorImages[item.creator] || "/assets/kt.webp");
    return {
      title: item.title,
      creator: item.creator,
      year: item.year || "",
      // KT10 GRAFIKA STRONY GŁÓWNEJ: najpierw własna miniaturka odcinka,
      // potem starsze pole image, na końcu avatar twórcy i lokalna grafika zastępcza.
      image,
      imageAlt: item.thumbnailAlt || (episodeImage
        ? `Miniatura odcinka: ${item.title}`
        : creatorImages[item.creator] ? item.creator : "Logo Krainy Twórców"),
      watch: safeYouTubeUrl(item.youtube) || `https://www.youtube.com/results?${search.toString()}`,
      read: safeLocalUrl(item.url)
    };
  });
  if (!items.length) {
    grid.innerHTML = "";
    return;
  }
  const shuffle = array => {
    const result = [...array];
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  };
  let order = shuffle(items);
  const prev = document.querySelector("#featured-prev");
  const next = document.querySelector("#featured-next");
  const esc = value => String(value ?? "").replace(/[&<>"']/g, ch => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));
  // Security boundary for URLs from the wiki index: allow same-site paths only.
  const safeLocalUrl = value => {
    if (typeof value !== "string" || !value || value.startsWith("//") || /[\\\s\u0000-\u001f\u007f]/.test(value) || /%(?:2f|5c|00|0[0-9a-f]|1[0-9a-f]|7f)/i.test(value)) return "/";
    let parsed;
    try { parsed = new URL(value, window.location.origin); } catch (_) { return "/"; }
    if (parsed.origin !== window.location.origin || !parsed.pathname.startsWith("/") || /(?:^|\/)\.{1,2}(?:\/|$)/.test(parsed.pathname)) return "/";
    return `${parsed.pathname}${parsed.search}${parsed.hash}`;
  };
  const safeAsset = value => {
    if (typeof value !== "string" || !value.startsWith("/assets/") || value.startsWith("//") || /[\\\s\u0000-\u001f\u007f]/.test(value) || /%(?:2f|5c|00|0[0-9a-f]|1[0-9a-f]|7f)/i.test(value)) return "/assets/kt.webp";
    let parsed;
    try { parsed = new URL(value, window.location.origin); } catch (_) { return "/assets/kt.webp"; }
    if (parsed.origin !== window.location.origin || !parsed.pathname.startsWith("/assets/") || parsed.pathname.split("/").some(part => part === "." || part === "..")) return "/assets/kt.webp";
    return `${parsed.pathname}${parsed.search}${parsed.hash}`;
  };
  const safeYouTubeUrl = value => {
    if (typeof value !== "string") return "";
    try {
      const parsed = new URL(value);
      const host = parsed.hostname.toLowerCase().replace(/^www\./, "");
      if (parsed.protocol !== "https:" || !["youtube.com", "m.youtube.com", "youtu.be"].includes(host)) return "";
      if (host === "youtu.be" && !parsed.pathname.slice(1)) return "";
      if (host.endsWith("youtube.com") && !["/watch", "/shorts/", "/embed/"].some(prefix => parsed.pathname.startsWith(prefix))) return "";
      return parsed.href;
    } catch (_) { return ""; }
  };
  const render = () => {
    grid.innerHTML = order.slice(0, 3).map(item => `
      <article class="featured-card">
        <a class="featured-card-image" href="${esc(safeLocalUrl(item.read))}" aria-label="Czytaj opis: ${esc(item.title)}">
          <img src="${esc(safeAsset(item.image))}" alt="${esc(item.imageAlt)}" loading="lazy" onerror="this.onerror=null;this.src='/assets/kt.webp';this.alt='Logo Krainy Twórców'">
        </a>
        <div class="featured-card-body">
          <h3><a href="${esc(safeLocalUrl(item.read))}">${esc(item.title)}</a></h3>
          <div class="featured-card-meta">${esc(item.creator)}${item.year ? ` <span aria-hidden="true">·</span> ${esc(item.year)}` : ""}</div>
          <div class="featured-card-actions">
            <a class="button button-secondary" href="${esc(safeLocalUrl(item.read))}">Czytaj opis</a>
            <a class="button button-primary" href="${esc(safeYouTubeUrl(item.watch) || "/")}" target="_blank" rel="noopener noreferrer">Obejrzyj na YouTube ↗</a>
          </div>
        </div>
      </article>`).join("");
  };
  const rotate = direction => {
    if (order.length <= 3) {
      if (direction > 0) order.push(order.shift());
      else order.unshift(order.pop());
    } else {
      grid.classList.add("is-changing");
      window.setTimeout(() => {
        if (direction > 0) order.push(order.shift());
        else order.unshift(order.pop());
        render();
        grid.classList.remove("is-changing");
      }, 120);
      return;
    }
    render();
  };
  prev?.addEventListener("click", () => rotate(-1));
  next?.addEventListener("click", () => rotate(1));
  render();
});

// Global fullscreen search. Compact catalogue rows keep the results readable and useful.
document.addEventListener("DOMContentLoaded", () => {
  if (document.querySelector(".kt-search-overlay")) return;
  const index = (Array.isArray(window.KT_WIKI_INDEX) ? window.KT_WIKI_INDEX : []).filter(item => item && item.published !== false);
  const overlay = document.createElement("section");
  overlay.className = "kt-search-overlay";
  overlay.id = "ktSearchOverlay";
  overlay.setAttribute("role", "dialog");
  overlay.setAttribute("aria-modal", "true");
  overlay.setAttribute("aria-label", "Wyszukiwarka Krainy Twórców");
  overlay.innerHTML = `
    <div class="kt-search-top">
      <div class="kt-search-field-wrap"><input class="kt-search-input" id="ktSearchInput" type="search" autocomplete="off" placeholder="Szukaj odcinka, postaci, twórcy…" aria-label="Szukaj w Krainie Twórców"></div>
      <span class="kt-search-shortcut">ESC</span>
      <button class="kt-search-close" type="button" aria-label="Zamknij wyszukiwarkę">×</button>
    </div>
    <div class="kt-search-content">
      <div class="kt-search-status-row"><p class="kt-search-hint" id="ktSearchHint">Szukaj w historii i uniwersum.</p><a class="kt-search-all" href="/szukaj/?mode=full">Pełna wyszukiwarka <span aria-hidden="true">↗</span></a></div>
      <nav class="kt-search-quicklinks" aria-label="Popularne kategorie">
        <button type="button" data-search-kind="Odcinek">Odcinki</button>
        <button type="button" data-search-kind="Postać">Postacie</button>
        <button type="button" data-search-kind="Twórca">Twórcy</button>
        <button type="button" data-search-kind="Rozdział">Rozdziały</button>
        <button type="button" data-search-kind="Sezon">Sezony</button>
      </nav>
      <div class="kt-search-section-label" id="ktSearchSectionLabel">Na początek</div>
      <div class="kt-search-results" id="ktSearchResults"></div>
    </div>`;
  document.body.appendChild(overlay);
  const input = overlay.querySelector("#ktSearchInput");
  const results = overlay.querySelector("#ktSearchResults");
  const hint = overlay.querySelector("#ktSearchHint");
  const sectionLabel = overlay.querySelector("#ktSearchSectionLabel");
  const closeButton = overlay.querySelector(".kt-search-close");
  const fullSearchLink = overlay.querySelector(".kt-search-all");
  const norm = value => String(value || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("pl").trim();
  const esc = value => String(value ?? "").replace(/[&<>"']/g, ch => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));
  // Security boundary for URLs from the wiki index: allow same-site paths only.
  const safeLocalUrl = value => {
    if (typeof value !== "string" || !value || value.startsWith("//") || /[\\\s\u0000-\u001f\u007f]/.test(value) || /%(?:2f|5c|00|0[0-9a-f]|1[0-9a-f]|7f)/i.test(value)) return "/";
    let parsed;
    try { parsed = new URL(value, window.location.origin); } catch (_) { return "/"; }
    if (parsed.origin !== window.location.origin || !parsed.pathname.startsWith("/") || /(?:^|\/)\.{1,2}(?:\/|$)/.test(parsed.pathname)) return "/";
    return `${parsed.pathname}${parsed.search}${parsed.hash}`;
  };
  const safeAsset = value => {
    if (typeof value !== "string" || !value.startsWith("/assets/") || value.startsWith("//") || /[\\\s\u0000-\u001f\u007f]/.test(value) || /%(?:2f|5c|00|0[0-9a-f]|1[0-9a-f]|7f)/i.test(value)) return "/assets/kt.webp";
    let parsed;
    try { parsed = new URL(value, window.location.origin); } catch (_) { return "/assets/kt.webp"; }
    if (parsed.origin !== window.location.origin || !parsed.pathname.startsWith("/assets/") || parsed.pathname.split("/").some(part => part === "." || part === "..")) return "/assets/kt.webp";
    return `${parsed.pathname}${parsed.search}${parsed.hash}`;
  };
  const safeYouTubeUrl = value => {
    if (typeof value !== "string") return "";
    try {
      const parsed = new URL(value);
      const host = parsed.hostname.toLowerCase().replace(/^www\./, "");
      if (parsed.protocol !== "https:" || !["youtube.com", "m.youtube.com", "youtu.be"].includes(host)) return "";
      if (host === "youtu.be" && !parsed.pathname.slice(1)) return "";
      if (host.endsWith("youtube.com") && !["/watch", "/shorts/", "/embed/"].some(prefix => parsed.pathname.startsWith(prefix))) return "";
      return parsed.href;
    } catch (_) { return ""; }
  };
  // Use the same manually maintained metadata as the rest of the wiki index.
  const entityImages = Object.fromEntries(index.filter(item => { const src = item.thumbnail || item.image; return safeAsset(src) !== "/assets/kt.webp" || src === "/assets/kt.webp"; }).map(item => [item.id, safeAsset(item.thumbnail || item.image)]));
  let previousFocus = null;
  const renderRow = item => {
    const isEpisode = item.kind === "Odcinek";
    const image = entityImages[item.id];
    const relatedImageAlt = index.find(candidate =>
      candidate.id !== item.id &&
      (candidate.thumbnail || candidate.image) === image &&
      candidate.thumbnailAlt
    )?.thumbnailAlt;
    const imageAlt = item.thumbnailAlt || relatedImageAlt || (
      item.kind === "Twórca" || item.kind === "Postać"
        ? item.title
        : item.kind === "Rozdział"
          ? `Okładka: ${item.title}`
          : item.kind === "Sezon"
            ? `Grafika sezonu: ${item.title}`
            : `Miniatura odcinka: ${item.title}`
    );
    const meta = [item.kind, item.creator, item.year || item.season].filter(Boolean).join(" · ");
    return `<a class="kt-search-result${isEpisode ? " is-episode" : ""}" href="${esc(safeLocalUrl(item.url))}">
      ${image ? `<span class="kt-search-thumb"><img src="${esc(safeAsset(image))}" alt="${esc(imageAlt)}" loading="lazy"></span>` : `<span class="kt-search-symbol" aria-hidden="true">${item.kind === "Postać" ? "◇" : item.kind === "Twórca" ? "@" : item.kind === "Rozdział" ? "§" : item.kind === "Sezon" ? "↗" : "⌕"}</span>`}
      <span class="kt-search-result-copy"><span class="kt-search-meta">${esc(meta)}</span><strong>${esc(item.title)}</strong>${item.summary ? `<span class="kt-search-summary">${esc(item.summary)}</span>` : ""}</span>
      <span class="kt-search-arrow" aria-hidden="true">↗</span>
    </a>`;
  };
  const renderResults = () => {
    const query = input.value.trim();
    const q = norm(query);
    const activeKind = overlay.querySelector(".kt-search-quicklinks button.is-active")?.dataset.searchKind || "";
    if (!q && !activeKind) {
      hint.textContent = "Odcinki, postacie i miejsca z historii Krainy Twórców.";
      sectionLabel.textContent = "Na początek";
      const startIds = ["episode-nieskot-1", "episode-nieskot-2", "episode-nieskot-3"];
      const picks = startIds.map(id => index.find(item => item.id === id)).filter(Boolean);
      results.innerHTML = picks.map(renderRow).join("") || `<div class="kt-search-empty">Zacznij pisać, aby wyszukać hasło.</div>`;
      return;
    }
    let pool = index;
    if (activeKind) pool = pool.filter(item => item.kind === activeKind);
    if (!q) {
      hint.textContent = `${pool.length} haseł`;
      sectionLabel.textContent = activeKind === "Odcinek" ? "Odcinki" : activeKind === "Postać" ? "Postacie" : activeKind === "Twórca" ? "Twórcy" : activeKind === "Rozdział" ? "Rozdziały" : "Sezony";
      results.innerHTML = pool.slice(0, 12).map(renderRow).join("") || `<div class="kt-search-empty">Brak haseł w tej kategorii.</div>`;
      return;
    }
    const terms = q.split(/\s+/).filter(Boolean);
    const matches = pool.map(item => {
      const title = norm(item.title);
      const aliases = (item.aliases || []).map(norm);
      const searchable = norm([item.title, item.summary, item.creator, item.season, ...aliases].join(" "));
      let score = 0;
      if (title === q) score += 200;
      if (aliases.some(alias => alias === q)) score += 180;
      if (title.includes(q)) score += 100;
      if (aliases.some(alias => alias.includes(q))) score += 90;
      if (searchable.includes(q)) score += 40;
      if (terms.length > 1 && terms.every(term => searchable.includes(term))) score += 15;
      return {item, score};
    }).filter(entry => entry.score > 0).sort((a,b) => b.score - a.score || a.item.title.localeCompare(b.item.title, "pl")).slice(0, 16);
    hint.textContent = matches.length ? `${matches.length} wyników` : "Nie znaleziono wyników.";
    sectionLabel.textContent = "Wyniki wyszukiwania";
    results.innerHTML = matches.length ? matches.map(({item}) => renderRow(item)).join("") : `<div class="kt-search-empty">Spróbuj innego tytułu, nazwiska lub aliasu.</div>`;
  };
  const open = ({ query = "", kind = "" } = {}) => {
    previousFocus = document.activeElement;
    // Close the mobile drawer before opening search so it cannot cover the input.
    const nav = document.querySelector(".nav");
    const navLinks = document.querySelector(".nav-links");
    const menuToggle = document.querySelector(".menu-toggle");
    navLinks?.classList.remove("open");
    nav?.classList.remove("menu-open");
    menuToggle?.setAttribute("aria-expanded", "false");
    menuToggle?.setAttribute("aria-label", "Otwórz menu nawigacji");
    overlay.classList.add("is-open");
    document.body.style.overflow = "hidden";
    input.value = query;
    overlay.querySelectorAll(".kt-search-quicklinks button").forEach(button => {
      button.classList.toggle("is-active", button.dataset.searchKind === kind);
    });
    renderResults();
    updateFullSearchLink();
    // Focus after the overlay becomes visible; this is more reliable on mobile browsers.
    window.requestAnimationFrame(() => input.focus({ preventScroll: true }));
  };
  const close = () => {
    overlay.classList.remove("is-open");
    document.body.style.overflow = "";
    if (previousFocus && typeof previousFocus.focus === "function") previousFocus.focus();
  };
  const updateFullSearchLink = () => {
    const target = new URL("/szukaj/", window.location.origin);
    target.searchParams.set("mode", "full");
    const query = input.value.trim();
    if (query) target.searchParams.set("q", query);
    const activeKind = overlay.querySelector(".kt-search-quicklinks button.is-active")?.dataset.searchKind;
    if (activeKind) target.searchParams.set("type", activeKind);
    fullSearchLink.href = `${target.pathname}${target.search}`;
  };
  input.addEventListener("input", () => {
    updateFullSearchLink();
    renderResults();
  });
  updateFullSearchLink();
  overlay.querySelectorAll(".kt-search-quicklinks button").forEach(button => button.addEventListener("click", () => {
    const wasActive = button.classList.contains("is-active");
    overlay.querySelectorAll(".kt-search-quicklinks button").forEach(other => other.classList.remove("is-active"));
    if (!wasActive) button.classList.add("is-active");
    input.value = "";
    updateFullSearchLink();
    renderResults();
    input.focus();
  }));
  closeButton.addEventListener("click", close);
  overlay.addEventListener("click", event => { if (event.target === overlay) close(); });
  document.querySelectorAll('a[href="/szukaj/"], a[href="/szukaj"]').forEach(link => {
    link.addEventListener("click", event => {
      event.preventDefault();
      const navLinks = document.querySelector(".nav-links");
      const toggle = document.querySelector(".menu-toggle");
      navLinks?.classList.remove("open");
      document.querySelector(".nav")?.classList.remove("menu-open");
      toggle?.setAttribute("aria-expanded", "false");
      toggle?.setAttribute("aria-label", "Otwórz menu nawigacji");
      document.body.style.overflow = "";
      open();
    });
    const quickSearchButton = document.querySelector("[data-open-quick-search]");
    if (quickSearchButton) {
      quickSearchButton.hidden = false;
      quickSearchButton.addEventListener("click", () => {
        open({
          query: document.querySelector("#wikiSearchInput")?.value.trim() || "",
          kind: document.querySelector("#wikiTypeFilter")?.value || ""
        });
      });
    }
  });
  document.addEventListener("keydown", event => {
    if (overlay.classList.contains("is-open") && event.key === "Tab") {
      const focusable = [...overlay.querySelectorAll('a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])')];
      if (focusable.length) {
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      }
    }
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
      event.preventDefault();
      if (!overlay.classList.contains("is-open")) open(); else input.focus();
    }
    if (event.key === "Escape" && overlay.classList.contains("is-open")) close();
  });
});
