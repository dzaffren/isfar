# Import JSON with `with { type: "json" }` when a browser test reads the module

**Learned:** 2026-11-23 · **From:** /build tawaf-walk

`e2e/walk.spec.ts` imports `src/scene/mataf.ts`, which imports `plan.json`. Vite and Vitest load a bare `import plan from "./plan.json"`, but Playwright runs the test files as Node ES modules and stops with `needs an import attribute of "type: json"`.

Wrong: a bare JSON import in a module that a browser test also imports. Right: `import plan from "./plan.json" with { type: "json" };`, which Vite, Vitest, TypeScript and Playwright all accept.
