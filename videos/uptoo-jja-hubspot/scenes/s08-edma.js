// Scène 8 (diapositive 6) — Une référence concrète : EDMA (chiffres issus du cas client)
UD.register("s08-edma", (tl, s) => {
  UD.frame(tl, s);
  const t0 = s.t(3.1);
  tl.fromTo(s.one(".title .h1"), { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: 0.8, ease: "expo.out" }, t0);
  UD.rise(tl, s.one(".title .lead"), t0 + 0.5);
  tl.fromTo(s.one(".src"), { opacity: 0 }, { opacity: 1, duration: 0.5 }, t0 + 1);

  // « …informations réparties entre son CRM et son ERP… intégration bidirectionnelle en temps réel »
  const t1 = s.cue(1);
  const box = s.q(".box");
  UD.slide(tl, box[0], t1);
  tl.fromTo(box[1], { opacity: 0, x: 60 }, { opacity: 1, x: 0, duration: 0.6, ease: "expo.out" }, t1 + 0.2);
  UD.pop(tl, s.q(".bit"), t1 + 1, { stagger: 0.3 });
  tl.fromTo(s.q(".bit"), { rotation: 0 }, { rotation: (i) => [-6, 5, -4, 7][i], duration: 0.6 }, t1 + 1.2);
  const tj = t1 + 5.5;
  tl.to(s.q(".bit"), { opacity: 0, scale: 0.4, x: (i) => [180, -60, 120, -150][i], y: (i) => [80, 50, -40, -50][i], duration: 0.6, stagger: 0.08, ease: "power2.in" }, tj);
  tl.fromTo(s.one(".link"), { scaleX: 0 }, { scaleX: 1, duration: 0.9, ease: "power2.inOut", transformOrigin: "center center" }, tj + 0.6);
  UD.pop(tl, s.one(".link-lbl .pill"), tj + 1.3);

  // « Le cas client mentionne une vision 360°, zéro double saisie, 100 % temps réel… »
  const t2 = s.cue(2);
  UD.fade(tl, s.one(".duo"), t2 - 0.4);
  const r = s.q(".r");
  [0.2, 1, 2.6, 4.4].forEach((d, i) => UD.pop(tl, r[i], t2 + d));
  UD.rise(tl, s.one(".quote"), t2 + 8);

  // « Cette référence est particulièrement pertinente pour JJA… »
  const t3 = s.cue(3);
  UD.fade(tl, s.one(".quote"), t3 - 0.4);
  UD.rise(tl, s.one(".fit"), t3);
  UD.pop(tl, s.q(".fit .pill"), t3 + 0.8, { stagger: 0.3 });
});
