# Builds the simple stylised Kaabah and the mataf floor, and exports public/models/kaabah.glb.
# Run: pnpm model  (blender -b -P tools/kaabah.py)
# Sizes are in metres. Blender is Z up; the glTF export turns it to Y up.
# place.ts colours each mesh by its name, so the file carries no materials.
import os

import bpy

OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "public", "models", "kaabah.glb")

WIDTH = 11.0   # x
DEPTH = 12.5   # y
HEIGHT = 13.0  # z
FOOT = 0.4     # the marble foot (shadharwan) under the walls
BAND_LOW = 9.2
BAND_HIGH = 10.4


def box(name, size, centre):
    bpy.ops.mesh.primitive_cube_add(size=1, location=centre)
    obj = bpy.context.active_object
    obj.scale = size
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    obj.name = name
    obj.data.name = name
    return obj


bpy.ops.wm.read_factory_settings(use_empty=True)

box("foot", (WIDTH + 0.8, DEPTH + 0.8, FOOT), (0, 0, FOOT / 2))
box("kiswah", (WIDTH, DEPTH, HEIGHT), (0, 0, FOOT + HEIGHT / 2))
box("band", (WIDTH + 0.08, DEPTH + 0.08, BAND_HIGH - BAND_LOW), (0, 0, FOOT + (BAND_LOW + BAND_HIGH) / 2))
# The door sits 2.2 m up the wall that faces the camera's left, near its far corner.
box("door", (0.1, 1.9, 3.2), (-WIDTH / 2 - 0.05, DEPTH / 2 - 3.2, FOOT + 2.2 + 1.6))
bpy.ops.mesh.primitive_plane_add(size=800, location=(0, 0, 0))
floor = bpy.context.active_object
floor.name = "floor"
floor.data.name = "floor"

bpy.ops.export_scene.gltf(filepath=os.path.normpath(OUT), export_format="GLB", export_materials="NONE", export_apply=True)
