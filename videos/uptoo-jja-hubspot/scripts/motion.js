// Outils d'animation partagés par toutes les scènes (objet global UD).
// Chargé une fois par index.html, avant les scènes.
(function () {
  // ---- Icônes au trait (dessinées pour ce projet, aucun logo de marque) ----
  const P = {
    database: '<ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v14c0 1.7 3.6 3 8 3s8-1.3 8-3V5"/><path d="M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3"/>',
    users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c0-3.6 2.9-6 6.5-6s6.5 2.4 6.5 6"/><path d="M16 4.5a3.5 3.5 0 0 1 0 7"/><path d="M18 14.3c2.1.7 3.5 2.8 3.5 5.7"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7"/>',
    globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M12 3c2.5 2.6 3.8 5.6 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3z"/>',
    history: '<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/><path d="M12 7v5l3 2"/>',
    bell: '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.9 1.9 0 0 0 3.4 0"/>',
    sync: '<path d="M3 12a9 9 0 0 1 15.5-6.2L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-15.5 6.2L3 16"/><path d="M3 21v-5h5"/>',
    link: '<path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7"/><path d="M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7"/>',
    chart: '<path d="M3 3v18h18"/><path d="M8 17v-5"/><path d="M13 17V8"/><path d="M18 17v-8"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/>',
    megaphone: '<path d="M3 11v2a1 1 0 0 0 1 1h3l6 4V6L7 10H4a1 1 0 0 0-1 1z"/><path d="M17 9a4 4 0 0 1 0 6"/><path d="M19.5 6.5a8 8 0 0 1 0 11"/>',
    export: '<path d="M12 3v12"/><path d="M7 8l5-5 5 5"/><path d="M5 15v4a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-4"/>',
    graduation: '<path d="M22 10L12 5 2 10l10 5 10-5z"/><path d="M6 12v5c3 2.5 9 2.5 12 0v-5"/><path d="M22 10v6"/>',
    lifebuoy: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4"/><path d="M5.6 5.6l3.6 3.6"/><path d="M14.8 14.8l3.6 3.6"/><path d="M14.8 9.2l3.6-3.6"/><path d="M5.6 18.4l3.6-3.6"/>',
    leaf: '<path d="M5 21c0-9 6-15 16-16-1 10-7 16-16 16z"/><path d="M5 21l8-8"/>',
    building: '<path d="M4 21V4a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v17"/><path d="M2 21h20"/><path d="M9 7h1M14 7h1M9 11h1M14 11h1M9 15h1M14 15h1"/>',
    target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5"/>',
    chat: '<path d="M21 12a8 8 0 0 1-11.6 7.1L4 20.5l1.4-4.6A8 8 0 1 1 21 12z"/>',
    tasks: '<path d="M10 6h10"/><path d="M10 12h10"/><path d="M10 18h10"/><path d="M3.5 6l1.5 1.5L7.5 5"/><path d="M3.5 12l1.5 1.5 2.5-2.5"/><path d="M3.5 18l1.5 1.5 2.5-2.5"/>',
    dashboard: '<path d="M3 3h7v9H3z"/><path d="M14 3h7v5h-7z"/><path d="M14 12h7v9h-7z"/><path d="M3 16h7v5H3z"/>',
    lock: '<path d="M5 11h14v10H5z"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
    sliders: '<path d="M4 6h9M17 6h3M4 12h3M11 12h9M4 18h11M19 18h1"/><circle cx="15" cy="6" r="2"/><circle cx="9" cy="12" r="2"/><circle cx="17" cy="18" r="2"/>',
    copy: '<path d="M8 8h12v12H8z"/><path d="M4 16V5a1 1 0 0 1 1-1h11"/>',
    shield: '<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6l8-3z"/><path d="M8.5 12l2.5 2.5 4.5-5"/>',
    calendar: '<path d="M4 5h16v16H4z"/><path d="M4 10h16"/><path d="M8 3v4"/><path d="M16 3v4"/>',
    sparkle: '<path d="M12 3l2.2 6.8L21 12l-6.8 2.2L12 21l-2.2-6.8L3 12l6.8-2.2z"/>',
    trend: '<path d="M3 17l6-6 4 4 8-8"/><path d="M15 7h6v6"/>',
    flag: '<path d="M5 21V4"/><path d="M5 4h12l-2 4 2 4H5"/>',
    euro: '<path d="M18 6.5A7 7 0 1 0 18 17.5"/><path d="M4 10h9"/><path d="M4 14h9"/>',
    rocket: '<path d="M12 15l-3-3c1.5-5 5-8.5 12-9-.5 7-4 10.5-9 12z"/><path d="M9 12H5l2-4h5"/><path d="M12 15v4l4-2v-5"/><path d="M6 17c-1.5.5-2.5 2-3 4 2-.5 3.5-1.5 4-3"/>',
    flask: '<path d="M9 3h6"/><path d="M10 3v6L4.5 19a1.5 1.5 0 0 0 1.3 2h12.4a1.5 1.5 0 0 0 1.3-2L14 9V3"/><path d="M7 15h10"/>',
    wrench: '<path d="M15 6a4 4 0 1 1 3 3L9 18a2.1 2.1 0 0 1-3-3l9-9z"/>',
    check: '<circle cx="12" cy="12" r="9"/><path d="M8 12.5l3 3 5-6"/>',
    arrow: '<path d="M5 12h14"/><path d="M13 6l6 6-6 6"/>',
    clipboard: '<path d="M9 3h6v3H9z"/><path d="M7 5H5v16h14V5h-2"/><path d="M8 11h8M8 15h6"/>',
    layers: '<path d="M12 3l9 5-9 5-9-5 9-5z"/><path d="M3 13l9 5 9-5"/>',
    eye: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
    zap: '<path d="M13 2L4 14h7l-1 8 9-12h-7z"/>',
    keyboard: '<path d="M3 6h18v12H3z"/><path d="M7 10h.01M11 10h.01M15 10h.01M7 14h10"/>',
    share: '<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4"/>',
    briefcase: '<path d="M3 7h18v13H3z"/><path d="M8 7V4h8v3"/><path d="M3 13h18"/>',
    server: '<path d="M3 4h18v7H3z"/><path d="M3 13h18v7H3z"/><path d="M7 7.5h.01M7 16.5h.01"/>',
  };

  const icon = (name) =>
    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${P[name] || ""}</svg>`;

  // Nombre au format français : 49 500 (espace insécable)
  const fr = (n) => Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");

  // Prépare une scène : icônes, repères (cues) en temps absolu, durée.
  function scene(id) {
    const root = document.getElementById(id);
    root.querySelectorAll("[data-icon]").forEach((el) => { el.innerHTML = icon(el.dataset.icon); });
    const meta = (window.SCENES || []).find((x) => x.id === id) || { at: 0, duration: 60 };
    const cues = (window.CUES || {})[id] || [];
    return {
      root,
      at: meta.at,
      dur: meta.duration,
      t: (x) => meta.at + x, // temps relatif à la scène → temps absolu
      cue: (i, offset = 0) => meta.at + (cues[i] ?? 0) + offset, // début du paragraphe i (+ décalage)
      q: (sel) => root.querySelectorAll(sel),
      one: (sel) => root.querySelector(sel),
    };
  }

  // Ouverture (panneau de chapitre) et fermeture (volet bleu) communes à toutes les scènes.
  function frame(tl, s, { intro = true, exit = true } = {}) {
    const T = s.t;
    const chapter = s.one(".chapter");
    if (intro && chapter) {
      tl.fromTo(s.one(".chapter-num"), { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.5, ease: "power3.out" }, T(0.15));
      tl.fromTo(s.one(".chapter-title"), { opacity: 0, y: 60 }, { opacity: 1, y: 0, duration: 0.7, ease: "expo.out" }, T(0.3));
      tl.fromTo(s.one(".chapter-bar"), { scaleX: 0 }, { scaleX: 1, duration: 0.7, ease: "power2.inOut", transformOrigin: "left center" }, T(0.55));
      tl.fromTo(chapter, { yPercent: 0 }, { yPercent: -100, duration: 0.8, ease: "power3.inOut" }, T(2.3));
    }
    if (s.one(".hdr")) {
      tl.fromTo(s.q(".hdr > *"), { opacity: 0, x: -30 }, { opacity: 1, x: 0, duration: 0.5, stagger: 0.08, ease: "power2.out" }, T(intro ? 2.75 : 0.2));
    }
    const wipe = s.one(".wipe");
    if (wipe) {
      if (exit) tl.fromTo(wipe, { yPercent: 100 }, { yPercent: 0, duration: 0.7, ease: "power3.in" }, T(s.dur - 0.72));
      else gsap.set(wipe, { yPercent: 100 });
    }
  }

  // Compteur animé (seek-safe : la valeur dépend uniquement du temps)
  function count(tl, el, to, at, duration = 1.4, { from = 0, suffix = "" } = {}) {
    const o = { v: from };
    el.textContent = fr(from) + suffix;
    tl.to(o, { v: to, duration, ease: "power2.out", onUpdate: () => { el.textContent = fr(o.v) + suffix; } }, at);
  }

  // Mouvement d'ambiance lent sur les décors (borné à la durée de la scène)
  function ambient(tl, s) {
    s.q(".deco-ring").forEach((el, i) => {
      tl.fromTo(el, { rotation: 0, scale: 1 }, { rotation: i % 2 ? -25 : 25, scale: 1.08, duration: s.dur, ease: "none" }, s.at);
    });
    s.q(".deco-dots").forEach((el, i) => {
      tl.fromTo(el, { x: 0, y: 0 }, { x: i % 2 ? 40 : -40, y: 30, duration: s.dur, ease: "none" }, s.at);
    });
  }

  // Raccourcis d'entrée
  const pop = (tl, t, at, o = {}) => tl.fromTo(t, { opacity: 0, scale: 0.85 }, { opacity: 1, scale: 1, duration: 0.55, ease: "back.out(1.7)", stagger: 0.12, ...o }, at);
  const rise = (tl, t, at, o = {}) => tl.fromTo(t, { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.6, ease: "power3.out", stagger: 0.1, ...o }, at);
  const slide = (tl, t, at, o = {}) => tl.fromTo(t, { opacity: 0, x: -60 }, { opacity: 1, x: 0, duration: 0.6, ease: "expo.out", stagger: 0.1, ...o }, at);
  const fade = (tl, t, at, o = {}) => tl.to(t, { opacity: 0, duration: 0.45, ease: "power2.in", ...o }, at);
  const grow = (tl, t, at, o = {}) => tl.fromTo(t, { scaleX: 0 }, { scaleX: 1, duration: 0.8, ease: "power2.inOut", transformOrigin: "left center", ...o }, at);
  const draw = (tl, t, at, o = {}) => tl.fromTo(t, { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 0.9, ease: "power2.inOut", ...o }, at);

  // Chaque fichier scenes/<id>.js s'enregistre ici ; index.html construit ensuite la timeline unique.
  const builders = [];
  const register = (id, build) => builders.push({ id, build });
  const buildAll = (tl) => builders.forEach(({ id, build }) => build(tl, scene(id)));

  window.UD = { icon, fr, scene, frame, count, ambient, pop, rise, slide, fade, grow, draw, register, buildAll };
})();
