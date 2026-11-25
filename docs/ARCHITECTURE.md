# Virtual Hajj · architecture

**Status:** Active · **Updated:** 2026-11-25 by /ship sai-check

## Context

```mermaid
flowchart LR
    PERSON[A pilgrim or an ustaz] -- "opens isfar.pages.dev" --> CF[Cloudflare Pages]
    CF -- "static files, mataf.glb and masa.glb" --> SITE[Isfar in the browser]
    GH[GitHub Actions] -- "uploads a green build" --> CF
```

## Components

```mermaid
flowchart TB
    HASH[("Address: #tawaf-6, #sai-5 or #semak")]
    APP["App.tsx: rite, step, check, language, keys, layout"]
    LIB["lib/step.ts, lib/check.ts, lib/language.ts"]
    TEXT["content/tawaf.ts, content/sai.ts, content/check.ts, content/text.ts"]
    SCENE["scene/Scene.tsx, keyed by rite: four states, names, map"]
    PLACE["scene/place.ts, a lazy file: one Site for each rite"]
    VIEWS["scene/views.ts, scene/mataf.ts, scene/masa.ts"]
    PLAN[("scene/plan.json")]
    GLB[("public/models/mataf.glb, masa.glb")]
    HASH -- "hashchange" --> APP
    APP -- "hash text, picks, stored code" --> LIB
    APP -- "rite, step number, language code" --> TEXT
    APP -- "rite, step number, names on or off, scene state" --> SCENE
    SCENE -- "import(), then goTo(step)" --> PLACE
    PLACE -- "camera of the step, arc or straight line between two" --> VIEWS
    VIEWS -- "sizes and spots" --> PLAN
    PLACE -- "fetches and draws" --> GLB
    PLAN -- "tools/mataf.py and tools/masa.py, in Blender" --> GLB
```

| Component | Folder | What it does |
| --------- | ------ | ------------ |
| App | `src/App.tsx` | Holds the rite and the step, or the check, from the address, and the question and the picks of the check. Picks the language, listens to the keys and lays out the screen. |
| Rules | `src/lib/` | Reads the rite and the step from `#tawaf-N` or `#sai-N` and the check of each rite from `#semak` or `#semak-sai`, counts the right picks and the missed steps, and picks the stored language, else the device language, else Malay. |
| Step text | `src/content/` | Holds every word on the screen, the 15 steps of tawaf, the 13 steps of sa'i and the seven questions of each rite's check, in Malay and English. |
| Components | `src/components/` | The top bar with the rite switch, step panel, beads, Arabic block, note, Back and Next, notices, cards and the top-view maps of the mataf and the mas'a. The check adds its side column, the question, the answer option and the result. |
| Scene | `src/scene/` | Checks for WebGL 2, loads the 3D place of the rite on screen, moves the camera and the names, hides the names until a check answer, and shows the map when 3D cannot show. |
| Plan | `src/scene/plan.json` | The sizes of the tawaf place and the mas'a, read by the map, the camera and the Blender script. |
| Model | `tools/mataf.py`, `tools/masa.py`, `public/models/` | Two Blender scripts. One builds the Kaabah, the mataf and the arcades as `mataf.glb`, and one builds the mas'a, its hills, its green lights and the barrier between its two lanes as `masa.glb`. |
| CI | `.github/workflows/ci.yml` | Tests each push, and deploys only a green build to Cloudflare Pages. |
