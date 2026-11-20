import React from "react";
import { Easing, interpolate, useCurrentFrame } from "remotion";

export const DISPLAY = "Bricolage Grotesque";
export const BODY = "DM Sans";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

/**
 * Apparition / disparition douce d'un texte (opacité, glissé, flou).
 * `inAt` et `outAt` sont des numéros d'image.
 */
export const Reveal: React.FC<{
  inAt: number;
  outAt: number;
  children: React.ReactNode;
  style?: React.CSSProperties;
  dy?: number;
}> = ({ inAt, outAt, children, style, dy = 46 }) => {
  const frame = useCurrentFrame();
  const enter = interpolate(frame, [inAt, inAt + 14], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  const exit = interpolate(frame, [outAt - 10, outAt], [0, 1], { ...clamp, easing: Easing.in(Easing.cubic) });
  if (frame < inAt || frame >= outAt) return null;
  return (
    <div
      style={{
        opacity: enter * (1 - exit),
        translate: `0px ${(1 - enter) * dy - exit * 30}px`,
        filter: `blur(${(1 - enter) * 10 + exit * 8}px)`,
        ...style,
      }}
    >
      {children}
    </div>
  );
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
