import * as THREE from "three";
import { useEffect, useMemo, useState } from "react";
import { useDelayRender } from "remotion";

/** Charge une image du dossier public/ comme texture, et attend qu'elle soit prête. */
export const useImageTexture = (src: string) => {
  const { delayRender, continueRender, cancelRender } = useDelayRender();
  const [handle] = useState(() => delayRender(`Texture ${src}`));
  const [tex, setTex] = useState<THREE.Texture | null>(null);
  useEffect(() => {
    new THREE.TextureLoader().load(
      src,
      (t) => {
        t.colorSpace = THREE.SRGBColorSpace;
        t.anisotropy = 8;
        setTex(t);
        continueRender(handle);
      },
      undefined,
      (err) => cancelRender(err),
    );
  }, [src, handle, continueRender, cancelRender]);
  return tex;
};

const canvasTexture = (w: number, h: number, draw: (ctx: CanvasRenderingContext2D) => void) => {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const ctx = c.getContext("2d")!;
  draw(ctx);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
};

/** Habillage de la canette générique : aucun logo, juste des bandes. */
export const useCanWrap = () =>
  useMemo(
    () =>
      canvasTexture(1024, 512, (ctx) => {
        const g = ctx.createLinearGradient(0, 0, 0, 512);
        g.addColorStop(0, "#2b3036");
        g.addColorStop(1, "#16191d");
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, 1024, 512);
        // Bandes diagonales argentées (motif raccordable tout autour de la canette)
        for (let i = 0; i < 8; i++) {
          for (const shift of [-1024, 0, 1024]) {
            const x = i * 128 + shift;
            const wide = i % 4 === 0;
            ctx.fillStyle = wide ? "rgba(220,226,232,0.85)" : "rgba(220,226,232,0.16)";
            const w = wide ? 34 : 12;
            ctx.beginPath();
            ctx.moveTo(x, 512);
            ctx.lineTo(x + w, 512);
            ctx.lineTo(x + w + 256, 0);
            ctx.lineTo(x + 256, 0);
            ctx.closePath();
            ctx.fill();
          }
        }
        // Liserés haut et bas
        ctx.fillStyle = "rgba(230,234,238,0.9)";
        ctx.fillRect(0, 18, 1024, 6);
        ctx.fillRect(0, 488, 1024, 6);
      }),
    [],
  );

/**
 * Face d'une pièce : relief doré et symbole €.
 * `turn` pré-tourne le symbole pour qu'il apparaisse à l'endroit une fois
 * plaqué sur le dessus (-90°) ou le dessous (+90°) du cylindre.
 */
export const useCoinFace = (turn: number) =>
  useMemo(
    () =>
      canvasTexture(256, 256, (ctx) => {
        const g = ctx.createRadialGradient(100, 90, 10, 128, 128, 140);
        g.addColorStop(0, "#fff1c4");
        g.addColorStop(0.55, "#e6b64e");
        g.addColorStop(1, "#a8761c");
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, 256, 256);
        ctx.lineWidth = 10;
        ctx.strokeStyle = "#b8862a";
        ctx.beginPath();
        ctx.arc(128, 128, 104, 0, Math.PI * 2);
        ctx.stroke();
        ctx.lineWidth = 3;
        ctx.strokeStyle = "#fbe39a";
        ctx.beginPath();
        ctx.arc(128, 128, 96, 0, Math.PI * 2);
        ctx.stroke();
        ctx.translate(128, 128);
        ctx.rotate(turn);
        ctx.font = "bold 150px sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = "#fbe7a8";
        ctx.fillText("€", -4, 8);
        ctx.fillStyle = "#9a6a15";
        ctx.fillText("€", 2, 12);
      }),
    [turn],
  );

/** Feuille dessinée (guayusa : longue et fine, maté : ovale). */
export const useLeafTexture = (kind: "guayusa" | "mate") =>
  useMemo(
    () =>
      canvasTexture(256, 512, (ctx) => {
        const w = kind === "guayusa" ? 70 : 105;
        const base = kind === "guayusa" ? ["#3f9b58", "#1b5a31"] : ["#8fd1a2", "#2a8046"];
        ctx.beginPath();
        ctx.moveTo(128, 500);
        ctx.bezierCurveTo(128 + w * 1.6, 380, 128 + w * 1.1, 80, 128, 10);
        ctx.bezierCurveTo(128 - w * 1.1, 80, 128 - w * 1.6, 380, 128, 500);
        ctx.closePath();
        const g = ctx.createLinearGradient(0, 0, 256, 512);
        g.addColorStop(0, base[0]);
        g.addColorStop(1, base[1]);
        ctx.fillStyle = g;
        ctx.fill();
        // Nervures
        ctx.strokeStyle = "rgba(230,255,235,0.55)";
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(128, 490);
        ctx.lineTo(128, 30);
        ctx.stroke();
        ctx.lineWidth = 2.5;
        ctx.strokeStyle = "rgba(230,255,235,0.3)";
        for (let y = 90; y < 470; y += 42) {
          ctx.beginPath();
          ctx.moveTo(128, y + 30);
          ctx.quadraticCurveTo(128 + w * 0.5, y + 10, 128 + w * 0.95, y - 10);
          ctx.moveTo(128, y + 30);
          ctx.quadraticCurveTo(128 - w * 0.5, y + 10, 128 - w * 0.95, y - 10);
          ctx.stroke();
        }
      }),
    [kind],
  );

/** Volute de vapeur, douce et transparente. */
export const useSteamTexture = () =>
  useMemo(
    () =>
      canvasTexture(256, 512, (ctx) => {
        ctx.filter = "blur(14px)";
        for (let k = 0; k < 3; k++) {
          ctx.strokeStyle = `rgba(255,255,255,${0.5 - k * 0.12})`;
          ctx.lineWidth = 34 - k * 8;
          ctx.beginPath();
          for (let y = 500; y >= 20; y -= 10) {
            const x = 128 + Math.sin(y / 70 + k * 1.7) * (30 + (500 - y) * 0.08);
            if (y === 500) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.stroke();
        }
        // Fondu en haut et en bas
        ctx.filter = "none";
        ctx.globalCompositeOperation = "destination-in";
        const g = ctx.createLinearGradient(0, 0, 0, 512);
        g.addColorStop(0, "rgba(0,0,0,0)");
        g.addColorStop(0.35, "rgba(0,0,0,1)");
        g.addColorStop(0.85, "rgba(0,0,0,1)");
        g.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, 256, 512);
      }),
    [],
  );
