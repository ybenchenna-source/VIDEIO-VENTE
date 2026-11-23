import React from "react";
import { Audio } from "@remotion/media";
import { loadFont } from "@remotion/fonts";
import { AbsoluteFill, Easing, interpolate, random, staticFile, useCurrentFrame, useVideoConfig } from "remotion";

/**
 * Jingle de fin TIFANNA (4,5 s) — joaillerie sur vêtement, Paris.
 * Fond émeraude, ligne d'or qui se dessine, lettres qui apparaissent sur les notes
 * de célesta, émeraude taillée qui scintille sur l'accord final, voix « Tifanna, Paris. ».
 * Musique composée : public/tifanna/musique.wav (glissando 0–0,65 s, notes 0,7 / 1 / 1,3 / 1,75 s).
 */

const SERIF = "Cormorant Garamond";
loadFont({ family: SERIF, url: staticFile("tifanna/cormorant-garamond-latin-500-normal.woff2"), weight: "500" });
loadFont({
  family: SERIF,
  url: staticFile("tifanna/cormorant-garamond-latin-400-italic.woff2"),
  weight: "400",
  style: "italic",
});

export const TIFANNA_JINGLE_FRAMES = 135;

const C = {
  emerald: "#0f2b1f",
  emeraldLight: "#1d4a35",
  gold: "#d4b06a",
  goldLight: "#f1dca6",
  cream: "#f6f1e6",
  gem: "#1f8a5b",
};
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const smooth = Easing.out(Easing.cubic);

/** Image d'apparition de chaque lettre, calée sur les notes de la musique. */
const LETTER_AT = [20, 25, 30, 35, 40, 46, 52];

/** Émeraude taillée (vue de face). */
const Emerald: React.FC<{ size: number; shine: number }> = ({ size, shine }) => (
  <svg width={size} height={size * 0.78} viewBox="0 0 100 78" style={{ display: "block", overflow: "visible" }}>
    <defs>
      <linearGradient id="gemBody" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#3fbf86" />
        <stop offset="0.5" stopColor={C.gem} />
        <stop offset="1" stopColor="#0b4a30" />
      </linearGradient>
      <linearGradient id="gemShine" x1="0" y1="0" x2="1" y2="0">
        <stop offset={Math.max(0, shine - 0.15)} stopColor="rgba(255,255,255,0)" />
        <stop offset={shine} stopColor="rgba(255,255,255,0.85)" />
        <stop offset={Math.min(1, shine + 0.15)} stopColor="rgba(255,255,255,0)" />
      </linearGradient>
    </defs>
    {/* Monture en or */}
    <polygon points="14,2 86,2 98,14 98,64 86,76 14,76 2,64 2,14" fill={C.gold} />
    {/* Pierre */}
    <polygon points="17,7 83,7 93,17 93,61 83,71 17,71 7,61 7,17" fill="url(#gemBody)" />
    {/* Table et facettes */}
    <polygon points="28,20 72,20 80,28 80,50 72,58 28,58 20,50 20,28" fill="rgba(255,255,255,0.12)" stroke="rgba(255,255,255,0.35)" strokeWidth={0.8} />
    {[
      [17, 7, 28, 20], [83, 7, 72, 20], [93, 17, 80, 28], [93, 61, 80, 50],
      [83, 71, 72, 58], [17, 71, 28, 58], [7, 61, 20, 50], [7, 17, 20, 28],
    ].map(([x1, y1, x2, y2], i) => (
      <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(255,255,255,0.3)" strokeWidth={0.8} />
    ))}
    <polygon points="17,7 83,7 93,17 93,61 83,71 17,71 7,61 7,17" fill="url(#gemShine)" style={{ mixBlendMode: "screen" }} />
  </svg>
);

/** Poussière d'or qui flotte lentement. */
const GoldDust: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  return (
    <>
      {Array.from({ length: 40 }, (_, i) => {
        const x = random(`gd-x-${i}`) * width;
        const y0 = random(`gd-y-${i}`) * height;
        const y = (y0 - frame * (0.4 + random(`gd-v-${i}`) * 0.9) + height) % height;
        const s = 2 + random(`gd-s-${i}`) * 4;
        const tw = 0.35 + 0.65 * Math.abs(Math.sin(frame * 0.08 + i));
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x,
              top: y,
              width: s,
              height: s,
              borderRadius: "50%",
              background: C.goldLight,
              opacity: 0.55 * tw * interpolate(frame, [0, 15], [0, 1], clamp),
              boxShadow: `0 0 ${s * 3}px ${C.gold}`,
            }}
          />
        );
      })}
    </>
  );
};

export const JingleTifanna: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const k = Math.min(width / 1080, height / 1350);

  const fadeIn = interpolate(frame, [0, 8], [0, 1], clamp);
  const zoom = 1 + interpolate(frame, [0, TIFANNA_JINGLE_FRAMES], [0, 0.05], clamp);
  // Ligne d'or : se dessine depuis le centre pendant le glissando de harpe
  const line = interpolate(frame, [2, 22], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  // Émeraude : apparaît sur l'accord final (1,75 s), puis reflet
  const gemIn = interpolate(frame, [50, 64], [0, 1], { ...clamp, easing: Easing.out(Easing.back(1.4)) });
  const shine = interpolate(frame, [62, 86], [-0.2, 1.2], clamp);
  const glow = frame >= 52 ? Math.exp(-(frame - 52) / 18) : 0;
  // Sous-titre sur « Paris » (voix : « Paris » vers 2,9 s)
  const sub = interpolate(frame, [84, 104], [0, 1], { ...clamp, easing: smooth });

  return (
    <AbsoluteFill style={{ backgroundColor: C.emerald, opacity: fadeIn }}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(65% 42% at 50% 50%, ${C.emeraldLight} 0%, ${C.emerald} 65%, #08180f 100%)`,
        }}
      />
      <AbsoluteFill style={{ scale: String(zoom) }}>
        <GoldDust />
        {/* Halo doré au moment de l'accord */}
        <AbsoluteFill
          style={{
            background: `radial-gradient(35% 22% at 50% 47%, rgba(212,176,106,${0.35 * glow}) 0%, rgba(212,176,106,0) 100%)`,
          }}
        />
        <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
          {/* Émeraude */}
          <div
            style={{
              opacity: Math.min(1, gemIn * 1.5),
              scale: String(0.6 + 0.4 * gemIn),
              translate: `0px ${(1 - gemIn) * 30 * k}px`,
              marginBottom: 42 * k,
              filter: `drop-shadow(0 0 ${24 * glow * k}px rgba(63,191,134,0.8))`,
            }}
          >
            <Emerald size={190 * k} shine={shine} />
          </div>

          {/* TIFANNA, lettre par lettre */}
          <div
            style={{
              display: "flex",
              fontFamily: SERIF,
              fontWeight: 500,
              fontSize: 150 * k,
              color: C.cream,
              letterSpacing: `${interpolate(frame, [18, 70], [0.42, 0.24], { ...clamp, easing: smooth })}em`,
              marginRight: `-0.24em`,
            }}
          >
            {"TIFANNA".split("").map((ch, i) => {
              const at = LETTER_AT[i];
              const e = interpolate(frame, [at, at + 14], [0, 1], { ...clamp, easing: smooth });
              return (
                <span
                  key={i}
                  style={{
                    display: "inline-block",
                    opacity: e,
                    translate: `0px ${(1 - e) * 26 * k}px`,
                    filter: e < 1 ? `blur(${(1 - e) * 10}px)` : undefined,
                  }}
                >
                  {ch}
                </span>
              );
            })}
          </div>

          {/* Ornement : ligne d'or et petits losanges */}
          <div style={{ position: "relative", width: 620 * k, height: 18 * k, marginTop: 26 * k }}>
            <div
              style={{
                position: "absolute",
                left: "50%",
                top: "50%",
                width: `${line * 100}%`,
                height: 2 * k,
                translate: "-50% -50%",
                background: `linear-gradient(90deg, rgba(212,176,106,0), ${C.gold} 20%, ${C.goldLight} 50%, ${C.gold} 80%, rgba(212,176,106,0))`,
              }}
            />
            {[-0.5, -0.25, 0, 0.25, 0.5].map((p, i) => {
              const a = interpolate(frame, [10 + Math.abs(p) * 20, 22 + Math.abs(p) * 20], [0, 1], clamp);
              const s = (i === 2 ? 14 : 8) * k;
              return (
                <div
                  key={i}
                  style={{
                    position: "absolute",
                    left: `${50 + p * 92}%`,
                    top: "50%",
                    width: s,
                    height: s,
                    translate: "-50% -50%",
                    rotate: "45deg",
                    background: i === 2 ? C.goldLight : C.gold,
                    opacity: a,
                    scale: String(a),
                  }}
                />
              );
            })}
          </div>

          {/* Sous-titre */}
          <div
            style={{
              marginTop: 34 * k,
              fontFamily: SERIF,
              fontWeight: 500,
              fontSize: 34 * k,
              letterSpacing: "0.34em",
              color: C.gold,
              opacity: sub,
              translate: `0px ${(1 - sub) * 16 * k}px`,
              textTransform: "uppercase",
              whiteSpace: "nowrap",
            }}
          >
            Paris · Joaillerie sur vêtement
          </div>
          <div
            style={{
              marginTop: 18 * k,
              fontFamily: SERIF,
              fontStyle: "italic",
              fontWeight: 400,
              fontSize: 44 * k,
              color: C.cream,
              opacity: interpolate(frame, [96, 114], [0, 0.85], clamp),
            }}
          >
            La pierre épouse le tissu.
          </div>
        </AbsoluteFill>
      </AbsoluteFill>

      {/* Son : musique composée + voix « Tifanna, Paris. » */}
      <Audio
        src={staticFile("tifanna/musique.wav")}
        volume={(f) => interpolate(f, [0, 115, 135], [1, 1, 0], clamp)}
      />
      <Audio src={staticFile("tifanna/voix.mp3")} from={58} volume={1} />
    </AbsoluteFill>
  );
};
