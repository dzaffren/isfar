# Builds the simple stylised ihram place, Bir Ali, and exports public/models/birali.glb.
# Run: pnpm model  (it runs tools/mataf.py and tools/masa.py, then this script)
# Sizes are in metres, from the birali part of src/scene/plan.json, which the site also reads (D43).
# x runs east, y runs north, and z is up. Makkah lies to the south.
# place.ts colours each mesh by its name, so each kind of part is one mesh, and the file carries no materials.
# The mosque has no roof, so the camera sees into the prayer hall (D100).
import json
import os

import bmesh
import bpy
from mathutils import Matrix, Vector

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, "..", "public", "models", "birali.glb")
with open(os.path.join(HERE, "..", "src", "scene", "plan.json")) as file:
    BIRALI = json.load(file)["birali"]

MOSQUE, COURT = BIRALI["mosque"], BIRALI["court"]
UP = Vector((0, 0, 1))
WALL = 1


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


def square(bm, at, size, z):
    """A flat square on the ground, a little above the floor so it draws on top."""
    x, y = at
    half = size / 2
    face(bm, [(x - half, y - half, z), (x + half, y - half, z), (x + half, y + half, z), (x - half, y + half, z)], UP)


def frame(bm, at, size, height):
    """Four walls round a square, WALL thick, with their outer faces on its edge."""
    x, y = at
    half = size / 2
    for side in (-1, 1):
        box(bm, (size, WALL, height), (x, y + side * (half - WALL / 2), height / 2))
        box(bm, (WALL, size - 2 * WALL, height), (x + side * (half - WALL / 2), y, height / 2))


bpy.ops.wm.read_factory_settings(use_empty=True)

mesh("floor", lambda bm: face(bm, [(-75, -55, 0), (65, -55, 0), (65, 70, 0), (-75, 70, 0)], UP))


def park(bm):
    part = BIRALI["busPark"]
    x, y = part["at"]
    width, depth = part["width"] / 2, part["depth"] / 2
    face(bm, [(x - width, y - depth, 0.02), (x + width, y - depth, 0.02), (x + width, y + depth, 0.02), (x - width, y + depth, 0.02)], UP)


mesh("park", park)


# The lines of the bus bays, along the north half of the park, as the map draws them.
def bays(bm):
    part = BIRALI["busPark"]
    top = part["at"][1] + part["depth"] / 2
    for x in range(-36, 37, 12):
        face(bm, [(x - 0.25, top - part["depth"] / 2, 0.04), (x + 0.25, top - part["depth"] / 2, 0.04), (x + 0.25, top, 0.04), (x - 0.25, top, 0.04)], UP)


mesh("bay", bays)

mesh("hallFloor", lambda bm: square(bm, MOSQUE["at"], MOSQUE["size"], 0.02))
mesh("court", lambda bm: square(bm, COURT["at"], COURT["size"], 0.04))


# The outer walls of the mosque, and the walls round the courtyard. The four halls between them are open to the sky.
def hall(bm):
    frame(bm, MOSQUE["at"], MOSQUE["size"], MOSQUE["height"])
    frame(bm, COURT["at"], COURT["size"], MOSQUE["height"])


mesh("hall", hall)


def minaret(bm):
    part = BIRALI["minaret"]
    box(bm, (part["size"], part["size"], part["height"]), (*part["at"], part["height"] / 2))


mesh("minaret", minaret)


def washrooms(bm):
    part = BIRALI["washrooms"]
    box(bm, (part["width"], part["depth"], part["height"]), (*part["at"], part["height"] / 2))


mesh("washrooms", washrooms)

bpy.ops.export_scene.gltf(filepath=os.path.normpath(OUT), export_format="GLB", export_materials="NONE", export_apply=True)
