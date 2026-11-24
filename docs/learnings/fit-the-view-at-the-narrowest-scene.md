# Fit a camera view at the narrowest scene, before you write the rule

**Learned:** 2026-11-24 · **From:** /build sai-walk

The plan said the mas'a camera stays inside the ends of the hall. The scene is about square at 960x540 (aspect 1), and the camera sees 40° each way. A 120 m hall then fits only from about 160 m up, or from behind one of its ends. The rule broke at the first wide view.

Wrong: write a camera rule from the plan of the place alone. Right: before you fix a view or a rule, project the corners of the place with a three.js camera at aspect 1 and 1.5, and find the nearest view that keeps them on screen.
