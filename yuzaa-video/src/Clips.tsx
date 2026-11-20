import { Video } from "@remotion/media";
import { AbsoluteFill, Easing, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { CLIPS } from "./config";

/** Durée (en images) de chaque moitié d'un fondu entre deux plans. */
const BLEND = 8;
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.inOut(Easing.cubic) } as const;

/**
 * Un clip vidéo sur sa plage d'images, sans le son.
 * Il entre et sort par un fondu cinéma (zoom + flou + transparence),
 * jamais par une coupe sèche.
 */
const Clip: React.FC<{ c: (typeof CLIPS)[number]; isFirst: boolean }> = ({ c, isFirst }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  // Recadrage « cover » : les clips sont en 9:16 ; en 4:5 on coupe le haut et le bas
  const vw = Math.max(width, (height * 9) / 16);
  const vh = (vw * 16) / 9;
  const start = isFirst ? c.from : c.from - BLEND;
  const end = c.to + BLEND;
  const lead = c.from - start; // images jouées avant `from` pendant le fondu d'entrée
  const pIn = isFirst ? 1 : interpolate(frame, [c.from - BLEND, c.from + BLEND], [0, 1], clamp);
  const pOut = interpolate(frame, [c.to - BLEND, c.to + BLEND], [1, 0], clamp);
  const p = Math.min(pIn, pOut);
  const scale = pOut < 1 ? 1 + (1 - pOut) * 0.22 : 1.1 - 0.1 * pIn;
  return (
    <AbsoluteFill style={{ opacity: p, scale: String(scale), filter: `blur(${(1 - p) * 14}px)` }}>
      <Video
        src={staticFile(c.file)}
        from={start}
        trimBefore={Math.max(0, Math.round(c.trimStart * fps - lead * c.rate))}
        durationInFrames={Math.round((end - start) * c.rate)}
        playbackRate={c.rate}
        muted
        style={{ position: "absolute", left: (width - vw) / 2, top: (height - vh) / 2, width: vw, height: vh }}
      />
    </AbsoluteFill>
  );
};

export const ClipsLayer: React.FC = () => (
  <>
    {CLIPS.map((c, i) => (
      <Clip key={c.file} c={c} isFirst={i === 0 && c.from === 0} />
    ))}
  </>
);

/** Vrai si un clip couvre entièrement l'image (la 3D n'a alors pas besoin d'être calculée). */
export const clipAt = (frame: number) =>
  CLIPS.some((c) => frame >= (c.from === 0 ? 0 : c.from + BLEND) && frame < c.to - BLEND);

/** Vrai si un clip est visible, même en partie (pour le voile de lisibilité). */
const clipVisible = (frame: number) => CLIPS.some((c) => frame >= c.from - BLEND && frame < c.to + BLEND);

/** Voile sombre en haut de l'image pour que les textes restent lisibles sur la vidéo. */
export const TextScrim: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill
      style={{
        opacity: clipVisible(frame) ? 1 : 0,
        background:
          "linear-gradient(180deg, rgba(5,20,11,0.55) 0%, rgba(5,20,11,0.25) 32%, rgba(5,20,11,0) 48%, rgba(5,20,11,0) 70%, rgba(5,20,11,0.35) 100%)",
      }}
    />
  );
};
