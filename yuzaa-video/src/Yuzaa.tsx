import { AbsoluteFill, Img, random, staticFile, useCurrentFrame } from "remotion";
import { Audio } from "@remotion/media";
import { COLORS, MUSIC_FILE, MUSIC_VOLUME } from "./config";
import "./fonts";
import { Overlay } from "./overlay/Overlay";
import { Scene3D } from "./three/Scene3D";
import { ClipsLayer, TextScrim, clipAt } from "./Clips";
import { MotionBlurDefs } from "./motion";

/** Fond vert foncé de la marque, avec un halo doux au centre. */
const Background: React.FC = () => (
  <AbsoluteFill
    style={{
      background: `radial-gradient(120% 70% at 50% 58%, ${COLORS.green700} 0%, ${COLORS.green900} 55%, #08200f 100%)`,
    }}
  />
);

/** Grain de film léger, qui change à chaque image (position tirée avec une graine fixe). */
const Grain: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ overflow: "hidden", pointerEvents: "none", mixBlendMode: "overlay", opacity: 0.16 }}>
      <Img
        src={staticFile("grain.jpg")}
        style={{
          position: "absolute",
          left: -60 + random(`gx-${frame}`) * 60,
          top: -90 + random(`gy-${frame}`) * 90,
          width: 1200,
          height: 2100,
        }}
      />
    </AbsoluteFill>
  );
};

/** La 3D n'est calculée que là où aucun clip vidéo ne couvre l'image. */
const Scene3DWhenNeeded: React.FC = () => {
  const frame = useCurrentFrame();
  return clipAt(frame) ? null : <Scene3D />;
};

export const Yuzaa: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: COLORS.green900 }}>
    <MotionBlurDefs />
    <Background />
    <Scene3DWhenNeeded />
    <ClipsLayer />
    <TextScrim />
    <Grain />
    <Overlay />
    {/* Emplacement musique : voir MUSIC_FILE dans src/config.ts */}
    {MUSIC_FILE ? <Audio src={staticFile(MUSIC_FILE)} volume={MUSIC_VOLUME} /> : null}
  </AbsoluteFill>
);
