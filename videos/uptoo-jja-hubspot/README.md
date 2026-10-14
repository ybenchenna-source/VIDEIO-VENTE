# Vidéo — Uptoo Digital × JJA (proposition CRM HubSpot)

Vidéo de motion design (16:9, 1920 × 1080, 30 i/s, **7:56**) avec les **voix enregistrées** de l'équipe.
Elle suit le texte `source/script-oral.md`, dans l'ordre des diapositives
(01, 02, 03A, 03B, 03C, 04, 05, 06, 08 — le script final n'a pas de diapositive 07).

**Synchronisation sur les voix réelles.** Chaque scène dure exactement le temps de son enregistrement.
Les voix ont été transcrites en local (Whisper), et chaque animation démarre quand la phrase
correspondante est prononcée. `TIMING.md` donne le repère de chaque phrase.

| Scène | Enregistrement |
|---|---|
| 01 Uptoo Digital, 02 Enjeux | Dilia |
| 03A Données, 03B Outils, 03C Compléments, 04 Roadmap | Yasmine |
| 05 Équipe, 06 EDMA | Houda |
| 08 Conclusion | Yacine |

`assets/voix/06-yacine-edma-doublon.mp4` (EDMA lu par Yacine) n'est pas utilisé : c'est la version de Houda qui a été retenue.

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
| `tools/index.template.tpl` | Gabarit de la page : fond, pied de page, barre de progression. |
| `tools/timing.mjs` | Estime le minutage et assemble `index.html`. |
| `index.html` | **Généré** — ne pas le modifier à la main. |

## Modifier la vidéo

- **Changer un texte affiché** : éditez `scenes/<scène>.html`, puis `node tools/timing.mjs apply`.
- **Changer une couleur** : variables en haut de `styles/theme.css` (`--navy`, `--orange`…).
- **Décaler une animation** : dans `scenes/<scène>.js`, modifiez le décalage, par exemple `s.cue(3, 1.5)` = 1,5 s après le début du paragraphe 4.
- **Le texte oral change** : modifiez `source/script-oral.md`, puis relancez le calage (ci-dessous).

### Changer ou réenregistrer une voix

1. Remplacez le fichier dans `assets/voix/` (ou changez la correspondance dans `timing/voix.json`).
2. Transcription (une seule installation, puis hors ligne) : `cd tools/transcrire && npm install && node transcrire.mjs && cd ../..`
3. Calage : `node tools/timing.mjs estimate && python3 tools/caler_voix.py && node tools/timing.mjs apply`
4. Relancez le rendu. Pour une version **sans voix** (à lancer pendant l'oral en direct) :
   `ffmpeg -i renders/uptoo-jja-hubspot.mp4 -c:v copy -an renders/uptoo-jja-hubspot-muette.mp4`

Un repère peut aussi être corrigé à la main dans `timing/cues.json`, puis `node tools/timing.mjs apply`.

## Contenus et sources

- Les chiffres affichés viennent uniquement du texte fourni : Uptoo Digital (partenaire HubSpot Elite, 650+ projets,
  350+ entreprises — *site officiel d'Uptoo Digital*), JJA (4 marques, 450 utilisateurs = 150 France + 300 international),
  calendrier du cahier des charges (22 mai → 24 juillet 2024), EDMA (*cas client Uptoo Digital*).
- Aucun logo n'est utilisé : les marques sont écrites en texte, et les icônes sont des pictogrammes génériques dessinés pour le projet.
- Chaque écran porte la mention « Simulation · projet scolaire ».
- Les mini-graphiques de la diapositive 03C (barres, fiches) sont des illustrations sans valeurs chiffrées.
