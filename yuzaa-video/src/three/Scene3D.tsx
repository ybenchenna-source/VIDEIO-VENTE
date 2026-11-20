import { ThreeCanvas } from "@remotion/three";
import { Bloom, EffectComposer, ToneMapping, Vignette } from "@react-three/postprocessing";
import { ToneMappingMode } from "postprocessing";
import { useEffect, useState } from "react";
import { useThree } from "@react-three/fiber";
import { useCurrentFrame, useDelayRender, useVideoConfig } from "remotion";
import {
  COIN_COUNT,
  COMPARE_PODIUM_H,
  CUP_PODIUM_H,
  LEAF_COUNT,
  PODIUM_COLORS,
  PODIUM_H,
  WIPE_COUNT,
  botanicalRise,
  botanicalVisible,
  box,
  boxPodium,
  deskDrop,
  deskVisible,
  SET_SWAP,
  wipeLeaf,
  coin,
  compareCan,
  cup,
  heroCan,
  leaf,
  leafKind,
} from "./choreo";
import { BotanicalSet, Box, CameraRig, Can, Coin, Cup, DeskSet, GiantLeaf, Guarana, Leaf, PRODUCTS } from "./Objects";
import { FLOOR } from "./choreo";
import { Podium, StudioSet } from "./Set";

const Objects: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const showCoins = frame >= 88 && frame < 205;
  const showLeaves = frame >= 182 && frame < 290;
  const cmp = compareCan(frame, fps);
  const c = cup(frame, fps);

  return (
    <>
      {/* Scènes 1-2 : le bureau de révisions, la nuit */}
      <DeskSet visible={deskVisible(frame)} drop={deskDrop(frame)} />
      {/* La première canette, déjà bue, couchée sur le bureau */}
      <Can
        pos={[-0.55, FLOOR + 0.004 + 0.3 - deskDrop(frame), 0.95]}
        rot={[0.1, -0.55, Math.PI / 2]}
        scale={[0.9, 0.9, 0.9]}
        visible={deskVisible(frame)}
      />
      <Can {...heroCan(frame)} />

      {/* Scènes 3 à 6 : le studio botanique */}
      <BotanicalSet visible={botanicalVisible(frame)} rise={botanicalRise(frame)} />

      {/* Feuille géante devant la caméra : le décor change pendant qu'elle masque l'écran */}
      <GiantLeaf from={SET_SWAP - 7} to={SET_SWAP + 7} />

      {/* Rideau de feuilles au premier plan (changement de décor) */}
      {frame >= 186 && frame < 232 &&
        Array.from({ length: WIPE_COUNT }, (_, i) => {
          const w = wipeLeaf(i, frame);
          return <Leaf key={`w${i}`} kind={w.kind} pos={w.pos} rot={w.rot} scale={w.scale} visible={w.visible} />;
        })}

      {showCoins &&
        Array.from({ length: COIN_COUNT }, (_, i) => <Coin key={i} {...coin(i, frame, fps)} />)}

      {showLeaves &&
        Array.from({ length: LEAF_COUNT }, (_, i) => {
          const kind = leafKind(i);
          const t = leaf(i, frame);
          return kind === "guarana" ? <Guarana key={i} {...t} /> : <Leaf key={i} kind={kind} {...t} />;
        })}

      {/* Scènes 4 et 6 : les boîtes sur des socles à la hauteur de leur dose */}
      {PRODUCTS.map((p, i) => {
        const pod = boxPodium(i as 0 | 1 | 2, frame, fps);
        return (
          <group key={p.key}>
            <group position={pod.pos} scale={pod.scale} visible={pod.visible}>
              <Podium pos={[0, 0, 0]} radius={0.58} height={PODIUM_H[i]} color={PODIUM_COLORS[i]} />
            </group>
            <Box model={p.model} {...box(i as 0 | 1 | 2, frame, fps)} />
          </group>
        );
      })}

      {/* Scène 5 : canette contre tasse */}
      <Podium {...cmp.podium} radius={0.5} height={COMPARE_PODIUM_H} color="#14261c" />
      <Can {...cmp.can} />
      <Podium {...c.podium} radius={1.05} height={CUP_PODIUM_H} color="#cbbd9c" />
      <Cup {...c.cup} />
    </>
  );
};

/**
 * Au montage, la chaîne de post-traitement n'est pas prête lors du premier
 * dessin : on redessine quelques fois avant de laisser Remotion capturer l'image.
 */
const WarmUp: React.FC = () => {
  const advance = useThree((s) => s.advance);
  const { delayRender, continueRender } = useDelayRender();
  const [handle] = useState(() => delayRender("Préchauffage du rendu 3D"));
  useEffect(() => {
    let n = 0;
    let timer: ReturnType<typeof setTimeout>;
    const tick = () => {
      advance(performance.now());
      n++;
      if (n < 3) timer = setTimeout(tick, 30);
      else continueRender(handle);
    };
    timer = setTimeout(tick, 30);
    return () => clearTimeout(timer);
  }, [advance, continueRender, handle]);
  return null;
};

export const Scene3D: React.FC = () => {
  const { width, height } = useVideoConfig();
  return (
    <ThreeCanvas width={width} height={height} shadows gl={{ antialias: false, alpha: false }}>
      <WarmUp />
      <CameraRig />
      <StudioSet />
      <Objects />
      <EffectComposer multisampling={4}>
        <Bloom mipmapBlur intensity={0.75} luminanceThreshold={0.72} luminanceSmoothing={0.25} />
        <Vignette offset={0.28} darkness={0.62} />
        <ToneMapping mode={ToneMappingMode.NEUTRAL} />
      </EffectComposer>
    </ThreeCanvas>
  );
};
