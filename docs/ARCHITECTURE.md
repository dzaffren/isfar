# Virtual Hajj · architecture

**Status:** Active · **Updated:** 2026-11-23 by /ship walking-skeleton

## Context

```mermaid
flowchart LR
    PERSON[A pilgrim or an ustaz] -- "opens isfar.pages.dev" --> CF[Cloudflare Pages]
    CF -- "static files and kaabah.glb" --> SITE[Isfar in the browser]
    GH[GitHub Actions] -- "uploads a green build" --> CF
```

## Components

```mermaid
flowchart TB
    APP["App.tsx: layout, language, scene state"]
    LANG["lib/language.ts"]
    TEXT["content/text.ts"]
    SCENE["scene/Scene.tsx"]
    PLACE["scene/place.ts, a lazy file"]
    GLB[("public/models/kaabah.glb")]
    APP -- "stored code, device language" --> LANG
    APP -- "language code" --> TEXT
    APP -- "scene state" --> SCENE
    SCENE -- "import() when WebGL 2 exists" --> PLACE
    PLACE -- "fetches and draws" --> GLB
```

| Component | Folder | What it does |
| --------- | ------ | ------------ |
| App | `src/App.tsx` | Picks the language, holds the scene state and lays out the screen. |
| Language rule | `src/lib/` | Uses the stored choice, else the device language, else Malay. |
| Step text | `src/content/` | Holds every word on the screen, in Malay and English. |
| Components | `src/components/` | The top bar, step panel, notices, loading card, message card and still picture. |
| Scene | `src/scene/` | Checks for WebGL 2, loads the 3D file, and shows loading, shown, unsupported or failed. |
| Model | `tools/kaabah.py`, `public/models/` | A Blender script that builds the Kaabah and the mataf as one `.glb` file. |
| CI | `.github/workflows/ci.yml` | Tests each push, and deploys only a green build to Cloudflare Pages. |
