"""
Construit les modèles 3D de la vidéo yuzaa avec Blender (module Python bpy)
et les exporte en GLB dans public/models/.

Lancer (depuis yuzaa-video/) :
    python blender/build_assets.py

Il faut le module Blender pour Python :  pip install bpy
(ou Blender lui-même :  blender -b -P blender/build_assets.py)

Repère : on raisonne dans le repère de la vidéo (three.js, Y vers le haut).
P(x, y, z) convertit vers le repère de Blender (Z vers le haut).
"""
import math
import os
import random
import sys

import bpy  # doit être importé avant bmesh
import bmesh
from mathutils import Matrix, Vector

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import textures  # noqa: E402

ROOT = os.path.dirname(HERE)
OUT = os.path.join(ROOT, "public", "models")
TEX = os.path.join(HERE, "tex")
PUBLIC_TEX = os.path.join(ROOT, "public", "textures")
os.makedirs(OUT, exist_ok=True)
os.makedirs(TEX, exist_ok=True)

FLOOR = -1.3  # même valeur que src/three/choreo.ts


def P(x, y, z):
    """Repère vidéo (Y haut, Z vers la caméra) → repère Blender (Z haut)."""
    return Vector((x, -z, y))


# ───────────────────────── Outils ─────────────────────────


def reset():
    bpy.ops.wm.read_factory_settings(use_empty=True)


def material(name, color=(0.8, 0.8, 0.8), metal=0.0, rough=0.5, image=None, transmission=0.0,
             coat=0.0, emission=None, emission_strength=0.0, alpha_image=False):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    nt = m.node_tree
    bsdf = nt.nodes.get("Principled BSDF")
    bsdf.inputs["Base Color"].default_value = (*color, 1)
    bsdf.inputs["Metallic"].default_value = metal
    bsdf.inputs["Roughness"].default_value = rough
    if transmission:
        bsdf.inputs["Transmission Weight"].default_value = transmission
        bsdf.inputs["IOR"].default_value = 1.45
    if coat:
        bsdf.inputs["Coat Weight"].default_value = coat
        bsdf.inputs["Coat Roughness"].default_value = 0.08
    if emission is not None:
        bsdf.inputs["Emission Color"].default_value = (*emission, 1)
        bsdf.inputs["Emission Strength"].default_value = emission_strength
    if image:
        tex = nt.nodes.new("ShaderNodeTexImage")
        tex.image = bpy.data.images.load(image, check_existing=True)
        nt.links.new(tex.outputs["Color"], bsdf.inputs["Base Color"])
        if alpha_image:
            nt.links.new(tex.outputs["Alpha"], bsdf.inputs["Alpha"])
            m.blend_method = "CLIP" if hasattr(m, "blend_method") else None
        if emission is not None:
            nt.links.new(tex.outputs["Color"], bsdf.inputs["Emission Color"])
    return m


def obj_from_bmesh(name, bm, mats=(), smooth=None):
    me = bpy.data.meshes.new(name)
    bm.to_mesh(me)
    bm.free()
    ob = bpy.data.objects.new(name, me)
    bpy.context.collection.objects.link(ob)
    for m in mats:
        me.materials.append(m)
    if smooth is not None:
        for p in me.polygons:
            p.use_smooth = True
        select_only(ob)
        if smooth > 0:
            bpy.ops.object.shade_smooth_by_angle(angle=smooth)
        else:
            bpy.ops.object.shade_smooth()
    return ob


def select_only(*objs):
    bpy.ops.object.select_all(action="DESELECT")
    for o in objs:
        o.select_set(True)
    bpy.context.view_layer.objects.active = objs[0]


def bevel(ob, width=0.02, segments=3, angle=0.6):
    mod = ob.modifiers.new("Bevel", "BEVEL")
    mod.width = width
    mod.segments = segments
    mod.limit_method = "ANGLE"
    mod.angle_limit = angle
    mod.harden_normals = False
    return mod


def lathe(name, profile, steps=72, mats=(), uv_body=None):
    """Révolution d'un profil [(rayon, hauteur)] autour de l'axe vertical."""
    bm = bmesh.new()
    verts = [bm.verts.new((r, 0, z)) for r, z in profile]
    edges = [bm.edges.new((verts[i], verts[i + 1])) for i in range(len(verts) - 1)]
    bmesh.ops.spin(bm, geom=verts + edges, cent=(0, 0, 0), axis=(0, 0, 1), angle=math.tau, steps=steps,
                   use_merge=True)
    bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=1e-5)
    uv = bm.loops.layers.uv.new("UVMap")
    zmin = min(z for _, z in profile)
    zmax = max(z for _, z in profile)
    for f in bm.faces:
        c = f.calc_center_median()
        for loop in f.loops:
            co = loop.vert.co
            a = math.atan2(co.y, co.x)
            u = (a / math.tau) % 1.0
            # évite la couture : on aligne les u d'une même face
            if c.x < 0 and abs(c.y) < 0.2 and u < 0.25:
                u += 1.0
            v = (co.z - zmin) / max(1e-6, zmax - zmin)
            if uv_body:
                v = (co.z - uv_body[0]) / (uv_body[1] - uv_body[0])
            loop[uv].uv = (u, v)
    return obj_from_bmesh(name, bm, mats, smooth=0.9)


def export(objs, filename):
    select_only(*objs)
    path = os.path.join(OUT, filename)
    bpy.ops.export_scene.gltf(
        filepath=path,
        export_format="GLB",
        use_selection=True,
        export_apply=True,
        export_yup=True,
        export_texcoords=True,
        export_normals=True,
        export_materials="EXPORT",
        export_image_format="AUTO",
    )
    print("✓", filename, f"{os.path.getsize(path) / 1024:.0f} Ko")


# ───────────────────────── Boîtes yuzaa ─────────────────────────

BOX = (0.9, 1.36, 0.5)  # largeur, hauteur, profondeur (repère vidéo)
PRODUCTS = {
    "eveil": {"side": (0.42, 0.55, 0.36), "top": (0.52, 0.64, 0.45)},
    "focus": {"side": (0.85, 0.55, 0.17), "top": (0.9, 0.62, 0.22)},
    "rush": {"side": (0.57, 0.12, 0.07), "top": (0.66, 0.18, 0.12)},
}


def srgb(c):
    return tuple(((x + 0.055) / 1.055) ** 2.4 if x > 0.04045 else x / 12.92 for x in c)


def build_box(key):
    reset()
    w, h, d = BOX
    bm = bmesh.new()
    bmesh.ops.create_cube(bm, size=1.0)
    for v in bm.verts:
        v.co = Vector((v.co.x * w, v.co.y * d, v.co.z * h))
    uv = bm.loops.layers.uv.new("UVMap")
    for f in bm.faces:
        n = f.normal
        if n.y < -0.9:  # face avant (vers la caméra)
            f.material_index = 0
            for loop in f.loops:
                co = loop.vert.co
                loop[uv].uv = ((co.x + w / 2) / w, (co.z + h / 2) / h)
        elif n.z > 0.9:
            f.material_index = 2
        else:
            f.material_index = 1
        if n.y > -0.9:
            for loop in f.loops:
                co = loop.vert.co
                loop[uv].uv = (co.x + co.y, co.z)
    front = material(f"{key}-front", rough=0.62, image=os.path.join(PUBLIC_TEX, f"{key}-front.jpg"))
    side = material(f"{key}-side", srgb(PRODUCTS[key]["side"]), rough=0.62)
    top = material(f"{key}-top", srgb(PRODUCTS[key]["top"]), rough=0.62)
    ob = obj_from_bmesh(f"box-{key}", bm, (front, side, top), smooth=0.6)
    bevel(ob, width=0.018, segments=4)
    export([ob], f"box-{key}.glb")


# ───────────────────────── Canette générique ─────────────────────────

CAN_PROFILE = [
    (0.0, 0.03), (0.17, 0.035), (0.215, 0.012), (0.24, 0.0), (0.268, 0.004), (0.29, 0.02),
    (0.31, 0.05), (0.325, 0.09), (0.33, 0.12),
    (0.33, 1.06), (0.326, 1.10), (0.31, 1.135), (0.29, 1.165), (0.274, 1.188),
    (0.27, 1.205), (0.276, 1.217), (0.272, 1.228), (0.26, 1.229), (0.25, 1.22),
    (0.246, 1.205), (0.24, 1.2), (0.0, 1.2),
]


def build_can():
    reset()
    alu = material("alu", srgb((0.84, 0.86, 0.89)), metal=1.0, rough=0.22)
    wrap_png = os.path.join(TEX, "can-wrap.jpg")
    textures.can_wrap(wrap_png)
    body_m = material("can-body", metal=0.7, rough=0.3, image=wrap_png, coat=1.0)
    can = lathe("can", CAN_PROFILE, steps=96, mats=(alu, body_m), uv_body=(0.12, 1.06))
    # Corps imprimé entre 0.12 et 1.06
    for p in can.data.polygons:
        zc = sum(can.data.vertices[i].co.z for i in p.vertices) / len(p.vertices)
        if 0.12 <= zc <= 1.06:
            p.material_index = 1
    # Languette : plaque arrondie + anneau
    bm = bmesh.new()
    pts = []
    for i in range(24):
        a = math.pi / 2 + i / 23 * math.pi
        pts.append((0.035 * math.cos(a) - 0.02, 0.035 * math.sin(a)))
    for i in range(24):
        a = -math.pi / 2 + i / 23 * math.pi
        pts.append((0.05 * math.cos(a) + 0.045, 0.042 * math.sin(a)))
    face = bm.faces.new([bm.verts.new((x, y, 0)) for x, y in pts])
    r = bmesh.ops.extrude_face_region(bm, geom=[face])
    for v in [e for e in r["geom"] if isinstance(e, bmesh.types.BMVert)]:
        v.co.z += 0.008
    tab = obj_from_bmesh("tab", bm, (alu,), smooth=0.5)
    tab.location = (0.03, 0, 1.208)
    hole = bpy.data.objects.new("tab-hole", bpy.data.meshes.new("tab-hole"))
    bm = bmesh.new()
    bmesh.ops.create_circle(bm, cap_ends=True, radius=0.026, segments=24)
    for v in bm.verts:
        v.co.x += 0.075
        v.co.z = 1.2175
    bm.to_mesh(hole.data)
    bm.free()
    bpy.context.collection.objects.link(hole)
    hole.data.materials.append(material("tab-hole", (0.05, 0.05, 0.05), rough=0.6))
    # Rainure d'ouverture sur le couvercle
    bpy.ops.mesh.primitive_torus_add(major_radius=0.07, minor_radius=0.006, location=(0.12, 0, 1.203),
                                     major_segments=48, minor_segments=8)
    score = bpy.context.active_object
    score.scale = (1.0, 0.75, 0.6)
    score.data.materials.append(alu)
    export([can, tab, hole, score], "can.glb")


# ───────────────────────── Pièce ─────────────────────────


def build_coin():
    reset()
    gold = material("gold", srgb((0.86, 0.66, 0.26)), metal=1.0, rough=0.26)
    R, T = 0.24, 0.045
    bm = bmesh.new()
    n = 180
    rings = []
    for z in (-T / 2, T / 2):
        ring = []
        for i in range(n):
            a = i / n * math.tau
            rr = R if i % 2 == 0 else R * 0.985  # cannelures sur la tranche
            ring.append(bm.verts.new((rr * math.cos(a), rr * math.sin(a), z)))
        rings.append(ring)
    for i in range(n):
        j = (i + 1) % n
        bm.faces.new((rings[0][i], rings[0][j], rings[1][j], rings[1][i]))
    for ring, z in ((rings[1], T / 2), (rings[0], -T / 2)):
        # Rebord en relief puis creux central
        f = bm.faces.new(ring if z > 0 else ring[::-1])
        ins = bmesh.ops.inset_region(bm, faces=[f], thickness=0.028, depth=0.0)
        ins2 = bmesh.ops.inset_region(bm, faces=[f], thickness=0.004, depth=-0.006)
        bmesh.ops.triangulate(bm, faces=[f])
    coin = obj_from_bmesh("coin", bm, (gold,), smooth=0.5)
    # « € » en relief sur les deux faces (orienté pour rester à l'endroit dans la vidéo)
    glyphs = []
    for side in (1, -1):
        cu = bpy.data.curves.new("euro", "FONT")
        cu.body = "€"
        cu.size = 0.25
        cu.align_x = "CENTER"
        cu.align_y = "CENTER"
        cu.extrude = 0.004
        ob = bpy.data.objects.new("euro", cu)
        bpy.context.collection.objects.link(ob)
        ob.location = (0, 0, side * (T / 2 - 0.002))
        if side < 0:
            ob.rotation_euler = (math.pi, 0, 0)
        select_only(ob)
        bpy.ops.object.convert(target="MESH")
        ob.data.materials.append(gold)
        glyphs.append(ob)
    export([coin, *glyphs], "coin.glb")


# ───────────────────────── Mug en verre ─────────────────────────


def build_mug():
    reset()
    glass = material("glass", (1, 1, 1), rough=0.03, transmission=1.0)
    tea = material("tea", srgb((0.84, 0.55, 0.16)), rough=0.08, transmission=0.4)
    ceramic = material("ceramic", srgb((0.98, 0.97, 0.94)), rough=0.3, coat=0.6)
    mug = lathe("mug-glass", [
        (0.0, 0.045), (0.37, 0.045), (0.42, 0.07), (0.445, 0.16), (0.48, 0.70), (0.49, 0.765),
        (0.475, 0.77), (0.455, 0.715), (0.42, 0.18), (0.39, 0.12), (0.0, 0.12),
    ], steps=96, mats=(glass,))
    liquid = lathe("mug-tea", [
        (0.0, 0.125), (0.388, 0.125), (0.41, 0.17), (0.444, 0.62), (0.0, 0.62),
    ], steps=96, mats=(tea,))
    saucer = lathe("mug-saucer", [
        (0.0, 0.0), (0.55, 0.0), (0.62, 0.012), (0.74, 0.05), (0.75, 0.062), (0.72, 0.064),
        (0.6, 0.035), (0.42, 0.045), (0.0, 0.045),
    ], steps=96, mats=(ceramic,))
    # Anse : demi-tore aplati
    bpy.ops.mesh.primitive_torus_add(major_radius=0.17, minor_radius=0.038, location=(0.47, 0, 0.42),
                                     rotation=(math.pi / 2, 0, 0), major_segments=48, minor_segments=16)
    handle = bpy.context.active_object
    bm = bmesh.from_edit_mesh(handle.data) if handle.mode == "EDIT" else None
    me = handle.data
    bm = bmesh.new()
    bm.from_mesh(me)
    bmesh.ops.delete(bm, geom=[v for v in bm.verts if v.co.x < -0.02], context="VERTS")
    bm.to_mesh(me)
    bm.free()
    handle.name = "mug-handle"
    handle.scale = (1.0, 1.0, 1.15)
    me.materials.append(glass)
    for p in me.polygons:
        p.use_smooth = True
    export([mug, liquid, saucer, handle], "mug.glb")


# ───────────────────────── Feuilles et guarana ─────────────────────────


def build_leaf(kind):
    reset()
    png = os.path.join(TEX, f"leaf-{kind}.png")
    textures.leaf(png, kind)
    m = material(f"leaf-{kind}", rough=0.5, image=png, alpha_image=True)
    L = 0.6 if kind == "guayusa" else 0.42
    W = L * 0.5
    nt, ns = 30, 8
    bm = bmesh.new()
    uv = bm.loops.layers.uv.new("UVMap")
    grid = []
    for i in range(nt + 1):
        t = i / nt
        row = []
        for j in range(ns + 1):
            s = j / ns * 2 - 1
            x = s * W * 0.5
            y = t * L
            z = abs(s) * W * 0.12 - 0.18 * (t ** 2) * L  # pli central + courbure
            z += 0.02 * math.sin(t * 9 + s * 2)  # ondulation
            row.append(bm.verts.new((x, y, z)))
        grid.append(row)
    for i in range(nt):
        for j in range(ns):
            f = bm.faces.new((grid[i][j], grid[i][j + 1], grid[i + 1][j + 1], grid[i + 1][j]))
            for loop in f.loops:
                co = loop.vert.co
                loop[uv].uv = (co.x / W + 0.5, co.y / L)
    leaf = obj_from_bmesh(f"leaf-{kind}", bm, (m,), smooth=0)
    sol = leaf.modifiers.new("Solidify", "SOLIDIFY")
    sol.thickness = 0.004
    # Pétiole
    bpy.ops.mesh.primitive_cylinder_add(radius=0.008, depth=0.09, location=(0, -0.04, 0.0),
                                        rotation=(math.pi / 2, 0, 0), vertices=10)
    stem = bpy.context.active_object
    stem.data.materials.append(material("stem", srgb((0.3, 0.45, 0.2)), rough=0.6))
    export([leaf, stem], f"leaf-{kind}.glb")


def build_guarana():
    reset()
    red = material("guarana-red", srgb((0.8, 0.12, 0.08)), rough=0.28, coat=0.6)
    white = material("guarana-aril", srgb((0.96, 0.93, 0.86)), rough=0.55)
    black = material("guarana-seed", (0.01, 0.01, 0.01), rough=0.12, coat=1.0)
    objs = []
    for k, (x, y, z, s) in enumerate([(0, 0, 0, 1.0), (0.17, -0.05, 0.05, 0.85), (-0.15, -0.06, 0.04, 0.9)]):
        # Coque rouge ouverte vers l'avant (-Y Blender = vers la caméra)
        bpy.ops.mesh.primitive_uv_sphere_add(radius=0.12 * s, location=(x, y, z), segments=40, ring_count=24)
        shell = bpy.context.active_object
        bm = bmesh.new()
        bm.from_mesh(shell.data)
        cut = [v for v in bm.verts if (v.co.y) < -0.08 * s]
        bmesh.ops.delete(bm, geom=cut, context="VERTS")
        bm.to_mesh(shell.data)
        bm.free()
        sol = shell.modifiers.new("Solidify", "SOLIDIFY")
        sol.thickness = 0.012
        shell.data.materials.append(red)
        bpy.ops.mesh.primitive_uv_sphere_add(radius=0.085 * s, location=(x, y - 0.035 * s, z), segments=32,
                                             ring_count=16)
        aril = bpy.context.active_object
        aril.data.materials.append(white)
        bpy.ops.mesh.primitive_uv_sphere_add(radius=0.052 * s, location=(x, y - 0.085 * s, z), segments=32,
                                             ring_count=16)
        seed = bpy.context.active_object
        seed.data.materials.append(black)
        for o in (shell, aril, seed):
            for p in o.data.polygons:
                p.use_smooth = True
        objs += [shell, aril, seed]
    export(objs, "guarana.glb")


# ───────────────────────── Bureau de révisions (scènes 1-2) ─────────────────────────


def box_obj(name, size, loc, mat, bev=0.01, rot=(0, 0, 0)):
    bpy.ops.mesh.primitive_cube_add(size=1, location=loc, rotation=rot)
    ob = bpy.context.active_object
    ob.name = name
    ob.scale = size
    bpy.ops.object.transform_apply(scale=True)
    ob.data.materials.append(mat)
    if bev:
        bevel(ob, width=bev, segments=3)
    return ob


def build_desk():
    reset()
    rnd = random.Random(11)
    objs = []
    wood_png = os.path.join(TEX, "wood.jpg")
    textures.wood(wood_png)
    wood = material("desk-wood", rough=0.6, image=wood_png)

    # Plateau : surface supérieure à FLOOR (légèrement au-dessus pour ne pas croiser le sol)
    top = FLOOR + 0.004
    bpy.ops.mesh.primitive_cube_add(size=1, location=P(0, top - 0.06, 3.0))
    desk = bpy.context.active_object
    desk.name = "desk-top"
    desk.scale = (9.0, 13.0, 0.12)
    bpy.ops.object.transform_apply(scale=True)
    bm = bmesh.new()
    bm.from_mesh(desk.data)
    uv = bm.loops.layers.uv.new("UVMap")
    for f in bm.faces:
        for loop in f.loops:
            co = loop.vert.co
            loop[uv].uv = (co.x / 9.0 + 0.5, co.y / 13.0 * 1.8 + 0.5)
    bm.to_mesh(desk.data)
    bm.free()
    desk.data.materials.append(wood)
    bevel(desk, width=0.02, segments=3)
    objs.append(desk)

    # Pile de livres (arrière gauche)
    covers = [(0.13, 0.2, 0.36), (0.45, 0.12, 0.13), (0.75, 0.58, 0.25), (0.2, 0.32, 0.28)]
    pages = material("pages", srgb((0.95, 0.92, 0.84)), rough=0.85)
    y = top
    for k, (w, hgt, d) in enumerate([(1.25, 0.16, 0.9), (1.15, 0.12, 0.82), (1.3, 0.14, 0.86), (1.05, 0.11, 0.76)]):
        cov = material(f"cover-{k}", srgb(covers[k]), rough=0.55)
        ang = rnd.uniform(-0.18, 0.18)
        cx, cz = -1.55 + rnd.uniform(-0.05, 0.05), -1.25 + rnd.uniform(-0.05, 0.05)
        objs.append(box_obj(f"book-{k}", (w, d, hgt), P(cx, y + hgt / 2, cz), cov, bev=0.012, rot=(0, 0, ang)))
        objs.append(box_obj(f"book-pages-{k}", (w - 0.06, d - 0.03, hgt - 0.03), P(cx + 0.035 * math.cos(ang), y + hgt / 2, cz), pages,
                            bev=0.0, rot=(0, 0, ang)))
        y += hgt

    # Cahier ouvert (avant droite) : deux pages légèrement bombées
    page_png = os.path.join(TEX, "notebook.jpg")
    textures.notebook_page(page_png)
    paper = material("notebook-page", rough=0.8, image=page_png)
    cover = material("notebook-cover", srgb((0.12, 0.3, 0.5)), rough=0.6)
    for side in (-1, 1):
        bm = bmesh.new()
        uvl = bm.loops.layers.uv.new("UVMap")
        nx, ny = 16, 2
        pw, ph = 0.62, 0.86
        grid = []
        for i in range(nx + 1):
            row = []
            for j in range(ny + 1):
                u = i / nx
                x = side * u * pw
                zlift = 0.05 * math.sin(u * math.pi * 0.9) * (1 - u * 0.3)
                row.append(bm.verts.new((x, (j / ny - 0.5) * ph, zlift + 0.012)))
            grid.append(row)
        for i in range(nx):
            for j in range(ny):
                q = (grid[i][j], grid[i + 1][j], grid[i + 1][j + 1], grid[i][j + 1])
                f = bm.faces.new(q if side > 0 else q[::-1])
                for loop in f.loops:
                    co = loop.vert.co
                    loop[uvl].uv = (abs(co.x) / pw, co.y / ph + 0.5)
        pg = obj_from_bmesh(f"notebook-page-{side}", bm, (paper,), smooth=0)
        pg.location = P(1.15, top, 0.75)
        pg.rotation_euler = (0, 0, -0.35)
        objs.append(pg)
    nb = box_obj("notebook-cover", (1.3, 0.9, 0.012), P(1.15, top + 0.006, 0.75), cover, bev=0.004, rot=(0, 0, -0.35))
    objs.append(nb)

    # Ordinateur portable (arrière droite)
    screen_png = os.path.join(TEX, "screen.jpg")
    textures.laptop_screen(screen_png)
    alu = material("laptop-alu", srgb((0.6, 0.62, 0.66)), metal=0.9, rough=0.35)
    disp = material("laptop-screen", rough=0.2, image=screen_png, emission=(1, 1, 1), emission_strength=1.6)
    base_loc = P(1.55, top + 0.025, -1.45)
    objs.append(box_obj("laptop-base", (1.5, 1.0, 0.04), base_loc, alu, bev=0.012, rot=(0, 0, -0.5)))
    lid = box_obj("laptop-lid", (1.5, 0.03, 0.98), (0, 0, 0), alu, bev=0.01)
    bpy.ops.mesh.primitive_plane_add(size=1, location=(0, -0.017, 0))
    scr = bpy.context.active_object
    scr.name = "laptop-display"
    scr.scale = (1.38, 0.86, 1)
    scr.rotation_euler = (math.pi / 2, 0, 0)
    bpy.ops.object.transform_apply(rotation=True, scale=True)
    scr.data.materials.append(disp)
    for o in (lid, scr):
        o.location = Vector((0, 0, 0.49))
        bpy.ops.object.select_all(action="DESELECT")
    for o in (lid, scr):
        mat = Matrix.Translation(base_loc) @ Matrix.Rotation(-0.5, 4, "Z") @ Matrix.Translation(
            (0, 0.5, 0.02)) @ Matrix.Rotation(-0.32, 4, "X") @ Matrix.Translation((0, 0, 0.49))
        o.matrix_world = mat
        objs.append(o)

    # Pot à crayons (avant gauche)
    cupm = material("pencil-cup", srgb((0.88, 0.85, 0.78)), rough=0.4, coat=0.3)
    cup = lathe("pencil-cup", [(0, 0), (0.19, 0), (0.2, 0.02), (0.2, 0.42), (0.185, 0.42), (0.185, 0.03), (0, 0.03)],
                steps=48, mats=(cupm,))
    cup.location = P(-1.55, top, 0.75)
    objs.append(cup)
    pencil_cols = [(0.95, 0.75, 0.2), (0.25, 0.45, 0.8), (0.85, 0.3, 0.3), (0.3, 0.6, 0.4)]
    for k in range(5):
        col = material(f"pencil-{k}", srgb(pencil_cols[k % 4]), rough=0.5)
        a = k / 5 * math.tau
        bpy.ops.mesh.primitive_cylinder_add(radius=0.022, depth=0.75, vertices=6)
        pen = bpy.context.active_object
        pen.name = f"pencil-{k}"
        pen.data.materials.append(col)
        pen.matrix_world = Matrix.Translation(P(-1.55 + 0.08 * math.cos(a), top + 0.4, 0.75 + 0.08 * math.sin(a))) @ \
            Matrix.Rotation(0.18 * math.cos(a), 4, "X") @ Matrix.Rotation(0.18 * math.sin(a), 4, "Y")
        objs.append(pen)

    # Post-it
    for k, (x, z, a, c) in enumerate([(0.55, -0.55, 0.3, (0.98, 0.85, 0.35)), (0.8, -0.75, -0.2, (0.98, 0.6, 0.55)),
                                      (-0.95, -0.35, 0.1, (0.6, 0.85, 0.65))]):
        objs.append(box_obj(f"postit-{k}", (0.32, 0.32, 0.004), P(x, top + 0.002 + k * 0.002, z),
                            material(f"postit-{k}", srgb(c), rough=0.8), bev=0.0, rot=(0, 0, a)))

    # Surligneur
    hl = material("highlighter", srgb((0.95, 0.9, 0.2)), rough=0.4)
    bpy.ops.mesh.primitive_cylinder_add(radius=0.04, depth=0.5, vertices=16, location=P(0.55, top + 0.04, 0.35),
                                        rotation=(0, math.pi / 2, 0.6))
    o = bpy.context.active_object
    o.data.materials.append(hl)
    objs.append(o)

    export(objs, "desk.glb")


# ───────────────────────── Décor botanique (scènes 3-6) ─────────────────────────


def build_plant(name, seed, n_stems=7, height=2.2):
    """Plante en pot : tiges courbes et feuilles de guayusa."""
    rnd = random.Random(seed)
    objs = []
    potm = material(f"{name}-pot", srgb((0.74, 0.44, 0.3)), rough=0.75)
    pot = lathe(f"{name}-pot", [(0, 0), (0.42, 0), (0.48, 0.05), (0.56, 0.62), (0.6, 0.66), (0.6, 0.7),
                                (0.54, 0.7), (0.5, 0.64), (0, 0.6)], steps=64, mats=(potm,))
    objs.append(pot)
    soil = material(f"{name}-soil", srgb((0.16, 0.11, 0.07)), rough=0.95)
    bpy.ops.mesh.primitive_cylinder_add(radius=0.52, depth=0.02, location=(0, 0, 0.62), vertices=48)
    s = bpy.context.active_object
    s.data.materials.append(soil)
    objs.append(s)
    leafpng = os.path.join(TEX, "leaf-guayusa.png")
    textures.leaf(leafpng, "guayusa")
    leafm = material(f"{name}-leaf", rough=0.45, image=leafpng, alpha_image=True)
    stemm = material(f"{name}-stem", srgb((0.25, 0.4, 0.18)), rough=0.6)
    for k in range(n_stems):
        a = k / n_stems * math.tau + rnd.uniform(-0.3, 0.3)
        lean = rnd.uniform(0.25, 0.6)
        hgt = height * rnd.uniform(0.55, 1.0)
        # Tige : courbe de Bézier épaissie
        cu = bpy.data.curves.new(f"{name}-stem-{k}", "CURVE")
        cu.dimensions = "3D"
        cu.bevel_depth = 0.012
        sp = cu.splines.new("BEZIER")
        sp.bezier_points.add(2)
        pts = []
        for j in range(3):
            t = j / 2
            r = lean * hgt * t ** 1.4
            pts.append(Vector((r * math.cos(a), r * math.sin(a), 0.62 + hgt * t)))
        for bp, p in zip(sp.bezier_points, pts):
            bp.co = p
            bp.handle_left_type = bp.handle_right_type = "AUTO"
        so = bpy.data.objects.new(f"{name}-stem-{k}", cu)
        bpy.context.collection.objects.link(so)
        select_only(so)
        bpy.ops.object.convert(target="MESH")
        so.data.materials.append(stemm)
        objs.append(so)
        # Feuilles le long de la tige
        for j in range(4):
            t = 0.45 + j * 0.18
            r = lean * hgt * t ** 1.4
            base = Vector((r * math.cos(a), r * math.sin(a), 0.62 + hgt * t))
            leaf = make_leaf_mesh(f"{name}-leaf-{k}-{j}", leafm, L=rnd.uniform(0.45, 0.7))
            side = 1 if j % 2 == 0 else -1
            leaf.matrix_world = Matrix.Translation(base) @ Matrix.Rotation(a + side * 1.2, 4, "Z") @ \
                Matrix.Rotation(-math.pi / 2 + rnd.uniform(0.6, 1.1), 4, "X")
            objs.append(leaf)
    return objs


def make_leaf_mesh(name, mat, L=0.6):
    W = L * 0.42
    nt, ns = 14, 6
    bm = bmesh.new()
    uv = bm.loops.layers.uv.new("UVMap")
    grid = []
    for i in range(nt + 1):
        t = i / nt
        row = []
        for j in range(ns + 1):
            s = j / ns * 2 - 1
            row.append(bm.verts.new((s * W * 0.5, t * L, abs(s) * W * 0.12 - 0.22 * t ** 2 * L)))
        grid.append(row)
    for i in range(nt):
        for j in range(ns):
            f = bm.faces.new((grid[i][j], grid[i][j + 1], grid[i + 1][j + 1], grid[i + 1][j]))
            for loop in f.loops:
                co = loop.vert.co
                loop[uv].uv = (co.x / W + 0.5, co.y / L)
    return obj_from_bmesh(name, bm, (mat,), smooth=0)


def build_botanical():
    reset()
    objs = []
    left = build_plant("plant-l", seed=21, n_stems=8, height=2.4)
    for o in left:
        o.location = o.location + P(-2.0, FLOOR, -4.4)
    right = build_plant("plant-r", seed=37, n_stems=6, height=1.8)
    for o in right:
        o.location = o.location + P(2.1, FLOOR, -4.0)
    objs += left + right
    # Galets
    rnd = random.Random(4)
    stone = material("stone", srgb((0.62, 0.6, 0.55)), rough=0.7)
    for k, (x, z, s) in enumerate([(-1.9, 0.9, 0.22), (-1.6, 1.2, 0.14), (1.9, 0.6, 0.25), (2.2, 0.95, 0.15),
                                   (-0.9, -1.6, 0.18), (1.2, -1.7, 0.2)]):
        bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=4, radius=s, location=P(x, FLOOR + s * 0.45, z))
        st = bpy.context.active_object
        st.scale = (1.0, rnd.uniform(0.8, 1.2), 0.55)
        disp = st.modifiers.new("Disp", "DISPLACE")
        tx = bpy.data.textures.new(f"n{k}", "CLOUDS")
        tx.noise_scale = 0.35
        disp.texture = tx
        disp.strength = 0.04
        st.data.materials.append(stone)
        for p in st.data.polygons:
            p.use_smooth = True
        objs.append(st)
    export(objs, "botanical.glb")


if __name__ == "__main__":
    only = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
    steps = {
        "boxes": lambda: [build_box(k) for k in PRODUCTS],
        "can": build_can,
        "coin": build_coin,
        "mug": build_mug,
        "leaves": lambda: [build_leaf("guayusa"), build_leaf("mate"), build_guarana()],
        "desk": build_desk,
        "botanical": build_botanical,
    }
    for name, fn in steps.items():
        if not only or name in only:
            fn()
