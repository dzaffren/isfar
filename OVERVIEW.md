# Virtual Hajj

**Status:** Active · **Updated:** 2026-11-25 by /ship ihram

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
- `src/scene/plan.json` — the sizes of the tawaf place, the mas'a and Bir Ali, read by the site and by Blender
- `public/models/` — `mataf.glb`, `masa.glb` and `birali.glb`, built by `tools/mataf.py`, `tools/masa.py` and `tools/birali.py` in Blender
- `e2e/` — the Playwright browser tests and the speed test
- `docs/design/design-system/` — the kiswah and marble tokens, styles and fonts
- `.github/workflows/ci.yml` — test each push, deploy a green build to Cloudflare Pages

## Slices

| Slice            | Status  | What it does | Page |
| ---------------- | ------- | ------------ | ---- |
| walking-skeleton | Shipped | A person opens the deployed site and sees one 3D place, with one step of text in Malay or English. | docs/specs/walking-skeleton.md |
| tawaf-walk       | Shipped | The site leads a person through tawaf in 15 steps, in a 3D mataf, from the Kaabah and its parts to the end of circuit 7. | docs/specs/tawaf-walk.md |
| tawaf-check      | Shipped | After the tawaf walk, the person answers seven questions on where each step happens and what to do there, and the result shows on screen. | docs/specs/tawaf-check.md |
| sai-walk         | Shipped | The site leads a person through sa'i in 13 steps, in a 3D mas'a with a one-way lane for each way, from Safa to the end of walk 7 at Marwah. | docs/specs/sai-walk.md |
| sai-check        | Shipped | After the sa'i walk, the person answers seven questions on where each step of sa'i happens and what to do there, and the result shows on screen. | docs/specs/sai-check.md |
| ihram            | Shipped | The site leads a person through ihram in 8 steps, in a 3D Bir Ali, from the bath and the clothes to the talbiyah on the bus to Makkah. | docs/specs/ihram.md |

## More

README.md · docs/ARCHITECTURE.md · DECISIONS.md · CHANGELOG.md
