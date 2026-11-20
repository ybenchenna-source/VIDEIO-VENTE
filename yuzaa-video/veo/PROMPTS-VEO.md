# Clips Veo pour la pub yuzaa

5 clips à générer dans l'app **Gemini** (outil vidéo Veo), au format **vertical 9:16**.
Chaque génération dure environ 8 s ; le montage n'en garde qu'une partie.
Les prompts sont en anglais : Veo les suit mieux.

Dépose ensuite chaque clip dans `yuzaa-video/public/clips/` avec **exactement** ce nom de fichier.
Le montage (textes, compteur, prix, plan final) se fait ensuite dans Remotion.

| Fichier | Moment dans la pub | Type |
|---|---|---|
| `canette.mp4` | 0 → 6 s | texte → vidéo |
| `feuilles.mp4` | 6 → 8,5 s | texte → vidéo |
| `eveil.mp4` | 8,5 → 10 s | image → vidéo (`image-depart-eveil.jpg`) |
| `gamme.mp4` | 10 → 15 s, puis fond du plan final | image → vidéo (`image-depart-gamme.jpg`) |
| `tasse.mp4` | 15 → 18 s | texte → vidéo |

Conseils :
- Génère d'abord en mode rapide ; garde la meilleure version de chaque clip.
- Vérifie qu'aucune marque réelle n'apparaît sur la canette, et que le packaging yuzaa n'est pas déformé.
- Le son de Veo n'est pas utilisé (version sans son + musique libre de droits ajoutée au montage).
- Chaque clip porte un filigrane invisible SynthID : indique « contenu généré par IA » sur TikTok, Instagram
  et dans la publicité (obligatoire pour une pub dans l'UE).

---

## 1. `canette.mp4` — texte → vidéo

```
Vertical 9:16 cinematic product shot at night. A student's wooden desk lit by a single warm desk lamp: open notebooks, highlighters, a laptop glowing softly in the background, and an empty crushed energy drink can lying on its side. A plain matte black aluminum can with no logo, no text and no branding drops into frame from above and lands upright on the desk with a small bounce. After a beat, a hand enters and crushes the can in one firm squeeze, and a cascade of shiny gold euro coins spills out of the crushed can and scatters across the desk in slow motion. Camera: slow push-in at desk level, 50mm lens, shallow depth of field. Lighting: warm tungsten key light, deep green shadows, subtle red rim light. Photorealistic commercial look. Audio: can landing clink, aluminum crunch, coins jingling. No on-screen text.
```

## 2. `feuilles.mp4` — texte → vidéo

```
Vertical 9:16 macro slow-motion shot. Fresh glossy green guayusa leaves (long and lance-shaped), yerba mate leaves and bright red guarana fruits with black seeds swirl in a graceful spiral vortex, floating in mid-air against a deep forest-green background. A warm golden sunbeam cuts diagonally through the frame and tiny dust particles glow. Camera slowly orbits and pushes in toward the center of the vortex. Photorealistic botanical commercial, crisp detail, shallow depth of field. Audio: soft rustling leaves, gentle airy whoosh. No on-screen text.
```

## 3. `eveil.mp4` — image → vidéo

**Étape A (image)** : dans Gemini, envoie `image-depart-eveil.jpg` avec :

```
Agrandis cette photo au format vertical 9:16 en prolongeant naturellement le décor en haut et en bas. Ne modifie ni les boîtes ni le texte imprimé dessus.
```

**Étape B (vidéo)** : crée une vidéo à partir de l'image obtenue, avec :

```
Bring this product photo to life: fresh green leaves and a few red guarana fruits drift down slowly around the packaging and settle on the table, a soft warm light sweeps across the box, very slow push-in. The box, its colors and its printed text stay perfectly unchanged and sharp. Photorealistic, calm, premium. Audio: soft leaves landing, light ambience. Vertical 9:16.
```

## 4. `gamme.mp4` — image → vidéo

**Étape A (image)** : envoie `image-depart-gamme.jpg` avec le même texte qu'en 3A.

**Étape B (vidéo)** :

```
Bring this product photo to life: slow cinematic dolly-in toward the three boxes, warm morning light gradually brightening, a few leaves gently falling in the background, faint steam rising behind the products. The boxes, their colors and their printed text stay perfectly unchanged and sharp. Photorealistic premium product commercial. Audio: soft morning ambience. Vertical 9:16.
```

## 5. `tasse.mp4` — texte → vidéo

```
Vertical 9:16 photorealistic close-up. A clear glass mug of golden herbal infusion sits on a light wooden desk next to an open notebook, soft morning sunlight coming through a window. Delicate steam rises and curls from the mug, and a single fresh green leaf floats on the surface. Camera: slow push-in, 85mm lens, shallow depth of field, creamy background bokeh. Warm, calm, healthy mood. Audio: quiet room tone, soft birdsong outside. No on-screen text, no logos.
```
