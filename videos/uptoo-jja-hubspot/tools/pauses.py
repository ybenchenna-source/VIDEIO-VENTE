"""Détecte les pauses d'un enregistrement vocal (énergie par fenêtres de 20 ms, seuil adaptatif).
Usage : python3 tools/pauses.py fichier.wav [pause_min_s]  → liste JSON [[début, fin], ...] des pauses."""
import json, subprocess, sys
import numpy as np

def pauses(path, min_pause=0.35):
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", path, "-ac", "1", "-ar", "16000", "-f", "s16le", "-"],
                         capture_output=True, check=True).stdout
    x = np.frombuffer(raw, np.int16).astype(np.float32) / 32768
    hop = 320  # 20 ms
    n = len(x) // hop
    e = 20 * np.log10(np.sqrt((x[: n * hop].reshape(n, hop) ** 2).mean(1)) + 1e-7)
    floor, peak = np.percentile(e, 10), np.percentile(e, 90)
    silent = e < floor + 0.30 * (peak - floor)
    out, start = [], None
    for i, s in enumerate(np.append(silent, False)):
        if s and start is None:
            start = i
        elif not s and start is not None:
            if (i - start) * 0.02 >= min_pause:
                out.append([round(start * 0.02, 2), round(i * 0.02, 2)])
            start = None
    return out, round(len(x) / 16000, 2)

if __name__ == "__main__":
    p, d = pauses(sys.argv[1], float(sys.argv[2]) if len(sys.argv) > 2 else 0.35)
    print(json.dumps({"duration": d, "pauses": p}))
