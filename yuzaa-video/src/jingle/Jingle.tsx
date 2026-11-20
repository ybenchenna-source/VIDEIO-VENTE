import React from "react";
import { Audio } from "@remotion/media";
import { AbsoluteFill, Easing, interpolate, random, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { COLORS } from "../config";
import "../fonts";
import { MotionBlurDefs, motionBlur } from "../motion";
import { DISPLAY } from "../overlay/Text";

/**
 * Jingle de fin yuzaa (4 s) : le logo jaillit au milieu d'un tourbillon de feuilles,
 * la voix off dit « yuzaa ! Infusez votre journée ! ».
 * Calé sur public/jingle/musique.mp3 (temps forts à 0,2 s, 0,85 s et 1,85 s)
 * et public/jingle/voix.mp3 (« yuzaa » à 0,5 s, « infusez » à 1,4 s).
 */

export const JINGLE_FRAMES = 120;
export const TAGLINE = ["infusez", "votre", "journée"];
/** Image où chaque mot de la signature apparaît (calée sur la voix). */
const TAGLINE_AT = [42, 52, 59];

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const back = Easing.out(Easing.back(1.8));

/* ───────────── Logo : la feuille-éclair du site yuzaa ───────────── */
const LogoMark: React.FC<{ size: number }> = ({ size }) => (
  <svg width={size} height={size} viewBox="8 6 34 34" style={{ display: "block", overflow: "visible" }}>
    <path d="M12 37C12 20 22 10 40 8c0 19-10 29-28 29z" fill={COLORS.green300} />
    <path d="M30 13l-8 11h6l-3 10 9-12h-6l2-9z" fill={COLORS.green900} />
  </svg>
);

/* ───────────── Feuille décorative ───────────── */
const LeafShape: React.FC<{ color: string }> = ({ color }) => (
  <svg viewBox="0 0 40 80" width="100%" height="100%" style={{ display: "block" }}>
    <path d="M20 78C4 58 2 26 20 2c18 24 16 56 0 76z" fill={color} />
    <path d="M20 76V6" stroke="rgba(255,255,255,0.35)" strokeWidth={1.6} fill="none" />
  </svg>
);

const LEAF_COLORS = [COLORS.green300, COLORS.green500, "#4fa267", COLORS.amber500];

/** Feuilles qui tourbillonnent vers le centre, puis flottent autour du logo. */
const Leaves: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const cx = width / 2;
  const cy = height / 2;
  return (
    <>
      {Array.from({ length: 16 }, (_, i) => {
        const a0 = random(`jl-a-${i}`) * Math.PI * 2;
        const r0 = Math.max(width, height) * (0.75 + random(`jl-r-${i}`) * 0.35);
        const rEnd = Math.min(width, height) * (0.36 + random(`jl-e-${i}`) * 0.22);
        const p = interpolate(frame, [0, 16], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
        const spin = a0 + p * 2.2 + frame * 0.012 * (i % 2 ? 1 : -1);
        const r = r0 + (rEnd - r0) * p + Math.sin(frame * 0.05 + i) * 14;
        const size = 100 + random(`jl-s-${i}`) * 130;
        const speed = (1 - p) * 60;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: cx + Math.cos(spin) * r - size / 4,
              top: cy + Math.sin(spin) * r * 1.25 - size / 2,
              width: size / 2,
              height: size,
              rotate: `${(spin * 180) / Math.PI + 90 + Math.sin(frame * 0.08 + i) * 12}deg`,
              opacity: 0.85,
              filter: [motionBlur("y", speed), random(`jl-b-${i}`) > 0.6 ? "blur(3px)" : ""].join(" ").trim() || undefined,
            }}
          >
            <LeafShape color={LEAF_COLORS[i % LEAF_COLORS.length]} />
          </div>
        );
      })}
    </>
  );
};

/** Onde « goutte d'infusion » qui s'étend depuis le logo. */
const Ripple: React.FC<{ at: number; delay?: number }> = ({ at, delay = 0 }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const t = frame - at - delay;
  if (t < 0 || t > 26) return null;
  const p = Easing.out(Easing.cubic)(t / 26);
  const d = Math.min(width, height) * (0.2 + p * 0.95);
  return (
    <div
      style={{
        position: "absolute",
        left: width / 2 - d / 2,
        top: height / 2 - d / 2,
        width: d,
        height: d,
        borderRadius: "50%",
        border: `${6 * (1 - p) + 1}px solid ${COLORS.amber500}`,
        opacity: 1 - p,
      }}
    />
  );
};

/** Étincelles au moment du reflet lumineux. */
const Sparkles: React.FC<{ at: number }> = ({ at }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const t = frame - at;
  if (t < 0 || t > 30) return null;
  return (
    <>
      {Array.from({ length: 14 }, (_, i) => {
        const a = random(`sp-a-${i}`) * Math.PI * 2;
        const dist = (120 + random(`sp-d-${i}`) * 320) * Easing.out(Easing.cubic)(Math.min(1, t / 22));
        const s = (8 + random(`sp-s-${i}`) * 12) * (1 - t / 30);
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: width / 2 + Math.cos(a) * dist * 1.4 - s / 2,
              top: height / 2 - 40 + Math.sin(a) * dist * 0.7 - s / 2,
              width: s,
              height: s,
              rotate: "45deg",
              background: i % 3 === 0 ? COLORS.amber500 : COLORS.sand50,
              boxShadow: `0 0 ${s * 1.5}px ${COLORS.amber500}`,
            }}
          />
        );
      })}
    </>
  );
};

export const Jingle: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const k = Math.min(width / 1080, height / 1350);

  // Logo : impact à 0,2 s
  const markIn = interpolate(frame, [6, 18], [0, 1], { ...clamp, easing: back });
  const markRot = interpolate(frame, [6, 18], [-120, 0], { ...clamp, easing: Easing.out(Easing.cubic) });
  // Poussée lente de la caméra sur tout le jingle + respiration
  const zoom = 1 + interpolate(frame, [0, JINGLE_FRAMES], [0, 0.06], clamp);
  // Reflet lumineux sur le logo à la note finale
  const shine = interpolate(frame, [56, 74], [-40, 140], clamp);
  // Fondu d'entrée (raccord avec la fin de la pub)
  const fadeIn = interpolate(frame, [0, 6], [0, 1], clamp);

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.green900, opacity: fadeIn }}>
      <MotionBlurDefs />
      <AbsoluteFill
        style={{
          background: `radial-gradient(70% 45% at 50% 50%, ${COLORS.green700} 0%, ${COLORS.green900} 70%, #08200f 100%)`,
        }}
      />
      <AbsoluteFill style={{ scale: String(zoom) }}>
        <Leaves />
        <Ripple at={6} />
        <Ripple at={6} delay={7} />
        <Sparkles at={57} />

        {/* Logo + nom */}
        <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 22 * k, translate: `0px ${-40 * k}px` }}>
            <div
              style={{
                scale: String(Math.max(0, markIn)),
                rotate: `${markRot}deg`,
                filter: motionBlur("y", (1 - Math.min(1, markIn)) * 50) || undefined,
              }}
            >
              <LogoMark size={190 * k} />
            </div>
            <div
              style={{
                position: "relative",
                fontFamily: DISPLAY,
                fontWeight: 800,
                fontSize: 250 * k,
                lineHeight: 0.85,
                letterSpacing: "-0.05em",
                color: COLORS.sand50,
                display: "flex",
              }}
            >
              {"yuzaa".split("").map((ch, i) => {
                const st = 15 + i * 2.5;
                const e = interpolate(frame, [st, st + 10], [0, 1], { ...clamp, easing: back });
                const o = interpolate(frame, [st, st + 3], [0, 1], clamp);
                return (
                  <span
                    key={i}
                    style={{
                      display: "inline-block",
                      opacity: o,
                      translate: `0px ${(1 - e) * 120 * k}px`,
                      filter: motionBlur("y", (1 - Math.min(1, e)) * 60) || undefined,
                    }}
                  >
                    {ch}
                  </span>
                );
              })}
              {/* Reflet qui balaie le mot */}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background: `linear-gradient(105deg, transparent ${shine - 18}%, rgba(255,255,255,0.75) ${shine}%, transparent ${shine + 18}%)`,
                  mixBlendMode: "overlay",
                  pointerEvents: "none",
                }}
              />
            </div>
          </div>

          {/* Signature, mot par mot sur la voix */}
          <div
            style={{
              display: "flex",
              gap: 18 * k,
              marginTop: 46 * k,
              translate: `0px ${-40 * k}px`,
              fontFamily: DISPLAY,
              fontWeight: 700,
              fontSize: 86 * k,
              letterSpacing: "-0.02em",
            }}
          >
            {TAGLINE.map((w, i) => {
              const st = TAGLINE_AT[i];
              const e = interpolate(frame, [st, st + 10], [0, 1], { ...clamp, easing: back });
              const o = interpolate(frame, [st, st + 3], [0, 1], clamp);
              return (
                <span
                  key={w}
                  style={{
                    display: "inline-block",
                    opacity: o,
                    color: i === 0 ? COLORS.amber500 : COLORS.sand50,
                    translate: `0px ${(1 - e) * 70 * k}px`,
                    scale: String(0.7 + 0.3 * e),
                    filter: motionBlur("y", (1 - Math.min(1, e)) * 50) || undefined,
                  }}
                >
                  {w}
                </span>
              );
            })}
          </div>
        </AbsoluteFill>
      </AbsoluteFill>

      {/* Son : musique, whoosh, voix off, scintillement */}
      <Audio src={staticFile("jingle/whoosh.mp3")} volume={0.35} />
      <Audio src={staticFile("jingle/musique.mp3")} from={3} volume={0.32} />
      <Audio src={staticFile("jingle/voix.mp3")} from={13} volume={1} />
      <Audio src={staticFile("jingle/scintillement.mp3")} from={55} volume={0.3} />
    </AbsoluteFill>
  );
};
