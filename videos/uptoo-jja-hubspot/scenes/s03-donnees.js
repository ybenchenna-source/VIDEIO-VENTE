// Scène 3 (diapositive 3A) — Centraliser les données et améliorer le suivi commercial
UD.register("s03-donnees", (tl, s) => {
  UD.frame(tl, s);
  UD.rise(tl, s.q(".thead > *"), s.t(3.1));
  const rows = s.q(".row");
  // Chaque ligne apparaît quand elle est évoquée : SQL, 450 utilisateurs, fiche client
  const at = [s.t(3.4), s.cue(1, 0.2), s.cue(2, 0.2)];
  rows.forEach((r, i) => {
    UD.slide(tl, r.querySelector(".need"), at[i]);
    tl.fromTo(r.querySelector(".arrow"), { opacity: 0, x: -20 }, { opacity: 1, x: 0, duration: 0.4, ease: "power2.out" }, at[i] + 0.5);
    UD.rise(tl, r.querySelector(".ans"), at[i] + 0.7);
    UD.pop(tl, r.querySelectorAll(".pill"), at[i] + 1.1, { stagger: i === 2 ? 1.3 : 1.6 });
  });
  // « Le bénéfice attendu est simple… »
  const t3 = s.cue(3);
  UD.rise(tl, s.one(".benef .eyebrow"), t3);
  UD.pop(tl, s.q(".benef .pill"), t3 + 0.6, { stagger: 1.6 });
});
