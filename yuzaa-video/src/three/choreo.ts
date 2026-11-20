import { Easing, interpolate, random, spring } from "remotion";

/**
 * Chorégraphie de tous les objets 3D, calculée uniquement à partir du
 * numéro d'image : pas de temps réel, pas de hasard sans graine.
 */

export const FLOOR = -1.3;
export const BOX = { w: 0.9, h: 1.36, d: 0.5 };
export const CAN_H = 1.24;

type Vec3 = [number, number, number];

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const io = Easing.inOut(Easing.cubic);
const out = Easing.out(Easing.cubic);
const inn = Easing.in(Easing.cubic);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/* ───────────── Canette ───────────── */

export const heroCan = (frame: number) => {
  // Chute avec rebonds (0 → 30)
  const y = interpolate(frame, [0, 30], [4.6, FLOOR], { ...clamp, easing: Easing.bounce });
  const rotY = interpolate(frame, [0, 70], [-4.2, 0.35], { ...clamp, easing: out }) + frame * 0.004;
  const landing = Math.max(0, frame - 30);
  const tiltZ =
    interpolate(frame, [0, 30], [0.45, 0], clamp) +
    (frame > 30 ? 0.07 * Math.sin(landing * 0.55) * Math.exp(-landing / 9) : 0);
  // Écrasement (76 → 90), puis disparition (90 → 98)
  const crush = interpolate(frame, [76, 90], [0, 1], { ...clamp, easing: inn });
  const vanish = interpolate(frame, [90, 98], [1, 0], { ...clamp, easing: inn });
  const S = 1.5; // taille de la canette d'accroche
  const sy = lerp(1, 0.22, crush) * vanish * S;
  const sxz = lerp(1, 1.24, crush) * vanish * S;
  return {
    pos: [0, y, 0] as Vec3,
    rot: [0, rotY, tiltZ + crush * 0.12] as Vec3,
    scale: [sxz, sy, sxz] as Vec3,
    visible: vanish > 0.001,
  };
};

/** Petite canette de comparaison dans la scène 5. */
export const compareCan = (frame: number) => {
  const enter = interpolate(frame, [452, 478], [0, 1], { ...clamp, easing: out });
  const exit = interpolate(frame, [532, 552], [0, 1], { ...clamp, easing: inn });
  const s = 0.9;
  return {
    pos: [-1.05, lerp(FLOOR - 3.2, FLOOR, enter) - exit * 3.5, -0.8] as Vec3,
    rot: [0, 0.5 + frame * 0.006, 0] as Vec3,
    scale: [s, s, s] as Vec3,
    visible: enter > 0 && exit < 1,
  };
};

/* ───────────── Pièces ───────────── */

export const COIN_COUNT = 16;

const coinOrbit = (i: number, frame: number): Vec3 => {
  const r = random(`coin-r-${i}`);
  const a0 = (i / COIN_COUNT) * Math.PI * 2 + r * 0.4;
  const theta = a0 + (frame - 90) * 0.022;
  const radius = 1.0 + random(`coin-R-${i}`) * 0.55;
  const y = -1.0 + (i % 5) * 0.28 + random(`coin-y-${i}`) * 0.15;
  return [Math.cos(theta) * radius, y, Math.sin(theta) * radius * 0.8];
};

export const coin = (i: number, frame: number, fps: number) => {
  const burst = spring({ frame: frame - 90 - (i % 4), fps, config: { damping: 15, stiffness: 70 } });
  const start: Vec3 = [0, FLOOR + 0.35, 0];
  const target = coinOrbit(i, frame);
  const lift = Math.sin(Math.min(1, burst) * Math.PI) * 0.9;
  const pos: Vec3 = [
    lerp(start[0], target[0], burst),
    lerp(start[1], target[1], burst) + lift,
    lerp(start[2], target[2], burst),
  ];
  const appear = interpolate(frame, [90, 97], [0, 1], { ...clamp, easing: out });
  const out_ = interpolate(frame, [182 + i * 0.7, 194 + i * 0.7], [1, 0], { ...clamp, easing: inn });
  const s = appear * out_;
  const spin = 1 + random(`coin-s-${i}`);
  return {
    pos,
    // Bascule autour de l'axe X seulement : le « € » reste à l'endroit
    rot: [Math.PI / 2 + frame * 0.06 * spin + i, 0.25 * Math.sin(frame * 0.04 + i), 0.18 * Math.sin(i)] as Vec3,
    scale: s,
    visible: s > 0.001,
  };
};

/* ───────────── Feuilles et graines ───────────── */

export const LEAF_COUNT = 36;
export type LeafKind = "guayusa" | "mate" | "guarana";
export const leafKind = (i: number): LeafKind =>
  i % 9 === 4 || i % 9 === 8 ? "guarana" : i % 2 === 0 ? "guayusa" : "mate";

const HERO_BOX_Y = FLOOR + BOX.h / 2;

export const leaf = (i: number, frame: number) => {
  const born = 184 + (i % 12) * 0.8;
  const appear = interpolate(frame, [born, born + 12], [0, 1], { ...clamp, easing: out });
  // Point de départ : la pièce dont elle « sort »
  const origin = coinOrbit(i % COIN_COUNT, 186);
  const r0 = Math.hypot(origin[0], origin[2] / 0.8) * (0.9 + random(`leaf-r-${i}`) * 0.5);
  const a0 = Math.atan2(origin[2] / 0.8, origin[0]) + random(`leaf-a-${i}`) * 0.6;
  const p = interpolate(frame, [186, 284], [0, 1], { ...clamp, easing: io });
  const theta = a0 + p * Math.PI * 2.4 + (frame - 186) * 0.012;
  const flare = 1 + 0.4 * Math.sin(p * Math.PI);
  const radius = lerp(r0, 0.08, Math.pow(p, 1.6)) * flare;
  const y =
    lerp(origin[1] + 0.2, HERO_BOX_Y + 0.1, p) +
    Math.sin(theta * 1.3 + i) * 0.22 * (1 - p);
  const enter = interpolate(p, [0.78, 1], [1, 0], { ...clamp, easing: inn });
  const s = appear * enter * (0.85 + random(`leaf-s-${i}`) * 0.4);
  return {
    pos: [Math.cos(theta) * radius, y, Math.sin(theta) * radius * 0.85] as Vec3,
    rot: [
      frame * 0.06 + i,
      -theta + Math.PI / 2,
      Math.sin(frame * 0.09 + i) * 0.7,
    ] as Vec3,
    scale: s,
    visible: s > 0.001,
  };
};

/* ───────────── Boîtes ───────────── */

/** 0 = Éveil, 1 = Focus, 2 = Rush */
export const box = (index: 0 | 1 | 2, frame: number, fps: number) => {
  const restY = (scale: number) => FLOOR + (BOX.h * scale) / 2;

  // Plan final : les trois boîtes reviennent, plus petites, sous le texte
  if (frame >= 536) {
    const s = 0.6;
    const rise = spring({ frame: frame - 540 - index * 4, fps, config: { damping: 14, stiffness: 90 } });
    const xs = [-0.78, -0.12, 0.54];
    return {
      pos: [xs[index], lerp(FLOOR - 3.5, restY(s), rise), 0.4] as Vec3,
      rot: [0, [0.28, 0, -0.28][index] + Math.sin(frame * 0.03) * 0.03, 0] as Vec3,
      scale: s,
      visible: rise > 0.001,
    };
  }

  const s4 = 0.86;
  const xs = [-1.12, -0.12, 0.88];
  // Sortie vers le bas avant la scène de la tasse
  const exit = interpolate(frame, [448 + index * 4, 472 + index * 4], [0, 1], { ...clamp, easing: inn });

  if (index === 0) {
    // Éveil : se forme au centre (scène 3), puis glisse à gauche (scène 4)
    const form = spring({ frame: frame - 236, fps, config: { damping: 13, stiffness: 80 } });
    const toRow = interpolate(frame, [300, 332], [0, 1], { ...clamp, easing: io });
    const scale = lerp(form, s4, toRow);
    const spinIn = interpolate(frame, [236, 292], [-Math.PI * 2 - 0.5, -0.12], { ...clamp, easing: out });
    const hover = interpolate(frame, [236, 290], [0.35, 0], { ...clamp, easing: io });
    return {
      pos: [lerp(0, xs[0], toRow), restY(scale) + hover - exit * 4.5, 0] as Vec3,
      rot: [0, lerp(spinIn, 0.24, toRow) + Math.sin(frame * 0.025) * 0.03, 0] as Vec3,
      scale,
      visible: form > 0.001 && exit < 1,
    };
  }

  const rise = spring({ frame: frame - 304 - index * 8, fps, config: { damping: 14, stiffness: 75 } });
  return {
    pos: [xs[index], lerp(FLOOR - 4.2, restY(s4), rise) - exit * 4.5, 0] as Vec3,
    rot: [0, (index === 1 ? 0 : -0.24) + Math.sin(frame * 0.025 + index) * 0.03, 0] as Vec3,
    scale: s4,
    visible: rise > 0.001 && exit < 1,
  };
};

/** Haut de la boîte en coordonnées 3D (pour y accrocher la dose). */
export const boxTop = (index: 0 | 1 | 2, frame: number, fps: number): Vec3 => {
  const b = box(index, frame, fps);
  return [b.pos[0], b.pos[1] + (BOX.h * b.scale) / 2, b.pos[2]];
};

/* ───────────── Tasse ───────────── */

export const cup = (frame: number, fps: number) => {
  const rise = spring({ frame: frame - 456, fps, config: { damping: 15, stiffness: 70 } });
  const exit = interpolate(frame, [532, 556], [0, 1], { ...clamp, easing: inn });
  const s = 1.25;
  return {
    pos: [0.42, lerp(FLOOR - 4, FLOOR, rise) - exit * 4.5, 2.0] as Vec3,
    rot: [0, -0.5 + frame * 0.002, 0] as Vec3,
    scale: s,
    visible: rise > 0.001 && exit < 1,
    steam: interpolate(frame, [470, 490, 528, 540], [0, 1, 1, 0], clamp),
  };
};
