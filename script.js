"use strict";

/* =====================================================================
   PIXEL VAULT // ARCADE SYSTEM
   ---------------------------------------------------------------------
   To add a game: put its folder next to this file, then add ONE object
   to the GAMES array below. Nothing else needs to change.

   Fields
     id           unique slug (required)
     title        display name (required)
     folder       directory name, spaces allowed (required)
     entry        file inside the folder, nested paths allowed
                  (default "index.html")
     genre        "Arcade / Endless" - the parts split by "/" become filter tags
     description  short blurb
     controls     e.g. "Keyboard / Mouse"
     featured     true = candidate for the Featured panel (first one wins)
     enabled      false = hidden from the library and cannot be launched
     cover        optional image path relative to this page,
                  e.g. "assets/covers/flappy-bird.png"; empty = CSS placeholder
   ===================================================================== */

const SITE = {
  name: "PIXEL VAULT",
  repoUrl: "" // e.g. "https://github.com/AbhiGradient/games"; empty hides the link
};

const GAMES = [
  {
    id: "flappy-bird",
    title: "FLAPPY BIRD",
    folder: "flappy bird",
    entry: "index.html",
    genre: "Arcade / Endless",
    description: "Navigate the endless obstacle course. Keep flying, avoid the pipes, and beat your highest score.",
    controls: "Keyboard / Mouse",
    featured: false,
    enabled: true,
    cover: "assets/covers/flappy.jpg"
  },
    {
    id: "hellbreach",
    title: "HELLBREACH",
    externalUrl: "https://doom-1-0tlz.onrender.com",
    genre: "First-Person Shooter",
    description: "Enter a hostile sci-fi facility, arm yourself, and fight your way through the breach.",
    controls: "Keyboard / Mouse",
    featured: true,
    enabled: true,
    cover: "assets/covers/doom.jpg"
  },
   {
    id: "mario",
    title: "SUPER MARIO",
    folder: "MARIO",
    entry: "index.html",
    genre: "Platformer / Arcade",
    description: "Jump across platforms, dodge enemies, and explore the world.",
    controls: "Keyboard",
    featured: false,
    enabled: true,
    cover: "assets/covers/mario.jpg"
  }
];

/* ===================================================================== */

(() => {
  const $ = (sel, root = document) => root.querySelector(sel);
  const root = document.documentElement;
  const reduceMQ = window.matchMedia("(prefers-reduced-motion: reduce)");

  /* ---------- storage (never throws) ---------- */
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* ignore */ } },
    sget(k) { try { return sessionStorage.getItem(k); } catch (e) { return null; } },
    sset(k, v) { try { sessionStorage.setItem(k, v); } catch (e) { /* ignore */ } }
  };

  /* ---------- helpers ---------- */
  function el(tag, cls, text) {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

  const str = (v) => (typeof v === "string" ? v.trim() : "");

  /** Encode each segment of a relative path; reject traversal / absolute / scheme paths. */
  function encodePath(path) {
    const raw = String(path).replace(/\\/g, "/");
    if (/^[a-z][a-z0-9+.-]*:/i.test(raw) || raw.startsWith("/") || raw.startsWith("//")) return null;
    const segs = raw.split("/").filter((s) => s !== "" && s !== ".");
    if (!segs.length || segs.some((s) => s === "..")) return null;
    return segs.map(encodeURIComponent).join("/");
  }

  function resolveRelative(path) {
    const enc = encodePath(path);
    if (!enc) return null;
    try {
      const url = new URL(enc, document.baseURI);
      return url.origin === new URL(document.baseURI).origin ? url : null;
    } catch (e) { return null; }
  }

    function gameURL(game) {
    if (game.externalUrl) {
      try {
        const u = new URL(game.externalUrl);
        return /^https?:$/.test(u.protocol) ? u : null;
      } catch (e) { return null; }
    }
    const folder = encodePath(game.folder);
    const entry = encodePath(game.entry || "index.html");
    if (!folder || !entry) return null;
    return resolveRelative(`${game.folder}/${game.entry || "index.html"}`);
  }

  function coverURL(game) {
    if (!game.cover) return null;
    if (/^https:\/\//i.test(game.cover)) return game.cover;
    const u = resolveRelative(game.cover);
    return u ? u.href : null;
  }

  function tagsOf(game) {
    return game.genre.split("/").map((s) => s.trim()).filter(Boolean);
  }

  function hueOf(text) {
    let h = 0;
    for (let i = 0; i < text.length; i++) h = (h * 31 + text.charCodeAt(i)) >>> 0;
    return h % 360;
  }

  function initialsOf(title) {
    const words = title.replace(/[^A-Za-z0-9 ]+/g, " ").split(/\s+/).filter(Boolean);
    if (!words.length) return "??";
    if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
    return words.slice(0, 3).map((w) => w[0]).join("").toUpperCase();
  }

  /* ---------- config validation ---------- */
  function validate(list) {
    const problems = [];
    const seen = new Set();
    const games = [];
    if (!Array.isArray(list)) return { games, problems: ["GAMES is not an array."] };

    list.forEach((g, i) => {
      const where = `GAMES[${i}]`;
      if (!g || typeof g !== "object") { problems.push(`${where}: not an object.`); return; }
      const id = str(g.id);
      const title = str(g.title);
      const folder = str(g.folder);
      const entry = str(g.entry) || "index.html";
      const externalUrl = str(g.externalUrl);
      if (!id) { problems.push(`${where}: missing "id".`); return; }
      if (seen.has(id)) { problems.push(`${where}: duplicate id "${id}" skipped.`); return; }
      if (!title) { problems.push(`${where} (${id}): missing "title".`); return; }
      if (!folder && !externalUrl) { problems.push(`${where} (${id}): needs "folder" or "externalUrl".`); return; }
      seen.add(id);
      const game = {
        id, title, folder, entry, externalUrl,
        genre: str(g.genre) || "Uncategorised",
        description: str(g.description) || "No description yet.",
        controls: str(g.controls) || "See game",
        featured: g.featured === true,
        enabled: g.enabled !== false,
        cover: str(g.cover),
        order: games.length
      };
      game.url = gameURL(game);
      if (!game.url) problems.push(`${where} (${id}): invalid folder/entry path; it cannot be launched.`);
      games.push(game);
    });
    return { games, problems };
  }

  const { games: ALL, problems } = validate(GAMES);
  problems.forEach((p) => console.warn("[PIXEL VAULT] " + p));
  const LIVE = ALL.filter((g) => g.enabled);
  const BY_ID = new Map(ALL.map((g) => [g.id, g]));

  /* ---------- preferences ---------- */
  const prefs = {
    sound: store.get("pv.sound") === "1",
    crt: store.get("pv.crt") !== "0",
    fx: store.get("pv.fx") === null ? !reduceMQ.matches : store.get("pv.fx") === "1"
  };

  function applyPrefs() {
    root.classList.toggle("crt-off", !prefs.crt);
    root.classList.toggle("fx-off", !prefs.fx);
    [["toggleSound", prefs.sound], ["toggleCrt", prefs.crt], ["toggleFx", prefs.fx]].forEach(([id, on]) => {
      const b = document.getElementById(id);
      if (!b) return;
      b.setAttribute("aria-pressed", String(on));
      b.querySelector(".state").textContent = on ? "ON" : "OFF";
    });
  }

  /* ---------- sound (Web Audio, off by default, starts only after a click) ---------- */
  let audioCtx = null;
  function beep(freq, dur, type, vol) {
    if (!prefs.sound) return;
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      audioCtx = audioCtx || new AC();
      if (audioCtx.state === "suspended") audioCtx.resume();
      const o = audioCtx.createOscillator();
      const g = audioCtx.createGain();
      o.type = type || "square";
      o.frequency.value = freq;
      const t = audioCtx.currentTime;
      g.gain.setValueAtTime(vol || 0.04, t);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.connect(g).connect(audioCtx.destination);
      o.start(t);
      o.stop(t + dur);
    } catch (e) { /* audio is optional */ }
  }
  const sfx = {
    hover: () => beep(660, 0.04, "square", 0.02),
    click: () => beep(440, 0.07, "square", 0.04),
    launch: () => { beep(330, 0.09); setTimeout(() => beep(495, 0.09), 90); setTimeout(() => beep(660, 0.14), 180); }
  };

  /* ---------- rendering ---------- */
  function buildCover(game) {
    const cover = el("div", "cover");
    cover.style.setProperty("--h", String(hueOf(game.id)));

    const ph = el("div", "placeholder");
    ph.setAttribute("aria-hidden", "true");
    ph.append(el("span", "placeholder-initials", initialsOf(game.title)), el("span", "placeholder-title", game.title));
    cover.append(ph);

    const src = coverURL(game);
    if (src) {
      const img = new Image();
      img.loading = "lazy";
      img.decoding = "async";
      img.alt = `${game.title} cover art`;
      img.addEventListener("load", () => cover.classList.add("has-image"));
      img.addEventListener("error", () => img.remove());
      img.src = src;
      cover.append(img);
    }
    return cover;
  }

  function buildMeta(game) {
    const dl = el("dl", "meta");
    [["GENRE", game.genre], ["CONTROLS", game.controls]].forEach(([k, v]) => {
      const row = el("div");
      row.append(el("dt", null, k), el("dd", null, v));
      dl.append(row);
    });
    return dl;
  }

  function buildLaunch(game, label) {
    if (!game.url) {
      const b = el("span", "btn btn-ghost", "UNAVAILABLE");
      b.setAttribute("role", "link");
      b.setAttribute("aria-disabled", "true");
      return [b, el("p", "launch-error", "LAUNCH ERROR // INVALID GAME PATH")];
    }
    const a = el("a", "btn btn-primary", label);
    a.href = game.url.href;
    a.dataset.launch = game.id;
    a.setAttribute("aria-label", `${label === "PLAY" ? "Play" : "Play now:"} ${game.title}`);
    return [a];
  }

  function buildCard(game) {
    const card = el("article", "card");
    card.dataset.id = game.id;

    const badges = el("div", "badges");
    badges.append(el("span", "badge badge-live", "● READY"));
    if (game.featured) badges.append(el("span", "badge badge-feat", "★ FEATURED"));

    const cover = buildCover(game);
    const body = el("div", "card-body");
    body.append(el("h3", null, game.title), el("p", "card-desc", game.description), buildMeta(game), ...buildLaunch(game, "PLAY"));

    card.append(badges, cover, body);
    return card;
  }

  function renderFeatured() {
    const mount = $("#featuredMount");
    mount.replaceChildren();
    const game = LIVE.find((g) => g.featured) || LIVE[0];
    if (!game) {
      mount.append(el("p", "featured-empty", "NO GAMES REGISTERED // ADD ONE IN script.js"));
      return;
    }
    const info = el("div", "featured-info");
    const tag = el("p", "eyebrow", game.featured ? "★ FEATURED" : "★ FIRST IN LIBRARY");
    info.append(tag, el("h3", null, game.title), el("p", "desc", game.description), buildMeta(game), ...buildLaunch(game, "PLAY NOW"));
    mount.append(buildCover(game), info);
  }

  /* ---------- filters ---------- */
  const state = { q: "", genre: "all", sort: "library" };

  function populateGenres() {
    const select = $("#genreSelect");
    const tags = [...new Set(LIVE.flatMap(tagsOf))].sort((a, b) => a.localeCompare(b));
    select.replaceChildren(new Option("All genres", "all"));
    tags.forEach((t) => select.append(new Option(t, t)));
    if (!tags.includes(state.genre)) state.genre = "all";
    select.value = state.genre;
  }

  function visibleGames() {
    const tokens = state.q.toLowerCase().split(/\s+/).filter(Boolean);
    let list = LIVE.filter((g) => {
      if (state.genre !== "all" && !tagsOf(g).includes(state.genre)) return false;
      if (!tokens.length) return true;
      const hay = `${g.title} ${g.description} ${g.genre}`.toLowerCase();
      return tokens.every((t) => hay.includes(t));
    });
    const byTitle = (a, b) => a.title.localeCompare(b.title, undefined, { sensitivity: "base" });
    if (state.sort === "az") list = list.sort(byTitle);
    else if (state.sort === "za") list = list.sort((a, b) => byTitle(b, a));
    else if (state.sort === "featured") list = list.sort((a, b) => (b.featured - a.featured) || (a.order - b.order));
    else list = list.sort((a, b) => a.order - b.order);
    return list;
  }

  function renderLibrary() {
    const grid = $("#gameGrid");
    const list = visibleGames();
    grid.replaceChildren(...list.map(buildCard));
    $("#emptyState").hidden = list.length > 0;
    $("#resultCount").textContent = LIVE.length
      ? `SHOWING ${list.length} OF ${LIVE.length} GAME${LIVE.length === 1 ? "" : "S"}`
      : "NO GAMES REGISTERED";
  }

  /* ---------- stats ---------- */
  function launchCount() { return parseInt(store.get("pv.launches") || "0", 10) || 0; }

  function renderStats() {
    const genres = new Set(LIVE.flatMap(tagsOf));
    $("#heroCount").textContent = String(ALL.length);
    $("#heroReady").textContent = String(LIVE.length);
    $("#statTotal").textContent = String(ALL.length);
    $("#statAvailable").textContent = String(LIVE.length);
    $("#statGenres").textContent = String(genres.size);
    $("#statLaunches").textContent = String(launchCount());
  }

  /* ---------- launching ---------- */
  let launchTimer = null;
  const overlay = $("#launchOverlay");

  function startLaunch(game) {
    if (!game || !game.enabled || !game.url) return;
    store.set("pv.launches", String(launchCount() + 1));
    sfx.launch();
    $("#launchTitle").textContent = game.title;
    overlay.hidden = false;
    $("#launchCancel").focus();
    clearTimeout(launchTimer);
    const delay = (!prefs.fx || reduceMQ.matches) ? 0 : 600;
    launchTimer = setTimeout(() => { window.location.assign(game.url.href); }, delay);
  }

  function cancelLaunch() {
    clearTimeout(launchTimer);
    overlay.hidden = true;
    renderStats();
  }

  document.addEventListener("click", (e) => {
    const a = e.target.closest("a[data-launch]");
    if (!a) return;
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return; // let the browser open new tabs normally
    const game = BY_ID.get(a.dataset.launch);
    if (!game) return;
    e.preventDefault();
    startLaunch(game);
  });

  // Coming back via the back/forward cache must not leave the overlay up.
  window.addEventListener("pageshow", () => { overlay.hidden = true; clearTimeout(launchTimer); renderStats(); });

  /* ---------- UI wiring ---------- */
  function wire() {
    const search = $("#searchInput");
    search.addEventListener("input", () => { state.q = search.value; renderLibrary(); });
    search.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && search.value) { search.value = ""; state.q = ""; renderLibrary(); }
    });
    $("#genreSelect").addEventListener("change", (e) => { state.genre = e.target.value; renderLibrary(); });
    $("#sortSelect").addEventListener("change", (e) => { state.sort = e.target.value; renderLibrary(); });
    $("#toolbar").addEventListener("submit", (e) => e.preventDefault());
    $("#clearFilters").addEventListener("click", () => {
      state.q = ""; state.genre = "all"; state.sort = "library";
      search.value = ""; $("#genreSelect").value = "all"; $("#sortSelect").value = "library";
      renderLibrary();
      search.focus();
    });

    $("#launchCancel").addEventListener("click", cancelLaunch);
    overlay.addEventListener("keydown", (e) => { if (e.key === "Escape") cancelLaunch(); });

    const flip = (key, id) => $(id).addEventListener("click", () => {
      prefs[key] = !prefs[key];
      store.set("pv." + key, prefs[key] ? "1" : "0");
      applyPrefs();
      if (key === "fx") syncParticles();
      sfx.click();
    });
    flip("sound", "#toggleSound");
    flip("crt", "#toggleCrt");
    flip("fx", "#toggleFx");

    // "/" jumps to search unless the user is already typing somewhere.
    document.addEventListener("keydown", (e) => {
      if (e.key !== "/" || e.ctrlKey || e.metaKey || e.altKey) return;
      const t = e.target;
      if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;
      e.preventDefault();
      search.focus();
      search.scrollIntoView({ block: "center" });
    });

    // Interface sounds (delegated, no per-card listeners).
    let lastHover = null;
    document.addEventListener("pointerover", (e) => {
      const t = e.target.closest(".card, .btn, .toggle, .nav a");
      if (t && t !== lastHover) sfx.hover();
      lastHover = t;
    });
    document.addEventListener("click", (e) => { if (e.target.closest(".btn:not([data-launch]), .toggle:not(#toggleSound), .nav a")) sfx.click(); });
  }

  /* ---------- decoration ---------- */
  function syncParticles() {
    const box = $("#particles");
    box.replaceChildren();
    if (!prefs.fx || reduceMQ.matches) return;
    const colors = ["", "m", "g"];
    for (let i = 0; i < 22; i++) {
      const s = el("span", colors[i % 3]);
      const size = 3 + (i % 3) * 2;
      s.style.cssText = `left:${(i * 37) % 100}%;width:${size}px;height:${size}px;animation-duration:${14 + (i * 7) % 16}s;animation-delay:${-((i * 5) % 20)}s`;
      box.append(s);
    }
  }

  function trackNav() {
    const links = new Map([...document.querySelectorAll("[data-nav]")].map((a) => [a.dataset.nav, a]));
    const mark = (id) => links.forEach((a, k) => (k === id ? a.setAttribute("aria-current", "true") : a.removeAttribute("aria-current")));
    mark("home");
    if (!("IntersectionObserver" in window)) return;
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((en) => { if (en.isIntersecting) mark(en.target.id); });
    }, { rootMargin: "-40% 0px -55% 0px" });
    ["home", "library", "about"].forEach((id) => { const n = document.getElementById(id); if (n) obs.observe(n); });
  }

  function bootSequence() {
    if (!prefs.fx || reduceMQ.matches || store.sget("pv.booted")) return;
    store.sset("pv.booted", "1");
    const boot = el("div", "boot");
    boot.setAttribute("role", "presentation");
    const pre = el("pre", null, `PIXEL VAULT BIOS v1.0\nMEMORY CHECK ........ OK\nLOADING ${ALL.length} CARTRIDGE${ALL.length === 1 ? "" : "S"} .... OK\nPLAYER 01 READY`);
    pre.append(el("small", null, "CLICK OR PRESS ANY KEY TO SKIP"));
    boot.append(pre);
    document.body.append(boot);
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      document.removeEventListener("keydown", finish);
      boot.classList.add("out");
      setTimeout(() => boot.remove(), 350);
    };
    boot.addEventListener("click", finish);
    document.addEventListener("keydown", finish);
    setTimeout(finish, 1500);
  }

  function footer() {
    $("#copyright").textContent = `© ${new Date().getFullYear()} ${SITE.name}. Launcher only. Games and their assets belong to their respective creators.`;
    if (SITE.repoUrl && /^https:\/\//i.test(SITE.repoUrl)) {
      $("#repoLink").href = SITE.repoUrl;
      $("#repoItem").hidden = false;
    }
    if (problems.length) {
      const w = $("#configWarn");
      w.textContent = `CONFIG WARNINGS: ${problems.length} (see browser console)`;
      w.hidden = false;
    }
  }

  /* ---------- init ---------- */
  applyPrefs();
  syncParticles();
  populateGenres();
  renderStats();
  renderFeatured();
  renderLibrary();
  footer();
  wire();
  trackNav();
  bootSequence();
})();
