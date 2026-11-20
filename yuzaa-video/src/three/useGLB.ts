import * as THREE from "three";
import { useEffect, useMemo, useState } from "react";
import { useThree } from "@react-three/fiber";
import { GLTFLoader, type GLTF } from "three/examples/jsm/loaders/GLTFLoader.js";
import { useDelayRender } from "remotion";

const cache = new Map<string, Promise<GLTF>>();

/**
 * Regroupe les demandes de redessin : quand plusieurs modèles arrivent en
 * même temps, on ne redessine la scène qu'une seule fois.
 */
let pending: Array<() => void> = [];
let timer: ReturnType<typeof setTimeout> | null = null;
let redraw: ((t: number) => void) | null = null;
const scheduleRedraw = (advance: (t: number) => void, done: () => void) => {
  redraw = advance;
  pending.push(done);
  if (timer) return;
  timer = setTimeout(() => {
    timer = null;
    const list = pending;
    pending = [];
    redraw?.(performance.now());
    list.forEach((f) => f());
  }, 50);
};

const load = (src: string) => {
  let p = cache.get(src);
  if (!p) {
    p = new GLTFLoader().loadAsync(src);
    cache.set(src, p);
  }
  return p;
};

/**
 * Copie d'un modèle GLB (exporté depuis Blender), prête à afficher.
 * Le rendu de l'image attend que le modèle soit chargé ET dessiné :
 * Remotion ne redessine la scène qu'une fois par image, donc on force
 * un nouveau dessin dès que le modèle arrive, avant de libérer la capture.
 * `tune` permet d'ajuster chaque matériau (par son nom Blender).
 */
export const useModel = (
  src: string,
  tune?: (mat: THREE.MeshStandardMaterial, mesh: THREE.Mesh) => THREE.Material | void,
) => {
  const advance = useThree((s) => s.advance);
  const { delayRender, continueRender, cancelRender } = useDelayRender();
  const [handle] = useState(() => delayRender(`Modèle 3D ${src}`));
  const [gltf, setGltf] = useState<GLTF | null>(null);

  useEffect(() => {
    load(src)
      .then(setGltf)
      .catch((e) => cancelRender(e));
  }, [src, cancelRender]);

  const obj = useMemo(() => {
    if (!gltf) return null;
    const root = gltf.scene.clone(true);
    root.traverse((o) => {
      const mesh = o as THREE.Mesh;
      if (!mesh.isMesh) return;
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      if (tune) {
        const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
        const next = mats.map((m) => {
          const c = (m as THREE.MeshStandardMaterial).clone();
          return (tune(c, mesh) as THREE.Material) ?? c;
        });
        mesh.material = Array.isArray(mesh.material) ? next : next[0];
      }
    });
    return root;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gltf]);

  useEffect(() => {
    if (!obj) return;
    // Le modèle est dans la scène : on redessine (une fois pour tous), puis on libère la capture.
    let released = false;
    const release = () => {
      if (released) return;
      released = true;
      continueRender(handle);
    };
    scheduleRedraw(advance, release);
    return release;
  }, [obj, advance, continueRender, handle]);

  return obj;
};
