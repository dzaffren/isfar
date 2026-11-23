# Break the code a browser test guards, and watch the test fail

**Learned:** 2026-11-23 · **From:** /review tawaf-walk

Two browser tests passed with their guarded code broken. The resize test waited for a canvas under 800 px, but the canvas was already 798 px before the resize. The speed test divided N frames by the time of N - 1 gaps, so 29 fps read as 30.

Wrong: a wait or a bar that the start state already meets. Right: compare against the value before the action, and run the test once with the guarded line commented out to see it go red.
