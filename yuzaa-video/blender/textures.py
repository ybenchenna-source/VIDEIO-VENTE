"""
Textures générées pour les modèles Blender (bois, papier, écran, feuilles...).
Tout est déterministe (graine fixe) : relancer le script donne les mêmes images.
"""
import math
import random

from PIL import Image, ImageDraw, ImageFilter


def wood(path, w=2048, h=1024, seed=3):
    r = random.Random(seed)
    img = Image.new("RGB", (w, h))
    px = img.load()
    rings = [r.uniform(0, math.tau) for _ in range(6)]
    for y in range(h):
        for x in range(w):
            t = y / h * 26 + 1.6 * math.sin(x / w * 5 + rings[0]) + 0.6 * math.sin(x / w * 17 + rings[1])
            g = 0.5 + 0.5 * math.sin(t * math.tau)
            g = g ** 3
            base = (124, 82, 50)
            dark = (78, 48, 28)
            c = tuple(int(base[i] * (1 - g * 0.45) + dark[i] * g * 0.45) for i in range(3))
            px[x, y] = c
    img = img.filter(ImageFilter.GaussianBlur(0.8))
    # Fines fibres
    d = ImageDraw.Draw(img, "RGBA")
    for _ in range(900):
        y = r.uniform(0, h)
        x = r.uniform(0, w)
        d.line([(x, y), (x + r.uniform(40, 240), y + r.uniform(-2, 2))], fill=(60, 36, 20, r.randint(10, 35)), width=1)
    img.save(path, quality=90)


def notebook_page(path, w=1024, h=1400, seed=5):
    r = random.Random(seed)
    img = Image.new("RGB", (w, h), (247, 243, 232))
    d = ImageDraw.Draw(img)
    for y in range(140, h, 46):
        d.line([(0, y), (w, y)], fill=(170, 196, 220), width=2)
    d.line([(120, 0), (120, h)], fill=(226, 130, 130), width=3)
    # « Écriture » : traits manuscrits stylisés
    y = 140 + 46 - 12
    while y < h - 80:
        x = 150
        end = r.uniform(520, w - 80)
        while x < end:
            seg = r.uniform(30, 110)
            pts = [(x + i * 4, y - 6 + 7 * math.sin(i * 0.9 + r.random())) for i in range(int(seg / 4))]
            if len(pts) > 1:
                d.line(pts, fill=(52, 64, 110), width=3)
            x += seg + r.uniform(12, 24)
        y += 46 * (1 if r.random() > 0.15 else 2)
    img.save(path, quality=90)


def laptop_screen(path, w=1280, h=800):
    img = Image.new("RGB", (w, h), (24, 28, 40))
    d = ImageDraw.Draw(img)
    d.rectangle([0, 0, w, 48], fill=(38, 44, 62))
    for i, c in enumerate([(240, 96, 90), (245, 190, 80), (110, 200, 120)]):
        d.ellipse([20 + i * 30, 16, 36 + i * 30, 32], fill=c)
    # Diapo de cours : titre + puces + graphique
    d.rectangle([80, 110, w - 80, h - 70], fill=(250, 250, 252))
    d.rectangle([130, 160, 760, 200], fill=(40, 70, 140))
    for k in range(5):
        y = 250 + k * 62
        d.ellipse([136, y + 8, 152, y + 24], fill=(40, 70, 140))
        d.rectangle([176, y + 10, 176 + 300 + (k * 97) % 260, y + 22], fill=(150, 160, 180))
    for k in range(6):
        hh = [120, 190, 150, 260, 220, 300][k]
        d.rectangle([820 + k * 55, 600 - hh, 860 + k * 55, 600], fill=(80 + k * 20, 120, 200))
    img.save(path, quality=90)


def can_wrap(path, w=1024, h=512):
    img = Image.new("RGB", (w, h))
    d = ImageDraw.Draw(img, "RGBA")
    for y in range(h):
        k = y / h
        d.line([(0, y), (w, y)], fill=(int(43 - 20 * k), int(48 - 22 * k), int(54 - 25 * k)))
    for i in range(8):
        for shift in (-w, 0, w):
            x = i * 128 + shift
            wide = i % 4 == 0
            ww = 34 if wide else 12
            a = 215 if wide else 40
            d.polygon([(x, h), (x + ww, h), (x + ww + 256, 0), (x + 256, 0)], fill=(220, 226, 232, a))
    d.rectangle([0, 18, w, 24], fill=(230, 234, 238, 230))
    d.rectangle([0, h - 24, w, h - 18], fill=(230, 234, 238, 230))
    img.save(path, quality=92)


def leaf(path, kind, w=512, h=1024):
    """Feuille vue de dessus (fond transparent), nervures comprises."""
    img = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    pts_l, pts_r = [], []
    n = 120
    for i in range(n + 1):
        t = i / n
        width = leaf_width(kind, t) * w * 0.48
        y = h - t * h
        pts_r.append((w / 2 + width, y))
        pts_l.append((w / 2 - width, y))
    poly = pts_r + pts_l[::-1]
    if kind == "guayusa":
        c0, c1 = (64, 150, 84), (24, 84, 46)
    else:
        c0, c1 = (126, 196, 140), (42, 118, 66)
    mask = Image.new("L", (w, h), 0)
    ImageDraw.Draw(mask).polygon(poly, fill=255)
    grad = Image.new("RGB", (w, h))
    gd = ImageDraw.Draw(grad)
    for y in range(h):
        k = y / h
        gd.line([(0, y), (w, y)], fill=tuple(int(c0[i] * (1 - k) + c1[i] * k) for i in range(3)))
    img.paste(grad, (0, 0), mask)
    d = ImageDraw.Draw(img, "RGBA")
    d.line([(w / 2, h), (w / 2, h * 0.02)], fill=(225, 245, 215, 170), width=7)
    for j in range(1, 11):
        t = j / 12
        y = h - t * h
        width = leaf_width(kind, t) * w * 0.44
        for s in (-1, 1):
            d.line([(w / 2, y + 40), (w / 2 + s * width * 0.55, y + 8), (w / 2 + s * width * 0.95, y - 30)],
                   fill=(225, 245, 215, 90), width=3)
    img.save(path)


def leaf_width(kind, t):
    if kind == "guayusa":
        base = math.sin(math.pi * min(1, t * 1.02)) ** 0.75 * (1 - 0.35 * t) * 0.62
    else:
        base = math.sin(math.pi * t) ** 0.6 * 0.95
        base *= 1 + 0.05 * math.sin(t * 46)  # bord légèrement denté (maté)
    return max(0.0, base)


def pot_glaze(path, w=512, h=512, seed=9):
    r = random.Random(seed)
    img = Image.new("RGB", (w, h), (233, 223, 200))
    d = ImageDraw.Draw(img, "RGBA")
    for _ in range(1600):
        x, y = r.uniform(0, w), r.uniform(0, h)
        d.point((x, y), fill=(150, 130, 100, r.randint(30, 90)))
    img.save(path, quality=90)
