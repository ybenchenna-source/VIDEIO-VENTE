/**
 * ─────────────────────────────────────────────────────────────
 *  RÉGLAGES DE LA VIDÉO YUZAA : textes, prix, couleurs, timing
 * ─────────────────────────────────────────────────────────────
 *  Tout ce qui s'affiche à l'écran se change ici.
 *
 *  Mise en couleur : entoure un mot de [crochets] pour l'afficher
 *  dans la couleur d'accent de la ligne (champ `accent`).
 *  Avant € et %, garde une espace insécable (Alt+Maj+Espace sur Mac,
 *  ou tape \u00A0) pour que le symbole ne passe pas seul à la ligne.
 */

export const COLORS = {
  // Vert de la marque (fond)
  green900: "#0F3320",
  green700: "#1B5A31",
  green500: "#2A8046",
  green300: "#7FC594",
  // Éveil / ambre
  amber500: "#F5BC75",
  amber700: "#A3600F",
  // Rush / rouge
  red500: "#D93A2B",
  red300: "#F28A7C",
  // Sable
  sand50: "#FAF7EF",
  sand900: "#1B1A16",
} as const;

export const FPS = 30;
export const DURATION_IN_FRAMES = 20 * FPS; // 20 s = 600 images

/** Début et fin de chaque scène, en secondes. */
export const SCENES = {
  hook: { from: 0, to: 2.5 },
  money: { from: 2.5, to: 6 },
  plants: { from: 6, to: 10 },
  range: { from: 10, to: 15 },
  cup: { from: 15, to: 18 },
  end: { from: 18, to: 20 },
} as const;

export const TEXTS = {
  // Scène 1 — accroche
  hook: {
    title: "Tes [2 canettes] par jour ?",
    accent: COLORS.red300,
  },

  // Scène 2 — le coût
  money: {
    amount: 69, // le compteur monte de 0 à ce nombre
    unit: " €",
    perMonth: "par mois",
    sugar: "+ du [sucre] à chaque canette",
    accent: COLORS.red300,
  },

  // Scène 3 — les plantes
  plants: {
    title: "Infusions énergisantes [100 % plantes], {zéro sucre ajouté}",
    accent: COLORS.green300, // couleur des [crochets]
    accent2: COLORS.amber500, // couleur des {accolades}
  },

  // Scène 4 — la gamme
  range: {
    products: [
      { name: "Éveil", dose: "40 mg", color: COLORS.green300 },
      { name: "Focus", dose: "60 mg", color: COLORS.amber500 },
      { name: "Rush", dose: "80 mg", color: COLORS.red300 },
    ],
    subtitle: "de caféine par tasse, [affichée sur chaque recette]",
    accent: COLORS.green300,
  },

  // Scène 5 — canette contre tasse
  cup: {
    canPrice: "1,50 €",
    canLabel: "la canette",
    cupPrice: "0,30 €",
    cupLabel: "la tasse",
    monthly: "14 €",
    monthlyLabel: "par mois",
  },

  // Scène 6 — plan final
  end: {
    brand: "yuzaa",
    offerName: "Coffret Découverte",
    offerPrice: "19,90 €",
    promoText: "-10 % sur ta 1re commande :",
    promoCode: "BIENVENUE10",
    url: "yuzaa.vercel.app",
  },
} as const;

/**
 * Musique : dépose un fichier libre de droits dans public/music/
 * puis indique son nom ici, par exemple "music/ma-musique.mp3".
 * Laisse `null` pour la version sans son.
 */
export const MUSIC_FILE: string | null = null;
export const MUSIC_VOLUME = 0.8;

/**
 * Clips vidéo (générés avec Veo dans Gemini) à placer dans public/clips/.
 * from / to : images de début et de fin dans la pub (30 images = 1 s).
 * trimStart : secondes à couper au début du clip. rate : vitesse de lecture.
 * Là où aucun clip n'est prévu, la vidéo affiche les scènes 3D.
 * Pour ajouter un clip (ex. tasse.mp4 de 15 s à 18 s) :
 *   { file: "clips/tasse.mp4", from: 450, to: 540, trimStart: 0.5, rate: 1.2 },
 */
export type ClipSpec = {
  file: string;
  from: number;
  to: number;
  trimStart: number;
  rate: number;
  /** Plan clair : les textes passent en vert foncé et le voile sombre est retiré. */
  light?: boolean;
  /** Fond flouté et assombri (plan final, sous les textes). */
  dim?: boolean;
  /** Largeur / hauteur réelle du fichier (9/16 par défaut). */
  ratio?: number;
  /** Transition d'entrée : panoramique éclair vertical / horizontal, ou zoom traversant. */
  enter?: "whipUp" | "whipLeft" | "zoom";
  /** Images (dans la pub) où l'action frappe : coup de zoom + secousse. */
  beats?: number[];
};

/** Les clips passés par WhatsApp font 480 × 848 (un peu plus larges que 9:16). */
const WA = 480 / 848;

export const CLIPS: ClipSpec[] = [
  { file: "clips/canette.mp4", from: 0, to: 183, trimStart: 0.6, rate: 1.57, beats: [15, 94, 115] },
  { file: "clips/feuilles.mp4", from: 183, to: 255, trimStart: 0.8, rate: 1.4, enter: "whipUp" },
  { file: "clips/eveil.mp4", from: 255, to: 303, trimStart: 2.4, rate: 1.3, light: true, ratio: WA, enter: "zoom" },
  { file: "clips/gamme.mp4", from: 303, to: 450, trimStart: 0.3, rate: 1, light: true, ratio: WA, enter: "whipLeft" },
  { file: "clips/tasse.mp4", from: 450, to: 540, trimStart: 1.0, rate: 1, light: true, ratio: WA, enter: "whipUp" },
  { file: "clips/gamme.mp4", from: 540, to: 600, trimStart: 5.5, rate: 1, dim: true, ratio: WA, enter: "zoom" },
];
