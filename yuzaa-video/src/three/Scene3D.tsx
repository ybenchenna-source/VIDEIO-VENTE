import { ThreeCanvas } from "@remotion/three";
import { staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import {
  COIN_COUNT,
  LEAF_COUNT,
  box,
  coin,
  compareCan,
  cup,
  heroCan,
  leaf,
  leafKind,
} from "./choreo";
import { Box, CameraRig, Can, Coin, Cup, Guarana, Leaf, PRODUCTS, Stage } from "./Objects";

const Objects: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const showCoins = frame >= 88 && frame < 205;
  const showLeaves = frame >= 182 && frame < 290;

  return (
    <>
      <Can {...heroCan(frame)} />
      <Can {...compareCan(frame)} />

      {showCoins &&
        Array.from({ length: COIN_COUNT }, (_, i) => <Coin key={i} {...coin(i, frame, fps)} />)}

      {showLeaves &&
        Array.from({ length: LEAF_COUNT }, (_, i) => {
          const kind = leafKind(i);
          const t = leaf(i, frame);
          return kind === "guarana" ? <Guarana key={i} {...t} /> : <Leaf key={i} kind={kind} {...t} />;
        })}

      {PRODUCTS.map((p, i) => (
        <Box
          key={p.front}
          front={staticFile(p.front)}
          side={p.side}
          top={p.top}
          {...box(i as 0 | 1 | 2, frame, fps)}
        />
      ))}

      <Cup {...cup(frame, fps)} />
    </>
  );
};

export const Scene3D: React.FC = () => {
  const { width, height } = useVideoConfig();
  return (
    <ThreeCanvas width={width} height={height} shadows gl={{ antialias: true, alpha: true }}>
      <CameraRig />
      <Stage />
      <Objects />
    </ThreeCanvas>
  );
};
