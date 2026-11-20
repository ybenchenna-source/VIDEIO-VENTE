import * as THREE from "three";
import { useThree } from "@react-three/fiber";
import { staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { cameraState, makeCamera } from "../layout";
import { useLeafTexture, useSteamTexture } from "./textures";
import { useModel } from "./useGLB";

/**
 * Objets de la vidéo. Les modèles 3D viennent de Blender
 * (blender/build_assets.py → public/models/*.glb).
 */

type Vec3 = [number, number, number];

/* ───────────── Caméra ───────────── */

export const CameraRig: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  const s = cameraState(frame, width, height);
  camera.fov = s.fov;
  camera.near = 0.1;
  camera.far = 100;
  camera.position.copy(s.position);
  camera.lookAt(s.target);
  camera.updateProjectionMatrix();
  return null;
};

/** Ajustements de matériaux communs (verre, feuilles, écran…). */
const tune = (m: THREE.MeshStandardMaterial): THREE.Material | void => {
  const name = m.name;
  if (name.startsWith("leaf-") || name.endsWith("-leaf")) {
    m.alphaTest = 0.5;
    m.transparent = false;
    m.side = THREE.DoubleSide;
    return;
  }
  if (name === "glass") {
    return new THREE.MeshPhysicalMaterial({
      name,
      color: "#ffffff",
      transmission: 1,
      roughness: 0.03,
      thickness: 0.08,
      ior: 1.45,
      side: THREE.DoubleSide,
      envMapIntensity: 1.2,
    });
  }
  if (name === "tea") {
    // Opaque : un objet transmissif n'est pas visible à travers un autre (le verre)
    return new THREE.MeshPhysicalMaterial({
      name,
      color: "#d9a03c",
      roughness: 0.05,
      clearcoat: 1,
      clearcoatRoughness: 0.02,
      emissive: new THREE.Color("#7a3c08"),
      emissiveIntensity: 0.25,
    });
  }
  if (name === "laptop-screen") {
    m.emissiveIntensity = 1.4;
    return;
  }
};

/* ───────────── Modèle générique ───────────── */

export const Model: React.FC<{
  src: string;
  pos?: Vec3;
  rot?: Vec3;
  scale?: number | Vec3;
  visible?: boolean;
}> = ({ src, pos = [0, 0, 0], rot = [0, 0, 0], scale = 1, visible = true }) => {
  const obj = useModel(staticFile(src), tune);
  if (!obj) return null;
  return <primitive object={obj} position={pos} rotation={rot} scale={scale} visible={visible} />;
};

/* ───────────── Canette, pièce, boîte, feuilles ───────────── */

export const Can: React.FC<{ pos: Vec3; rot: Vec3; scale: Vec3; visible: boolean }> = (t) => (
  <Model src="models/can.glb" {...t} />
);

export const Coin: React.FC<{ pos: Vec3; rot: Vec3; scale: number; visible: boolean }> = (t) => (
  <Model src="models/coin.glb" {...t} />
);

export const PRODUCTS = [
  { key: "eveil", model: "models/box-eveil.glb" },
  { key: "focus", model: "models/box-focus.glb" },
  { key: "rush", model: "models/box-rush.glb" },
] as const;

export const Box: React.FC<{ model: string; pos: Vec3; rot: Vec3; scale: number; visible: boolean }> = ({
  model,
  ...t
}) => <Model src={model} {...t} />;

export const Leaf: React.FC<{
  kind: "guayusa" | "mate";
  pos: Vec3;
  rot: Vec3;
  scale: number;
  visible: boolean;
}> = ({ kind, ...t }) => <Model src={`models/leaf-${kind}.glb`} {...t} scale={t.scale * 1.15} />;

export const Guarana: React.FC<{ pos: Vec3; rot: Vec3; scale: number; visible: boolean }> = (t) => (
  <Model src="models/guarana.glb" {...t} scale={t.scale * 0.75} />
);

/* ───────────── Décors ───────────── */

export const DeskSet: React.FC<{ visible: boolean; drop: number }> = ({ visible, drop }) => (
  <group visible={visible} position={[0, -drop, 0]}>
    <Model src="models/desk.glb" />
  </group>
);

export const BotanicalSet: React.FC<{ visible: boolean; rise: number }> = ({ visible, rise }) => (
  <group visible={visible} position={[0, -(1 - rise) * 3.2, 0]}>
    <Model src="models/botanical.glb" />
  </group>
);

/* ───────────── Mug en verre fumant ───────────── */

export const Cup: React.FC<{ pos: Vec3; rot: Vec3; scale: number; visible: boolean; steam: number }> = (t) => {
  const frame = useCurrentFrame();
  const steamTex = useSteamTexture();
  return (
    <group position={t.pos} rotation={t.rot} scale={t.scale} visible={t.visible}>
      <Model src="models/mug.glb" />
      {/* Feuille qui flotte sur l'infusion */}
      <Model
        src="models/leaf-mate.glb"
        pos={[0.06, 0.625, 0.1]}
        rot={[0, 0.6 + Math.sin(frame * 0.03) * 0.08, 0]}
        scale={0.55}
      />
      {/* Vapeur */}
      {[0, 1, 2].map((k) => {
        const cycle = (((frame * 0.012 + k / 3) % 1) + 1) % 1;
        const fade = Math.sin(cycle * Math.PI);
        return (
          <mesh
            key={k}
            position={[(k - 1) * 0.12 + Math.sin(frame * 0.05 + k) * 0.04, 1.0 + cycle * 0.6, 0.05 * k]}
            rotation={[0, -t.rot[1], Math.sin(frame * 0.04 + k * 2) * 0.12]}
            scale={[0.55 + cycle * 0.35, 1.2, 1]}
          >
            <planeGeometry args={[0.6, 1.2]} />
            <meshBasicMaterial
              map={steamTex}
              transparent
              depthWrite={false}
              opacity={0.5 * fade * t.steam}
              color="#ffffff"
            />
          </mesh>
        );
      })}
    </group>
  );
};

/* ───────────── Feuille géante devant la caméra (changement de décor) ───────────── */

/**
 * Feuille plate placée juste devant la caméra et qui monte à travers le cadre.
 * Au milieu de son passage elle masque tout l'écran : c'est à ce moment
 * que le bureau laisse place au studio botanique.
 */
export const GiantLeaf: React.FC<{ from: number; to: number }> = ({ from, to }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const tex = useLeafTexture("guayusa");
  if (frame < from || frame > to) return null;
  const p = (frame - from) / (to - from);
  const cam = makeCamera(frame, width, height);
  const dist = 1.3;
  const fwd = new THREE.Vector3(0, 0, -1).applyQuaternion(cam.quaternion);
  const up = new THREE.Vector3(0, 1, 0).applyQuaternion(cam.quaternion);
  const right = new THREE.Vector3(1, 0, 0).applyQuaternion(cam.quaternion);
  const pos = cam.position
    .clone()
    .add(fwd.multiplyScalar(dist))
    .add(up.multiplyScalar(-2.0 + 4.0 * p))
    .add(right.multiplyScalar(-0.12 + 0.24 * p));
  const q = cam.quaternion.clone().multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), -0.28));
  return (
    <mesh position={pos} quaternion={q}>
      <planeGeometry args={[1.7, 3.4]} />
      <meshStandardMaterial map={tex} alphaTest={0.5} side={THREE.DoubleSide} roughness={0.55} emissive="#0d3a1c" emissiveIntensity={0.4} emissiveMap={tex} />
    </mesh>
  );
};
