# Script de la voix off (pub yuzaa, 20 s)

Voix : Jessica (ElevenLabs, modèle `eleven_multilingual_v2`, français). Débit légèrement accéléré.

| Moment | À l'image | Voix off |
|---|---|---|
| 0,1 s | la canette tombe sur le bureau | Deux canettes par jour pour tenir tes révisions ? |
| 2,9 s | écrasement, pièces, compteur 69 € | Soixante-neuf euros par mois. Et une montagne de sucre. |
| 6,3 s | tourbillon de feuilles, boîte Éveil | Passe aux infusions yuzaa : cent pour cent plantes, zéro sucre ajouté. |
| 10,7 s | la gamme et les doses | Éveil, Focus, Rush : caféine affichée sur chaque recette. |
| 15,1 s | la tasse fumante | Trente centimes la tasse. Quatorze euros par mois. |
| 18,0 s | plan final | Moins dix pour cent avec Bienvenue dix. |

Effets sonores (ElevenLabs) : canette posée, écrasée, pluie de pièces, « ka-ching », whooshs sur chaque
transition, bruissement de feuilles, petits « pops » sur les doses et le « 14 € », trait de feutre sur
« 1,50 € », impact sur le logo final.

Pour modifier un texte ou un moment : `LINES` et `SFX` dans `generer.py`, supprime le fichier
correspondant dans `audio/`, puis relance `python voixoff/generer.py`.
