import { Composition, Folder } from "remotion";
import { DURATION_IN_FRAMES, FPS } from "./config";
import { Yuzaa } from "./Yuzaa";
import { JINGLE_FRAMES, Jingle } from "./jingle/Jingle";

export const RemotionRoot: React.FC = () => (
  <Folder name="yuzaa">
    {/* Reel Instagram / TikTok / publicité */}
    <Composition
      id="Yuzaa-9x16"
      component={Yuzaa}
      durationInFrames={DURATION_IN_FRAMES}
      fps={FPS}
      width={1080}
      height={1920}
    />
    {/* Fil Instagram */}
    <Composition
      id="Yuzaa-4x5"
      component={Yuzaa}
      durationInFrames={DURATION_IN_FRAMES}
      fps={FPS}
      width={1080}
      height={1350}
    />
    {/* Jingle de fin : logo + « yuzaa, infusez votre journée » */}
    <Composition
      id="Jingle-9x16"
      component={Jingle}
      durationInFrames={JINGLE_FRAMES}
      fps={FPS}
      width={1080}
      height={1920}
    />
    <Composition
      id="Jingle-4x5"
      component={Jingle}
      durationInFrames={JINGLE_FRAMES}
      fps={FPS}
      width={1080}
      height={1350}
    />
  </Folder>
);
