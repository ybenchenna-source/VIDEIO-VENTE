import { Easing, interpolate, random, spring } from "remotion";

/**
 * Chorégraphie de tous les objets 3D, calculée uniquement à partir du
 * numéro d'image : pas de temps réel, pas de hasard sans graine.
 */

export const FLOOR = -1.3;
export const BOX = { w: 0.9, h: 1.36, d: 0.5 };
export const CAN_H = 1.24;
/** La canette d'accroche se pose directement sur le bureau (plateau à FLOOR + 0.004). */
export const CAN_PODIUM_H = 0.004;

/* ───────────── Changement de décor (bureau → studio botanique) ───────────── */

/** Image du changement de décor : une feuille géante masque alors tout l'écran. */
export const SET_SWAP = 205;
export const deskDrop = (_frame: number) => 0;
export const deskVisible = (frame: number) => frame < SET_SWAP;

/** Le décor botanique monte en place juste après. */
export const botanicalRise = (frame: number) =>
  interpolate(frame, [SET_SWAP, SET_SWAP + 26], [0, 1], { ...clamp, easing: out });
export const botanicalVisible = (frame: number) => frame >= SET_SWAP;

/** Grandes feuilles qui balaient l'écran au premier plan (transition). */
export const WIPE_COUNT = 12;
export const wipeLeaf = (i: number, frame: number) => {
  const start = 188 + i * 1.7;
  const p = interpolate(frame, [start, start + 18], [0, 1], { ...clamp, easing: Easing.inOut(Easing.quad) });
  const z = 5.2 + random(`w-z-${i}`) * 2.2;
  const spread = (10.4 - z) * 0.45; // plus la feuille est proche, moins elle doit voyager
  const lane = (random(`w-l-${i}`) - 0.5) * 2.2;
  return {
    pos: [lerp(-spread * 1.6, spread * 1.6, p), lerp(-spread * 2.4, spread * 2.4, p) + lane * spread * 0.6, z] as Vec3,
    rot: [0.9 + p * 2.2, random(`w-r-${i}`) * 6, -0.8 + p * 1.6] as Vec3,
    scale: 1.6 + random(`w-s-${i}`) * 1.2,
    kind: (i % 3 === 0 ? "mate" : "guayusa") as "mate" | "guayusa",
    visible: p > 0 && p < 1,
  };
};

type Vec3 = [number, number, number];

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const io = Easing.inOut(Easing.cubic);
const out = Easing.out(Easing.cubic);
const inn = Easing.in(Easing.cubic);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/* ───────────── Canette ───────────── */

export const heroCan = (frame: number) => {
  // Chute avec rebonds (0 → 30)
  const y = interpolate(frame, [0, 30], [4.6, FLOOR + CAN_PODIUM_H], { ...clamp, easing: Easing.bounce });
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

/** Socle de la canette d'accroche : présent dès le début, s'enfonce quand les plantes arrivent. */
export const canPodium = (frame: number) => {
  const sink = interpolate(frame, [186, 214], [0, 1], { ...clamp, easing: inn });
  return { pos: [0, FLOOR - sink * (CAN_PODIUM_H + 0.05), 0] as Vec3, visible: sink < 1 };
};

/** Petite canette de comparaison dans la scène 5, sur son socle. */
export const COMPARE_PODIUM_H = 0.42;
export const compareCan = (frame: number, fps: number) => {
  const rise = spring({ frame: frame - 452, fps, config: { damping: 16, stiffness: 80 } });
  const exit = interpolate(frame, [532, 552], [0, 1], { ...clamp, easing: inn });
  const off = lerp(-(COMPARE_PODIUM_H + 1.3), 0, rise) - exit * (COMPARE_PODIUM_H + 1.3);
  const s = 0.85;
  const base: Vec3 = [-1.05, FLOOR + off, -0.8];
  return {
    podium: { pos: base, visible: rise > 0.001 && exit < 1 },
    can: {
      pos: [base[0], base[1] + COMPARE_PODIUM_H, base[2]] as Vec3,
      rot: [0, 0.5 + frame * 0.006, 0] as Vec3,
      scale: [s, s, s] as Vec3,
      visible: rise > 0.001 && exit < 1,
    },
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
  const start: Vec3 = [0, FLOOR + CAN_PODIUM_H + 0.35, 0];
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

const HERO_BOX_Y = FLOOR + 0.95 + BOX.h / 2; // centre de la boîte qui se forme en l'air

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

/* ───────────── Boîtes sur socles ───────────── */

/** Hauteur des socles : plus la dose de caféine est forte, plus le socle est haut. */
export const PODIUM_H = [0.22, 0.44, 0.66] as const;
export const PODIUM_COLORS = ["#1B5A31", "#A3600F", "#9E2318"] as const;
const ROW_X = [-1.12, -0.12, 0.88];
const END_X = [-0.78, -0.12, 0.54];
const ROW_S = 0.86;
const END_S = 0.6;
const HERO_AIR_Y = FLOOR + 0.95;

/** Socle d'une boîte : sort du sol (scène 4), y retourne, puis revient en petit (plan final). */
export const boxPodium = (index: 0 | 1 | 2, frame: number, fps: number) => {
  if (frame >= 536) {
    const rise = spring({ frame: frame - 540 - index * 4, fps, config: { damping: 15, stiffness: 90 } });
    const h = PODIUM_H[index] * END_S;
    const off = lerp(-(h + BOX.h * END_S + 0.3), 0, rise);
    return { pos: [END_X[index], FLOOR + off, 0.4] as Vec3, scale: END_S, top: FLOOR + off + h, visible: rise > 0.001 };
  }
  const rise = spring({ frame: frame - 300 - index * 8, fps, config: { damping: 15, stiffness: 80 } });
  const exit = interpolate(frame, [446 + index * 4, 470 + index * 4], [0, 1], { ...clamp, easing: inn });
  const h = PODIUM_H[index] * ROW_S;
  const depth = h + BOX.h * ROW_S + 0.4;
  const off = lerp(-depth, 0, rise) - exit * depth;
  return {
    pos: [ROW_X[index], FLOOR + off, 0] as Vec3,
    scale: ROW_S,
    top: FLOOR + off + h,
    visible: rise > 0.001 && exit < 1,
  };
};

/** 0 = Éveil, 1 = Focus, 2 = Rush */
export const box = (index: 0 | 1 | 2, frame: number, fps: number) => {
  const pod = boxPodium(index, frame, fps);
  const rotRow = [0.24, 0, -0.24][index] + Math.sin(frame * 0.025 + index) * 0.03;

  if (frame >= 536) {
    return {
      pos: [pod.pos[0], pod.top + (BOX.h * END_S) / 2, pod.pos[2]] as Vec3,
      rot: [0, [0.28, 0, -0.28][index] + Math.sin(frame * 0.03) * 0.03, 0] as Vec3,
      scale: END_S,
      visible: pod.visible,
    };
  }

  if (index === 0) {
    // Éveil : se forme en l'air au centre (scène 3), puis se pose sur son socle à gauche
    const form = spring({ frame: frame - 236, fps, config: { damping: 13, stiffness: 80 } });
    const toRow = interpolate(frame, [304, 338], [0, 1], { ...clamp, easing: io });
    const scale = lerp(form, ROW_S, toRow);
    const spinIn = interpolate(frame, [236, 292], [-Math.PI * 2 - 0.5, -0.12], { ...clamp, easing: out });
    const bob = Math.sin(frame * 0.06) * 0.04 * (1 - toRow);
    const airY = HERO_AIR_Y + (BOX.h * scale) / 2 + bob;
    const seatY = pod.top + (BOX.h * ROW_S) / 2;
    const exit = interpolate(frame, [446, 470], [0, 1], clamp);
    return {
      pos: [lerp(0, pod.pos[0], toRow), lerp(airY, seatY, toRow), 0] as Vec3,
      rot: [0, lerp(spinIn, rotRow, toRow), 0] as Vec3,
      scale,
      visible: form > 0.001 && exit < 1,
    };
  }

  return {
    pos: [pod.pos[0], pod.top + (BOX.h * ROW_S) / 2, pod.pos[2]] as Vec3,
    rot: [0, rotRow, 0] as Vec3,
    scale: ROW_S,
    visible: pod.visible,
  };
};

/** Haut de la boîte en coordonnées 3D (pour y accrocher la dose). */
export const boxTop = (index: 0 | 1 | 2, frame: number, fps: number): Vec3 => {
  const b = box(index, frame, fps);
  return [b.pos[0], b.pos[1] + (BOX.h * b.scale) / 2, b.pos[2]];
};

/* ───────────── Tasse en verre sur son socle ───────────── */

export const CUP_PODIUM_H = 0.2;
export const cup = (frame: number, fps: number) => {
  const rise = spring({ frame: frame - 456, fps, config: { damping: 16, stiffness: 70 } });
  const exit = interpolate(frame, [530, 554], [0, 1], { ...clamp, easing: inn });
  const depth = CUP_PODIUM_H + 1.6;
  const off = lerp(-depth, 0, rise) - exit * depth;
  const base: Vec3 = [0.42, FLOOR + off, 2.0];
  const s = 1.25;
  return {
    podium: { pos: base, visible: rise > 0.001 && exit < 1 },
    cup: {
      pos: [base[0], base[1] + CUP_PODIUM_H, base[2]] as Vec3,
      rot: [0, -0.5 + frame * 0.002, 0] as Vec3,
      scale: s,
      visible: rise > 0.001 && exit < 1,
      steam: interpolate(frame, [470, 490, 526, 538], [0, 1, 1, 0], clamp),
    },
  };
};
