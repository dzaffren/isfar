# Builds the simple stylised sa'i place and exports public/models/masa.glb.
# Run: pnpm model  (it runs tools/mataf.py, then this script)
# Sizes are in metres, from the masa part of src/scene/plan.json, which the site also reads (D43).
# x runs along the mas'a from Safa (x < 0) to Marwah (x > 0), y runs across it, and z is up.
# place.ts colours each mesh by its name, so each kind of part is one mesh, and the file carries no materials.
# The hall has no roof, and each green light is a beam across the top of the walls, with a band down each wall (D79).
import json
import math
import os

import bmesh
import bpy
from mathutils import Matrix, Vector

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, "..", "public", "models", "masa.glb")
with open(os.path.join(HERE, "..", "src", "scene", "plan.json")) as file:
    MASA = json.load(file)["masa"]

LENGTH, WIDTH, HEIGHT = MASA["length"], MASA["width"], MASA["height"]
# The floor and the walls run on past each hill.
END = LENGTH / 2 + 10
UP = Vector((0, 0, 1))


def face(bm, corners, facing):
    """One face, turned to look the way of its facing vector."""
    new = bm.faces.new([bm.verts.new(corner) for corner in corners])
    new.normal_update()
    if new.normal.dot(facing) < 0:
        new.normal_flip()


def box(bm, size, centre):
    bmesh.ops.create_cube(bm, size=1, matrix=Matrix.Translation(centre) @ Matrix.Diagonal((*size, 1)))


def mesh(name, build):
    """One mesh object, made by build(bm)."""
    bm = bmesh.new()
    build(bm)
    data = bpy.data.meshes.new(name)
    bm.to_mesh(data)
    bm.free()
    obj = bpy.data.objects.new(name, data)
    bpy.context.collection.objects.link(obj)


bpy.ops.wm.read_factory_settings(use_empty=True)

mesh("floor", lambda bm: face(bm, [(-END, -WIDTH / 2, 0), (END, -WIDTH / 2, 0), (END, WIDTH / 2, 0), (-END, WIDTH / 2, 0)], UP))


def walls(bm):
    for side in (-1, 1):
        y = side * WIDTH / 2
        face(bm, [(-END, y, 0), (END, y, 0), (END, y, HEIGHT), (-END, y, HEIGHT)], Vector((0, -side, 0)))
        face(bm, [(-END, y, HEIGHT), (END, y, HEIGHT), (END, y + side * 2, HEIGHT), (-END, y + side * 2, HEIGHT)], UP)


mesh("wall", walls)


# A plain arch on the inner face of each wall, every 6 m.
def arches(bm):
    for side in (-1, 1):
        y = side * (WIDTH / 2 - 0.05)
        for index in range(22):
            left = -END + 4 + index * 6
            shape = [(left + 1, y, 0), (left + 1, y, 4)]
            for degrees in range(150, 29, -30):
                angle = math.radians(degrees)
                shape.append((left + 3 + 2 * math.cos(angle), y, 4 + 2 * math.sin(angle)))
            shape += [(left + 5, y, 4), (left + 5, y, 0)]
            face(bm, shape, Vector((0, -side, 0)))


mesh("arch", arches)


# A low mound of rock at each end: half an ellipsoid as wide as the hall. masa.ts groundAt() gives its height.
def rocks(bm):
    for key in ("safa", "marwah"):
        hill = MASA[key]
        size = Matrix.Diagonal((hill["radius"], WIDTH / 2, hill["height"], 1))
        bmesh.ops.create_uvsphere(bm, u_segments=16, v_segments=8, radius=1, matrix=Matrix.Translation((*hill["at"], 0)) @ size)


mesh("rock", rocks)


def lamps(bm):
    depth = MASA["green"]["depth"]
    for x in MASA["green"]["at"]:
        box(bm, (depth, WIDTH + 4, 0.6), (x, 0, HEIGHT + 0.3))
        for side in (-1, 1):
            box(bm, (depth, 0.1, HEIGHT), (x, side * (WIDTH / 2 - 0.1), HEIGHT / 2))


mesh("lamp", lamps)

bpy.ops.export_scene.gltf(filepath=os.path.normpath(OUT), export_format="GLB", export_materials="NONE", export_apply=True)
