// Scène 4 (diapositive 3B) — Connecter les outils et simplifier les tâches
UD.register("s04-outils", (tl, s) => {
  UD.frame(tl, s);

  // « …la connexion avec Sage X3. » puis « Une intégration bidirectionnelle… »
  const t0 = s.t(3.1);
  const sys = s.q(".sys");
  UD.slide(tl, sys[0], t0);
  tl.fromTo(sys[1], { opacity: 0, x: 60 }, { opacity: 1, x: 0, duration: 0.6, ease: "expo.out" }, t0 + 0.3);
  const t1 = s.cue(1);
  const lanes = s.q(".lane");
  lanes.forEach((l) => tl.fromTo(l, { opacity: 0 }, { opacity: 1, duration: 0.4 }, t1));
  // Sens HubSpot → Sage X3 puis Sage X3 → HubSpot, en boucle jusqu'à la fin de cette partie
  const loopEnd = s.cue(3, -0.5);
  UD.grow(tl, lanes[0].querySelector(".lane-fill"), t1 + 0.3, { duration: 1 });
  tl.fromTo(lanes[1].querySelector(".lane-fill"), { scaleX: 0 }, { scaleX: 1, duration: 1, ease: "power2.inOut", transformOrigin: "right center" }, t1 + 2.4);
  const cycle = 2.4;
  const reps = Math.max(0, Math.floor((loopEnd - (t1 + 1)) / cycle) - 1);
  tl.fromTo(lanes[0].querySelector(".pkt"), { left: "0%", opacity: 1 }, { left: "95%", duration: cycle, ease: "power1.inOut", repeat: reps }, t1 + 1);
  tl.fromTo(lanes[1].querySelector(".pkt"), { left: "95%", opacity: 1 }, { left: "0%", duration: cycle, ease: "power1.inOut", repeat: reps }, t1 + 3.1);
  lanes.forEach((l) => UD.rise(tl, l.querySelector(".lane-lbl"), t1 + 0.6));
  UD.pop(tl, s.one(".rules .stamp"), s.within(1, 0.55));
  UD.pop(tl, s.q(".goals .pill"), s.within(1, 0.7), { stagger: 0.8 });

  // « Uptoo Digital présente déjà une réalisation de ce type avec EDMA… »
  const t2 = s.cue(2);
  UD.fade(tl, s.one(".goals"), t2 - 0.4);
  UD.rise(tl, s.one(".edma"), t2);

  // « Nous prévoyons également les imports en masse… »
  const t3 = s.cue(3);
  UD.fade(tl, [s.one(".sync"), s.one(".edma")], t3 - 0.4);
  UD.rise(tl, s.one(".feat .eyebrow"), t3);
  const f = s.q(".f");
  [0.04, 0.14, 0.26, 0.38, 0.56, 0.74].forEach((d, i) => UD.pop(tl, f[i], s.within(3, d)));

  // « Enfin, les communications seront adaptées au besoin… »
  const t4 = s.cue(4);
  UD.fade(tl, s.one(".feat"), t4 - 0.4);
  const c = s.q(".c");
  UD.slide(tl, c[0], t4);
  UD.pop(tl, c[0].querySelector(".verdict"), s.within(4, 0.3));
  UD.slide(tl, c[1], s.within(4, 0.5));
  UD.pop(tl, c[1].querySelector(".verdict"), s.within(4, 0.75));

  // « Cette distinction est importante… fichiers Excel… »
  UD.rise(tl, s.one(".excel"), s.cue(5, 0.2));
});
