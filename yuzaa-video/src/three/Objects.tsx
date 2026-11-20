import * as THREE from "three";
import { useMemo } from "react";
import { useThree } from "@react-three/fiber";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { cameraState } from "../layout";
import { BOX, CAN_H, FLOOR } from "./choreo";
import {
  useCanWrap,
  useCoinFace,
  useImageTexture,
  useLeafTexture,
  useSteamTexture,
} from "./textures";

type Vec3 = [number, number, number];

/* ───────────── Caméra, lumière, sol ───────────── */

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

export const Stage: React.FC = () => {
  const gl = useThree((s) => s.gl);
  const scene = useThree((s) => s.scene);
  useMemo(() => {
    gl.toneMapping = THREE.NeutralToneMapping;
    gl.toneMappingExposure = 1.0;
    gl.shadowMap.enabled = true;
    gl.shadowMap.type = THREE.PCFSoftShadowMap;
    const pmrem = new THREE.PMREMGenerator(gl);
    scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environmentIntensity = 0.65;
  }, [gl, scene]);

  return (
    <>
      <hemisphereLight args={["#fff6e8", "#0F3320", 0.55]} />
      <directionalLight
        position={[-3, 6.5, 5]}
        intensity={2.3}
        color="#fff8ee"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0004}
        shadow-radius={6}
        shadow-camera-left={-5}
        shadow-camera-right={5}
        shadow-camera-top={5}
        shadow-camera-bottom={-5}
      />
      {/* Contre-jour vert pour détacher les objets du fond */}
      <directionalLight position={[3.5, 2.5, -4]} intensity={1.6} color="#bfeccb" />
      <pointLight position={[4, 1, 6]} intensity={6} distance={20} color="#ffe2b8" />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, FLOOR, 0]} receiveShadow>
        <planeGeometry args={[40, 40]} />
        <shadowMaterial opacity={0.32} color="#03140a" />
      </mesh>
    </>
  );
};

/* ───────────── Canette générique ───────────── */

const ALU = { color: "#d5dae0", metalness: 1, roughness: 0.24 };

export const Can: React.FC<{ pos: Vec3; rot: Vec3; scale: Vec3; visible: boolean }> = (t) => {
  const wrap = useCanWrap();
  const R = 0.33;
  const bottom = useMemo(
    () =>
      new THREE.LatheGeometry(
        [
          [0, 0.02],
          [0.22, 0.0],
          [0.27, 0.012],
          [0.305, 0.045],
          [0.325, 0.09],
          [R, 0.12],
        ].map(([x, y]) => new THREE.Vector2(x, y)),
        64,
      ),
    [],
  );
  const top = useMemo(
    () =>
      new THREE.LatheGeometry(
        [
          [R, 1.06],
          [0.326, 1.1],
          [0.296, 1.165],
          [0.272, 1.192],
          [0.27, 1.21],
          [0.276, 1.222],
          [0.268, 1.232],
          [0.252, 1.226],
          [0.246, 1.205],
          [0, 1.205],
        ].map(([x, y]) => new THREE.Vector2(x, y)),
        64,
      ),
    [],
  );
  return (
    <group position={t.pos} rotation={t.rot} scale={t.scale} visible={t.visible}>
      <mesh geometry={bottom} castShadow>
        <meshStandardMaterial {...ALU} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, 0.59, 0]} castShadow>
        <cylinderGeometry args={[R, R, 0.94, 64, 1, true]} />
        <meshStandardMaterial map={wrap} metalness={0.75} roughness={0.32} />
      </mesh>
      <mesh geometry={top} castShadow>
        <meshStandardMaterial {...ALU} side={THREE.DoubleSide} />
      </mesh>
      {/* Languette */}
      <mesh position={[0.05, 1.212, 0]} rotation={[-Math.PI / 2, 0, 0.3]}>
        <torusGeometry args={[0.055, 0.014, 8, 24]} />
        <meshStandardMaterial {...ALU} />
      </mesh>
      <mesh position={[-0.03, 1.212, 0]} rotation={[0, 0.3, 0]}>
        <boxGeometry args={[0.12, 0.01, 0.07]} />
        <meshStandardMaterial {...ALU} />
      </mesh>
    </group>
  );
};

export const CAN_HEIGHT = CAN_H;

/* ───────────── Pièce ───────────── */

export const Coin: React.FC<{ pos: Vec3; rot: Vec3; scale: number; visible: boolean }> = (t) => {
  const top = useCoinFace(-Math.PI / 2);
  const bottom = useCoinFace(Math.PI / 2);
  const mats = useMemo(() => {
    const side = new THREE.MeshStandardMaterial({ color: "#d9a53b", metalness: 1, roughness: 0.3 });
    const f = new THREE.MeshStandardMaterial({ map: top, metalness: 0.85, roughness: 0.3 });
    const b = new THREE.MeshStandardMaterial({ map: bottom, metalness: 0.85, roughness: 0.3 });
    return [side, f, b];
  }, [top, bottom]);
  return (
    <mesh position={t.pos} rotation={t.rot} scale={t.scale} visible={t.visible} material={mats} castShadow>
      <cylinderGeometry args={[0.24, 0.24, 0.045, 48]} />
    </mesh>
  );
};

/* ───────────── Feuilles et graines ───────────── */

const useBentPlane = (w: number, h: number) =>
  useMemo(() => {
    const g = new THREE.PlaneGeometry(w, h, 6, 12);
    const p = g.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i);
      const y = p.getY(i);
      // Feuille légèrement creusée au centre et courbée sur la longueur
      p.setZ(i, -Math.pow(x / (w / 2), 2) * 0.05 + Math.pow(y / (h / 2), 2) * 0.06);
    }
    g.computeVertexNormals();
    return g;
  }, [w, h]);

export const Leaf: React.FC<{
  kind: "guayusa" | "mate";
  pos: Vec3;
  rot: Vec3;
  scale: number;
  visible: boolean;
}> = (t) => {
  const tex = useLeafTexture(t.kind);
  const geo = useBentPlane(0.26, 0.52);
  return (
    <mesh geometry={geo} position={t.pos} rotation={t.rot} scale={t.scale} visible={t.visible} castShadow>
      <meshStandardMaterial map={tex} alphaTest={0.5} side={THREE.DoubleSide} roughness={0.55} />
    </mesh>
  );
};

/** Graine de guarana : baie rouge, chair blanche, graine noire. */
export const Guarana: React.FC<{ pos: Vec3; rot: Vec3; scale: number; visible: boolean }> = (t) => (
  <group position={t.pos} rotation={t.rot} scale={t.scale * 0.85} visible={t.visible}>
    <mesh castShadow>
      <sphereGeometry args={[0.12, 32, 24]} />
      <meshStandardMaterial color="#c9281c" roughness={0.3} />
    </mesh>
    <mesh position={[0, 0, 0.075]} scale={[1, 1, 0.6]}>
      <sphereGeometry args={[0.072, 24, 16]} />
      <meshStandardMaterial color="#f6efe2" roughness={0.5} />
    </mesh>
    <mesh position={[0, 0, 0.11]}>
      <sphereGeometry args={[0.045, 24, 16]} />
      <meshStandardMaterial color="#111" roughness={0.15} />
    </mesh>
  </group>
);

/* ───────────── Boîte yuzaa ───────────── */

export const PRODUCTS = [
  { front: "textures/eveil-front.jpg", side: "#6d8a5c", top: "#86a374" },
  { front: "textures/focus-front.jpg", side: "#d8962b", top: "#e6a83c" },
  { front: "textures/rush-front.jpg", side: "#922314", top: "#a8301f" },
] as const;

export const Box: React.FC<{
  front: string;
  side: string;
  top: string;
  pos: Vec3;
  rot: Vec3;
  scale: number;
  visible: boolean;
}> = (t) => {
  const tex = useImageTexture(t.front);
  const mats = useMemo(() => {
    const card = { roughness: 0.62, metalness: 0 };
    const side = new THREE.MeshStandardMaterial({ color: t.side, ...card });
    const top = new THREE.MeshStandardMaterial({ color: t.top, ...card });
    const front = new THREE.MeshStandardMaterial({ map: tex, ...card });
    // ordre BoxGeometry : +x, -x, +y, -y, +z (face avant), -z
    return [side, side, top, side, front, side];
  }, [tex, t.side, t.top]);
  return (
    <mesh position={t.pos} rotation={t.rot} scale={t.scale} visible={t.visible} material={mats} castShadow>
      <boxGeometry args={[BOX.w, BOX.h, BOX.d]} />
    </mesh>
  );
};

/* ───────────── Tasse fumante ───────────── */

export const Cup: React.FC<{ pos: Vec3; rot: Vec3; scale: number; visible: boolean; steam: number }> = (t) => {
  const frame = useCurrentFrame();
  const steamTex = useSteamTexture();
  const body = useMemo(
    () =>
      new THREE.LatheGeometry(
        [
          [0, 0.0],
          [0.36, 0.0],
          [0.41, 0.025],
          [0.44, 0.1],
          [0.475, 0.62],
          [0.485, 0.7],
          [0.478, 0.72],
          [0.45, 0.72],
          [0.44, 0.66],
          [0.405, 0.12],
          [0.36, 0.07],
          [0, 0.07],
        ].map(([x, y]) => new THREE.Vector2(x, y)),
        72,
      ),
    [],
  );
  const ceramic = { color: "#FAF7EF", roughness: 0.28, metalness: 0 };
  return (
    <group position={t.pos} rotation={t.rot} scale={t.scale} visible={t.visible}>
      <mesh geometry={body} castShadow>
        <meshStandardMaterial {...ceramic} side={THREE.DoubleSide} />
      </mesh>
      {/* Soucoupe */}
      <mesh position={[0, -0.02, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.74, 0.62, 0.045, 72]} />
        <meshStandardMaterial {...ceramic} />
      </mesh>
      {/* Infusion */}
      <mesh position={[0, 0.6, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.448, 64]} />
        <meshStandardMaterial color="#b97a1c" roughness={0.12} metalness={0.1} />
      </mesh>
      {/* Anse */}
      <mesh position={[0.47, 0.37, 0]} rotation={[0, 0, -Math.PI / 2]} castShadow>
        <torusGeometry args={[0.17, 0.045, 20, 40, Math.PI]} />
        <meshStandardMaterial {...ceramic} />
      </mesh>
      {/* Vapeur */}
      {[0, 1, 2].map((k) => {
        const cycle = ((frame * 0.012 + k / 3) % 1 + 1) % 1;
        const fade = Math.sin(cycle * Math.PI);
        return (
          <mesh
            key={k}
            position={[(k - 1) * 0.12 + Math.sin(frame * 0.05 + k) * 0.04, 0.95 + cycle * 0.6, 0.05 * k]}
            rotation={[0, -t.rot[1], Math.sin(frame * 0.04 + k * 2) * 0.12]}
            scale={[0.55 + cycle * 0.35, 1.2, 1]}
          >
            <planeGeometry args={[0.6, 1.2]} />
            <meshBasicMaterial
              map={steamTex}
              transparent
              depthWrite={false}
              opacity={0.42 * fade * t.steam}
              color="#ffffff"
            />
          </mesh>
        );
      })}
    </group>
  );
};
