# Vidéo — Uptoo Digital × JJA (proposition CRM HubSpot)

Vidéo de motion design (16:9, 1920 × 1080, 30 i/s, **8:00**) qui accompagne l'oral.
Elle suit le texte `source/script-oral.md` scène par scène, dans le même ordre que les diapositives
(01, 02, 03A, 03B, 03C, 04, 05, 06, 07, 08).

> ⚠️ **Synchronisation approximative.** Aucun enregistrement audio n'a été fourni : les temps sont
> **estimés à partir du texte**, puis calés sur 8 minutes. Cela suppose un débit soutenu
> (environ 185 mots/min ; à un débit naturel, le texte dure plutôt 9 min 50).
> La feuille `TIMING.md` indique à quel moment de la vidéo chaque phrase doit commencer.

Technologie : [HyperFrames](https://hyperframes.heygen.com) (HTML + CSS + GSAP, rendu en MP4 par Chromium/ffmpeg).
Tout est local, y compris GSAP (`scripts/vendor/`) : aucun accès Internet n'est nécessaire au rendu.

## Générer la vidéo

```bash
cd videos/uptoo-jja-hubspot
node tools/timing.mjs apply        # assemble index.html à partir des scènes et du minutage
npx hyperframes render -o renders/uptoo-jja-hubspot.mp4
```

Aperçu interactif (navigateur, avec timeline) : `npx hyperframes preview`
Vérification (mise en page, contrastes, erreurs) : `npx hyperframes check`

## Organisation des fichiers

| Fichier | Rôle |
|---|---|
| `source/script-oral.md` | Le texte oral (référence). Un titre `## SCÈNE N — …` par diapositive, un paragraphe par ligne. |
| `timing/cues.json` | **Le minutage** : durée de chaque scène et début de chaque paragraphe (en secondes, relatif à la scène). |
| `TIMING.md` | Feuille de repères générée : temps vidéo de chaque phrase. |
| `scenes/sNN-*.html` | Contenu visuel d'une scène (textes affichés + styles propres à la scène). |
| `scenes/sNN-*.js` | Animations de la scène, accrochées aux paragraphes : `s.cue(2)` = début du 3e paragraphe. |
| `styles/theme.css` | Couleurs (bleu foncé, blanc, gris clair, orange), typographies, cartes, pastilles. |
| `scripts/motion.js` | Icônes et fonctions d'animation communes (apparitions, compteurs, ouverture/fermeture de chapitre). |
| `tools/index.template.html` | Gabarit de la page : fond, pied de page, barre de progression. |
| `tools/timing.mjs` | Estime le minutage et assemble `index.html`. |
| `index.html` | **Généré** — ne pas le modifier à la main. |

## Modifier la vidéo

- **Changer un texte affiché** : éditez `scenes/<scène>.html`, puis `node tools/timing.mjs apply`.
- **Changer une couleur** : variables en haut de `styles/theme.css` (`--navy`, `--orange`…).
- **Décaler une animation** : dans `scenes/<scène>.js`, modifiez le décalage, par exemple `s.cue(3, 1.5)` = 1,5 s après le début du paragraphe 4.
- **Changer la durée totale** : `TARGET_TOTAL` dans `tools/timing.mjs` (`null` = débit naturel), puis
  `node tools/timing.mjs estimate && node tools/timing.mjs apply`.
- **Le texte oral change** : modifiez `source/script-oral.md`, puis `estimate` et `apply`.

### Caler la vidéo sur votre vraie voix

1. Enregistrez l'oral et chronométrez le début de chaque paragraphe (par exemple dans Audacity).
2. Reportez ces temps dans `timing/cues.json` : `duration` de chaque scène, et `start` de chaque paragraphe,
   **relatif au début de sa scène**. Remplacez `"synchronisation": "estimée"` par `"réelle"`.
3. `node tools/timing.mjs apply`, puis relancez le rendu.
4. Optionnel : copiez l'audio dans `assets/voix.mp3` et décommentez la balise `<audio>` dans
   `tools/index.template.html` pour l'intégrer à la vidéo.

N'utilisez pas `estimate` après cette étape : cette commande écrase `timing/cues.json`.

## Contenus et sources

- Les chiffres affichés viennent uniquement du texte fourni : Uptoo Digital (partenaire HubSpot Elite, 650+ projets,
  350+ entreprises — *site officiel d'Uptoo Digital*), JJA (4 marques, 450 utilisateurs = 150 France + 300 international),
  calendrier du cahier des charges (22 mai → 24 juillet 2024), EDMA (*cas client Uptoo Digital*), budget 50 000 € HT sur deux ans.
- Aucun logo n'est utilisé : les marques sont écrites en texte, et les icônes sont des pictogrammes génériques dessinés pour le projet.
- Le budget porte la mention « Simulation réalisée dans le cadre d'un projet scolaire — ce n'est pas un devis officiel d'Uptoo Digital ».
- Les mini-graphiques de la diapositive 03C (barres, fiches) sont des illustrations sans valeurs chiffrées.
