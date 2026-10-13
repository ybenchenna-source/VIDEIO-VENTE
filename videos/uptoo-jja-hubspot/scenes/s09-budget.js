// Scène 9 (diapositive 7) — Budget et engagement (simulation, projet scolaire)
UD.register("s09-budget", (tl, s) => {
  UD.frame(tl, s);
  // « …votre enveloppe maximale de 50 000 euros hors taxes sur deux ans. »
  const t0 = s.t(3.1);
  UD.slide(tl, s.one(".hero"), t0);
  UD.count(tl, s.one(".amount .n"), 50000, t0 + 0.5, 1.8);
  UD.rise(tl, s.q(".hero .h3, .hero .sub"), t0 + 2.2, { stagger: 0.4 });
  UD.pop(tl, s.one(".hero .stamp"), t0 + 3.4);

  // « Notre offre doit intégrer l'ensemble des coûts… »
  const t1 = s.cue(1);
  UD.rise(tl, s.one(".incl"), t1);
  UD.pop(tl, s.q(".chips .pill"), t1 + 1.6, { stagger: 0.9 });

  // « …prix ferme… cession à JJA de la propriété des développements spécifiques »
  const t2 = s.cue(2);
  const eng = s.q(".eng");
  UD.slide(tl, eng[0], t2 + 0.6);
  UD.slide(tl, eng[1], t2 + 3.2);

  // « Le point de vigilance concerne le coût des licences pour 450 utilisateurs… »
  const t3 = s.cue(3);
  UD.fade(tl, s.one(".side"), t3 - 0.4);
  tl.fromTo(s.one(".warn"), { opacity: 0, x: 80 }, { opacity: 1, x: 0, duration: 0.7, ease: "expo.out" }, t3);
  UD.rise(tl, s.q(".warn .h2, .warn .lead"), t3 + 0.5, { stagger: 2 });
  UD.slide(tl, s.q(".todo > div"), t3 + 7, { stagger: 2.2 });
});
