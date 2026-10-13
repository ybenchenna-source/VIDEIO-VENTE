// Scène 7 (diapositive 5) — L'équipe et les partenaires
UD.register("s07-equipe", (tl, s) => {
  UD.frame(tl, s);
  const m = s.q(".m");
  const dim = (el, t) => tl.to(el, { opacity: 0.45, duration: 0.4 }, t);
  const lit = (el, t) => tl.to(el, { opacity: 1, duration: 0.4 }, t);
  // « …quatre responsabilités » : les 4 cartes, en retrait
  UD.rise(tl, m, s.t(3.1), { stagger: 0.15 });
  m.forEach((el) => dim(el, s.t(4.4)));
  // Yasmine, puis Dilia, Houda et Yacine au fil du texte
  const t1 = s.cue(1), t2 = s.cue(2);
  lit(m[0], t1);
  tl.fromTo(m[0].querySelector(".av"), { scale: 0.6 }, { scale: 1, duration: 0.6, ease: "back.out(2)" }, t1);
  const order = [t2, t2 + 2.2, t2 + 6.3];
  order.forEach((t, i) => {
    dim(m[i], t);
    lit(m[i + 1], t);
    tl.fromTo(m[i + 1].querySelector(".av"), { scale: 0.6 }, { scale: 1, duration: 0.6, ease: "back.out(2)" }, t);
  });
  // « Notre proposition s'appuie sur HubSpot… expertise d'Uptoo… Sage X3 reste votre ERP »
  const t3 = s.cue(3);
  m.forEach((el) => lit(el, t3 - 0.6));
  const tools = s.q(".tool");
  [0, 2.2, 4.6].forEach((d, i) => UD.rise(tl, tools[i], t3 + d));
  // « Cette répartition permet de garder une vision globale… »
  const t4 = s.cue(4);
  UD.fade(tl, s.one(".tools"), t4 - 0.4);
  UD.pop(tl, s.q(".glob .pill"), t4, { stagger: 2 });
});
