import { AbsoluteFill, staticFile } from "remotion";
import { Audio } from "@remotion/media";
import { COLORS, MUSIC_FILE, MUSIC_VOLUME } from "./config";
import "./fonts";
import { Overlay } from "./overlay/Overlay";
import { Scene3D } from "./three/Scene3D";

/** Fond vert foncé de la marque, avec un halo doux au centre. */
const Background: React.FC = () => (
  <AbsoluteFill
    style={{
      background: `radial-gradient(120% 70% at 50% 58%, ${COLORS.green700} 0%, ${COLORS.green900} 55%, #08200f 100%)`,
    }}
  />
);

export const Yuzaa: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: COLORS.green900 }}>
    <Background />
    <Scene3D />
    <Overlay />
    {/* Emplacement musique : voir MUSIC_FILE dans src/config.ts */}
    {MUSIC_FILE ? <Audio src={staticFile(MUSIC_FILE)} volume={MUSIC_VOLUME} /> : null}
  </AbsoluteFill>
);
