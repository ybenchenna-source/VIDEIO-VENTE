<!-- Gabarit de index.html : ne pas modifier index.html directement, lancer `node tools/timing.mjs apply`. -->
<!DOCTYPE html>
<html lang="fr">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=1920, height=1080">
    <title>Uptoo Digital × JJA — Proposition CRM HubSpot</title>
    <script src="scripts/vendor/gsap.min.js"></script>
    <link rel="stylesheet" href="styles/theme.css">
    <!-- Minutage généré par tools/timing.mjs (source : timing/cues.json) -->
    <script src="scripts/cues.js"></script>
    <!-- Icônes et fonctions d'animation communes (objet global UD) -->
    <script src="scripts/motion.js"></script>
    <style>
      html, body { margin: 0; width: 1920px; height: 1080px; overflow: hidden; background: #f3f5f9; }
      #root { position: relative; width: 100%; height: 100%; overflow: hidden; background: var(--bg); font-family: var(--display); }
      #root > div[data-composition-src] { position: absolute; inset: 0; z-index: 2; }
      /* Décor de fond persistant */
      #bg { position: absolute; inset: 0; z-index: 0; overflow: hidden; }
      #bg .grid {
        position: absolute; inset: -80px;
        background-image: linear-gradient(var(--line) 1.5px, transparent 1.5px), linear-gradient(90deg, var(--line) 1.5px, transparent 1.5px);
        background-size: 96px 96px; opacity: 0.45;
      }
      #bg .glow { position: absolute; border-radius: 50%; background: radial-gradient(circle, rgba(36, 87, 197, 0.14), transparent 65%); }
      #bg .glow.a { width: 1400px; height: 1400px; right: -500px; top: -600px; }
      #bg .glow.b { width: 1100px; height: 1100px; left: -500px; bottom: -600px; background: radial-gradient(circle, rgba(242, 106, 27, 0.10), transparent 65%); }
      /* Pied de page + progression par chapitre */
      #foot { position: absolute; left: 120px; right: 120px; bottom: 34px; z-index: 1; display: flex; align-items: center; gap: 40px; }
      #foot .brand { font-family: var(--mono); font-size: 18px; font-weight: 700; color: var(--muted); white-space: nowrap; letter-spacing: 0.04em; }
      #foot .brand b { color: var(--navy); }
      #foot .bar { flex: 1; display: flex; gap: 10px; }
      #foot .seg { flex: 1; height: 6px; border-radius: 3px; background: var(--line); overflow: hidden; }
      #foot .seg-fill { display: block; width: 100%; height: 100%; background: var(--orange); transform-origin: left center; transform: scaleX(0); }
      #foot .note { font-family: var(--mono); font-size: 18px; color: var(--muted); white-space: nowrap; }
    </style>
  </head>
  <body>
    <div id="root" data-composition-id="main" data-width="1920" data-height="1080" data-duration="{{TOTAL}}">
      <div id="bg"><div class="grid"></div><div class="glow a"></div><div class="glow b"></div></div>
      <div id="foot">
        <div class="brand"><b>UPTOO DIGITAL</b> × JJA</div>
        <div class="bar">
{{SEGMENTS}}
        </div>
        <div class="note">Simulation · projet scolaire</div>
      </div>

      <!-- Les scènes, dans l'ordre de l'oral (assemblées depuis scenes/*.html) -->
{{SCENES}}

      <!-- Voix enregistrée (assemblée par tools/caler_voix.py) -->
      <audio id="voix" src="assets/voix.mp3" data-start="0" data-duration="{{TOTAL}}" data-track-index="10" data-volume="1"></audio>
    </div>

{{SCRIPTS}}
    <script>
      const main = gsap.timeline({ paused: true });
      // Fond : dérive lente
      main.fromTo("#bg .grid", { x: 0, y: 0 }, { x: 96, y: 48, duration: window.TOTAL_DURATION, ease: "none" }, 0);
      main.fromTo("#bg .glow.a", { scale: 1 }, { scale: 1.25, duration: window.TOTAL_DURATION, ease: "none" }, 0);
      main.fromTo("#bg .glow.b", { x: 0 }, { x: 300, duration: window.TOTAL_DURATION, ease: "none" }, 0);
      // Barre de progression : un segment par scène
      const fills = document.querySelectorAll("#foot .seg-fill");
      window.SCENES.forEach((s, i) => {
        main.fromTo(fills[i], { scaleX: 0 }, { scaleX: 1, duration: s.duration, ease: "none" }, s.at);
      });
      // Animations de chaque scène (scenes/*.js)
      UD.buildAll(main);
      window.__timelines["main"] = main;
    </script>
  </body>
</html>
