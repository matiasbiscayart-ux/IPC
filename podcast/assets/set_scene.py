# -*- coding: utf-8 -*-
"""
Set de grabacion del podcast FHC modelado sobre la sala real de la oficina.
Render con Blender (bpy) / Cycles CPU.
Uso: python3 set_scene.py <salida.png> [ancho] [alto] [samples]
"""
import sys, math, random
import bpy
from mathutils import Vector

OUT     = sys.argv[1] if len(sys.argv) > 1 else "/tmp/set.png"
RES_X   = int(sys.argv[2]) if len(sys.argv) > 2 else 1280
RES_Y   = int(sys.argv[3]) if len(sys.argv) > 3 else 720
SAMPLES = int(sys.argv[4]) if len(sys.argv) > 4 else 96

random.seed(7)

# ───────────────────────── limpiar escena ─────────────────────────
bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene

# ───────────────────────── helpers ─────────────────────────
def mat(name, color, rough=0.6, metal=0.0, emit=None, emit_str=1.0, ior=1.45, alpha=1.0):
    m = bpy.data.materials.new(name); m.use_nodes = True
    b = m.node_tree.nodes["Principled BSDF"]
    b.inputs["Base Color"].default_value = (*color, 1)
    b.inputs["Roughness"].default_value = rough
    b.inputs["Metallic"].default_value = metal
    if "IOR" in b.inputs: b.inputs["IOR"].default_value = ior
    if alpha < 1.0:
        b.inputs["Alpha"].default_value = alpha
        m.blend_method = 'BLEND'
    if emit is not None:
        b.inputs["Emission Color"].default_value = (*emit, 1)
        b.inputs["Emission Strength"].default_value = emit_str
    return m

def box(name, size, loc, rot=(0,0,0), material=None):
    bpy.ops.mesh.primitive_cube_add(size=1, location=loc, rotation=rot)
    o = bpy.context.object; o.name = name
    o.scale = (size[0], size[1], size[2])
    if material: o.data.materials.append(material)
    return o

def cyl(name, r, h, loc, rot=(0,0,0), material=None, verts=32):
    bpy.ops.mesh.primitive_cylinder_add(radius=r, depth=h, location=loc, rotation=rot, vertices=verts)
    o = bpy.context.object; o.name = name
    if material: o.data.materials.append(material)
    return o

def plane(name, size, loc, rot=(0,0,0), material=None):
    bpy.ops.mesh.primitive_plane_add(size=1, location=loc, rotation=rot)
    o = bpy.context.object; o.name = name
    o.scale = (size[0], size[1], 1)
    if material: o.data.materials.append(material)
    return o

def bevel(obj, width=0.012, segments=3):
    m = obj.modifiers.new("bev", 'BEVEL')
    m.width = width; m.segments = segments; m.limit_method = 'ANGLE'
    m.angle_limit = math.radians(50)
    return obj

def shade_smooth(obj):
    for p in obj.data.polygons: p.use_smooth = True

# ───────────────────────── materiales ─────────────────────────
M_FLOOR   = mat("piso_cemento",   (0.255,0.263,0.275), rough=0.32)
M_WALL    = mat("pared_blanca",   (0.905,0.900,0.888), rough=0.88)
M_WALL_AC = mat("pared_acento",   (0.055,0.086,0.160), rough=0.80)   # navy FHC
M_CEIL    = mat("cielorraso",     (0.945,0.945,0.945), rough=0.95)
M_RUG     = mat("alfombra",       (0.185,0.176,0.162), rough=1.00)
M_CHAIR   = mat("butaca",         (0.030,0.115,0.150), rough=0.88)   # teal oscuro
M_CUSH    = mat("almohadon",      (0.560,0.330,0.145), rough=0.90)   # mostaza/terracota
M_WOOD    = mat("madera",         (0.180,0.098,0.052), rough=0.42)
M_WOOD_L  = mat("madera_clara",   (0.420,0.255,0.135), rough=0.50)
M_WHITE   = mat("melamina",       (0.880,0.878,0.870), rough=0.45)
M_BLACK   = mat("negro_mate",     (0.022,0.022,0.024), rough=0.48)
M_METAL   = mat("metal_oscuro",   (0.085,0.088,0.092), rough=0.32, metal=0.85)
M_ALU     = mat("aluminio",       (0.330,0.340,0.350), rough=0.30, metal=0.90)
M_GLASS   = mat("vidrio",         (0.92,0.94,0.96),    rough=0.05, ior=1.45, alpha=0.22)
M_FOAM    = mat("panel_acustico", (0.140,0.145,0.155), rough=0.98)
M_CURTAIN = mat("cortina",        (0.105,0.115,0.130), rough=0.95)
M_SOFA    = mat("sofa_gris",      (0.300,0.312,0.330), rough=0.92)
M_LEAF    = mat("planta",         (0.055,0.180,0.060), rough=0.70)
M_SOFTBOX = mat("softbox",        (1,1,1), rough=0.5, emit=(1.0,0.955,0.885), emit_str=6.5)
M_PRACT   = mat("practical",      (1,1,1), rough=0.5, emit=(1.0,0.740,0.430), emit_str=16.0)
M_RGB     = mat("rgb_fondo",      (1,1,1), rough=0.5, emit=(0.130,0.560,0.640), emit_str=9.0)
M_SCREEN  = mat("monitor",        (1,1,1), rough=0.3, emit=(0.360,0.480,0.600), emit_str=2.6)
M_CITY    = mat("ciudad",         (1,1,1), rough=0.9, emit=(0.640,0.700,0.790), emit_str=2.2)
M_BLDG    = mat("edificio",       (1,1,1), rough=0.9, emit=(0.330,0.370,0.440), emit_str=2.0)
M_MAPBG   = mat("mapa_fondo",     (0.900,0.880,0.830), rough=0.85)
M_MAPLAND = mat("mapa_tierra",    (0.640,0.400,0.250), rough=0.88)

# ───────────────────────── dimensiones de la sala ─────────────────────────
# X: ancho (-2.30 .. 2.30) = 4.60 m   |  Y: profundidad (-2.60 .. 1.80) = 4.40 m
# Z: altura 0 .. 2.75 m
X0, X1 = -2.30, 2.30
Y0, Y1 = -2.60, 1.80
ZH     = 2.75
T      = 0.10   # espesor muros

box("piso",      (X1-X0, Y1-Y0, T), ((X0+X1)/2, (Y0+Y1)/2, -T/2), material=M_FLOOR)
box("cielorraso",(X1-X0, Y1-Y0, T), ((X0+X1)/2, (Y0+Y1)/2, ZH+T/2), material=M_CEIL)
box("pared_fondo",(X1-X0, T, ZH),   ((X0+X1)/2, Y1+T/2, ZH/2), material=M_WALL)
box("pared_der", (T, Y1-Y0, ZH),    (X1+T/2, (Y0+Y1)/2, ZH/2), material=M_WALL)
box("pared_atras",(X1-X0, T, ZH),   ((X0+X1)/2, Y0-T/2, ZH/2), material=M_WALL)

# panel de acento navy detras del set
box("panel_acento", (2.05, 0.035, 2.30), (-0.62, Y1-0.02, 1.28), material=M_WALL_AC)

# ── pared izquierda con ventanal (marco de aluminio gris, como el de la oficina)
WIN_Y0, WIN_Y1 = -1.55, 1.25      # extension del ventanal
WIN_Z0, WIN_Z1 = 0.42, 2.42
box("pared_izq_inf", (T, Y1-Y0, WIN_Z0),        (X0-T/2, (Y0+Y1)/2, WIN_Z0/2), material=M_WALL)
box("pared_izq_sup", (T, Y1-Y0, ZH-WIN_Z1),     (X0-T/2, (Y0+Y1)/2, (WIN_Z1+ZH)/2), material=M_WALL)
box("pared_izq_a",   (T, WIN_Y0-Y0, WIN_Z1-WIN_Z0), (X0-T/2, (Y0+WIN_Y0)/2, (WIN_Z0+WIN_Z1)/2), material=M_WALL)
box("pared_izq_b",   (T, Y1-WIN_Y1, WIN_Z1-WIN_Z0), (X0-T/2, (WIN_Y1+Y1)/2, (WIN_Z0+WIN_Z1)/2), material=M_WALL)

# marco y parteluces
for yy in (WIN_Y0, -0.60, 0.30, WIN_Y1):
    box("mullion", (0.09, 0.055, WIN_Z1-WIN_Z0), (X0-0.04, yy, (WIN_Z0+WIN_Z1)/2), material=M_ALU)
for zz in (WIN_Z0, 1.62, WIN_Z1):
    box("travesano", (0.09, WIN_Y1-WIN_Y0, 0.055), (X0-0.04, (WIN_Y0+WIN_Y1)/2, zz), material=M_ALU)
box("vidrio", (0.02, WIN_Y1-WIN_Y0, WIN_Z1-WIN_Z0), (X0-0.04, (WIN_Y0+WIN_Y1)/2, (WIN_Z0+WIN_Z1)/2), material=M_GLASS)

# exterior: cielo y edificio de enfrente
plane("cielo", (9, 9), (X0-3.2, 0.0, 1.5), rot=(0, math.radians(90), 0), material=M_CITY)
for i in range(7):
    for j in range(5):
        box(f"vent_{i}_{j}", (0.05, 0.34, 0.30),
            (X0-2.55, -1.9+i*0.62, 0.55+j*0.55), material=M_BLDG)

# cortina pesada (corrida a medias, del lado del set)
box("cortina", (0.075, 1.15, ZH-0.12), (X0+0.14, 0.72, (ZH-0.12)/2+0.05), material=M_CURTAIN)
box("riel", (0.05, WIN_Y1-WIN_Y0+0.35, 0.05), (X0+0.14, (WIN_Y0+WIN_Y1)/2, ZH-0.10), material=M_ALU)

# ───────────────────────── backdrop: biblioteca + mapa ─────────────────────────
SX, SY = 1.30, Y1-0.23
BW, BD, BH = 1.10, 0.38, 2.10
box("bib_fondo",  (BW, 0.028, BH), (SX, SY+BD/2-0.014, BH/2), material=M_WHITE)
box("bib_lat_i",  (0.03, BD, BH),  (SX-BW/2+0.015, SY, BH/2), material=M_WHITE)
box("bib_lat_d",  (0.03, BD, BH),  (SX+BW/2-0.015, SY, BH/2), material=M_WHITE)
box("bib_techo",  (BW, BD, 0.032), (SX, SY, BH-0.016), material=M_WHITE)
box("bib_piso",   (BW, BD, 0.032), (SX, SY, 0.016), material=M_WHITE)
SHELVES = (0.46, 0.90, 1.34)
for i, z in enumerate(SHELVES):
    box(f"estante_{i}", (BW-0.06, BD-0.02, 0.028), (SX, SY, z), material=M_WHITE)
box("bib_puerta", (BW-0.05, 0.028, 0.58), (SX, SY-BD/2+0.02, 1.76), material=M_WHITE)
cyl("bib_tirador", 0.008, 0.16, (SX, SY-BD/2, 1.76), rot=(0,math.radians(90),0), material=M_ALU)

# libros sobre los estantes (al frente, visibles)
for i, z in enumerate(SHELVES):
    x = SX - BW/2 + 0.06
    while x < SX + BW/2 - 0.12:
        w = random.uniform(0.030, 0.058); h = random.uniform(0.20, 0.31)
        c = random.choice([(0.28,0.045,0.035),(0.035,0.075,0.185),(0.050,0.140,0.075),
                           (0.330,0.215,0.055),(0.085,0.085,0.098),(0.380,0.310,0.220)])
        box(f"libro_{i}_{x:.2f}", (w, 0.21, h), (x+w/2, SY-0.055, z+0.014+h/2),
            rot=(0,0,random.uniform(-0.025,0.025)), material=mat("lib", c, rough=0.78))
        x += w + random.uniform(0.002, 0.010)

# objetos decorativos y luz practica calida
cyl("obj_a", 0.058, 0.20, (SX+0.36, SY-0.02, 0.46+0.114), material=M_WOOD_L)
box("obj_b", (0.17,0.17,0.15), (SX-0.36, SY-0.03, 0.90+0.089), rot=(0,0,0.3), material=M_WOOD)
cyl("practical_pie",  0.070, 0.02, (SX+0.30, SY-0.04, 1.36), material=M_WOOD)
cyl("practical", 0.072, 0.21, (SX+0.30, SY-0.04, 1.49), material=M_PRACT)

# cuadro enmarcado sobre la pared de acento
box("mapa_marco", (1.46, 0.035, 0.98), (-0.74, Y1-0.05, 1.60), material=M_WOOD)
box("mapa_fondo", (1.37, 0.02, 0.89), (-0.74, Y1-0.074, 1.60), material=M_MAPBG)
PALETA = [(0.620,0.380,0.225), (0.450,0.250,0.150), (0.720,0.520,0.330),
          (0.180,0.260,0.380), (0.560,0.310,0.190), (0.300,0.380,0.420)]
BLOQUES = [(-0.44,  0.24, 0.42, 0.20), ( 0.10,  0.26, 0.52, 0.16),
           (-0.50, -0.05, 0.30, 0.22), (-0.06, -0.02, 0.34, 0.14),
           ( 0.38, -0.08, 0.38, 0.26), (-0.28, -0.30, 0.56, 0.15)]
for i, (dx, dz, w, h) in enumerate(BLOQUES):
    m = mat(f"arte_{i}", PALETA[i], rough=0.88)
    box(f"arte_{i}", (w, 0.008, h), (-0.74 + dx, Y1 - 0.086 - i * 0.004, 1.60 + dz), material=m)

# planta
cyl("maceta", 0.155, 0.32, (SX+0.78, SY-0.02, 0.16), material=M_WOOD_L)
random.seed(5)
for i in range(22):
    a = random.uniform(0, math.tau); r = random.uniform(0.04, 0.34)
    plane(f"hoja_{i}", (random.uniform(0.14,0.26), random.uniform(0.09,0.15)),
          (SX+0.78+math.cos(a)*r, SY-0.02+math.sin(a)*r*0.6, 0.42+random.uniform(0.0,0.72)),
          rot=(random.uniform(-1.1,1.1), random.uniform(-0.9,0.9), a), material=M_LEAF)

# ───────────────────────── alfombra ─────────────────────────
box("alfombra", (2.85, 2.25, 0.022), (-0.10, 0.62, 0.011), material=M_RUG)

# ───────────────────────── butacas ─────────────────────────
def butaca(name, loc, rot_z):
    parts = []
    g = []
    g.append(box(f"{name}_asiento", (0.60, 0.58, 0.15), (0, 0, 0.40), material=M_CHAIR))
    g.append(box(f"{name}_respaldo",(0.60, 0.14, 0.56), (0, -0.25, 0.70),
                 rot=(math.radians(-9), 0, 0), material=M_CHAIR))
    for sx in (-1, 1):
        g.append(box(f"{name}_brazo{sx}", (0.10, 0.52, 0.17), (sx*0.31, 0.02, 0.535), material=M_CHAIR))
    for sx in (-1, 1):
        for sy in (-1, 1):
            g.append(cyl(f"{name}_pata{sx}{sy}", 0.022, 0.34,
                         (sx*0.24, sy*0.22, 0.165),
                         rot=(math.radians(sy*7), math.radians(-sx*7), 0), material=M_WOOD))
    g.append(box(f"{name}_almohadon", (0.30, 0.10, 0.28), (0.13, -0.19, 0.60),
                 rot=(math.radians(-14), 0, math.radians(8)), material=M_CUSH))
    for o in g:
        bevel(o, 0.035, 5)
    bpy.ops.object.select_all(action='DESELECT')
    for o in g: o.select_set(True)
    bpy.context.view_layer.objects.active = g[0]
    bpy.ops.object.join()
    ch = bpy.context.object; ch.name = name
    ch.rotation_euler = (0, 0, rot_z)
    ch.location = loc
    return ch

butaca("butaca_invitado",  (-0.92, 0.72, 0), math.radians(-28))
butaca("butaca_conductor", ( 0.72, 0.72, 0), math.radians( 28))

# mesa ratona
cyl("mesa_tapa", 0.34, 0.045, (-0.10, 0.45, 0.435), material=M_WOOD)
for a in (0.5, 2.6, 4.7):
    cyl("mesa_pata", 0.018, 0.43, (-0.10+math.cos(a)*0.24, 0.45+math.sin(a)*0.24, 0.215),
        rot=(math.radians(math.sin(a)*8), math.radians(-math.cos(a)*8), 0), material=M_METAL)
for dx in (-0.13, 0.13):
    cyl("vaso", 0.035, 0.11, (-0.10+dx, 0.42, 0.513), material=M_GLASS)
box("libreta", (0.18, 0.24, 0.012), (-0.10, 0.60, 0.464), rot=(0,0,math.radians(9)), material=M_CUSH)

# ───────────────────────── microfonos con brazo articulado ─────────────────────────
def micro(name, base, tip, mic_rot):
    bx, by, bz = base
    cyl(f"{name}_mastil", 0.022, 1.30, (bx, by, 0.65), material=M_BLACK)
    mid = ((bx+tip[0])/2, (by+tip[1])/2, 1.34)
    d = Vector(tip) - Vector((bx, by, 1.30))
    L = d.length
    o = cyl(f"{name}_brazo", 0.016, L, mid, material=M_BLACK)
    o.rotation_euler = d.to_track_quat('Z','Y').to_euler()
    m = cyl(f"{name}_mic", 0.031, 0.17, tip, rot=mic_rot, material=M_BLACK)
    shade_smooth(m)
    cyl(f"{name}_base", 0.10, 0.03, (bx, by, 0.015), material=M_BLACK)

micro("mic_inv",  (-1.78, 0.30, 0), (-1.02, 0.52, 1.18), (math.radians(58), 0, math.radians(-30)))
micro("mic_cond", ( 1.58, 0.30, 0), ( 0.82, 0.52, 1.18), (math.radians(58), 0, math.radians( 30)))

# ───────────────────────── camaras en tripode ─────────────────────────
def camara(name, loc, target, altura=1.22):
    x, y = loc
    for a in (0.6, 2.7, 4.8):
        cyl(f"{name}_pata{a}", 0.016, altura*1.06,
            (x+math.cos(a)*0.24, y+math.sin(a)*0.24, altura*0.53),
            rot=(math.radians(math.sin(a)*13), math.radians(-math.cos(a)*13), 0), material=M_METAL)
    cyl(f"{name}_columna", 0.026, 0.22, (x, y, altura+0.06), material=M_METAL)
    body = box(f"{name}_cuerpo", (0.135, 0.105, 0.098), (x, y, altura+0.21), material=M_BLACK)
    lens = cyl(f"{name}_lente", 0.047, 0.135, (x, y-0.11, altura+0.21),
               rot=(math.radians(90),0,0), material=M_BLACK)
    shade_smooth(lens)
    d = Vector((target[0]-x, target[1]-y, 0))
    ang = math.atan2(d.y, d.x) + math.pi/2
    for o in (body, lens):
        o.rotation_euler = (o.rotation_euler[0], o.rotation_euler[1], ang)
        o.location = (x + math.sin(-ang)*0.0, y, o.location[2])
    bpy.ops.object.select_all(action='DESELECT')
    body.select_set(True); lens.select_set(True)
    bpy.context.view_layer.objects.active = body
    bpy.ops.object.join()
    cam = bpy.context.object
    cam.rotation_euler = (0, 0, ang)
    cam.location = (x, y, altura + 0.21)

camara("camA", (-0.14, -1.12), (-0.10, 0.72), 1.32)   # plano general
camara("camB", (-1.86, -0.34), (-0.92, 0.72), 1.18)   # primer plano invitado
camara("camC", ( 1.88,  0.22), ( 0.72, 0.72), 1.18)   # primer plano conductor

# ───────────────────────── iluminacion de set ─────────────────────────
def softbox(name, loc, target, w=0.78, h=0.78, power=150):
    x, y, z = loc
    for a in (0.7, 2.8, 4.9):
        cyl(f"{name}_pata{a}", 0.014, z*0.62,
            (x+math.cos(a)*0.26, y+math.sin(a)*0.26, z*0.31),
            rot=(math.radians(math.sin(a)*15), math.radians(-math.cos(a)*15), 0), material=M_METAL)
    cyl(f"{name}_mastil", 0.020, z*0.92, (x, y, z*0.46), material=M_METAL)
    d = Vector((target[0]-x, target[1]-y, target[2]-z)); d.normalize()
    rot = d.to_track_quat('-Z','Y').to_euler()
    sb = box(f"{name}_caja", (w, h, 0.14), (x, y, z), rot=rot, material=M_BLACK)
    face = plane(f"{name}_difusor", (w*0.94, h*0.94),
                 (x+d.x*0.085, y+d.y*0.085, z+d.z*0.085), rot=rot, material=M_SOFTBOX)
    lt = bpy.data.lights.new(f"{name}_luz", 'AREA')
    lt.energy = power; lt.size = w*0.92; lt.shape = 'SQUARE'
    lt.color = (1.0, 0.955, 0.895)
    ob = bpy.data.objects.new(f"{name}_luz", lt); scene.collection.objects.link(ob)
    ob.location = (x+d.x*0.10, y+d.y*0.10, z+d.z*0.10); ob.rotation_euler = rot

softbox("key_inv",  (-1.94, -0.46, 1.95), (-0.92, 0.72, 1.05), 0.82, 0.82, 118)
softbox("key_cond", ( 1.90, -0.60, 1.95), ( 0.72, 0.72, 1.05), 0.82, 0.82, 100)

# luz de recorte (desde atras, sobre el hombro)
lt = bpy.data.lights.new("recorte", 'SPOT'); lt.energy = 130; lt.spot_size = math.radians(58)
lt.spot_blend = 0.55; lt.color = (1.0, 0.90, 0.80); lt.shadow_soft_size = 0.12
ob = bpy.data.objects.new("recorte", lt); scene.collection.objects.link(ob)
ob.location = (1.75, 1.60, 2.45)
ob.rotation_euler = Vector((-0.80-1.75, 0.80-1.60, 1.10-2.45)).to_track_quat('-Z','Y').to_euler()
cyl("recorte_mastil", 0.018, 2.3, (1.95, 1.62, 1.15), material=M_METAL)

# luz RGB de fondo (lava la pared de acento)
box("rgb_barra", (0.09, 0.09, 1.05), (-1.72, Y1-0.16, 0.55), material=M_RGB)
lt = bpy.data.lights.new("rgb", 'AREA'); lt.energy = 28; lt.size = 0.9
lt.color = (0.24, 0.72, 0.82)
ob = bpy.data.objects.new("rgb", lt); scene.collection.objects.link(ob)
ob.location = (-1.62, Y1-0.30, 0.85); ob.rotation_euler = (math.radians(74), 0, math.radians(-96))

# luz de ventana (dia nublado de Buenos Aires)
lt = bpy.data.lights.new("ventana", 'AREA'); lt.energy = 165
lt.shape = 'RECTANGLE'; lt.size = 2.6; lt.size_y = 1.9
lt.color = (0.80, 0.86, 1.0)
ob = bpy.data.objects.new("ventana", lt); scene.collection.objects.link(ob)
ob.location = (X0+0.22, -0.20, 1.45); ob.rotation_euler = (0, math.radians(90), 0)

# ambiente general
world = bpy.data.worlds.new("W"); scene.world = world  # global
world.use_nodes = True
world.node_tree.nodes["Background"].inputs[0].default_value = (0.072, 0.080, 0.098, 1)
world.node_tree.nodes["Background"].inputs[1].default_value = 0.12

# ───────────────────────── paneles acusticos (pared derecha) ─────────────────────────
for i in range(3):
    for j in range(2):
        box(f"panel_{i}{j}", (0.035, 0.58, 0.58),
            (X1-0.03, -1.35+i*0.66, 1.02+j*0.66),
            material=M_FOAM)

# ───────────────────────── mesa tecnica (detras de camara) ─────────────────────────
box("mesa_tec_tapa", (1.35, 0.55, 0.035), (-1.05, -2.20, 0.735), material=M_WHITE)
for sx in (-1,1):
    for sy in (-1,1):
        cyl("mesa_tec_pata", 0.021, 0.72, (-1.05+sx*0.60, -2.20+sy*0.22, 0.36), material=M_ALU)
box("consola", (0.34, 0.24, 0.055), (-1.43, -2.18, 0.78), rot=(0,0,math.radians(-6)), material=M_BLACK)
box("notebook_base", (0.33, 0.23, 0.018), (-0.91, -2.14, 0.762), material=M_METAL)
box("notebook_tapa", (0.33, 0.015, 0.22), (-0.91, -2.25, 0.875), rot=(math.radians(-16),0,0), material=M_SCREEN)
box("monitor_ref", (0.42, 0.028, 0.26), (-0.39, -2.32, 0.98), rot=(0,0,math.radians(-22)), material=M_SCREEN)
cyl("monitor_pie", 0.055, 0.10, (-0.39, -2.30, 0.80), material=M_BLACK)

# sofa gris existente (reubicado como area de espera, contra la pared de atras)
box("sofa_base",  (1.85, 0.82, 0.34), (1.15, -2.14, 0.20), material=M_SOFA)
box("sofa_resp",  (1.85, 0.20, 0.44), (1.15, -2.45, 0.56), rot=(math.radians(-7),0,0), material=M_SOFA)
for sx in (-1,1):
    box("sofa_brazo", (0.16, 0.82, 0.22), (1.15+sx*0.845, -2.14, 0.48), material=M_SOFA)
for sx in (-1,1):
    for sy in (-1,1):
        cyl("sofa_pata", 0.025, 0.14, (1.15+sx*0.74, -2.14+sy*0.30, 0.07), material=M_WOOD)

# cartel "GRABANDO" junto a la puerta
box("cartel", (0.02, 0.30, 0.16), (X1-0.02, -2.05, 1.62), material=mat("cartel",(0.45,0.03,0.03),rough=0.6))

# ───────────────────────── camara de render ─────────────────────────
cam_data = bpy.data.cameras.new("render_cam")
cam_data.lens = 20
cam_data.dof.use_dof = True
cam_data.dof.focus_distance = 3.90
cam_data.dof.aperture_fstop = 5.0
cam = bpy.data.objects.new("render_cam", cam_data); scene.collection.objects.link(cam)
VIEW = sys.argv[5] if len(sys.argv) > 5 else "wide"

if VIEW == "planta":
    # ── vista en planta con etiquetas, para armar el set ──
    for _o in bpy.data.objects:
        if _o.name.startswith(("cielorraso", "cortina", "riel")):
            _o.hide_render = True
    M_TXT = mat("texto", (0.02, 0.05, 0.12), rough=0.9, emit=(0.02, 0.05, 0.12), emit_str=1.4)
    def etiqueta(txt, loc, size=0.135):
        bpy.ops.object.text_add(location=(loc[0], loc[1], 2.55))
        o = bpy.context.object
        o.data.body = txt; o.data.size = size
        o.data.align_x = 'CENTER'; o.data.align_y = 'CENTER'
        o.data.extrude = 0.004
        o.data.materials.append(M_TXT)
        return o
    ETIQUETAS = [
        ("BUTACA INVITADO", (-0.92, 0.16), 0.100), ("BUTACA CONDUCTOR", (0.74, 0.16), 0.100),
        ("MESA", (-0.10, 0.45), 0.080),
        ("ALFOMBRA", (-0.10, -0.26), 0.090),
        ("CAM A  general", (-0.14, -1.64), 0.100),
        ("CAM B  invitado", (-1.28, -0.64), 0.092),
        ("CAM C  conductor", (1.38, 0.64), 0.092),
        ("LUZ 1", (-1.95, -1.06), 0.088), ("LUZ 2", (1.92, -1.26), 0.088),
        ("RECORTE", (1.52, 1.60), 0.082), ("RGB", (-1.74, 1.56), 0.082),
        ("MIC", (-1.78, -0.14), 0.082), ("MIC", (1.58, -0.14), 0.082),
        ("BIBLIOTECA", (1.30, 1.00), 0.092), ("CUADRO", (-0.74, 1.62), 0.082),
        ("VENTANAL", (-1.96, 0.42), 0.088),
        ("PANELES ACUST.", (1.92, -0.52), 0.082),
        ("MESA TECNICA", (-1.05, -1.72), 0.090),
        ("SOFA / ESPERA", (1.15, -1.66), 0.090),
        ("PLANTA", (2.06, 0.72), 0.080),
    ]
    for e in ETIQUETAS:
        etiqueta(e[0], e[1], e[2] if len(e) > 2 else 0.135)
    # luz cenital plana
    lt = bpy.data.lights.new("cenital", 'SUN'); lt.energy = 4.2; lt.angle = 0.6
    ob = bpy.data.objects.new("cenital", lt); scene.collection.objects.link(ob)
    ob.location = (0, 0, 6); ob.rotation_euler = (0, 0, 0)
    world.node_tree.nodes["Background"].inputs[0].default_value = (0.55, 0.58, 0.62, 1)
    world.node_tree.nodes["Background"].inputs[1].default_value = 0.85
    cam_data.type = 'ORTHO'
    cam_data.ortho_scale = 5.32
    cam_data.dof.use_dof = False
    cam.location = (0.0, -0.40, 6.0)
    cam.rotation_euler = (0, 0, 0)
    scene.view_settings.view_transform = 'Standard'
    scene.view_settings.exposure = 0.0
elif VIEW == "camA":
    for _o in bpy.data.objects:
        if _o.name.startswith("camA"):
            _o.hide_render = True
    cam_data.lens = 24
    cam_data.dof.focus_distance = 1.95
    cam_data.dof.aperture_fstop = 4.0
    cam.location = (-0.14, -1.12, 1.51)
    look = Vector((-0.10, 0.72, 0.88)) - Vector(cam.location)
    cam.rotation_euler = look.to_track_quat('-Z','Y').to_euler()
else:
    cam.location = (1.26, -2.44, 1.86)
    look = Vector((-0.40, 0.88, 0.94)) - Vector(cam.location)
    cam.rotation_euler = look.to_track_quat('-Z','Y').to_euler()
scene.camera = cam

# ───────────────────────── render ─────────────────────────
scene.render.engine = 'CYCLES'
scene.cycles.device = 'CPU'
scene.cycles.samples = SAMPLES
scene.cycles.use_denoising = True
scene.cycles.max_bounces = 8
scene.cycles.transmission_bounces = 6
scene.cycles.caustics_reflective = False
scene.cycles.caustics_refractive = False
scene.render.resolution_x = RES_X
scene.render.resolution_y = RES_Y
scene.render.resolution_percentage = 100
scene.render.film_transparent = False
scene.render.image_settings.file_format = 'PNG'
scene.view_settings.view_transform = 'AgX'
scene.view_settings.look = 'AgX - Medium High Contrast'
scene.view_settings.exposure = -1.05
scene.render.filepath = OUT

bpy.ops.render.render(write_still=True)
print("RENDER OK ->", OUT)
