# Builds the simple stylised tawaf place and exports public/models/mataf.glb.
# Run: pnpm model  (blender -b -P tools/mataf.py)
# Sizes are in metres, from src/scene/plan.json, which the site also reads (D43).
# Blender is Z up, the same axes as the plan; the glTF export turns it to Y up.
# place.ts colours each mesh by its name, so the file carries no materials.
import json
import math
import os

import bmesh
import bpy
from mathutils import Vector

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, "..", "public", "models", "mataf.glb")
with open(os.path.join(HERE, "..", "src", "scene", "plan.json")) as file:
    PLAN = json.load(file)

KAABAH = PLAN["kaabah"]
WIDTH, DEPTH, HEIGHT, FOOT = KAABAH["width"], KAABAH["depth"], KAABAH["height"], KAABAH["foot"]
RING = PLAN["ring"]
HAJAR_ASWAD = PLAN["hajarAswad"]


def box(name, size, centre):
    bpy.ops.mesh.primitive_cube_add(size=1, location=centre)
    obj = bpy.context.active_object
    obj.scale = size
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    obj.name = name
    obj.data.name = name
    return obj


def ball(name, radius, centre):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=12, ring_count=8, radius=radius, location=centre)
    obj = bpy.context.active_object
    obj.name = name
    obj.data.name = name
    return obj


def mesh(name, faces):
    """One mesh from a list of (corners, facing). Each face turns to look the way of its facing vector."""
    bm = bmesh.new()
    for corners, facing in faces:
        face = bm.faces.new([bm.verts.new(corner) for corner in corners])
        face.normal_update()
        if face.normal.dot(facing) < 0:
            face.normal_flip()
    data = bpy.data.meshes.new(name)
    bm.to_mesh(data)
    bm.free()
    obj = bpy.data.objects.new(name, data)
    bpy.context.collection.objects.link(obj)
    return obj


UP = Vector((0, 0, 1))


def inward(corners):
    """The way from a wall towards the centre of the mataf."""
    centre = sum((Vector(corner) for corner in corners), Vector()) / len(corners)
    return Vector((-centre.x, -centre.y, 0))


def on_line(corner, distance):
    """The point at a distance from the centre of the Kaabah, on the line through a corner."""
    length = math.hypot(corner[0], corner[1])
    return (corner[0] / length * distance, corner[1] / length * distance)


bpy.ops.wm.read_factory_settings(use_empty=True)

# The Kaabah, as in the skeleton, with the Hajar Aswad stone at its corner.
box("foot", (WIDTH + 0.8, DEPTH + 0.8, FOOT), (0, 0, FOOT / 2))
box("kiswah", (WIDTH, DEPTH, HEIGHT), (0, 0, FOOT + HEIGHT / 2))
box("band", (WIDTH + 0.08, DEPTH + 0.08, KAABAH["bandHigh"] - KAABAH["bandLow"]), (0, 0, FOOT + (KAABAH["bandLow"] + KAABAH["bandHigh"]) / 2))
door = PLAN["door"]
box("door", (0.1, door["width"], door["height"]), (door["at"][0] - 0.05, door["at"][1], FOOT + door["up"] + door["height"] / 2))
corner = HAJAR_ASWAD["at"]
ball("stone", HAJAR_ASWAD["size"], (corner[0] - 0.1, corner[1] + 0.1, HAJAR_ASWAD["up"]))

# The low wall of Hijr Ismail: half an ellipse on the wall at y = -6.25, with its top.
# Its ends meet the wall of the Kaabah, so they need no face.
hijr = PLAN["hijr"]
inner, outer = [], []
for index in range(25):
    angle = math.pi + index / 24 * math.pi
    for line, grow in ((inner, 0), (outer, hijr["thick"])):
        line.append((math.cos(angle) * (hijr["across"] + grow), hijr["centre"][1] + math.sin(angle) * (hijr["out"] + grow)))
low, high = 0, hijr["height"]
faces = []
for a in range(24):
    b = a + 1
    out = Vector((outer[a][0] - inner[a][0], outer[a][1] - inner[a][1], 0))
    faces.append(([(*inner[a], low), (*inner[b], low), (*inner[b], high), (*inner[a], high)], -out))
    faces.append(([(*outer[a], low), (*outer[b], low), (*outer[b], high), (*outer[a], high)], out))
    faces.append(([(*inner[a], high), (*inner[b], high), (*outer[b], high), (*outer[a], high)], UP))
mesh("hijr", faces)

maqam = PLAN["maqam"]
box("maqam", (maqam["size"], maqam["size"], maqam["height"]), (maqam["at"][0], maqam["at"][1], maqam["height"] / 2))

# The floor of the mataf, out to the back of the arcades.
bpy.ops.mesh.primitive_circle_add(vertices=64, radius=RING["radius"] + RING["roof"], fill_type="NGON", location=(0, 0, 0))
floor = bpy.context.active_object
floor.name = "floor"
floor.data.name = "floor"

# The ring of arcades: a wall on each side of a polygon that faces the mataf, with a roof over it, and an arch on each wall.
sides, radius, tall, roof = RING["walls"], RING["radius"], RING["height"], RING["roof"]
post = lambda index, distance: (math.cos(index / sides * 2 * math.pi) * distance, math.sin(index / sides * 2 * math.pi) * distance)
walls = []
for index in range(sides):
    a, b = post(index, radius), post(index + 1, radius)
    walls.append([(*a, 0), (*b, 0), (*b, tall), (*a, tall)])
roofs = [[(*post(index, radius), tall), (*post(index + 1, radius), tall), (*post(index + 1, radius + roof), tall), (*post(index, radius + roof), tall)] for index in range(sides)]
mesh("arcade", [(wall, inward(wall)) for wall in walls] + [(top, UP) for top in roofs])

arch = PLAN["arch"]
arches = []
for index in range(sides):
    a, b = Vector((*post(index, radius - 0.05), 0)), Vector((*post(index + 1, radius - 0.05), 0))
    on = lambda u, z: (a.x + (b.x - a.x) * u, a.y + (b.y - a.y) * u, z)
    middle, half = (arch["from"] + arch["to"]) / 2, (arch["to"] - arch["from"]) / 2
    shape = [on(arch["from"], 0), on(arch["from"], arch["spring"])]
    for degrees in range(150, 29, -30):
        angle = math.radians(degrees)
        shape.append(on(middle + half * math.cos(angle), arch["spring"] + arch["rise"] * math.sin(angle)))
    shape += [on(arch["to"], arch["spring"]), on(arch["to"], 0)]
    arches.append(shape)
mesh("arch", [(shape, inward(shape)) for shape in arches])

# The guide line on the floor, from the Hajar Aswad corner to the green light on the arcade wall (D26).
lamp = on_line(corner, radius * 0.99)
end = on_line(corner, radius)
across = Vector((-end[1], end[0], 0)).normalized() * PLAN["guide"]["width"] / 2
start, finish = Vector((*corner, 0.02)), Vector((*end, 0.02))
mesh("guide", [([start + across, finish + across, finish - across, start - across], UP)])
ball("lamp", PLAN["lamp"]["size"], (*lamp, PLAN["lamp"]["up"]))

bpy.ops.export_scene.gltf(filepath=os.path.normpath(OUT), export_format="GLB", export_materials="NONE", export_apply=True)
