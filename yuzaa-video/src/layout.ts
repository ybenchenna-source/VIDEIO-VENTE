import * as THREE from "three";
import { Easing, interpolate } from "remotion";

/**
 * Mise en page selon le format.
 * - 9:16 (Reel / TikTok) : zones de sécurité 250 px en haut, 420 px en bas,
 *   160 px à droite.
 * - 4:5 (fil Instagram) : même animation, marges plus serrées.
 */
export type Layout = {
  isFeed: boolean;
  /** Haut de la zone de texte haute (px). */
  top: number;
  /** Bas de la zone de texte basse (px). */
  bottom: number;
  left: number;
  right: number;
  /** Facteur appliqué aux tailles de texte. */
  k: number;
};

export const getLayout = (width: number, height: number): Layout => {
  const isFeed = height / width < 1.5;
  if (isFeed) {
    return { isFeed, top: 80, bottom: height - 80, left: 80, right: 120, k: 0.82 };
  }
  return { isFeed, top: 270, bottom: height - 440, left: 80, right: 170, k: 1 };
};

/** Champ vertical de la caméra en 9:16. En 4:5 on garde le même champ horizontal. */
const BASE_VFOV = 32;
const BASE_ASPECT = 9 / 16;

const fovFor = (aspect: number) => {
  const half = THREE.MathUtils.degToRad(BASE_VFOV / 2);
  const hHalf = Math.atan(Math.tan(half) * BASE_ASPECT);
  return THREE.MathUtils.radToDeg(2 * Math.atan(Math.tan(hHalf) / aspect));
};

const ease = Easing.inOut(Easing.cubic);
const opts = { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease } as const;

/** Trajectoire lente de la caméra, image par image. */
export const cameraState = (frame: number, width: number, height: number) => {
  const z = interpolate(
    frame,
    [0, 75, 180, 290, 330, 445, 480, 535, 565, 600],
    [10.4, 9.7, 10.0, 9.5, 10.5, 10.2, 9.8, 9.6, 11.0, 10.8],
    opts,
  );
  const x = 0.28 * Math.sin((frame / 600) * Math.PI * 2);
  const y = interpolate(frame, [0, 290, 330, 445, 480, 600], [0.55, 0.35, 0.05, 0.05, 0.45, 0.35], opts);
  const targetY = interpolate(
    frame,
    [0, 180, 300, 330, 445, 480, 540, 570],
    [-0.3, -0.15, -0.3, -0.72, -0.72, -0.45, -0.45, -0.2],
    opts,
  );
  const isFeed = height / width < 1.5;
  return {
    position: new THREE.Vector3(x, y, z),
    target: new THREE.Vector3(x * 0.4, targetY + (isFeed ? 0.15 : 0), 0),
    fov: fovFor(width / height),
  };
};

export const makeCamera = (frame: number, width: number, height: number) => {
  const s = cameraState(frame, width, height);
  const cam = new THREE.PerspectiveCamera(s.fov, width / height, 0.1, 100);
  cam.position.copy(s.position);
  cam.lookAt(s.target);
  cam.updateMatrixWorld();
  cam.updateProjectionMatrix();
  return cam;
};

/** Projette un point 3D en pixels écran (pour placer un texte sur un objet). */
export const projectToScreen = (
  frame: number,
  width: number,
  height: number,
  p: [number, number, number],
) => {
  const cam = makeCamera(frame, width, height);
  const v = new THREE.Vector3(...p).project(cam);
  return { x: ((v.x + 1) / 2) * width, y: ((1 - v.y) / 2) * height };
};
