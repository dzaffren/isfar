# Prove the 3D half of the browser test in Firefox on the dev machine

**Learned:** 2026-11-23 · **From:** /build tawaf-walk

On the dev machine, headless Chromium draws the first frame of the place and then loses its WebGL context, so each 3D test ends in the failed state. `main` fails the same way here, and passes in CI. Firefox draws the place here and passes.

Wrong: read a red 3D test in local Chromium as a bug. Right: run `pnpm e2e --project=firefox` here, and let CI judge Chromium.
