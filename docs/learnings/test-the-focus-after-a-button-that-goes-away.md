# Test where the focus goes after a button that goes away when pressed

**Learned:** 2026-11-27 · **From:** /review full-umrah

"Cuba semula" moved from the bar into the result panel. The bar stays on screen, but the panel goes away with the result. On a check opened by a fresh load, Enter on the button sent the focus to the page body. No test pressed it by keyboard.

Wrong: move a button into a part of the screen that its own press removes, and test only that the button shows. Right: press it by keyboard in a browser test, and check which control has the focus after.

The same review found a second miss of this kind: `tools/masa.py` made the hall longer but kept 22 arches, so the arches stopped 17 m short of Marwah. When a script makes a part longer, read each loop that fills that part.
