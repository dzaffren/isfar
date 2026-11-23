# Virtual Hajj · architecture

**Status:** Active · **Updated:** 2026-11-23 by /ship tawaf-walk

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
    HASH[("Address: #tawaf-6")]
    APP["App.tsx: step, language, keys, layout"]
    LIB["lib/step.ts, lib/language.ts"]
    TEXT["content/tawaf.ts, content/text.ts"]
    SCENE["scene/Scene.tsx: four states, names, map"]
    PLACE["scene/place.ts, a lazy file"]
    VIEWS["scene/views.ts, scene/mataf.ts"]
    PLAN[("scene/plan.json")]
    GLB[("public/models/mataf.glb")]
    HASH -- "hashchange" --> APP
    APP -- "hash text, stored code" --> LIB
    APP -- "step number, language code" --> TEXT
    APP -- "step number, scene state" --> SCENE
    SCENE -- "import(), then goTo(step)" --> PLACE
    PLACE -- "camera of the step, arc between two" --> VIEWS
    VIEWS -- "sizes and spots" --> PLAN
    PLACE -- "fetches and draws" --> GLB
    PLAN -- "tools/mataf.py, in Blender" --> GLB
```

| Component | Folder | What it does |
| --------- | ------ | ------------ |
| App | `src/App.tsx` | Holds the step from the address, picks the language, listens to the keys and lays out the screen. |
| Rules | `src/lib/` | Reads the step from `#tawaf-N`, and picks the stored language, else the device language, else Malay. |
| Step text | `src/content/` | Holds every word on the screen, and the 15 steps of tawaf, in Malay and English. |
| Components | `src/components/` | The top bar, step panel, beads, Arabic block, note, Back and Next, notices, cards and the top-view map. |
| Scene | `src/scene/` | Checks for WebGL 2, loads the 3D place, moves the camera and the names, and shows the map when 3D cannot show. |
| Plan | `src/scene/plan.json` | The sizes of the tawaf place, read by the map, the camera and the Blender script. |
| Model | `tools/mataf.py`, `public/models/` | A Blender script that builds the Kaabah, the mataf and the arcades as one `.glb` file. |
| CI | `.github/workflows/ci.yml` | Tests each push, and deploys only a green build to Cloudflare Pages. |
