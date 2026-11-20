# Vidéo pub yuzaa : « canette contre tasse »

Publicité verticale de 20 s pour yuzaa (Reel Instagram, TikTok, publicité), montée avec
[Remotion](https://www.remotion.dev). Les plans filmés sont des clips générés avec **Veo** (app Gemini) ;
les textes, le compteur, les prix et les transitions sont animés par Remotion.

| Format | Composition | Fichier rendu |
|---|---|---|
| 1080 × 1920 (9:16), 30 i/s, 20 s | `Yuzaa-9x16` | `out/yuzaa-canette-vs-tasse.mp4` |
| 1080 × 1350 (4:5), fil Instagram | `Yuzaa-4x5` | `out/yuzaa-canette-vs-tasse-4x5.mp4` |

## Rendre la vidéo

```bash
npm install
npm run render        # 9:16  → out/yuzaa-canette-vs-tasse.mp4
npm run render:4x5    # 4:5   → out/yuzaa-canette-vs-tasse-4x5.mp4
npm run apercus       # 6 images clés (1, 4, 8, 12, 16 et 19 s) → out/keyframes/
npm run dev           # aperçu interactif dans Remotion Studio
```

Les MP4 sont en H.264, avec une piste audio silencieuse (acceptée partout).

## Changer les textes, les prix, les couleurs

Tout est dans **`src/config.ts`** :

- `TEXTS` : chaque texte de chaque scène (accroche, 69 €, doses, 1,50 € / 0,30 €, 14 €, coffret 19,90 €, code
  BIENVENUE10, adresse du site). Entoure un mot de `[crochets]` pour le mettre dans la couleur d'accent.
- `TEXTS.money.amount` : le nombre auquel monte le compteur.
- `COLORS` : la palette de la marque.

Les moments où chaque texte apparaît sont dans `src/overlay/Overlay.tsx` (`inAt` / `outAt`, en images :
30 images = 1 seconde).

## Changer ou remplacer un clip vidéo

Les clips sont dans `public/clips/`. Leur placement est réglé dans `CLIPS` (`src/config.ts`) :

- `from` / `to` : début et fin dans la pub (en images),
- `trimStart` : secondes coupées au début du clip,
- `rate` : vitesse de lecture,
- `light: true` : plan clair (textes en vert foncé), `dim: true` : fond flouté et assombri (plan final).

Pour un meilleur rendu, dépose les clips **originaux** téléchargés depuis Gemini (720 × 1280) plutôt que
des fichiers passés par WhatsApp (480 × 848, plus compressés), puis retire `ratio: WA` de leur ligne.
Les prompts utilisés sont dans `veo/PROMPTS-VEO.md`.

## Ajouter une musique

Dépose un fichier libre de droits dans `public/music/`, puis indique son nom dans `MUSIC_FILE`
(`src/config.ts`), par exemple `"music/ma-musique.mp3"`. Le volume se règle avec `MUSIC_VOLUME`.

## Version 3D (secours)

Si `CLIPS` est vide (ou là où aucun clip n'est prévu), la vidéo affiche à la place des scènes en 3D :
bureau de révisions, studio botanique, boîtes sur socles, mug en verre. Les modèles sont construits par
`blender/build_assets.py` (`pip install bpy pillow`, puis `npm run modeles-3d`) et exportés dans
`public/models/`.

## À savoir avant de publier

- Les clips Veo portent un filigrane invisible SynthID : indique « contenu généré par IA » sur TikTok,
  Instagram et dans la publicité.
- Les montants 69 € et 14 € par mois correspondent à 2 boissons par jour sur 23 jours
  (1,50 € et 0,30 € l'unité).
- Remotion est gratuit pour les équipes de 3 personnes maximum ; au-delà, une licence est nécessaire.

## Sans connexion à remotion.media

Si le téléchargement du navigateur de Remotion est bloqué, indique un Chrome headless déjà installé :

```bash
export REMOTION_BROWSER=/chemin/vers/chrome-headless-shell
```
