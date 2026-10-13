// Scène 6 (diapositive 4) — Roadmap du projet (dates du cahier des charges, 2024)
UD.register("s06-roadmap", (tl, s) => {
  UD.frame(tl, s);
  // « …cinq phases, avec une livraison prévue le 24 juillet 2024. »
  const t0 = s.t(3.1);
  tl.fromTo(s.one(".axis"), { opacity: 0 }, { opacity: 1, duration: 0.5 }, t0);
  UD.rise(tl, s.q(".month"), t0 + 0.2, { stagger: 0.2 });
  UD.slide(tl, s.q(".lbl"), t0 + 0.8, { stagger: 0.15 });
  UD.pop(tl, s.one(".flag .pill"), t0 + 3);

  // Chaque phase quand sa période est annoncée
  const rows = s.q(".row");
  const details = s.q(".detail");
  for (let i = 0; i < 5; i++) {
    const t = s.cue(i + 1);
    UD.grow(tl, rows[i].querySelector(".bar"), t, { duration: 0.9 });
    tl.fromTo(rows[i].querySelector(".n"), { scale: 1 }, { scale: 1.25, duration: 0.25, yoyo: true, repeat: 1, ease: "power2.out" }, t);
    UD.rise(tl, details[i], t + 0.5);
    if (i < 4) UD.fade(tl, details[i], s.cue(i + 2, -0.4));
  }
  // « La date de livraison… La réussite repose sur… »
  const t6 = s.cue(6);
  UD.fade(tl, details[4], t6 - 0.4);
  tl.fromTo(s.one(".flag .pill"), { scale: 1 }, { scale: 1.12, duration: 0.3, yoyo: true, repeat: 1 }, t6);
  UD.rise(tl, s.one(".keys .eyebrow"), t6 + 1.5);
  UD.pop(tl, s.q(".key"), t6 + 2.5, { stagger: 2.5 });
});
