# TIFANNA : voix off, musique composée et jingle de fin

Habillage sonore de la pub TIFANNA (joaillerie sur vêtement, Paris) : `source/tifanna-source.mp4`, 20 s.

| Fichier | Contenu |
|---|---|
| `out/video_voixoff.mp4` | la pub en 1080 × 1920 avec voix off, effets sonores et musique (20 s) |
| `out/jingle-tifanna.mp4` | le jingle de fin seul (4,6 s) |
| `out/video_voixoff_jingle.mp4` | la pub + le jingle en fondu enchaîné (24 s) |

## Voix off (ElevenLabs, voix « Alice », modèle multilingue, français)

| Moment | Plan | Voix off |
|---|---|---|
| 0,3 s | l'émeraude | Et si vos pierres se portaient sur la robe ? |
| 3,1 s | la femme à l'atelier | Tifanna, joaillerie sur vêtement. |
| 5,3 s | Braise | Braise, le feu du rubis. |
| 7,6 s | Jardin | Jardin, l'éclat de l'émeraude. |
| 9,9 s | Blason | Blason, la noblesse de l'or. |
| 12,3 s | l'atelier, les mains | Chaque pièce est cousue à la main, pierre après pierre. |
| 16,1 s | sur mesure | Soirée, mariée, grands boubous. |
| 18,2 s | carte TIFANNA | La pierre épouse le tissu. |

Jingle : « Tifanna, Paris. »

## Musique

Composée note par note (`musique/composer.py`) et jouée avec de vrais sons d'instruments (FluidSynth,
banque FluidR3) : piano, cordes, violoncelle, harpe, célesta. Un accord par plan, un scintillement de
célesta sur chaque pierre, glissandos de harpe aux coupes, crescendo sur la robe, résolution en ré majeur
sur TIFANNA. La musique baisse automatiquement sous la voix.

## Refaire le mixage

```bash
sudo apt install fluidsynth fluid-soundfont-gm && pip install mido
python musique/composer.py
ELEVENLABS_API_KEY=... python voixoff/generer.py
```

Textes, moments et effets sonores : `LINES` et `SFX` dans `voixoff/generer.py` (supprime le fichier
correspondant dans `voixoff/audio/` pour le régénérer).

Le jingle est une composition Remotion du projet `yuzaa-video` (`src/tifanna/JingleTifanna.tsx`) :

```bash
cd ../yuzaa-video && npx remotion render Tifanna-Jingle-9x16 ../tifanna-video/out/jingle-tifanna.mp4
```
