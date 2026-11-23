# Measure frame rates on a machine with a graphics chip, not on the dev machine

**Learned:** 2026-11-23 · **From:** /build walking-skeleton

The dev machine is a cloud VM with no graphics chip. Chrome draws WebGL there with SwiftShader, on the CPU, at about 18 frames a second, with or without a CPU slow-down. The walking-skeleton plan assumed that a desktop Chrome here could prove 30 frames a second.

Wrong: plan a frame-rate proof that runs on the dev machine. Right: plan it for a machine with a real GPU, and keep the renderer check in `e2e/speed.spec.ts` so a software renderer fails by name. Load times can still be measured here.
