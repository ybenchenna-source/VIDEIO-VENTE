"""
Voix off française + effets sonores de la pub yuzaa, avec ElevenLabs, puis mixage avec ffmpeg.

Usage (depuis yuzaa-video/) :
    ELEVENLABS_API_KEY=... python voixoff/generer.py [video.mp4] [sortie.mp4]

Par défaut : out/yuzaa-canette-vs-tasse.mp4 → out/video_voixoff.mp4
Les fichiers audio générés sont gardés dans voixoff/audio/ (réutilisés s'ils existent :
supprime-les pour régénérer). Le texte de chaque réplique et son moment sont dans LINES.
"""
import json
import os
import subprocess
import sys
import urllib.request

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
AUDIO = os.path.join(HERE, "audio")
os.makedirs(AUDIO, exist_ok=True)

API = "https://api.elevenlabs.io/v1"
KEY = os.environ.get("ELEVENLABS_API_KEY", "proxy-injected")

VOICE_ID = "cgSgspJ2msm6clMCkdW9"  # Jessica : jeune, expressive (lit très bien le français en multilingue)
MODEL = "eleven_multilingual_v2"
VOICE_SETTINGS = {"stability": 0.45, "similarity_boost": 0.8, "style": 0.35, "speed": 1.1}

# (début en secondes, fin à ne pas dépasser, texte lu)
# « yuzaa » est écrit « Youza » et BIENVENUE10 « Bienvenue dix » pour la prononciation.
LINES = [
    (0.15, 2.75, "Deux canettes par jour pour tenir tes révisions ?"),
    (2.90, 6.15, "Soixante-neuf euros par mois. Et une montagne de sucre."),
    (6.30, 10.40, "Passe aux infusions Youza : cent pour cent plantes, zéro sucre ajouté."),
    (10.70, 14.95, "Éveil, Focus, Rush : caféine affichée sur chaque recette."),
    (15.10, 17.85, "Trente centimes la tasse. Quatorze euros par mois."),
    (18.00, 19.95, "Moins dix pour cent avec Bienvenue dix."),
]

# (moment en secondes, durée, description, volume relatif)
SFX = [
    (0.30, 1.0, "Aluminum soda can dropped onto a wooden desk, solid thud with a light metallic clink", 0.9),
    (3.05, 1.0, "Aluminum soda can crushed by a hand, sharp metallic crunch", 0.9),
    (3.70, 2.5, "Cascade of metal coins pouring and scattering onto a wooden table, jingling", 0.8),
    (3.95, 1.0, "Bright cash register ka-ching, short", 0.45),
    (5.95, 1.0, "Fast whoosh swoosh transition, airy, cinematic", 0.55),
    (6.10, 4.0, "Soft rustling of fresh leaves swirling in the wind, gentle and airy", 0.35),
    (8.35, 1.0, "Soft cinematic whoosh, zoom transition", 0.5),
    (9.95, 1.0, "Quick whip pan whoosh, left to right", 0.55),
    (10.85, 1.0, "Three soft bubbly pop sounds in quick succession, playful UI", 0.4),
    (14.85, 1.0, "Fast upward whoosh transition", 0.55),
    (16.00, 0.6, "Quick marker pen strike-through scratch on paper", 0.5),
    (16.30, 0.6, "Single satisfying bubbly pop, playful", 0.45),
    (17.85, 1.5, "Deep cinematic impact boom with soft shimmer tail, logo reveal", 0.6),
]


def post(path, payload, out):
    if os.path.exists(out):
        return
    req = urllib.request.Request(
        f"{API}{path}",
        data=json.dumps(payload).encode(),
        headers={"xi-api-key": KEY, "Content-Type": "application/json"},
    )
    with urllib.request.urlopen(req, timeout=120) as r, open(out, "wb") as f:
        f.write(r.read())
    print("✓", os.path.basename(out))


def duration(path):
    out = subprocess.run(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", path],
        capture_output=True, text=True, check=True,
    )
    return float(out.stdout.strip())


def main():
    video = sys.argv[1] if len(sys.argv) > 1 else os.path.join(ROOT, "out", "yuzaa-canette-vs-tasse.mp4")
    output = sys.argv[2] if len(sys.argv) > 2 else os.path.join(ROOT, "out", "video_voixoff.mp4")

    # 1. Voix off, réplique par réplique (avec le texte voisin pour une intonation continue)
    voice_files = []
    for i, (start, end, text) in enumerate(LINES):
        out = os.path.join(AUDIO, f"voix-{i + 1:02d}.mp3")
        payload = {
            "text": text,
            "model_id": MODEL,
            "language_code": "fr",
            "voice_settings": VOICE_SETTINGS,
            "previous_text": LINES[i - 1][2] if i > 0 else None,
            "next_text": LINES[i + 1][2] if i + 1 < len(LINES) else None,
        }
        post(f"/text-to-speech/{VOICE_ID}?output_format=mp3_44100_128", payload, out)
        d = duration(out)
        room = end - start
        tempo = max(1.0, min(1.15, d / room))  # accélère un peu si la réplique déborde
        print(f"  réplique {i + 1} : {d:.2f} s pour {room:.2f} s → tempo {tempo:.2f}")
        voice_files.append((out, start, tempo))

    # 2. Effets sonores
    sfx_files = []
    for i, (at, dur, text, vol) in enumerate(SFX):
        out = os.path.join(AUDIO, f"sfx-{i + 1:02d}.mp3")
        post("/sound-generation", {"text": text, "duration_seconds": dur, "prompt_influence": 0.5}, out)
        sfx_files.append((out, at, vol))

    # 3. Mixage : voix au premier plan, effets en dessous, le tout normalisé pour les réseaux
    inputs = ["-i", video]
    chains = []
    labels = []
    n = 1
    for path, start, tempo in voice_files:
        inputs += ["-i", path]
        chains.append(
            f"[{n}:a]atempo={tempo:.3f},adelay={int(start * 1000)}:all=1,volume=1.0[v{n}]"
        )
        labels.append(f"[v{n}]")
        n += 1
    for path, at, vol in sfx_files:
        inputs += ["-i", path]
        chains.append(f"[{n}:a]adelay={int(at * 1000)}:all=1,volume={vol * 0.55:.3f}[s{n}]")
        labels.append(f"[s{n}]")
        n += 1
    mix = (
        ";".join(chains)
        + ";"
        + "".join(labels)
        + f"amix=inputs={len(labels)}:normalize=0:dropout_transition=0,"
        + "apad,atrim=0:20,loudnorm=I=-14:TP=-1.5:LRA=11[aout]"
    )
    cmd = [
        "ffmpeg", "-y", "-v", "error", *inputs,
        "-filter_complex", mix,
        "-map", "0:v", "-map", "[aout]",
        "-c:v", "copy", "-c:a", "aac", "-b:a", "192k", "-ar", "48000",
        "-shortest", "-movflags", "+faststart", output,
    ]
    subprocess.run(cmd, check=True)
    print("→", output)


if __name__ == "__main__":
    main()
