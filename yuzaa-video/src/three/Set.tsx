import * as THREE from "three";
import { useMemo } from "react";
import { useThree } from "@react-three/fiber";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { Easing, interpolate, random, useCurrentFrame } from "remotion";
import { FLOOR } from "./choreo";

/**
 * Le plateau : fond courbe de studio, lumières qui racontent l'histoire,
 * feuilles floues, pollen et rayons de lumière.
 */

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

/** 0 = ambiance canette (sombre, contre-jour rouge) → 1 = ambiance plantes (chaude, dorée). */
export const warmth = (frame: number) =>
  interpolate(frame, [168, 262], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });

const mix = (a: string, b: string, t: number) => new THREE.Color(a).lerp(new THREE.Color(b), t);

const canvasTex = (w: number, h: number, draw: (ctx: CanvasRenderingContext2D) => void) => {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  draw(c.getContext("2d")!);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
};

/* ───────────── Fond courbe (sol + mur d'un seul tenant) ───────────── */

/**
 * Fond courbe + carte de lueur dessinée dans ses coordonnées de texture :
 * la lueur suit la surface (sol, arrondi, mur) sans aucune découpe.
 */
const useSweep = () =>
  useMemo(() => {
    // Profil (z, y) : sol → arrondi → mur
    const pts: [number, number][] = [];
    const R = 3.6;
    for (let z = 14; z > -3.5; z -= 0.5) pts.push([z, FLOOR]);
    for (let a = 0; a <= 90; a += 3) {
      const r = THREE.MathUtils.degToRad(a);
      pts.push([-3.5 - Math.sin(r) * R, FLOOR + R - Math.cos(r) * R]);
    }
    for (let y = FLOOR + R + 0.5; y < 22; y += 0.5) pts.push([-3.5 - R, y]);
    // Abscisse curviligne le long du profil
    const sArr = [0];
    for (let i = 1; i < pts.length; i++) {
      sArr.push(sArr[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
    }
    const L = sArr[sArr.length - 1];
    const W = 60;
    const pos: number[] = [];
    const uv: number[] = [];
    const idx: number[] = [];
    pts.forEach(([z, y], i) => {
      pos.push(-W / 2, y, z, W / 2, y, z);
      uv.push(0, sArr[i] / L, 1, sArr[i] / L);
    });
    for (let i = 0; i < pts.length - 1; i++) {
      const a = i * 2;
      idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
    g.setIndex(idx);
    g.computeVertexNormals();

    // Lueur : ellipse douce centrée derrière les objets (milieu de l'arrondi)
    const sCenter = sArr[pts.findIndex(([z]) => z < -3.5) + 12];
    const c = document.createElement("canvas");
    c.width = 512;
    c.height = 1024;
    const ctx = c.getContext("2d")!;
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, 512, 1024);
    const cx = 256;
    const cy = (1 - sCenter / L) * 1024;
    const ru = (7.5 / W) * 512;
    const rv = (9 / L) * 1024;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(ru / rv, 1);
    const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, rv);
    grad.addColorStop(0, "rgba(255,255,255,1)");
    grad.addColorStop(0.4, "rgba(255,255,255,0.45)");
    grad.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(0, 0, rv, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    const glow = new THREE.CanvasTexture(c);
    glow.colorSpace = THREE.SRGBColorSpace;
    return { geometry: g, glow };
  }, []);

const useGlowTexture = () =>
  useMemo(
    () =>
      canvasTex(512, 512, (ctx) => {
        const g = ctx.createRadialGradient(256, 256, 0, 256, 256, 256);
        g.addColorStop(0, "rgba(255,255,255,1)");
        g.addColorStop(0.35, "rgba(255,255,255,0.45)");
        g.addColorStop(1, "rgba(255,255,255,0)");
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, 512, 512);
      }),
    [],
  );

const useBlurLeafTexture = (blur: number) =>
  useMemo(
    () =>
      canvasTex(256, 384, (ctx) => {
        ctx.filter = `blur(${blur}px)`;
        ctx.fillStyle = "#fff";
        ctx.beginPath();
        ctx.moveTo(128, 370);
        ctx.bezierCurveTo(250, 260, 210, 70, 128, 14);
        ctx.bezierCurveTo(46, 70, 6, 260, 128, 370);
        ctx.fill();
      }),
    [blur],
  );

const useShaftTexture = () =>
  useMemo(
    () =>
      canvasTex(64, 512, (ctx) => {
        const gx = ctx.createLinearGradient(0, 0, 64, 0);
        gx.addColorStop(0, "rgba(255,255,255,0)");
        gx.addColorStop(0.5, "rgba(255,255,255,1)");
        gx.addColorStop(1, "rgba(255,255,255,0)");
        ctx.fillStyle = gx;
        ctx.fillRect(0, 0, 64, 512);
        ctx.globalCompositeOperation = "destination-in";
        const gy = ctx.createLinearGradient(0, 0, 0, 512);
        gy.addColorStop(0, "rgba(0,0,0,1)");
        gy.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = gy;
        ctx.fillRect(0, 0, 64, 512);
      }),
    [],
  );

export const StudioSet: React.FC = () => {
  const frame = useCurrentFrame();
  const gl = useThree((s) => s.gl);
  const scene = useThree((s) => s.scene);
  useMemo(() => {
    gl.shadowMap.enabled = true;
    gl.shadowMap.type = THREE.PCFSoftShadowMap;
    const pmrem = new THREE.PMREMGenerator(gl);
    scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.background = new THREE.Color("#0b2616");
  }, [gl, scene]);

  const w = warmth(frame);
  scene.environmentIntensity = 0.45 + 0.25 * w;

  const sweep = useSweep();
  const leafFar = useBlurLeafTexture(10);
  const leafNear = useBlurLeafTexture(26);
  const shaftTex = useShaftTexture();

  // Spot sur la canette au début, qui s'éteint quand les plantes arrivent
  const spotOn = interpolate(frame, [0, 10, 170, 200], [0, 1, 1, 0], clamp);

  return (
    <>
      {/* Lumières */}
      <hemisphereLight args={[mix("#cfe3ff", "#fff1d6", w), "#0F3320", 0.35 + 0.25 * w]} />
      <directionalLight
        position={[-3, 7, 5]}
        intensity={1.4 + 1.2 * w}
        color={mix("#e3ecff", "#fff0d2", w)}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0004}
        shadow-camera-left={-6}
        shadow-camera-right={6}
        shadow-camera-top={6}
        shadow-camera-bottom={-6}
      />
      {/* Contre-jour : rouge « alerte » au début, vert-doré ensuite */}
      <directionalLight position={[3.5, 2.8, -4]} intensity={3.2 - 1.2 * w} color={mix("#ff3b2a", "#b8f0c6", w)} />
      <directionalLight position={[-4, 2.2, -3.5]} intensity={0.4 + 1.8 * w} color="#ffc777" />
      <spotLight
        position={[0, 6.5, 1.2]}
        angle={0.38}
        penumbra={0.9}
        intensity={70 * spotOn}
        distance={14}
        color="#ffd9a3"
        castShadow
        shadow-mapSize={[1024, 1024]}
      />
      {/* Lueur bleutée de l'écran d'ordinateur (scènes bureau) */}
      <pointLight position={[1.4, FLOOR + 0.8, -1.6]} intensity={2.5 * spotOn} distance={3.5} color="#9fb8ff" />
      <pointLight position={[3.5, 0.5, 6]} intensity={1.5 + 7 * w} distance={18} color="#ffe2b8" />

      {/* Fond courbe, avec sa lueur intégrée */}
      <mesh geometry={sweep.geometry} receiveShadow>
        <meshStandardMaterial
          color={mix("#0f3a22", "#1c5a33", w)}
          roughness={0.95}
          metalness={0}
          emissiveMap={sweep.glow}
          emissive={mix("#7a2a1c", "#e3a04a", w)}
          emissiveIntensity={0.55 + 0.15 * w}
        />
      </mesh>

      {/* Cône de lumière visible au-dessus de la canette */}
      <mesh position={[0, FLOOR + 3.2, 0]} visible={spotOn > 0.01}>
        <coneGeometry args={[1.25, 6.4, 48, 1, true]} />
        <meshBasicMaterial
          map={shaftTex}
          transparent
          depthWrite={false}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
          color="#ffe2b0"
          opacity={0.1 * spotOn}
        />
      </mesh>

      {/* Rayons de soleil dorés quand les plantes arrivent */}
      {[0, 1, 2].map((k) => (
        <mesh
          key={`shaft-${k}`}
          position={[-2.4 + k * 1.3, FLOOR + 6, -4.5 + k * 0.3]}
          rotation={[0, 0, -0.42 + Math.sin(frame * 0.01 + k) * 0.03]}
        >
          <planeGeometry args={[0.9 + k * 0.3, 14]} />
          <meshBasicMaterial
            map={shaftTex}
            transparent
            depthWrite={false}
            blending={THREE.AdditiveBlending}
            color="#ffd28a"
            opacity={(0.1 + 0.04 * Math.sin(frame * 0.03 + k * 2)) * w}
          />
        </mesh>
      ))}

      {/* Feuilles floues au loin */}
      {Array.from({ length: 14 }, (_, i) => {
        const x = (random(`bk-x-${i}`) - 0.5) * 11;
        const y = FLOOR + 0.5 + random(`bk-y-${i}`) * 5.5;
        const s = 1.2 + random(`bk-s-${i}`) * 1.8;
        return (
          <mesh
            key={`bk-${i}`}
            position={[x, y + Math.sin(frame * 0.012 + i) * 0.08, -6.2 + random(`bk-z-${i}`) * 0.8]}
            rotation={[0, 0, random(`bk-r-${i}`) * Math.PI * 2 + Math.sin(frame * 0.01 + i) * 0.05]}
          >
            <planeGeometry args={[s * 0.66, s]} />
            <meshBasicMaterial
              map={leafFar}
              transparent
              depthWrite={false}
              color={mix("#0d3a20", "#2e7a45", w * random(`bk-c-${i}`))}
              opacity={0.75}
            />
          </mesh>
        );
      })}

      {/* Grandes feuilles floues au premier plan, dans les coins bas */}
      {[
        { x: -1.9, y: FLOOR - 0.2, z: 6.2, r: 0.6, s: 2.6 },
        { x: 2.0, y: FLOOR - 0.4, z: 5.8, r: -0.7, s: 2.9 },
      ].map((l, i) => (
        <mesh
          key={`fg-${i}`}
          position={[l.x + Math.sin(frame * 0.01 + i) * 0.05, l.y, l.z]}
          rotation={[0, 0, l.r + Math.sin(frame * 0.015 + i * 3) * 0.04]}
        >
          <planeGeometry args={[l.s * 0.66, l.s]} />
          <meshBasicMaterial map={leafNear} transparent depthWrite={false} color="#061c0e" opacity={0.9} />
        </mesh>
      ))}

      <Pollen frame={frame} w={w} />
    </>
  );
};

/* ───────────── Pollen lumineux ───────────── */

const Pollen: React.FC<{ frame: number; w: number }> = ({ frame, w }) => {
  const tex = useGlowTexture();
  const N = 110;
  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(new Array(N * 3).fill(0), 3));
    return g;
  }, []);
  const p = geo.attributes.position as THREE.BufferAttribute;
  const H = 6;
  for (let i = 0; i < N; i++) {
    const speed = 0.002 + random(`p-v-${i}`) * 0.004;
    const y0 = random(`p-y-${i}`) * H;
    const y = FLOOR + ((y0 + frame * speed) % H);
    const x = (random(`p-x-${i}`) - 0.5) * 8 + Math.sin(frame * 0.01 + i) * 0.15;
    const z = -5 + random(`p-z-${i}`) * 9;
    p.setXYZ(i, x, y, z);
  }
  p.needsUpdate = true;
  return (
    <points geometry={geo}>
      <pointsMaterial
        map={tex}
        size={0.07}
        sizeAttenuation
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        color={mix("#9fc7b0", "#ffd98a", w)}
        opacity={0.35 + 0.5 * w}
      />
    </points>
  );
};

/* ───────────── Socle ───────────── */

export const Podium: React.FC<{
  pos: [number, number, number];
  radius: number;
  height: number;
  color: string;
  visible?: boolean;
}> = ({ pos, radius, height, color, visible = true }) => (
  <group position={pos} visible={visible}>
    <mesh position={[0, height / 2, 0]} castShadow receiveShadow>
      <cylinderGeometry args={[radius, radius, height, 72]} />
      <meshPhysicalMaterial color={color} roughness={0.5} clearcoat={0.4} clearcoatRoughness={0.3} />
    </mesh>
    {/* Liseré doré sur l'arête */}
    <mesh position={[0, height, 0]} rotation={[Math.PI / 2, 0, 0]}>
      <torusGeometry args={[radius - 0.01, 0.012, 12, 96]} />
      <meshStandardMaterial color="#e9c27a" metalness={1} roughness={0.25} />
    </mesh>
  </group>
);
