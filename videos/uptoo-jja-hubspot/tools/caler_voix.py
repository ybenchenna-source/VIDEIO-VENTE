"""Cale la vidéo sur les voix enregistrées.

Pour chaque scène (timing/voix.json) :
  - la durée de la scène devient celle de l'enregistrement (+ courtes marges) ;
  - le début de chaque paragraphe est retrouvé dans la transcription (timing/transcriptions.json,
    produite par tools/transcrire), puis recalé sur la pause la plus proche ; à défaut,
    il est placé sur une pause au plus près de la position attendue d'après le nombre de mots ;
  - la piste assets/voix.mp3 est assemblée (volumes harmonisés entre intervenant·es).
Écrit timing/cues.json (synchronisation "voix enregistrée"). Ensuite : node tools/timing.mjs apply

Usage : python3 tools/caler_voix.py
"""
import difflib, json, os, re, subprocess, sys, tempfile, unicodedata

sys.path.insert(0, os.path.dirname(__file__))
from pauses import pauses  # noqa: E402

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
LEAD = 0.4   # silence avant la voix au début de chaque scène
TAIL = 0.9   # marge après la voix (volet de transition)
MIN_PAUSE = 0.22


def norm(text):
    t = unicodedata.normalize("NFD", text.lower())
    t = "".join(c for c in t if unicodedata.category(c) != "Mn")
    return re.findall(r"[a-z0-9]+", t)


def from_transcript(segments, paragraphs, pause_list, fallback):
    """Début de chaque paragraphe d'après la transcription (temps approximatif par mot)."""
    words = []  # (mot, temps, début_de_segment)
    for seg in segments:
        toks = norm(seg["text"])
        end = seg["end"] if seg["end"] is not None else seg["start"] + 0.4 * len(toks)
        for k, w in enumerate(toks):
            words.append((w, seg["start"] + (end - seg["start"]) * k / max(1, len(toks)), k == 0))
    starts, pos = [], 0
    for j, para in enumerate(paragraphs):
        if j == 0:
            starts.append(fallback[0]); continue
        target = " ".join(norm(para)[:7])
        best, best_i = 0.0, None
        for i in range(pos, len(words)):
            cand = " ".join(w for w, _, _ in words[i:i + 8])
            sc = difflib.SequenceMatcher(None, target, cand).ratio() + (0.08 if words[i][2] else 0)
            if sc > best:
                best, best_i = sc, i
        if best_i is not None and best >= 0.55:
            t = words[best_i][1]
            near = [p[1] for p in pause_list if abs(p[1] - t) <= 0.8]
            t = min(near, key=lambda x: abs(x - t)) if near else t
            starts.append(t); pos = best_i + 1
        else:
            starts.append(None)
    # paragraphes non retrouvés : position estimée, bornée par les voisins
    for j, t in enumerate(starts):
        if t is None:
            starts[j] = fallback[j]
    for j in range(1, len(starts)):
        starts[j] = max(starts[j], starts[j - 1] + 1.0)
    return starts


def align(path, paragraphs, segments=None):
    ps, dur = pauses(path, MIN_PAUSE)
    speech_start = ps[0][1] if ps and ps[0][0] <= 0.05 else 0.0
    speech_end = ps[-1][0] if ps and ps[-1][1] >= dur - 0.05 else dur
    inner = [p for p in ps if p[0] > speech_start + 0.3 and p[1] < speech_end - 0.3]
    words = [len(t.split()) for t in paragraphs]
    total = sum(words)
    span = speech_end - speech_start
    expected, acc = [], 0
    for w in words[:-1]:
        acc += w
        expected.append(speech_start + span * acc / total)
    k = len(expected)
    if k == 0:
        return [speech_start], dur
    if segments:
        return from_transcript(segments, paragraphs, ps, [speech_start] + expected), dur
    if len(inner) < k:  # pas assez de pauses : position estimée
        return [speech_start] + expected, dur

    # Coût : écart à la position attendue, allégé pour les pauses longues.
    def cost(j, p):
        return (p[1] - expected[j]) ** 2 / (1 + 4 * (p[1] - p[0]))

    INF = float("inf")
    n = len(inner)
    best = [[INF] * n for _ in range(k)]
    prev = [[-1] * n for _ in range(k)]
    for i in range(n):
        best[0][i] = cost(0, inner[i])
    for j in range(1, k):
        run, arg = INF, -1
        for i in range(n):
            if i - 1 >= 0 and best[j - 1][i - 1] < run:
                run, arg = best[j - 1][i - 1], i - 1
            if arg >= 0:
                best[j][i] = run + cost(j, inner[i])
                prev[j][i] = arg
    i = min(range(n), key=lambda x: best[k - 1][x])
    chosen = []
    for j in range(k - 1, -1, -1):
        chosen.append(inner[i][1])
        i = prev[j][i]
    return [speech_start] + chosen[::-1], dur


def main():
    voix = json.load(open(os.path.join(ROOT, "timing/voix.json")))
    cues_path = os.path.join(ROOT, "timing/cues.json")
    data = json.load(open(cues_path))
    tr_path = os.path.join(ROOT, "timing/transcriptions.json")
    transcripts = json.load(open(tr_path)) if os.path.exists(tr_path) else {}
    tmp = tempfile.mkdtemp()
    parts = []
    for s in data["scenes"]:
        src = os.path.join(ROOT, voix[s["id"]])
        wav = os.path.join(tmp, s["id"] + ".wav")
        # Volume harmonisé, mono 48 kHz
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", src, "-af", "loudnorm=I=-16:TP=-1.5:LRA=11",
                        "-ac", "1", "-ar", "48000", wav], check=True)
        starts, dur = align(wav, [c["text"] for c in s["cues"]], transcripts.get(s["id"]))
        s["duration"] = round(LEAD + dur + TAIL, 2)
        for c, t in zip(s["cues"], starts):
            c["start"] = round(LEAD + t, 2)
        padded = os.path.join(tmp, s["id"] + "-p.wav")
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", wav, "-af",
                        f"adelay={int(LEAD * 1000)},apad=whole_dur={s['duration']}", "-ar", "48000", padded], check=True)
        parts.append(padded)
        print(f"{s['id']:16} {s['duration']:6.1f}s  paragraphes à {[c['start'] for c in s['cues']]}")
    lst = os.path.join(tmp, "list.txt")
    with open(lst, "w") as f:
        f.writelines(f"file '{p}'\n" for p in parts)
    out = os.path.join(ROOT, "assets/voix.mp3")
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "concat", "-safe", "0", "-i", lst,
                    "-c:a", "libmp3lame", "-b:a", "160k", out], check=True)
    data["synchronisation"] = "voix enregistrée"
    data["_note"] = ("Temps en secondes, relatifs au début de chaque scène, calés sur les pauses des voix "
                     "enregistrées (tools/caler_voix.py). Ajuster à la main si besoin, puis 'node tools/timing.mjs apply'.")
    json.dump(data, open(cues_path, "w"), ensure_ascii=False, indent=2)
    total = sum(s["duration"] for s in data["scenes"])
    print(f"Durée totale : {int(total // 60)}:{total % 60:04.1f} — piste écrite : assets/voix.mp3")


if __name__ == "__main__":
    main()
