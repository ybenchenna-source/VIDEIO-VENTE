import React from "react";

/**
 * Flou de mouvement directionnel (filtres SVG), très léger à calculer :
 * on étire l'image dans le sens du mouvement, d'autant plus que ça va vite.
 */
const LEVELS = 14;
const STEP = 4; // px de flou par niveau

export const MotionBlurDefs: React.FC = () => (
  <svg width={0} height={0} style={{ position: "absolute" }} aria-hidden>
    <defs>
      {Array.from({ length: LEVELS }, (_, i) => {
        const s = (i + 1) * STEP;
        return (
          <React.Fragment key={i}>
            <filter id={`mbY${i + 1}`} x="-10%" y="-30%" width="120%" height="160%">
              <feGaussianBlur stdDeviation={`0 ${s}`} />
            </filter>
            <filter id={`mbX${i + 1}`} x="-30%" y="-10%" width="160%" height="120%">
              <feGaussianBlur stdDeviation={`${s} 0`} />
            </filter>
          </React.Fragment>
        );
      })}
    </defs>
  </svg>
);

/** Filtre CSS de flou de mouvement : `amount` en pixels, `axis` = direction du mouvement. */
export const motionBlur = (axis: "x" | "y", amount: number): string => {
  const level = Math.min(LEVELS, Math.round(Math.abs(amount) / STEP));
  if (level <= 0) return "";
  return `url(#mb${axis === "x" ? "X" : "Y"}${level})`;
};

/** Secousse amortie déclenchée à chaque « impact » (image donnée), déterministe. */
export const shake = (frame: number, beats: number[], amplitude = 16) => {
  let x = 0;
  let y = 0;
  for (const b of beats) {
    const t = frame - b;
    if (t < 0 || t > 14) continue;
    const decay = Math.exp(-t / 4);
    x += Math.sin(t * 2.7 + b) * amplitude * decay;
    y += Math.cos(t * 3.1 + b * 0.7) * amplitude * 0.8 * decay;
  }
  return { x, y };
};

/** Coup de zoom bref à chaque impact. */
export const punch = (frame: number, beats: number[], strength = 0.07) => {
  let s = 0;
  for (const b of beats) {
    const t = frame - b;
    if (t < 0) continue;
    s += strength * Math.exp(-t / 5) * Math.min(1, (t + 1) / 2);
  }
  return s;
};
