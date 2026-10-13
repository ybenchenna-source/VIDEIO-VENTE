// Scène 1 — Qui est Uptoo Digital ?
UD.register("s01-uptoo", (tl, s) => {
  UD.frame(tl, s, { intro: false });
  UD.ambient(tl, s);

  // Couverture — « Bonjour… » puis « Dans le cadre de votre appel d'offres… »
  UD.rise(tl, s.q(".cover-top > *"), s.cue(0, 0.1), { stagger: 0.12 });
  tl.fromTo(s.one(".cover-title"), { opacity: 0, y: 70 }, { opacity: 1, y: 0, duration: 0.9, ease: "expo.out" }, s.cue(0, 0.4));
  tl.fromTo(s.one(".cover-sub"), { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.7, ease: "power2.out" }, s.cue(1, 0.4));
  UD.grow(tl, s.one(".cover-rule"), s.cue(1, 0.8));
  tl.to(s.one(".cover"), { yPercent: -100, duration: 0.9, ease: "power3.inOut" }, s.cue(2, -0.5));

  // Chiffres clés — « Partenaire HubSpot Elite, plus de 650 projets… 350 entreprises »
  const t2 = s.cue(2);
  tl.fromTo(s.q(".hdr > *"), { opacity: 0, x: -30 }, { opacity: 1, x: 0, duration: 0.5, stagger: 0.08, ease: "power2.out" }, t2 - 0.1);
  tl.fromTo(s.one(".badge"), { opacity: 0, x: -80 }, { opacity: 1, x: 0, duration: 0.7, ease: "expo.out" }, t2 + 0.2);
  const stats = s.q(".stat");
  UD.pop(tl, stats[0], t2 + 1.6);
  UD.count(tl, stats[0].querySelector(".n"), 650, t2 + 1.7, 1.6);
  UD.pop(tl, stats[1], t2 + 3.4);
  UD.count(tl, stats[1].querySelector(".n"), 350, t2 + 3.5, 1.6);
  UD.rise(tl, s.one(".expertise"), t2 + 5.4);
  UD.pop(tl, s.q(".chips .pill"), t2 + 5.8, { stagger: 0.25 });
  tl.fromTo(s.one(".source"), { opacity: 0 }, { opacity: 1, duration: 0.5 }, t2 + 1);

  // Conviction
  const t3 = s.cue(3);
  UD.fade(tl, [s.one(".facts"), s.one(".source")], t3 - 0.5);
  tl.fromTo(s.one(".qmark"), { opacity: 0, scale: 0.4, rotation: -20 }, { opacity: 1, scale: 1, rotation: 0, duration: 0.7, ease: "back.out(2)" }, t3);
  tl.fromTo(s.one(".qtxt"), { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: 0.9, ease: "expo.out" }, t3 + 0.2);
  UD.rise(tl, s.one(".qsub"), t3 + 4);

  // Sommaire
  const t4 = s.cue(4);
  UD.fade(tl, s.one(".quote"), t4 - 0.5);
  UD.grow(tl, s.one(".agenda-line"), t4, { duration: 2.4, ease: "power1.inOut" });
  const steps = s.q(".step");
  [0, 2.6, 4.6].forEach((d, i) => {
    UD.pop(tl, steps[i].querySelector(".step-dot"), t4 + d);
    UD.rise(tl, steps[i].querySelectorAll(".h3, .lead"), t4 + d + 0.25);
  });
});
