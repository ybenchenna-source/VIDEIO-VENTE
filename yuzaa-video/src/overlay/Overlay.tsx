import React from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { COLORS, TEXTS } from "../config";
import { getLayout, projectToScreen } from "../layout";
import { boxTop } from "../three/choreo";
import { clipAt, isLight, videoPoint } from "../Clips";
import { BODY, DISPLAY, Kinetic, Reveal, Rich } from "./Text";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

const headline: React.CSSProperties = {
  textShadow: "0 4px 28px rgba(6, 26, 14, 0.45)",
  fontFamily: DISPLAY,
  fontWeight: 800,
  color: COLORS.sand50,
  letterSpacing: "-0.03em",
  lineHeight: 0.98,
  margin: 0,
};

const body: React.CSSProperties = {
  textShadow: "0 3px 20px rgba(6, 26, 14, 0.5)",
  fontFamily: BODY,
  fontWeight: 500,
  color: COLORS.sand50,
  lineHeight: 1.2,
};

/** Couleurs des textes posés sur un plan clair (mur blanc, fenêtre). */
const ON_LIGHT = {
  text: COLORS.green900,
  green: COLORS.green500,
  amber: COLORS.amber700,
  red: COLORS.red500,
  shadow: "0 2px 18px rgba(255, 252, 240, 0.7)",
};

/** Étiquette crème translucide qui détache un texte d'un fond chargé. */
const card = (k: number): React.CSSProperties => ({
  background: "rgba(250, 247, 239, 0.78)",
  backdropFilter: "blur(8px)",
  borderRadius: 24 * k,
  padding: `${14 * k}px ${22 * k}px`,
  boxShadow: "0 10px 30px rgba(15, 51, 32, 0.18)",
});

/** Bloc de texte collé en haut de la zone de sécurité. */
const Top: React.FC<{ children: React.ReactNode; offset?: number }> = ({ children, offset = 0 }) => {
  const { width, height } = useVideoConfig();
  const L = getLayout(width, height);
  return (
    <div style={{ position: "absolute", left: L.left, top: L.top + offset, width: width - L.left - L.right }}>
      {children}
    </div>
  );
};

/** Bloc de texte collé en bas de la zone de sécurité. */
const Bottom: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { width, height } = useVideoConfig();
  const L = getLayout(width, height);
  return (
    <div
      style={{
        position: "absolute",
        left: L.left,
        bottom: height - L.bottom,
        width: width - L.left - L.right,
      }}
    >
      {children}
    </div>
  );
};

/* ───────────── Scène 1 ───────────── */
const Hook: React.FC<{ k: number }> = ({ k }) => (
  <Top offset={20}>
    <Reveal inAt={6} outAt={100} enter={false}>
      <h1 style={{ ...headline, fontSize: 124 * k }}>
        <Kinetic text={TEXTS.hook.title} accent={TEXTS.hook.accent} inAt={6} />
      </h1>
    </Reveal>
  </Top>
);

/* ───────────── Scène 2 ───────────── */
const Money: React.FC<{ k: number }> = ({ k }) => {
  const frame = useCurrentFrame();
  const n = Math.round(
    interpolate(frame, [106, 120], [0, TEXTS.money.amount], { ...clamp, easing: Easing.out(Easing.cubic) }),
  );
  const hit = frame >= 120 ? Math.exp(-(frame - 120) / 4) : 0;
  return (
    <>
      <Top>
        <Reveal inAt={104} outAt={186} pop>
          <div
            style={{
              ...headline,
              fontSize: 300 * k,
              color: TEXTS.money.accent,
              fontVariantNumeric: "tabular-nums",
              lineHeight: 0.9,
              scale: String(1 + 0.2 * hit),
              rotate: `${-4 * hit}deg`,
              transformOrigin: "left center",
            }}
          >
            {n}
            {TEXTS.money.unit}
          </div>
          <div style={{ ...headline, fontSize: 96 * k, marginTop: 6 * k }}>{TEXTS.money.perMonth}</div>
        </Reveal>
      </Top>
      <Bottom>
        <Reveal inAt={124} outAt={186} enter={false}>
          <div style={{ ...body, fontWeight: 600, fontSize: 58 * k }}>
            <Kinetic text={TEXTS.money.sugar} accent={TEXTS.money.accent} inAt={124} />
          </div>
        </Reveal>
      </Bottom>
    </>
  );
};

/* ───────────── Scène 3 ───────────── */
const Plants: React.FC<{ k: number }> = ({ k }) => (
  <Top>
    <Reveal inAt={190} outAt={262} enter={false}>
      <h1 style={{ ...headline, fontSize: 98 * k }}>
        <Kinetic text={TEXTS.plants.title} accent={TEXTS.plants.accent} accent2={TEXTS.plants.accent2} inAt={190} stagger={1.8} />
      </h1>
    </Reveal>
  </Top>
);

/* ───────────── Scène 4 ───────────── */
const DOSE_COLORS_ON_LIGHT = [COLORS.green500, COLORS.amber700, COLORS.red500];
/** Centre horizontal de chaque boîte sur le clip gamme.mp4 (repère 1080 × 1920). */
const GAMME_BOX_X = [165, 465, 780];
const GAMME_LABEL_BOTTOM = 770;

const Range: React.FC<{ k: number }> = ({ k }) => {
  const frame = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();
  const L = getLayout(width, height);
  const labelW = 246 * k;
  const onClip = clipAt(375);
  const light = isLight(375);
  return (
    <>
      {TEXTS.range.products.map((p, i) => {
        let cx: number;
        let bottom: number;
        if (onClip) {
          const pt = videoPoint(GAMME_BOX_X[i], GAMME_LABEL_BOTTOM, width, height);
          cx = pt.x;
          bottom = pt.y;
        } else {
          const at = projectToScreen(frame, width, height, boxTop(i as 0 | 1 | 2, frame, fps));
          cx = at.x;
          bottom = at.y - 30 * k;
        }
        cx = Math.min(Math.max(cx, L.left * 0.6 + labelW / 2), width - L.right - labelW / 2);
        return (
          <div
            key={p.name}
            style={{ position: "absolute", left: cx - labelW / 2, top: bottom - 160 * k, width: labelW, textAlign: "center" }}
          >
            <Reveal inAt={326 + i * 6} outAt={452} dy={60} pop style={light ? { ...card(k), padding: `${10 * k}px ${8 * k}px` } : undefined}>
              <div style={{ ...body, fontWeight: 600, fontSize: 42 * k, opacity: 0.9, ...(light ? { color: ON_LIGHT.text, textShadow: ON_LIGHT.shadow } : {}) }}>
                {p.name}
              </div>
              <div
                style={{
                  ...headline,
                  fontSize: 74 * k,
                  color: light ? DOSE_COLORS_ON_LIGHT[i] : p.color,
                  whiteSpace: "nowrap",
                  ...(light ? { textShadow: ON_LIGHT.shadow } : {}),
                }}
              >
                {p.dose}
              </div>
            </Reveal>
          </div>
        );
      })}
      {onClip ? (
        <Top>
          <Reveal inAt={312} outAt={452} pop style={{ ...card(k), display: "inline-block" }}>
            <div style={{ ...headline, fontSize: 60 * k, lineHeight: 1.05, color: ON_LIGHT.text, textShadow: "none" }}>
              <Kinetic text={TEXTS.range.subtitle} accent={ON_LIGHT.green} inAt={316} stagger={1.6} />
            </div>
          </Reveal>
        </Top>
      ) : (
        <Bottom>
          <Reveal inAt={340} outAt={452}>
            <div style={{ ...headline, fontSize: 64 * k, lineHeight: 1.05 }}>
              <Rich text={TEXTS.range.subtitle} accent={TEXTS.range.accent} />
            </div>
          </Reveal>
        </Bottom>
      )}
    </>
  );
};

/* ───────────── Scène 5 ───────────── */
const Compare: React.FC<{ k: number }> = ({ k }) => {
  const frame = useCurrentFrame();
  const strike = interpolate(frame, [480, 494], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  const light = isLight(495);
  const ink = light ? { color: ON_LIGHT.text, textShadow: ON_LIGHT.shadow } : {};
  const row: React.CSSProperties = { display: "flex", alignItems: "baseline", gap: 22 * k };
  return (
    <Top>
      <Reveal inAt={456} outAt={540}>
        <div style={row}>
          <span style={{ ...headline, fontSize: 118 * k, color: light ? ON_LIGHT.red : COLORS.red300, position: "relative", ...(light ? { textShadow: ON_LIGHT.shadow } : {}) }}>
            {TEXTS.cup.canPrice}
            <span
              style={{
                position: "absolute",
                left: -6,
                top: "52%",
                height: 10 * k,
                width: `${strike * 104}%`,
                background: light ? ON_LIGHT.text : COLORS.sand50,
                borderRadius: 6,
                rotate: "-6deg",
              }}
            />
          </span>
          <span style={{ ...body, fontWeight: 600, fontSize: 54 * k, opacity: 0.9, ...ink }}>{TEXTS.cup.canLabel}</span>
        </div>
      </Reveal>
      <Reveal inAt={468} outAt={540}>
        <div style={{ ...row, marginTop: 10 * k }}>
          <span style={{ ...headline, fontSize: 118 * k, color: light ? ON_LIGHT.green : COLORS.green300, ...(light ? { textShadow: ON_LIGHT.shadow } : {}) }}>{TEXTS.cup.cupPrice}</span>
          <span style={{ ...body, fontWeight: 600, fontSize: 54 * k, opacity: 0.9, ...ink }}>{TEXTS.cup.cupLabel}</span>
        </div>
      </Reveal>
      <Reveal inAt={490} outAt={542} pop dy={40} style={{ rotate: "-3deg", transformOrigin: "left center" }}>
        <div
          style={{
            display: "inline-flex",
            alignItems: "baseline",
            gap: 20 * k,
            marginTop: 34 * k,
            padding: `${18 * k}px ${34 * k}px`,
            borderRadius: 999,
            background: COLORS.amber500,
          }}
        >
          <span style={{ ...headline, fontSize: 104 * k, color: COLORS.green900 }}>{TEXTS.cup.monthly}</span>
          <span style={{ ...headline, fontSize: 52 * k, color: COLORS.green900 }}>{TEXTS.cup.monthlyLabel}</span>
        </div>
      </Reveal>
    </Top>
  );
};

/* ───────────── Scène 6 ───────────── */
const Logo: React.FC<{ size: number }> = ({ size }) => (
  <svg width={size} height={size} viewBox="8 6 34 34" style={{ display: "block" }}>
    <path d="M12 37C12 20 22 10 40 8c0 19-10 29-28 29z" fill={COLORS.green300} />
    <path d="M30 13l-8 11h6l-3 10 9-12h-6l2-9z" fill={COLORS.green900} />
  </svg>
);

const End: React.FC<{ k: number }> = ({ k }) => {
  const E = TEXTS.end;
  return (
    <>
      <Top offset={-10 * k}>
        <Reveal inAt={540} outAt={99999} dy={40} pop>
          <div style={{ display: "flex", alignItems: "center", gap: 18 * k }}>
            <Logo size={176 * k} />
            <div style={{ ...headline, fontSize: 236 * k, letterSpacing: "-0.05em", lineHeight: 0.85 }}>{E.brand}</div>
          </div>
        </Reveal>
        <Reveal inAt={545} outAt={99999}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 18 * k, marginTop: 36 * k, flexWrap: "wrap" }}>
            <span style={{ ...headline, fontSize: 62 * k }}>{E.offerName}</span>
            <span style={{ ...headline, fontSize: 62 * k, color: COLORS.amber500 }}>{E.offerPrice}</span>
          </div>
        </Reveal>
        <Reveal inAt={549} outAt={99999}>
          <div style={{ ...body, fontWeight: 600, fontSize: 44 * k, marginTop: 30 * k }}>
            <Rich text={E.promoText} />
          </div>
          <div
            style={{
              display: "inline-block",
              marginTop: 14 * k,
              padding: `${12 * k}px ${30 * k}px`,
              borderRadius: 18 * k,
              background: COLORS.amber500,
              color: COLORS.green900,
              fontFamily: DISPLAY,
              fontWeight: 800,
              fontSize: 64 * k,
              letterSpacing: "0.04em",
            }}
          >
            {E.promoCode}
          </div>
        </Reveal>
      </Top>
      <Bottom>
        <Reveal inAt={552} outAt={99999}>
          <div
            style={{
              display: "inline-block",
              padding: `${14 * k}px ${32 * k}px`,
              borderRadius: 999,
              border: `3px solid ${COLORS.green300}`,
              ...body,
              fontWeight: 700,
              fontSize: 48 * k,
            }}
          >
            {E.url}
          </div>
        </Reveal>
      </Bottom>
    </>
  );
};

export const Overlay: React.FC = () => {
  const { width, height } = useVideoConfig();
  const { k } = getLayout(width, height);
  return (
    <AbsoluteFill>
      <Hook k={k} />
      <Money k={k} />
      <Plants k={k} />
      <Range k={k} />
      <Compare k={k} />
      <End k={k} />
    </AbsoluteFill>
  );
};
