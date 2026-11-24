# Virtual Hajj · architecture

**Status:** Active · **Updated:** 2026-11-24 by /ship tawaf-check

## Context

```mermaid
flowchart LR
    PERSON[A pilgrim or an ustaz] -- "opens isfar.pages.dev" --> CF[Cloudflare Pages]
    CF -- "static files and mataf.glb" --> SITE[Isfar in the browser]
    GH[GitHub Actions] -- "uploads a green build" --> CF
```

## Components

```mermaid
flowchart TB
    HASH[("Address: #tawaf-6 or #semak")]
    APP["App.tsx: step, check, language, keys, layout"]
    LIB["lib/step.ts, lib/check.ts, lib/language.ts"]
    TEXT["content/tawaf.ts, content/check.ts, content/text.ts"]
    SCENE["scene/Scene.tsx: four states, names, map"]
    PLACE["scene/place.ts, a lazy file"]
    VIEWS["scene/views.ts, scene/mataf.ts"]
    PLAN[("scene/plan.json")]
    GLB[("public/models/mataf.glb")]
    HASH -- "hashchange" --> APP
    APP -- "hash text, picks, stored code" --> LIB
    APP -- "step number, language code" --> TEXT
    APP -- "step number, names on or off, scene state" --> SCENE
    SCENE -- "import(), then goTo(step)" --> PLACE
    PLACE -- "camera of the step, arc between two" --> VIEWS
    VIEWS -- "sizes and spots" --> PLAN
    PLACE -- "fetches and draws" --> GLB
    PLAN -- "tools/mataf.py, in Blender" --> GLB
```

| Component | Folder | What it does |
| --------- | ------ | ------------ |
| App | `src/App.tsx` | Holds the step or the check from the address, and the question and the picks of the check. Picks the language, listens to the keys and lays out the screen. |
| Rules | `src/lib/` | Reads the step from `#tawaf-N` and the check from `#semak`, counts the right picks and the missed steps, and picks the stored language, else the device language, else Malay. |
| Step text | `src/content/` | Holds every word on the screen, the 15 steps of tawaf and the seven check questions, in Malay and English. |
| Components | `src/components/` | The top bar, step panel, beads, Arabic block, note, Back and Next, notices, cards and the top-view map. The check adds its side column, the question, the answer option and the result. |
| Scene | `src/scene/` | Checks for WebGL 2, loads the 3D place, moves the camera and the names, hides the names until a check answer, and shows the map when 3D cannot show. |
| Plan | `src/scene/plan.json` | The sizes of the tawaf place, read by the map, the camera and the Blender script. |
| Model | `tools/mataf.py`, `public/models/` | A Blender script that builds the Kaabah, the mataf and the arcades as one `.glb` file. |
| CI | `.github/workflows/ci.yml` | Tests each push, and deploys only a green build to Cloudflare Pages. |
