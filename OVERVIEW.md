# Virtual Hajj

**Status:** Active · **Updated:** 2026-11-23 by /ship walking-skeleton

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
- `public/models/` — `kaabah.glb`, built by `tools/kaabah.py` in Blender
- `e2e/` — the Playwright browser tests and the speed test
- `docs/design/design-system/` — the kiswah and marble tokens, styles and fonts
- `.github/workflows/ci.yml` — test each push, deploy a green build to Cloudflare Pages

## Slices

| Slice            | Status  | What it does | Page |
| ---------------- | ------- | ------------ | ---- |
| walking-skeleton | Shipped | A person opens the deployed site and sees one 3D place, with one step of text in Malay or English. | docs/specs/walking-skeleton.md |

## More

README.md · docs/ARCHITECTURE.md · DECISIONS.md · CHANGELOG.md
