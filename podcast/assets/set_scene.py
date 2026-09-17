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
# Modelada sobre la SEGUNDA foto de la oficina (la sala chica).
# X: ancho  -1.85 .. 1.85  = 3.70 m
# Y: fondo  -2.10 .. 2.10  = 4.20 m   (Y+ = pared del fondo, la del mapa y la biblioteca)
# Z: altura 0 .. 2.85 m
X0, X1 = -1.85, 1.85
Y0, Y1 = -2.10, 2.10
ZH     = 2.85
T      = 0.10

M_FLOOR_R = mat("piso_oficina", (0.235, 0.250, 0.252), rough=0.28)   # cemento alisado gris verdoso
M_CARDB   = mat("carton",       (0.430, 0.310, 0.185), rough=0.92)
M_BLUEBOX = mat("caja_azul",    (0.055, 0.115, 0.330), rough=0.55)
M_MAPSEA  = mat("mapa_oceano",  (0.400, 0.585, 0.720), rough=0.90)
M_SIGN    = mat("cartel_rojo",  (0.480, 0.045, 0.045), rough=0.80, emit=(0.480,0.045,0.045), emit_str=1.6)

box("piso",        (X1-X0, Y1-Y0, T), ((X0+X1)/2, (Y0+Y1)/2, -T/2), material=M_FLOOR_R)
box("cielorraso",  (X1-X0, Y1-Y0, T), ((X0+X1)/2, (Y0+Y1)/2, ZH+T/2), material=M_CEIL)
box("pared_fondo", (X1-X0, T, ZH),    ((X0+X1)/2, Y1+T/2, ZH/2), material=M_WALL)
box("pared_der",   (T, Y1-Y0, ZH),    (X1+T/2, (Y0+Y1)/2, ZH/2), material=M_WALL)
box("pared_atras", (X1-X0, T, ZH),    ((X0+X1)/2, Y0-T/2, ZH/2), material=M_WALL)
# zocalo metalico del fondo, como el de la foto
box("zocalo", (X1-X0, 0.04, 0.09), ((X0+X1)/2, Y1-0.02, 0.045), material=M_ALU)

# ── pared izquierda: ventanal industrial de marco gris con grilla fina ──
WY0, WY1 = -1.35, 1.70
WZ0, WZ1 = 0.46, 2.46
box("pizq_inf", (T, Y1-Y0, WZ0),      (X0-T/2, (Y0+Y1)/2, WZ0/2), material=M_WALL)
box("pizq_sup", (T, Y1-Y0, ZH-WZ1),   (X0-T/2, (Y0+Y1)/2, (WZ1+ZH)/2), material=M_WALL)
box("pizq_a",   (T, WY0-Y0, WZ1-WZ0), (X0-T/2, (Y0+WY0)/2, (WZ0+WZ1)/2), material=M_WALL)
box("pizq_b",   (T, Y1-WY1, WZ1-WZ0), (X0-T/2, (WY1+Y1)/2, (WZ0+WZ1)/2), material=M_WALL)

box("vidrio", (0.02, WY1-WY0, WZ1-WZ0), (X0-0.045, (WY0+WY1)/2, (WZ0+WZ1)/2), material=M_GLASS)
NV, NH = 7, 6                                    # grilla de paños, como la carpinteria real
for i in range(NV + 1):
    y = WY0 + (WY1 - WY0) * i / NV
    box(f"mull_v{i}", (0.085, 0.042, WZ1-WZ0), (X0-0.042, y, (WZ0+WZ1)/2), material=M_ALU)
for j in range(NH + 1):
    z = WZ0 + (WZ1 - WZ0) * j / NH
    box(f"mull_h{j}", (0.085, WY1-WY0, 0.042), (X0-0.042, (WY0+WY1)/2, z), material=M_ALU)
box("marco_v0", (0.13, 0.09, WZ1-WZ0+0.09), (X0-0.04, WY0, (WZ0+WZ1)/2), material=M_ALU)
box("marco_v1", (0.13, 0.09, WZ1-WZ0+0.09), (X0-0.04, WY1, (WZ0+WZ1)/2), material=M_ALU)

# exterior: edificio de enfrente con su grilla de ventanas y equipos de aire
plane("cielo", (11, 11), (X0-4.0, 0.2, 1.6), rot=(0, math.radians(90), 0), material=M_CITY)
random.seed(11)
for i in range(9):
    for j in range(7):
        box(f"ext_v{i}_{j}", (0.05, 0.30, 0.34), (X0-2.9, -2.3+i*0.58, 0.40+j*0.46), material=M_BLDG)
        if random.random() < 0.28:
            box(f"ext_ac{i}_{j}", (0.14, 0.17, 0.15), (X0-2.78, -2.3+i*0.58, 0.28+j*0.46), material=M_ALU)
box("cartel_calle", (0.06, 1.15, 0.30), (X0-2.86, 0.55, 0.30), material=M_SIGN)

# cortina pesada, corrida a medias del lado del set
box("cortina", (0.075, 1.05, ZH-0.14), (X0+0.15, 1.35, (ZH-0.14)/2+0.06), material=M_CURTAIN)
box("riel", (0.05, WY1-WY0+0.30, 0.05), (X0+0.15, (WY0+WY1)/2, ZH-0.11), material=M_ALU)

# ───────────────── backdrop: panel navy portatil + mapamundi + biblioteca ─────────────────
# El panel NO es pintura sobre la pared: es un panel con pie, se arma y se guarda.
PX, PW, PH = -0.72, 1.58, 2.12
box("panel_navy", (PW, 0.055, PH), (PX, Y1-0.12, PH/2 + 0.05), material=M_WALL_AC)
for sx in (-1, 1):
    cyl(f"panel_pie{sx}", 0.030, 0.10, (PX + sx*0.62, Y1-0.24, 0.05), rot=(math.radians(90),0,0), material=M_BLACK)
    box(f"panel_pata{sx}", (0.05, 0.30, 0.04), (PX + sx*0.62, Y1-0.26, 0.02), material=M_BLACK)

# mapamundi (el que ya esta en la pared), montado sobre el panel
MW, MH = 1.34, 0.84
box("mapa_base", (MW, 0.016, MH), (PX, Y1-0.152, 1.58), material=M_MAPSEA)
random.seed(31)
ROJO, OCRE, VERDE, TIERRA, OLIVA = ((0.60,0.17,0.07),(0.70,0.45,0.10),(0.20,0.40,0.13),(0.46,0.24,0.08),(0.40,0.46,0.13))
# cada continente es un racimo de bloques superpuestos: forma irregular, no un rectangulo
CLUSTERS = [((-0.44,  0.18), 0.15, 0.11,  9, OCRE),    # Norteamerica
            ((-0.32, -0.17), 0.06, 0.14,  8, VERDE),   # Sudamerica
            ((-0.03,  0.24), 0.09, 0.06,  6, ROJO),    # Europa
            (( 0.03, -0.09), 0.08, 0.14,  9, TIERRA),  # Africa
            (( 0.30,  0.19), 0.18, 0.11, 12, OLIVA),   # Asia
            (( 0.50, -0.26), 0.07, 0.04,  5, ROJO)]    # Oceania
for ci, ((cx, cz), rx, rz, n, col) in enumerate(CLUSTERS):
    mc = mat(f"mapa_c{ci}", col, rough=0.90)
    for k in range(n):
        w = random.uniform(0.055, 0.125); h = random.uniform(0.045, 0.100)
        box(f"cont_{ci}_{k}",
            (w, 0.009, h),
            (PX + cx + random.uniform(-rx, rx),
             Y1 - 0.162 - ci * 0.0035 - k * 0.00025,
             1.58 + cz + random.uniform(-rz, rz)),
            material=mc)

# biblioteca blanca (la existente): estantes abiertos abajo, puerta arriba, cajas encima
BX, BW, BD, BH = 0.70, 0.82, 0.40, 1.96
box("bib_fondo", (BW, 0.028, BH), (BX, Y1-0.024-BD+BD, BH/2), material=M_WHITE)
box("bib_fondo2",(BW, 0.028, BH), (BX, Y1-0.04, BH/2), material=M_WHITE)
box("bib_lat_i", (0.028, BD, BH), (BX-BW/2, Y1-0.04-BD/2, BH/2), material=M_WHITE)
box("bib_lat_d", (0.028, BD, BH), (BX+BW/2, Y1-0.04-BD/2, BH/2), material=M_WHITE)
box("bib_techo", (BW, BD, 0.03),  (BX, Y1-0.04-BD/2, BH-0.015), material=M_WHITE)
box("bib_piso",  (BW, BD, 0.03),  (BX, Y1-0.04-BD/2, 0.015), material=M_WHITE)
for i, z in enumerate((0.44, 0.88)):
    box(f"bib_est{i}", (BW-0.06, BD-0.02, 0.026), (BX, Y1-0.04-BD/2, z), material=M_WHITE)
box("bib_puerta", (BW-0.04, 0.026, 0.62), (BX, Y1-0.04-BD+0.02, 1.58), material=M_WHITE)
cyl("bib_tirador", 0.007, 0.13, (BX, Y1-0.05-BD, 1.58), rot=(0, math.radians(90), 0), material=M_ALU)
random.seed(3)
for i, z in enumerate((0.44, 0.88)):
    x = BX - BW/2 + 0.05
    while x < BX + BW/2 - 0.10:
        w = random.uniform(0.028, 0.052); h = random.uniform(0.19, 0.30)
        c = random.choice([(0.30,0.05,0.04),(0.04,0.08,0.20),(0.05,0.15,0.08),
                           (0.34,0.22,0.06),(0.09,0.09,0.10),(0.40,0.33,0.24)])
        box(f"libro{i}_{x:.2f}", (w, 0.21, h), (x+w/2, Y1-0.14, z+0.013+h/2),
            rot=(0,0,random.uniform(-0.02,0.02)), material=mat("lib", c, rough=0.78))
        x += w + random.uniform(0.002, 0.009)
# cajas sobre la biblioteca, como en la foto
box("caja_carton1", (0.50, 0.34, 0.26), (BX-0.10, Y1-0.26, BH+0.13), rot=(0,0,math.radians(4)), material=M_CARDB)
box("caja_carton2", (0.40, 0.28, 0.20), (BX+0.18, Y1-0.24, BH+0.10), rot=(0,0,math.radians(-7)), material=M_CARDB)
box("caja_azul",    (0.46, 0.32, 0.14), (BX-0.06, Y1-0.26, BH+0.33), rot=(0,0,math.radians(2)), material=M_BLUEBOX)

# mueble bajo con la cafetera (el que ya esta)
CX = 1.46
box("mueble_bajo", (0.62, 0.42, 0.76), (CX, Y1-0.25, 0.38), material=M_WHITE)
box("cafetera_base", (0.17, 0.20, 0.10), (CX-0.06, Y1-0.26, 0.81), material=M_BLACK)
box("cafetera_cuerpo",(0.15, 0.17, 0.24), (CX-0.06, Y1-0.32, 0.98), material=M_BLACK)
cyl("cafetera_jarra", 0.062, 0.15, (CX-0.06, Y1-0.20, 0.885), material=M_GLASS)
cyl("botella", 0.035, 0.22, (CX+0.20, Y1-0.24, 0.87), material=mat("bot",(0.72,0.62,0.10),rough=0.35))

# planta entre el panel y la biblioteca
cyl("maceta", 0.145, 0.30, (0.14, Y1-0.32, 0.15), material=M_WOOD_L)
random.seed(5)
for i in range(20):
    a = random.uniform(0, math.tau); r = random.uniform(0.04, 0.30)
    plane(f"hoja_{i}", (random.uniform(0.13,0.24), random.uniform(0.08,0.14)),
          (0.14+math.cos(a)*r, Y1-0.32+math.sin(a)*r*0.55, 0.40+random.uniform(0.0,0.62)),
          rot=(random.uniform(-1.1,1.1), random.uniform(-0.9,0.9), a), material=M_LEAF)

# ───────────────────────── alfombra y butacas ─────────────────────────
box("alfombra", (2.55, 1.95, 0.020), (0.0, 0.82, 0.010), material=M_RUG)

def butaca(name, loc, rot_z):
    g = []
    g.append(box(f"{name}_asiento", (0.58, 0.56, 0.15), (0, 0, 0.40), material=M_CHAIR))
    g.append(box(f"{name}_respaldo",(0.58, 0.14, 0.54), (0, -0.24, 0.69),
                 rot=(math.radians(-9), 0, 0), material=M_CHAIR))
    for sx in (-1, 1):
        g.append(box(f"{name}_brazo{sx}", (0.10, 0.50, 0.17), (sx*0.30, 0.02, 0.525), material=M_CHAIR))
    for sx in (-1, 1):
        for sy in (-1, 1):
            g.append(cyl(f"{name}_pata{sx}{sy}", 0.021, 0.33, (sx*0.23, sy*0.21, 0.16),
                         rot=(math.radians(sy*7), math.radians(-sx*7), 0), material=M_WOOD))
    g.append(box(f"{name}_almohadon", (0.29, 0.10, 0.27), (0.12, -0.18, 0.59),
                 rot=(math.radians(-14), 0, math.radians(8)), material=M_CUSH))
    for o in g: bevel(o, 0.035, 5)
    bpy.ops.object.select_all(action='DESELECT')
    for o in g: o.select_set(True)
    bpy.context.view_layer.objects.active = g[0]
    bpy.ops.object.join()
    ch = bpy.context.object; ch.name = name
    ch.rotation_euler = (0, 0, rot_z); ch.location = loc
    return ch

butaca("butaca_invitado",  (-0.70, 0.92, 0), math.radians(-30))
butaca("butaca_conductor", ( 0.70, 0.92, 0), math.radians( 30))

cyl("mesa_tapa", 0.30, 0.042, (0.0, 0.66, 0.434), material=M_WOOD)
for a in (0.5, 2.6, 4.7):
    cyl("mesa_pata", 0.017, 0.43, (math.cos(a)*0.21, 0.66+math.sin(a)*0.21, 0.215),
        rot=(math.radians(math.sin(a)*8), math.radians(-math.cos(a)*8), 0), material=M_METAL)
for dx in (-0.12, 0.12):
    cyl("vaso", 0.033, 0.10, (dx, 0.63, 0.505), material=M_GLASS)
box("libreta", (0.17, 0.22, 0.011), (0.0, 0.80, 0.461), rot=(0,0,math.radians(9)), material=M_CUSH)

# ───────────────────────── microfonos ─────────────────────────
def micro(name, base, tip, mic_rot):
    bx, by, bz = base
    cyl(f"{name}_mastil", 0.021, 1.28, (bx, by, 0.64), material=M_BLACK)
    d = Vector(tip) - Vector((bx, by, 1.28))
    o = cyl(f"{name}_brazo", 0.015, d.length, ((bx+tip[0])/2, (by+tip[1])/2, (1.28+tip[2])/2), material=M_BLACK)
    o.rotation_euler = d.to_track_quat('Z','Y').to_euler()
    shade_smooth(cyl(f"{name}_mic", 0.030, 0.16, tip, rot=mic_rot, material=M_BLACK))
    cyl(f"{name}_base", 0.095, 0.03, (bx, by, 0.015), material=M_BLACK)

micro("mic_inv",  (-1.48, 0.55, 0), (-0.80, 0.72, 1.16), (math.radians(58), 0, math.radians(-28)))
micro("mic_cond", ( 1.48, 0.55, 0), ( 0.80, 0.72, 1.16), (math.radians(58), 0, math.radians( 28)))

# ───────────────────────── camaras ─────────────────────────
def camara(name, loc, target, altura=1.22):
    x, y = loc
    for a in (0.6, 2.7, 4.8):
        cyl(f"{name}_pata{a}", 0.015, altura*1.06,
            (x+math.cos(a)*0.22, y+math.sin(a)*0.22, altura*0.53),
            rot=(math.radians(math.sin(a)*13), math.radians(-math.cos(a)*13), 0), material=M_METAL)
    cyl(f"{name}_columna", 0.024, 0.20, (x, y, altura+0.06), material=M_METAL)
    body = box(f"{name}_cuerpo", (0.130, 0.100, 0.094), (x, y, altura+0.20), material=M_BLACK)
    lens = cyl(f"{name}_lente", 0.045, 0.13, (x, y-0.10, altura+0.20), rot=(math.radians(90),0,0), material=M_BLACK)
    shade_smooth(lens)
    ang = math.atan2(target[1]-y, target[0]-x) + math.pi/2
    bpy.ops.object.select_all(action='DESELECT')
    body.select_set(True); lens.select_set(True)
    bpy.context.view_layer.objects.active = body
    bpy.ops.object.join()
    cam = bpy.context.object
    cam.rotation_euler = (0, 0, ang); cam.location = (x, y, altura + 0.20)

camara("camA", ( 0.00, -0.72), ( 0.00, 0.92), 1.30)
camara("camB", (-1.02, -0.22), (-0.70, 0.92), 1.16)
camara("camC", ( 1.02, -0.22), ( 0.70, 0.92), 1.16)

# ───────────────────────── iluminacion ─────────────────────────
def softbox(name, loc, target, w=0.72, h=0.72, power=120):
    x, y, z = loc
    for a in (0.7, 2.8, 4.9):
        cyl(f"{name}_pata{a}", 0.013, z*0.60, (x+math.cos(a)*0.24, y+math.sin(a)*0.24, z*0.30),
            rot=(math.radians(math.sin(a)*15), math.radians(-math.cos(a)*15), 0), material=M_METAL)
    cyl(f"{name}_mastil", 0.019, z*0.92, (x, y, z*0.46), material=M_METAL)
    d = Vector((target[0]-x, target[1]-y, target[2]-z)); d.normalize()
    rot = d.to_track_quat('-Z','Y').to_euler()
    box(f"{name}_caja", (w, h, 0.13), (x, y, z), rot=rot, material=M_BLACK)
    plane(f"{name}_dif", (w*0.94, h*0.94), (x+d.x*0.08, y+d.y*0.08, z+d.z*0.08), rot=rot, material=M_SOFTBOX)
    lt = bpy.data.lights.new(f"{name}_luz", 'AREA')
    lt.energy = power; lt.size = w*0.92; lt.shape = 'SQUARE'; lt.color = (1.0, 0.955, 0.895)
    ob = bpy.data.objects.new(f"{name}_luz", lt); scene.collection.objects.link(ob)
    ob.location = (x+d.x*0.10, y+d.y*0.10, z+d.z*0.10); ob.rotation_euler = rot

softbox("key_inv",  (-1.52, -0.18, 1.98), (-0.70, 0.92, 1.05), 0.62, 0.62, 105)
softbox("key_cond", ( 1.54, -0.22, 1.98), ( 0.70, 0.92, 1.05), 0.62, 0.62,  92)

lt = bpy.data.lights.new("recorte", 'SPOT'); lt.energy = 110; lt.spot_size = math.radians(58)
lt.spot_blend = 0.55; lt.color = (1.0, 0.90, 0.80); lt.shadow_soft_size = 0.12
ob = bpy.data.objects.new("recorte", lt); scene.collection.objects.link(ob)
ob.location = (1.52, 1.78, 2.52)
ob.rotation_euler = Vector((-0.65-1.52, 0.95-1.78, 1.10-2.52)).to_track_quat('-Z','Y').to_euler()
cyl("recorte_mastil", 0.017, 2.4, (1.66, 1.82, 1.20), material=M_METAL)

box("rgb_barra", (0.08, 0.08, 0.95), (-1.62, Y1-0.30, 0.50), material=M_RGB)
lt = bpy.data.lights.new("rgb", 'AREA'); lt.energy = 24; lt.size = 0.85; lt.color = (0.24, 0.72, 0.82)
ob = bpy.data.objects.new("rgb", lt); scene.collection.objects.link(ob)
ob.location = (-1.52, Y1-0.42, 0.80); ob.rotation_euler = (math.radians(74), 0, math.radians(-96))

lt = bpy.data.lights.new("ventana", 'AREA'); lt.energy = 150
lt.shape = 'RECTANGLE'; lt.size = 2.7; lt.size_y = 1.9; lt.color = (0.80, 0.86, 1.0)
ob = bpy.data.objects.new("ventana", lt); scene.collection.objects.link(ob)
ob.location = (X0+0.22, 0.15, 1.46); ob.rotation_euler = (0, math.radians(90), 0)

world = bpy.data.worlds.new("W"); scene.world = world
world.use_nodes = True
world.node_tree.nodes["Background"].inputs[0].default_value = (0.072, 0.080, 0.098, 1)
world.node_tree.nodes["Background"].inputs[1].default_value = 0.12

# ───────────────── paneles acusticos (pared derecha) ─────────────────
for i in range(3):
    for j in range(2):
        box(f"panel_ac{i}{j}", (0.032, 0.54, 0.54), (X1-0.03, 0.52-i*0.60, 1.10+j*0.60), material=M_FOAM)

# ───────────────── muebles existentes reubicados ─────────────────
# sofa gris -> area de espera contra la pared derecha
SFX, SFY = X1-0.46, -1.10
box("sofa_base", (0.82, 1.85, 0.34), (SFX, SFY, 0.20), material=M_SOFA)
box("sofa_resp", (0.20, 1.85, 0.44), (X1-0.13, SFY, 0.56), rot=(0, math.radians(7), 0), material=M_SOFA)
for sy in (-1, 1):
    box("sofa_brazo", (0.82, 0.16, 0.22), (SFX, SFY+sy*0.845, 0.48), material=M_SOFA)
for sx in (-1, 1):
    for sy in (-1, 1):
        cyl("sofa_pata", 0.024, 0.14, (SFX+sx*0.30, SFY+sy*0.74, 0.07), material=M_WOOD)

# escritorio existente (tapa clara, patas cromadas) -> mesa tecnica, detras de camara
DX, DY = -0.75, Y0+0.42
box("esc_tapa", (1.25, 0.62, 0.032), (DX, DY, 0.735), material=M_WHITE)
for sx in (-1, 1):
    for sy in (-1, 1):
        cyl("esc_pata", 0.022, 0.72, (DX+sx*0.56, DY+sy*0.24, 0.36), material=M_ALU)
box("consola", (0.32, 0.22, 0.05), (DX-0.36, DY, 0.776), rot=(0,0,math.radians(-6)), material=M_BLACK)
box("note_base", (0.31, 0.22, 0.017), (DX+0.12, DY+0.03, 0.760), material=M_METAL)
box("note_tapa", (0.31, 0.014, 0.21), (DX+0.12, DY-0.08, 0.870), rot=(math.radians(-16),0,0), material=M_SCREEN)
box("monitor_ref", (0.40, 0.026, 0.25), (DX+0.52, DY-0.14, 0.97), rot=(0,0,math.radians(-24)), material=M_SCREEN)
cyl("monitor_pie", 0.05, 0.10, (DX+0.52, DY-0.12, 0.79), material=M_BLACK)

box("cartel_grabando", (0.02, 0.28, 0.15), (X1-0.02, -1.95, 1.58),
    material=mat("cartel",(0.45,0.03,0.03), rough=0.6))

# ───────────────────────── camara de render ─────────────────────────
cam_data = bpy.data.cameras.new("render_cam")
cam_data.lens = 20
cam_data.dof.use_dof = True
cam_data.dof.focus_distance = 3.75
cam_data.dof.aperture_fstop = 5.6
cam = bpy.data.objects.new("render_cam", cam_data); scene.collection.objects.link(cam)

VIEW = sys.argv[5] if len(sys.argv) > 5 else "wide"

if VIEW == "planta":
    for _o in bpy.data.objects:
        if _o.name.startswith(("cielorraso", "cortina", "riel")):
            _o.hide_render = True
    M_TXT = mat("texto", (0.02, 0.05, 0.12), rough=0.9, emit=(0.02, 0.05, 0.12), emit_str=1.4)
    def etiqueta(txt, loc, size=0.10):
        bpy.ops.object.text_add(location=(loc[0], loc[1], 2.60))
        o = bpy.context.object
        o.data.body = txt; o.data.size = size
        o.data.align_x = 'CENTER'; o.data.align_y = 'CENTER'; o.data.extrude = 0.004
        o.data.materials.append(M_TXT)
    for e in [
        ("BUTACA INVITADO", (-0.70, 0.30), 0.093), ("BUTACA CONDUCTOR", (0.70, 0.30), 0.093),
        ("MESA", (0.0, 0.66), 0.072),
        ("ALFOMBRA", (0.0, 0.02), 0.082),
        ("PANEL + MAPA", (-0.72, 1.74), 0.082),
        ("BIBLIOTECA", (0.70, 1.56), 0.078),
        ("CAFETERA", (1.58, 1.34), 0.068),
        ("CAM A", (0.0, -0.80), 0.090),
        ("CAM B", (-0.86, -0.46), 0.080), ("CAM C", (0.86, -0.46), 0.080),
        ("LUZ 1", (-1.48, -0.66), 0.078), ("LUZ 2", (1.46, -0.78), 0.078),
        ("MIC", (-1.48, 0.34), 0.072), ("MIC", (1.48, 0.34), 0.072),
        ("RECORTE", (1.26, 1.92), 0.066), ("RGB", (-1.62, 1.64), 0.070),
        ("VENTANAL", (-1.42, -0.98), 0.076),
        ("PANELES ACUST.", (1.38, 0.60), 0.064),
        ("ESCRITORIO / MESA TECNICA", (-0.75, -1.28), 0.078),
        ("SOFA - ESPERA", (1.16, -1.32), 0.074),
    ]:
        etiqueta(e[0], e[1], e[2])
    lt = bpy.data.lights.new("cenital", 'SUN'); lt.energy = 4.2; lt.angle = 0.6
    ob = bpy.data.objects.new("cenital", lt); scene.collection.objects.link(ob)
    ob.location = (0, 0, 6); ob.rotation_euler = (0, 0, 0)
    world.node_tree.nodes["Background"].inputs[0].default_value = (0.55, 0.58, 0.62, 1)
    world.node_tree.nodes["Background"].inputs[1].default_value = 0.85
    cam_data.type = 'ORTHO'; cam_data.ortho_scale = 4.62; cam_data.dof.use_dof = False
    cam.location = (0.0, 0.0, 6.0); cam.rotation_euler = (0, 0, 0)
    scene.view_settings.view_transform = 'Standard'
    scene.view_settings.exposure = 0.0
else:
    # mismo punto de vista que la foto: desde la puerta, ventanal a la izquierda
    cam.location = (-0.56, -2.02, 2.12)
    look = Vector((0.16, 1.24, 1.08)) - Vector(cam.location)
    cam.rotation_euler = look.to_track_quat('-Z','Y').to_euler()
    scene.view_settings.view_transform = 'AgX'
    scene.view_settings.look = 'AgX - Medium High Contrast'
    scene.view_settings.exposure = -1.05
scene.camera = cam

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
scene.render.image_settings.file_format = 'PNG'
scene.render.filepath = OUT
bpy.ops.render.render(write_still=True)
print("RENDER OK ->", OUT)
