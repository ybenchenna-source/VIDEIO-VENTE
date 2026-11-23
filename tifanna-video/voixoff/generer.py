"""
Voix off française + effets sonores (ElevenLabs) + musique composée, mixés sur la pub TIFANNA.

Usage (depuis tifanna-video/) :
    python musique/composer.py                 # musique (une fois)
    ELEVENLABS_API_KEY=... python voixoff/generer.py
→ out/video_voixoff.mp4 (1080 × 1920)

Les fichiers audio générés sont gardés dans voixoff/audio/ (supprime-en un pour le régénérer).
"""
import json
import os
import subprocess
import sys
import urllib.request

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
AUDIO = os.path.join(HERE, "audio")
OUT = os.path.join(ROOT, "out")
os.makedirs(AUDIO, exist_ok=True)
os.makedirs(OUT, exist_ok=True)

API = "https://api.elevenlabs.io/v1"
KEY = os.environ.get("ELEVENLABS_API_KEY", "proxy-injected")

VOICE_ID = "Xb7hH8MSUJpSbSDYk0k2"  # Alice : posée, élégante (très nette en français)
MODEL = "eleven_multilingual_v2"
VOICE_SETTINGS = {"stability": 0.6, "similarity_boost": 0.85, "style": 0.25, "speed": 1.0}

# (début en s, fin à ne pas dépasser, texte lu) — calé sur les coupes 3 / 5 / 7,3 / 9,7 / 12 / 16 / 18,1 s
LINES = [
    (0.30, 2.85, "Et si vos pierres se portaient sur la robe ?"),
    (3.05, 5.15, "Tifanna, joaillerie sur vêtement."),
    (5.30, 7.30, "Braise, le feu du rubis."),
    (7.55, 9.60, "Jardin, l'éclat de l'émeraude."),
    (9.85, 12.15, "Blason, la noblesse de l'or."),
    (12.30, 15.90, "Chaque pièce est cousue à la main, pierre après pierre."),
    (16.05, 18.05, "Soirée, mariée, grands boubous."),
    (18.20, 19.95, "La pierre épouse le tissu."),
]

# (moment en s, durée, description, volume relatif) — sobre : c'est du luxe
SFX = [
    (0.00, 2.0, "Soft deep cinematic swell with a delicate shimmer, luxury intro", 0.45),
    (0.45, 1.2, "Precious gemstone glint, tiny crystalline sparkle ting", 0.35),
    (2.80, 0.8, "Soft silk fabric swish", 0.45),
    (3.00, 2.0, "Quiet haute couture atelier ambience, distant scissors, light room tone", 0.25),
    (5.05, 0.8, "Soft silk fabric swish", 0.4),
    (5.25, 1.0, "Precious gemstone glint, tiny crystalline sparkle ting", 0.3),
    (7.30, 0.8, "Soft silk fabric swish", 0.4),
    (7.55, 1.0, "Precious gemstone glint, tiny crystalline sparkle ting", 0.3),
    (9.62, 0.8, "Soft silk fabric swish", 0.4),
    (9.90, 1.2, "Delicate fine gold chain jingling softly", 0.35),
    (12.00, 4.0, "Close-up hand sewing foley: needle piercing fabric, thread pulled through, soft and intimate", 0.4),
    (15.95, 2.0, "Luxurious long silk evening gown rustling as a woman turns, elegant", 0.4),
    (18.05, 1.8, "Elegant soft cinematic impact with a warm shimmering tail, luxury logo reveal", 0.45),
]

MUSIC = os.path.join(ROOT, "musique", "musique-pub.wav")
MUSIC_VOLUME = 1.6  # la musique est rendue assez bas (-24 LUFS) : on la remonte, la voix la fera baisser


def post(path, payload, out):
    if os.path.exists(out):
        return
    req = urllib.request.Request(
        f"{API}{path}", data=json.dumps(payload).encode(),
        headers={"xi-api-key": KEY, "Content-Type": "application/json"},
    )
    with urllib.request.urlopen(req, timeout=120) as r, open(out, "wb") as f:
        f.write(r.read())
    print("✓", os.path.basename(out))


def duration(path):
    out = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", path],
                         capture_output=True, text=True, check=True)
    return float(out.stdout.strip())


def main():
    video = sys.argv[1] if len(sys.argv) > 1 else os.path.join(ROOT, "source", "tifanna-source.mp4")
    output = sys.argv[2] if len(sys.argv) > 2 else os.path.join(OUT, "video_voixoff.mp4")

    voice = []
    for i, (start, end, text) in enumerate(LINES):
        out = os.path.join(AUDIO, f"voix-{i + 1:02d}.mp3")
        post(f"/text-to-speech/{VOICE_ID}?output_format=mp3_44100_128", {
            "text": text, "model_id": MODEL, "language_code": "fr", "voice_settings": VOICE_SETTINGS,
            "previous_text": LINES[i - 1][2] if i > 0 else None,
            "next_text": LINES[i + 1][2] if i + 1 < len(LINES) else None,
        }, out)
        d = duration(out)
        tempo = max(1.0, min(1.12, d / (end - start)))
        print(f"  réplique {i + 1} : {d:.2f} s pour {end - start:.2f} s → tempo {tempo:.2f}")
        voice.append((out, start, tempo))

    sfx = []
    for i, (at, dur, text, vol) in enumerate(SFX):
        out = os.path.join(AUDIO, f"sfx-{i + 1:02d}.mp3")
        post("/sound-generation", {"text": text, "duration_seconds": dur, "prompt_influence": 0.5}, out)
        sfx.append((out, at, vol))

    inputs = ["-i", video, "-i", MUSIC]
    chains, vlabels, slabels = [], [], []
    n = 2
    for path, start, tempo in voice:
        inputs += ["-i", path]
        chains.append(f"[{n}:a]atempo={tempo:.3f},adelay={int(start * 1000)}:all=1[v{n}]")
        vlabels.append(f"[v{n}]")
        n += 1
    for path, at, vol in sfx:
        inputs += ["-i", path]
        chains.append(f"[{n}:a]adelay={int(at * 1000)}:all=1,volume={vol * 0.6:.3f}[s{n}]")
        slabels.append(f"[s{n}]")
        n += 1
    graph = ";".join(chains)
    # Voix : un seul bus, dupliqué pour commander la baisse de la musique
    graph += f";{''.join(vlabels)}amix=inputs={len(vlabels)}:normalize=0,apad,atrim=0:20[vox]"
    graph += ";[vox]asplit=2[voxmix][voxkey]"
    graph += f";[1:a]atrim=0:20,volume={MUSIC_VOLUME},afade=t=out:st=19.4:d=0.6[mus]"
    graph += ";[mus][voxkey]sidechaincompress=threshold=0.03:ratio=6:attack=20:release=350[musduck]"
    graph += f";[voxmix][musduck]{''.join(slabels)}amix=inputs={2 + len(slabels)}:normalize=0,"
    graph += "atrim=0:20,loudnorm=I=-14:TP=-1.5:LRA=11,alimiter=limit=0.84:level=false[aout]"
    # Vidéo WhatsApp 480 × 848 → 1080 × 1920
    graph += ";[0:v]scale=-2:1920:flags=lanczos,crop=1080:1920,setsar=1,format=yuv420p[vout]"
    subprocess.run([
        "ffmpeg", "-y", "-v", "error", *inputs, "-filter_complex", graph,
        "-map", "[vout]", "-map", "[aout]",
        "-c:v", "libx264", "-preset", "slow", "-crf", "19", "-r", "30",
        "-c:a", "aac", "-b:a", "192k", "-ar", "48000", "-t", "20", "-movflags", "+faststart", output,
    ], check=True)
    print("→", output)


if __name__ == "__main__":
    main()
