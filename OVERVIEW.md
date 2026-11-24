# Virtual Hajj

**Status:** Active · **Updated:** 2026-11-24 by /ship sai-walk

A learning website that works as a virtual hajj and umrah.
People who prepare to go for hajj or umrah use it.

## Run it

| Task    | Command                                  |
| ------- | ---------------------------------------- |
| install | `pnpm install`                           |
| run     | `pnpm dev`                               |
| test    | `pnpm test` and `pnpm e2e`               |
| lint    | `pnpm typecheck`                         |

## Where things are

- `src/` — the site: `App.tsx`, the components, the step text and the 3D scene
- `src/scene/plan.json` — the sizes of the tawaf place and the mas'a, read by the site and by Blender
- `public/models/` — `mataf.glb` and `masa.glb`, built by `tools/mataf.py` and `tools/masa.py` in Blender
- `e2e/` — the Playwright browser tests and the speed test
- `docs/design/design-system/` — the kiswah and marble tokens, styles and fonts
- `.github/workflows/ci.yml` — test each push, deploy a green build to Cloudflare Pages

## Slices

| Slice            | Status  | What it does | Page |
| ---------------- | ------- | ------------ | ---- |
| walking-skeleton | Shipped | A person opens the deployed site and sees one 3D place, with one step of text in Malay or English. | docs/specs/walking-skeleton.md |
| tawaf-walk       | Shipped | The site leads a person through tawaf in 15 steps, in a 3D mataf, from the Kaabah and its parts to the end of circuit 7. | docs/specs/tawaf-walk.md |
| tawaf-check      | Shipped | After the tawaf walk, the person answers seven questions on where each step happens and what to do there, and the result shows on screen. | docs/specs/tawaf-check.md |
| sai-walk         | Shipped | The site leads a person through sa'i in 13 steps, in a 3D mas'a, from Safa to the end of walk 7 at Marwah. | docs/specs/sai-walk.md |

## More

README.md · docs/ARCHITECTURE.md · DECISIONS.md · CHANGELOG.md
