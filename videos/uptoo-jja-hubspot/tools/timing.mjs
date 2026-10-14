#!/usr/bin/env node
// Minutage de la vidéo — source unique : timing/cues.json
//
//   node tools/timing.mjs estimate   estime les cues depuis source/script-oral.md
//                                    (débit moyen de parole) et écrit timing/cues.json
//   node tools/timing.mjs apply      applique timing/cues.json : génère scripts/cues.js,
//                                    assemble index.html (gabarit + scenes/*.html + scenes/*.js)
//                                    et réécrit TIMING.md (feuille de repères pour l'oral)
//
// Après un enregistrement audio réel : corriger les temps dans timing/cues.json
// (secondes, relatives au début de chaque scène), puis lancer `apply`.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SCRIPT = path.join(ROOT, "source/script-oral.md");
const CUES = path.join(ROOT, "timing/cues.json");

// Hypothèses d'estimation (pas d'audio fourni) :
const WORDS_PER_SECOND = 2.55; // ≈ 153 mots/min, débit d'un oral dynamique
const PARAGRAPH_PAUSE = 0.4; // respiration entre deux paragraphes
const SCENE_LEAD_IN = 1.0; // temps avant la première phrase d'une scène
const SCENE_TAIL = 1.0; // marge après la dernière phrase (passage de parole)
const TARGET_TOTAL = 480; // durée visée (s) : 8 min. Les temps estimés sont mis à l'échelle. Mettre null pour garder le débit naturel.

const IDS = ["s01-uptoo", "s02-enjeux", "s03-donnees", "s04-outils", "s05-complements",
  "s06-roadmap", "s07-equipe", "s08-edma", "s10-conclusion"];

const round = (n) => Math.round(n * 10) / 10;

function parseScript() {
  const md = fs.readFileSync(SCRIPT, "utf8");
  return md.split(/^## /m).slice(1).map((block, i) => {
    const lines = block.split("\n");
    const title = lines[0].replace(/^SCÈNE \d+ — /, "").trim();
    const speaker = (lines.find((l) => l.startsWith("**")) || "")
      .replace(/\*\*|Intervenante? : /g, "").trim();
    const paragraphs = lines.slice(1).filter((l) => l.trim() && !l.startsWith("**") && !l.startsWith("<!--")).map((l) => l.trim());
    return { id: IDS[i], title, speaker, paragraphs };
  });
}

function estimate() {
  const scenes = parseScript().map((s) => {
    let t = SCENE_LEAD_IN;
    const cues = s.paragraphs.map((text) => {
      const start = round(t);
      t += text.split(/\s+/).length / WORDS_PER_SECOND + PARAGRAPH_PAUSE;
      return { start, text };
    });
    return { id: s.id, title: s.title, speaker: s.speaker, duration: t - PARAGRAPH_PAUSE + SCENE_TAIL, cues };
  });
  const natural = scenes.reduce((a, s) => a + s.duration, 0);
  const k = TARGET_TOTAL ? TARGET_TOTAL / natural : 1;
  for (const s of scenes) {
    s.duration = round(s.duration * k);
    s.cues.forEach((c) => { c.start = round(c.start * k); });
  }
  console.log(`Durée au débit naturel : ${round(natural)}s → durée retenue : ${round(natural * k)}s (×${k.toFixed(3)}).`);
  const out = {
    _note: "Temps en secondes, relatifs au début de chaque scène. Estimation sans audio : "
      + `${WORDS_PER_SECOND} mots/s, ${PARAGRAPH_PAUSE}s entre paragraphes${TARGET_TOTAL ? `, puis mise à l'échelle sur ${TARGET_TOTAL}s` : ""}. Corriger puis lancer 'node tools/timing.mjs apply'.`,
    synchronisation: "estimée",
    scenes,
  };
  fs.writeFileSync(CUES, JSON.stringify(out, null, 2) + "\n");
  console.log(`timing/cues.json écrit (${scenes.length} scènes).`);
}

const fmt = (t) => `${Math.floor(t / 60)}:${(t % 60).toFixed(1).padStart(4, "0")}`;

function apply() {
  const data = JSON.parse(fs.readFileSync(CUES, "utf8"));
  let at = 0;
  const layout = data.scenes.map((s) => {
    const r = { ...s, at: round(at) };
    at += s.duration;
    return r;
  });
  const total = round(at);

  // 1. scripts/cues.js — lu par chaque scène : CUES["s2-besoins"][3] = début du 4e paragraphe
  const cuesJs = "// Généré par tools/timing.mjs apply — ne pas modifier à la main.\n"
    + "window.CUES = " + JSON.stringify(Object.fromEntries(layout.map((s) => [s.id, s.cues.map((c) => c.start)]))) + ";\n"
    + "window.SCENES = " + JSON.stringify(layout.map((s) => ({ id: s.id, title: s.title, speaker: s.speaker, at: s.at, duration: s.duration }))) + ";\n"
    + `window.TOTAL_DURATION = ${total};\n`;
  fs.writeFileSync(path.join(ROOT, "scripts/cues.js"), cuesJs);

  // 2. index.html — assemblé depuis tools/index.template.tpl + scenes/<id>.html + scenes/<id>.js
  const tpl = fs.readFileSync(path.join(ROOT, "tools/index.template.tpl"), "utf8").replace(/^<!--.*?-->\n/, "");
  const sections = layout.map((s) => {
    const frag = fs.readFileSync(path.join(ROOT, `scenes/${s.id}.html`), "utf8").trim().replace(/^/gm, "        ");
    return `      <section id="${s.id}" class="sc clip" data-start="${s.at}" data-duration="${s.duration}" data-track-index="1">\n${frag}\n      </section>`;
  }).join("\n\n");
  const scripts = layout.map((s) => `    <script src="scenes/${s.id}.js"></script>`).join("\n");
  const html = tpl.replaceAll("{{TOTAL}}", String(total)).replace("{{SCENES}}", sections).replace("{{SCRIPTS}}", scripts)
    .replace("{{SEGMENTS}}", layout.map(() => '        <div class="seg"><div class="seg-fill"></div></div>').join("\n"));
  fs.writeFileSync(path.join(ROOT, "index.html"), html);

  // 3. TIMING.md — feuille de repères
  let md = `# Feuille de repères — synchronisation ${data.synchronisation}\n\n`
    + (data.synchronisation === "estimée"
      ? "> ⚠️ Synchronisation **approximative** : les temps sont estimés à partir du texte (aucun enregistrement audio fourni).\n> Ils sont calés sur une durée totale de 8 minutes, soit un débit soutenu d'environ 185 mots/minute. Voir README pour recaler sur votre voix.\n\n"
      : "")
    + `Durée totale : **${fmt(total)}**\n\n`;
  for (const s of layout) {
    md += `## ${fmt(s.at)} — ${s.title} (${s.speaker}) · ${s.duration}s\n\n| Temps vidéo | Dans la scène | Phrase de départ |\n|---|---|---|\n`;
    s.cues.forEach((c) => {
      const words = c.text.split(/\s+/);
      md += `| ${fmt(s.at + c.start)} | ${c.start}s | ${words.slice(0, 9).join(" ")}${words.length > 9 ? "…" : ""} |\n`;
    });
    md += "\n";
  }
  fs.writeFileSync(path.join(ROOT, "TIMING.md"), md);
  console.log(`Appliqué : durée totale ${fmt(total)} (${total}s).`);
}

const cmd = process.argv[2];
if (cmd === "estimate") estimate();
else if (cmd === "apply") apply();
else console.log("Usage : node tools/timing.mjs estimate|apply");
