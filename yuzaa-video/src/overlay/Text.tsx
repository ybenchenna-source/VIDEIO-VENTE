import React from "react";
import { Easing, interpolate, useCurrentFrame } from "remotion";
import { motionBlur } from "../motion";

export const DISPLAY = "Bricolage Grotesque";
export const BODY = "DM Sans";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

const back = Easing.out(Easing.back(1.7));

/**
 * Apparition dynamique d'un bloc de texte : il jaillit avec un léger rebond
 * et un flou de mouvement vertical, puis repart vers le haut en fin de vie.
 * `inAt` et `outAt` sont des numéros d'image. `enter={false}` : seule la sortie est animée
 * (pour les textes déjà animés mot par mot avec <Kinetic>).
 */
export const Reveal: React.FC<{
  inAt: number;
  outAt: number;
  children: React.ReactNode;
  style?: React.CSSProperties;
  dy?: number;
  enter?: boolean;
  pop?: boolean;
}> = ({ inAt, outAt, children, style, dy = 70, enter = true, pop = false }) => {
  const frame = useCurrentFrame();
  if (frame < inAt || frame >= outAt) return null;
  const e = enter ? interpolate(frame, [inAt, inAt + 12], [0, 1], { ...clamp, easing: back }) : 1;
  const fade = enter ? interpolate(frame, [inAt, inAt + 5], [0, 1], clamp) : 1;
  const x = interpolate(frame, [outAt - 8, outAt], [0, 1], { ...clamp, easing: Easing.in(Easing.cubic) });
  const vy = (1 - Math.min(1, e)) * dy * 0.9 + x * 50;
  return (
    <div
      style={{
        opacity: fade * (1 - x),
        translate: `0px ${(1 - e) * dy - x * 90}px`,
        scale: pop ? String(0.6 + 0.4 * e) : undefined,
        filter: motionBlur("y", vy) || undefined,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

/**
 * Texte animé mot par mot : chaque mot jaillit avec un petit décalage,
 * un rebond et un flou de mouvement. Mêmes repères de couleur que <Rich>.
 */
export const Kinetic: React.FC<{
  text: string;
  inAt: number;
  accent?: string;
  accent2?: string;
  stagger?: number;
}> = ({ text, inAt, accent, accent2, stagger = 2.2 }) => {
  const frame = useCurrentFrame();
  const parts = text.split(/(\[[^\]]+\]|\{[^}]+\})/g).filter(Boolean);
  let n = 0;
  const out: React.ReactNode[] = [];
  parts.forEach((p, pi) => {
    const color = p.startsWith("[") ? accent : p.startsWith("{") ? accent2 : undefined;
    const raw = color ? p.slice(1, -1) : p;
    raw.split(/( +)/).forEach((w, wi) => {
      if (w === "") return;
      if (/^ +$/.test(w)) {
        out.push(<React.Fragment key={`${pi}-${wi}`}>{w}</React.Fragment>);
        return;
      }
      const start = inAt + n * stagger;
      n++;
      const e = interpolate(frame, [start, start + 12], [0, 1], { ...clamp, easing: back });
      const o = interpolate(frame, [start, start + 4], [0, 1], clamp);
      out.push(
        <span
          key={`${pi}-${wi}`}
          style={{
            display: "inline-block",
            color,
            opacity: o,
            translate: `0px ${(1 - e) * 80}px`,
            rotate: `${(1 - Math.min(1, e)) * 6}deg`,
            filter: motionBlur("y", (1 - Math.min(1, e)) * 64) || undefined,
          }}
        >
          {sup(w)}
        </span>,
      );
    });
  });
  return <>{out}</>;
};

/**
 * Texte avec mots colorés : [mot] → `accent`, {mot} → `accent2`.
 * « 1re » est mis en exposant automatiquement.
 */
export const Rich: React.FC<{ text: string; accent?: string; accent2?: string }> = ({
  text,
  accent,
  accent2,
}) => {
  const parts = text.split(/(\[[^\]]+\]|\{[^}]+\})/g).filter(Boolean);
  return (
    <>
      {parts.map((p, i) => {
        if (p.startsWith("[")) return <span key={i} style={{ color: accent }}>{sup(p.slice(1, -1))}</span>;
        if (p.startsWith("{")) return <span key={i} style={{ color: accent2 }}>{sup(p.slice(1, -1))}</span>;
        return <React.Fragment key={i}>{sup(p)}</React.Fragment>;
      })}
    </>
  );
};

const sup = (s: string) => {
  const bits = s.split(/(\d)(re|er)\b/g);
  if (bits.length === 1) return s;
  const out: React.ReactNode[] = [];
  for (let i = 0; i < bits.length; i++) {
    if (bits[i] === "re" || bits[i] === "er") {
      out.push(
        <sup key={i} style={{ fontSize: "0.6em", verticalAlign: "0.55em", lineHeight: 0 }}>
          {bits[i]}
        </sup>,
      );
    } else out.push(<React.Fragment key={i}>{bits[i]}</React.Fragment>);
  }
  return out;
};
