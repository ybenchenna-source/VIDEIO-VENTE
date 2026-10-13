// Scène 10 (diapositive 8) — Conclusion
UD.register("s10-conclusion", (tl, s) => {
  UD.frame(tl, s, { exit: false });
  // « Demain, vos équipes doivent pouvoir ouvrir le CRM… »
  const t0 = s.t(3.1);
  tl.fromTo(s.one(".tomorrow .h1"), { opacity: 0, x: -60 }, { opacity: 1, x: 0, duration: 0.8, ease: "expo.out" }, t0);
  UD.rise(tl, s.one(".tomorrow .lead"), t0 + 0.6);
  UD.slide(tl, s.q(".qq"), t0 + 2.2, { stagger: 1.6 });

  // « En reliant vos données, vos équipes et vos outils… »
  const t1 = s.cue(1);
  UD.fade(tl, s.one(".tomorrow"), t1 - 0.4);
  const nd = s.q(".nd");
  [0, 1, 2].forEach((i) => UD.pop(tl, nd[i], t1 + 0.4 + i * 0.9));
  UD.grow(tl, s.one(".wire"), t1 + 2.8, { duration: 1 });
  tl.fromTo(s.one(".net .more"), { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.8, ease: "expo.out" }, t1 + 4);

  // « Nous vous proposons de commencer par un atelier de cadrage… »
  const t2 = s.cue(2);
  UD.fade(tl, s.one(".net"), t2 - 0.4);
  UD.slide(tl, s.one(".at-l"), t2);
  UD.pop(tl, s.q(".v"), t2 + 4, { stagger: 1.5 });

  // « À partir de cette base… proposition cohérente, adaptée, transparente »
  const t3 = s.cue(3);
  UD.fade(tl, s.one(".atelier"), t3 - 0.4);
  UD.rise(tl, s.one(".final .eyebrow"), t3);
  UD.rise(tl, s.q(".three .card"), t3 + 0.3, { stagger: 0.5 });
  UD.rise(tl, s.one(".final .lead"), t3 + 2.4);

  // « Merci pour votre attention. »
  const t4 = s.cue(4, -0.3);
  tl.fromTo(s.one(".thanks"), { yPercent: 100 }, { yPercent: 0, duration: 0.8, ease: "power3.inOut" }, t4);
  tl.fromTo(s.one(".thanks .t"), { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: 0.7, ease: "expo.out" }, t4 + 0.5);
  UD.rise(tl, s.one(".thanks .b"), t4 + 0.9);
  UD.grow(tl, s.one(".thanks .bar"), t4 + 1.1, { duration: 0.6 });
});
