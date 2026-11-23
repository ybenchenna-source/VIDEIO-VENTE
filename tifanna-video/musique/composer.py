"""
Musique originale pour la pub TIFANNA (20 s) et son jingle de fin (4,5 s).

Composée note par note (MIDI), puis jouée par la banque de sons FluidR3 (FluidSynth) :
piano, cordes, violoncelle, harpe et célesta. Les changements d'accord tombent sur
les coupes de la vidéo.

Usage (depuis tifanna-video/) :
    sudo apt install fluidsynth fluid-soundfont-gm && pip install mido
    python musique/composer.py
→ musique/musique-pub.wav et musique/musique-jingle.wav
"""
import os
import subprocess

import mido

HERE = os.path.dirname(os.path.abspath(__file__))
SF2 = "/usr/share/sounds/sf2/FluidR3_GM.sf2"
TPS = 960  # ticks par seconde (tempo 120, 480 ticks par temps)

# Programmes General MIDI
PIANO, CELESTA, HARP, CELLO, STRINGS, SLOW_STRINGS = 0, 8, 46, 42, 48, 49


class Score:
    def __init__(self):
        self.events = []  # (temps s, canal, type, data1, data2)
        self.programs = {}

    def channel(self, ch, program, volume=100, pan=64, reverb=90):
        self.programs[ch] = (program, volume, pan, reverb)

    def note(self, ch, pitch, start, dur, vel):
        self.events.append((start, ch, "on", pitch, vel))
        self.events.append((start + dur, ch, "off", pitch, 0))

    def chord(self, ch, pitches, start, dur, vel, spread=0.0):
        for i, p in enumerate(pitches):
            self.note(ch, p, start + i * spread, dur - i * spread, vel)

    def save(self, path):
        mid = mido.MidiFile(ticks_per_beat=480)
        tr = mido.MidiTrack()
        mid.tracks.append(tr)
        tr.append(mido.MetaMessage("set_tempo", tempo=500000))
        for ch, (prog, vol, pan, rev) in self.programs.items():
            tr.append(mido.Message("program_change", channel=ch, program=prog, time=0))
            tr.append(mido.Message("control_change", channel=ch, control=7, value=vol, time=0))
            tr.append(mido.Message("control_change", channel=ch, control=10, value=pan, time=0))
            tr.append(mido.Message("control_change", channel=ch, control=91, value=rev, time=0))
        last = 0
        for t, ch, kind, d1, d2 in sorted(self.events, key=lambda e: (e[0], e[2] == "on")):
            tick = int(round(t * TPS))
            delta = max(0, tick - last)
            last = tick
            msg = "note_on" if kind == "on" else "note_off"
            tr.append(mido.Message(msg, channel=ch, note=d1, velocity=d2, time=delta))
        mid.save(path)


def harp_gliss(s, start, low, high, dur, vel=70, scale=(0, 2, 4, 7, 9)):
    """Glissando de harpe montant sur une gamme (pentatonique de ré par défaut)."""
    notes = [n for n in range(low, high + 1) if (n - 62) % 12 in scale]
    step = dur / max(1, len(notes))
    for i, n in enumerate(notes):
        s.note(2, n, start + i * step, 1.6, vel)


def arpeggio(s, chord, start, end, step, vel, ch=0):
    t, i = start, 0
    while t < end - 0.05:
        s.note(ch, chord[i % len(chord)], t, step * 2.2, vel)
        t += step
        i += 1


def compose_pub(path):
    s = Score()
    s.channel(0, PIANO, volume=96, pan=58, reverb=100)
    s.channel(1, SLOW_STRINGS, volume=84, pan=70, reverb=110)
    s.channel(2, HARP, volume=88, pan=48, reverb=110)
    s.channel(3, CELLO, volume=92, pan=60, reverb=90)
    s.channel(4, CELESTA, volume=72, pan=80, reverb=120)

    # (début, fin, basse, accord des cordes, arpège piano, intensité)
    B, D, E, Fs, G, A = 47, 50, 52, 54, 55, 57
    sections = [
        (0.0, 3.0, 35, [B, Fs, 61, 62], None, 46),               # Bm(add9) — l'émeraude
        (3.0, 5.0, 43, [G - 12 + 12, 59, 62, 66], [55, 59, 62, 66], 54),  # Gmaj7 — Paris
        (5.0, 7.33, 40, [E, 55, 62, 66], [52, 55, 59, 62, 66], 58),     # Em9 — Braise
        (7.33, 9.67, 42, [D, 57, 61, 66], [50, 57, 61, 66, 69], 62),    # D/F# maj7 — Jardin
        (9.67, 12.0, 43, [G, 59, 62, 67], [55, 59, 62, 67, 71], 66),    # G — Blason
        (12.0, 13.0, 35, [Fs, 59, 62, 66], [47, 54, 59, 62], 62),       # Bm — l'atelier
        (13.0, 14.0, 43, [D, 59, 62, 67], [43, 50, 55, 59], 64),        # G
        (14.0, 15.0, 42, [D, 57, 62, 66], [42, 50, 57, 62], 66),        # D/F#
        (15.0, 16.0, 40, [E, 55, 59, 64], [40, 47, 55, 59], 70),        # Em
        (16.0, 17.1, 43, [D, 59, 62, 67], [55, 59, 62, 67, 71, 74], 82),  # G — sur mesure (crescendo)
        (17.1, 18.13, 45, [E, 57, 62, 64], [57, 61, 64, 69, 73], 92),   # A(sus4→3)
    ]
    for start, end, bass, strings, arp, inten in sections:
        s.note(3, bass, start, end - start + 0.15, min(110, inten + 10))
        s.chord(1, strings, start, end - start + 0.2, inten, spread=0.03)
        if arp:
            arpeggio(s, arp, start + 0.02, end, 0.25 if start < 12 else 0.2, max(36, inten - 22))

    # Mélodie au piano, sobre pour laisser la place à la voix
    melody = [
        (0.35, 78, 1.0, 58), (1.35, 76, 0.6, 52), (1.95, 74, 0.5, 50), (2.45, 73, 0.8, 54),  # question
        (3.05, 74, 1.9, 56),
        (5.05, 71, 0.9, 58), (5.95, 74, 1.3, 56),
        (7.38, 73, 0.9, 60), (8.3, 78, 1.3, 60),
        (9.72, 79, 1.0, 62), (10.7, 78, 1.2, 60),
        (16.02, 83, 0.9, 74), (16.95, 81, 0.5, 72), (17.45, 79, 0.65, 72),
    ]
    for t, p, d, v in melody:
        s.note(0, p, t, d, v)

    # Scintillements de célesta sur chaque pierre
    for t, notes in [(0.5, [86, 90]), (5.25, [83, 86]), (7.55, [85, 90]), (9.9, [86, 91])]:
        for i, n in enumerate(notes):
            s.note(4, n, t + i * 0.12, 1.2, 64)

    # Glissandos de harpe qui ouvrent les plans
    for t in (2.55, 6.95, 11.55):
        harp_gliss(s, t, 50, 86, 0.42, vel=58)
    harp_gliss(s, 17.55, 45, 93, 0.55, vel=74)

    # TIFANNA : grand accord de ré majeur qui résout
    final = [38, 45, 50, 54, 57, 62, 66, 69]
    s.note(3, 38, 18.13, 1.9, 96)
    s.chord(1, [50, 54, 57, 62, 66, 69], 18.13, 1.9, 86, spread=0.02)
    s.chord(0, final, 18.13, 1.9, 74, spread=0.035)
    s.chord(4, [86, 90, 93, 98], 18.4, 1.5, 60, spread=0.1)
    s.save(path)


def compose_jingle(path):
    s = Score()
    s.channel(0, PIANO, volume=100, pan=58, reverb=105)
    s.channel(1, SLOW_STRINGS, volume=92, pan=70, reverb=115)
    s.channel(2, HARP, volume=96, pan=48, reverb=115)
    s.channel(3, CELLO, volume=96, pan=60, reverb=95)
    s.channel(4, CELESTA, volume=84, pan=80, reverb=125)
    harp_gliss(s, 0.05, 50, 86, 0.6, vel=74)
    # Motif signature : ré - fa# - la - ré (célesta + piano)
    for i, (n, t) in enumerate([(74, 0.7), (78, 1.0), (81, 1.3), (86, 1.75)]):
        s.note(4, n + 12 if i == 3 else n, t, 1.6, 70 + i * 4)
        s.note(0, n, t, 1.4, 64 + i * 4)
    s.note(3, 38, 1.75, 2.7, 100)
    s.chord(1, [50, 54, 57, 62, 66, 69], 1.75, 2.7, 92, spread=0.02)
    s.chord(0, [38, 45, 50, 54, 57, 62, 66, 69, 74], 1.75, 2.6, 80, spread=0.03)
    s.chord(4, [86, 90, 93, 98], 2.1, 2.0, 62, spread=0.12)
    s.save(path)


def render(mid, wav, gain):
    subprocess.run(
        ["fluidsynth", "-ni", "-g", str(gain), "-r", "44100", "-R", "1", "-C", "1", "-F", wav, SF2, mid],
        check=True, capture_output=True,
    )
    print("✓", os.path.basename(wav))


if __name__ == "__main__":
    compose_pub(os.path.join(HERE, "pub.mid"))
    compose_jingle(os.path.join(HERE, "jingle.mid"))
    render(os.path.join(HERE, "pub.mid"), os.path.join(HERE, "musique-pub.wav"), 0.55)
    render(os.path.join(HERE, "jingle.mid"), os.path.join(HERE, "musique-jingle.wav"), 0.6)
