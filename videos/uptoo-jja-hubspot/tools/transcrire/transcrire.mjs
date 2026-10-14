// Transcrit les voix de timing/voix.json (Whisper base, en local, sans Internet après installation)
// et écrit timing/transcriptions.json : segments horodatés par scène.
//   cd tools/transcrire && npm install && node transcrire.mjs
import { pipeline, env } from "@xenova/transformers";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "../..");
env.localModelPath = path.join(import.meta.dirname, "node_modules/sts-whisper-base/models/");
env.allowRemoteModels = false;
const asr = await pipeline("automatic-speech-recognition", "Xenova/whisper-base", { quantized: true });

const voix = JSON.parse(fs.readFileSync(path.join(ROOT, "timing/voix.json"), "utf8"));
const out = {};
for (const [id, file] of Object.entries(voix)) {
  if (id.startsWith("_") || !file) continue;
  const raw = execFileSync("ffmpeg", ["-v", "error", "-i", path.join(ROOT, file), "-ac", "1", "-ar", "16000", "-f", "f32le", "-"], { maxBuffer: 1 << 30 });
  const audio = new Float32Array(raw.buffer, raw.byteOffset, raw.byteLength / 4);
  const r = await asr(audio, { language: "french", task: "transcribe", chunk_length_s: 30, stride_length_s: 5, return_timestamps: true });
  out[id] = r.chunks.map((c) => ({ start: c.timestamp[0], end: c.timestamp[1], text: c.text.trim() }));
  console.log(`${id} : ${out[id].length} segments`);
}
fs.writeFileSync(path.join(ROOT, "timing/transcriptions.json"), JSON.stringify(out, null, 1) + "\n");
