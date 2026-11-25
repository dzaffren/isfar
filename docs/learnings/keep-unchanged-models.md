# Put back a model that pnpm model rebuilt with no change to its script

**Rule:** After `pnpm model`, run `git checkout` on each `.glb` whose script and plan part did not change.

`pnpm model` runs both Blender scripts. In `/build sai-walk` v2, only `tools/masa.py` changed, but `mataf.glb` came out with 1,098 bytes different and the same size. Blender writes small float differences on each run. A commit of that file puts an unrelated binary change in the diff, outside the files the plan named.
