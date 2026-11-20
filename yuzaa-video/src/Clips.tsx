import { Video } from "@remotion/media";
import { AbsoluteFill, Easing, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { CLIPS, type ClipSpec } from "./config";
import { motionBlur, punch, shake } from "./motion";

/** Durée (en images) de chaque moitié d'une transition entre deux plans. */
const HALF = 7;
const ease = Easing.inOut(Easing.cubic);

type Kind = NonNullable<ClipSpec["enter"]>;

/**
 * Position d'un plan pendant une transition.
 * q va de 0 à 1 sur toute la transition ; `side` dit si le plan sort ou entre.
 */
const transition = (kind: Kind, q: number, side: "out" | "in", width: number, height: number) => {
  const e = ease(q);
  const speed = Math.sin(Math.PI * q); // vitesse relative : maximale au milieu
  if (kind === "whipUp") {
    const y = side === "out" ? -e * height : (1 - e) * height;
    return { x: 0, y, scale: 1, opacity: 1, blur: motionBlur("y", speed * 56) };
  }
  if (kind === "whipLeft") {
    const x = side === "out" ? -e * width : (1 - e) * width;
    return { x, y: 0, scale: 1, opacity: 1, blur: motionBlur("x", speed * 56) };
  }
  // Zoom traversant : le plan sortant fonce vers la caméra, l'entrant arrive de loin
  const scale = side === "out" ? 1 + e * 0.7 : 1.5 - 0.5 * e;
  const opacity = side === "out" ? 1 - e : e;
  return { x: 0, y: 0, scale, opacity, blur: speed > 0.05 ? `blur(${speed * 16}px)` : "" };
};

const Clip: React.FC<{ c: ClipSpec; next?: ClipSpec; isFirst: boolean }> = ({ c, next, isFirst }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  // Recadrage « cover » : le clip remplit tout l'écran, quel que soit le format
  const r = c.ratio ?? 9 / 16;
  const vw = Math.max(width, height * r);
  const vh = vw / r;

  const start = isFirst ? c.from : c.from - HALF;
  const end = c.to + HALF;
  if (frame < start || frame >= end) return null;
  const lead = c.from - start;

  // Transition d'entrée / de sortie
  let t = { x: 0, y: 0, scale: 1, opacity: 1, blur: "" };
  if (!isFirst && frame < c.from + HALF) {
    const q = interpolate(frame, [c.from - HALF, c.from + HALF], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    t = transition(c.enter ?? "zoom", q, "in", width, height);
  } else if (frame >= c.to - HALF) {
    const q = interpolate(frame, [c.to - HALF, c.to + HALF], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    t = transition(next?.enter ?? "zoom", q, "out", width, height);
  }

  // Caméra vivante : poussée lente sur tout le plan + coups de zoom et secousses sur les impacts
  const push = interpolate(frame, [c.from, c.to], [0, 0.08], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const beats = c.beats ?? [];
  const k = shake(frame, beats);
  const zoom = 1 + push + punch(frame, beats);

  const filters = [t.blur, c.dim ? "blur(7px) saturate(1.1)" : ""].filter(Boolean).join(" ");
  return (
    <AbsoluteFill
      style={{
        opacity: t.opacity,
        translate: `${t.x + k.x}px ${t.y + k.y}px`,
        scale: String(t.scale * zoom),
      }}
    >
      <Video
        src={staticFile(c.file)}
        from={start}
        trimBefore={Math.max(0, Math.round(c.trimStart * fps - lead * c.rate))}
        durationInFrames={Math.round((end - start) * c.rate)}
        playbackRate={c.rate}
        muted
        style={{
          position: "absolute",
          left: (width - vw) / 2,
          top: (height - vh) / 2,
          width: vw,
          height: vh,
          filter: filters || undefined,
        }}
      />
      {c.dim ? <AbsoluteFill style={{ background: "rgba(12, 44, 26, 0.66)" }} /> : null}
    </AbsoluteFill>
  );
};

export const ClipsLayer: React.FC = () => (
  <>
    {CLIPS.map((c, i) => (
      <Clip key={`${c.file}-${c.from}`} c={c} next={CLIPS[i + 1]} isFirst={i === 0 && c.from === 0} />
    ))}
  </>
);

/** Vrai si un clip couvre entièrement l'image (la 3D n'a alors pas besoin d'être calculée). */
export const clipAt = (frame: number) =>
  CLIPS.some((c) => frame >= (c.from === 0 ? 0 : c.from + HALF) && frame < c.to - HALF) ||
  CLIPS.some((c, i) => {
    const n = CLIPS[i + 1];
    return n && n.from === c.to && frame >= c.to - HALF && frame < c.to + HALF;
  });

/** Vrai si un plan sombre est visible (le voile de lisibilité n'est utile que là). */
const darkClipVisible = (frame: number) =>
  CLIPS.some((c) => !c.light && !c.dim && frame >= c.from - HALF && frame < c.to + HALF);

/** Vrai si le plan affiché à cette image est clair (textes en vert foncé). */
export const isLight = (frame: number) => CLIPS.some((c) => c.light && frame >= c.from && frame < c.to);

/**
 * Convertit une position mesurée sur un clip 9:16 (repère 1080 × 1920)
 * en position à l'écran, quel que soit le format (recadrage « cover »).
 */
export const videoPoint = (x1080: number, y1920: number, width: number, height: number) => {
  const vw = Math.max(width, (height * 9) / 16);
  const vh = (vw * 16) / 9;
  return { x: (width - vw) / 2 + (x1080 * vw) / 1080, y: (height - vh) / 2 + (y1920 * vh) / 1920 };
};

/** Voile sombre en haut de l'image pour que les textes restent lisibles sur la vidéo. */
export const TextScrim: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill
      style={{
        opacity: darkClipVisible(frame) ? 1 : 0,
        background:
          "linear-gradient(180deg, rgba(5,20,11,0.55) 0%, rgba(5,20,11,0.25) 32%, rgba(5,20,11,0) 48%, rgba(5,20,11,0) 70%, rgba(5,20,11,0.35) 100%)",
      }}
    />
  );
};
