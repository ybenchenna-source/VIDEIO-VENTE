// Scène 5 (diapositive 3C) — Les fonctionnalités complémentaires proposées
UD.register("s05-complements", (tl, s) => {
  UD.frame(tl, s);
  UD.rise(tl, s.one(".intro"), s.t(3.1));
  const cols = s.q(".col");
  // Premièrement / Deuxièmement / Troisièmement
  [s.cue(1), s.cue(2), s.cue(3)].forEach((t, i) => {
    UD.rise(tl, cols[i], t);
    UD.rise(tl, cols[i].querySelectorAll(".h3, .lead"), t + 0.4);
  });
  tl.fromTo(s.q(".bars i"), { scaleY: 0 }, { scaleY: 1, duration: 0.7, stagger: 0.12, ease: "back.out(1.4)" }, s.cue(1, 0.8));
  UD.slide(tl, s.q(".rec"), s.cue(2, 0.8), { stagger: 0.4 });
  tl.fromTo(s.one(".phone"), { opacity: 0, y: 60, rotation: -8 }, { opacity: 1, y: 0, rotation: 0, duration: 0.8, ease: "back.out(1.5)" }, s.cue(3, 0.6));
  UD.rise(tl, s.q(".phone i"), s.cue(3, 1.2), { stagger: 0.15 });
  // « Ces ajouts visent à rendre le CRM plus utile… »
  const t4 = s.cue(4);
  UD.pop(tl, s.q(".foot .pill"), t4, { stagger: 2 });
  UD.pop(tl, s.one(".foot .stamp"), t4 + 5.5);
});
