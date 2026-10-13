// Scène 2 — Ce que vous risquez si rien ne change
UD.register("s02-enjeux", (tl, s) => {
  UD.frame(tl, s);

  // « JJA, avec ses quatre marques… fournisseurs asiatiques… distributeurs »
  const t0 = s.t(3.1);
  UD.pop(tl, s.one(".jja"), t0);
  UD.rise(tl, s.q(".brands span"), t0 + 0.9, { stagger: 0.35 });
  UD.slide(tl, s.q(".node")[0], t0 + 3.4);
  UD.grow(tl, s.q(".flow")[0], t0 + 3.8, { duration: 0.5 });
  UD.grow(tl, s.q(".flow")[1], t0 + 5.4, { duration: 0.5 });
  tl.fromTo(s.q(".node")[1], { opacity: 0, x: 60 }, { opacity: 1, x: 0, duration: 0.6, ease: "expo.out" }, t0 + 5.6);

  // « … grand volume d'informations… France et international »
  UD.pop(tl, s.q(".ribbon .pill"), s.cue(1, 0.6), { stagger: 1.6 });

  // « Comme le souligne votre cahier des charges… »
  const t2 = s.cue(2);
  UD.fade(tl, [s.one(".eco"), s.one(".ribbon")], t2 - 0.4);
  UD.rise(tl, s.one(".cdc .eyebrow"), t2);
  [2.2, 4.6, 6.8, 9].forEach((d, i) => UD.pop(tl, s.q(".cdc-item")[i], t2 + d));

  // « Concrètement, une relance oubliée… une donnée obsolète… »
  const t3 = s.cue(3);
  UD.fade(tl, s.one(".cdc"), t3 - 0.4);
  const risks = s.q(".risk");
  UD.rise(tl, risks[1], t3);
  UD.rise(tl, risks[1].querySelector(".ex"), t3 + 1.2);
  UD.rise(tl, risks[0], t3 + 4.5);
  UD.rise(tl, risks[0].querySelector(".ex"), t3 + 5.5);

  // « Avec au moins 450 utilisateurs… »
  const t4 = s.cue(4);
  UD.pop(tl, risks[2], t4);
  UD.count(tl, risks[2].querySelector(".n"), 450, t4 + 0.3, 1.5);
  UD.grow(tl, risks[2].querySelector(".split-bar"), t4 + 1.6, { duration: 1.2 });
  UD.rise(tl, risks[2].querySelector(".split-lbl"), t4 + 2.4);

  // « L'enjeu est donc clair… »
  const t5 = s.cue(5);
  UD.fade(tl, s.one(".risks"), t5 - 0.4);
  UD.rise(tl, s.one(".stake .eyebrow"), t5);
  const words = s.q(".less span");
  words.forEach((w, i) => {
    UD.rise(tl, w, t5 + 0.6 + i * 0.7);
    UD.grow(tl, w.querySelector(".strike"), t5 + 3.2 + i * 0.3, { duration: 0.4 });
  });
  tl.fromTo(s.one(".more"), { opacity: 0, y: 60 }, { opacity: 1, y: 0, duration: 0.9, ease: "expo.out" }, t5 + 5);
});
