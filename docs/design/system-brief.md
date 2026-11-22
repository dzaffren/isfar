# Virtual Hajj · design system brief

**Status:** Approved · **Updated:** 2026-11-21 by /design-system pause C

Source for who and where: `docs/specs/virtual-hajj/shape.md`.
The answers below come from the user on 2026-11-21.

## Who looks at it, and where

- A first-time pilgrim, often older, alone, on a phone. They are nervous and new to the places.
- An ustaz or ustazah, in a lit classroom, on a projector. The room reads the screen from a distance.
- Both use the same site and the same next and back steps (shape O3).
- Each text exists in Malay and English (shape O11).

## Answers

| Question | Answer |
| --- | --- |
| Must feel | Friendly, simple, encouraging |
| Must never feel | Preachy, heavy, old-fashioned |
| Locked brand | Nothing. Logo, colours and fonts are open. |
| Motion ceiling | Tier 2 in the interface, around a 3D scene |
| Accessibility floor | WCAG AA, with large text |
| Arabic | Arabic script inside Malay or English text. The interface reads left to right. |
| Oldest device | A 5-year-old mid-range Android, on mobile data |
| Light and dark | Both work. Light is the default. Dark is "kiswah night": near-black and gold, chosen on 2026-11-21 over warm grey, night sky and green night. |
| Direction test 1 | Rejected. The three looks were too flat, had no texture, and could be any app. "Soft daylight" was the closest. |

## References, and what we take

| Reference | Take | Leave |
| --- | --- | --- |
| [Quran.com](https://quran.com) | Arabic on its own line, larger than the Latin text, with the meaning under it. Calm reading layout. | Its long scrolling pages |
| [Google Arts & Culture](https://artsandculture.google.com) | The place fills the screen. A small caption panel sits over it, with next and back. | Its dark museum mood |
| [Duolingo](https://www.duolingo.com) | One step on screen at a time. Progress that is always visible. | Points, streaks, mascots, the game look |
| [Apple product pages](https://www.apple.com/iphone) | One large 3D object, and short text that explains one thing at a time, in step with the camera. | Its black, glossy, premium tone |
| Animal Crossing | Each surface is a material you could touch. Chunky rounded forms. Buttons that press down. Warm daylight. Nothing sharp, glossy or hard black. | Its characters, its patterns, its palette and its art. We take the reason, not the look. |

## Screen anatomy

Each walk screen has the same three parts.

```
phone, portrait                     projector or laptop
+----------------------+            +--------------------------------------+
| progress   BM | EN   |            | progress                    BM | EN  |
|                      |            |                         +-----------+|
|      3D scene        |            |                         | step text ||
|                      |            |        3D scene         | Arabic    ||
|                      |            |                         | note      ||
+----------------------+            |                         | back next ||
| step text            |            |                         +-----------+|
| back          next   |            +--------------------------------------+
+----------------------+
```

The 3D scene is the lesson, so it takes the most space, and the step panel sits over or beside it.

## Token trace

Each token comes from an answer.

```
older eyes + projector, AA large text  → 18px body, 16px smallest text, 1.25 type ratio, 1.6 line height
phone in one hand, touch               → 48px touch targets, next and back at the bottom edge
phone and projector, one site          → 2 layouts of the same parts: panel under the scene, panel beside it
"friendly"                             → chunky rounded corners: 16px controls, 24px panels; warm ink, no pure grey
"simple"                               → one accent colour, one step on screen, 8px spacing scale
"encouraging"                          → progress as "step 3 of 7"; a soft success state; plain verbs on buttons
tawaf and sa'i each count seven        → progress is seven counter beads on a cord, like the beads a pilgrim carries
never "preachy"                        → step text is 40 words or fewer; a ruling note opens on tap, not by default
never "heavy"                          → no dense tables; dark is only the kiswah: the panel header and the recitation block
never "old-fashioned"                  → no ornament frames, no gold gradients, no photos behind text; gold is one flat colour
Animal Crossing textures               → each surface has a material: a fine pattern, a thick edge, a lip under a button
"too flat, no texture" (test 1)        → panels are woven cloth, the ground is marble tile, buttons press down by their lip
"too generic" (test 1)                 → the materials come from the pilgrimage: ihram cloth, mataf marble, counter beads,
                                         the kiswah and its gold band; a small Kaabah mark names the rite
Quran.com                              → type.arabic: own line, right to left, 1.5x the body size
Arabic inside Malay or English         → one Arabic font; Arabic runs carry dir="rtl"; layout stays left to right
Malay and English                      → buttons and panels size to their text; no fixed-width labels
motion ceiling: tier 2                 → 160ms for press and hover, 320ms for a step change, ease-out curves
reduced motion                         → a step change becomes a cross-fade; the camera cuts, it does not fly
5-year-old Android, mobile data        → no backdrop blur over the 3D scene; 2 Latin weights and 1 Arabic weight;
                                         textures are CSS patterns, not image files
lit classroom + daytime scene          → light is the default; dark keeps the same accent and contrast
nothing locked                         → pause B chooses the hues and the fonts
```

## Direction

The user chose "Kiswah and marble" on 2026-11-21, on the second direction test.
The canvas is https://claude.ai/artifact/Bh3RraqYt71kLdDGncLzSb.

| Part | Choice |
| --- | --- |
| Ground | Mataf marble: a pale tile with thin joints |
| Surface | Ihram cloth: warm white with a fine weave, a thick edge under each panel |
| Anchor | The kiswah: near-black cloth with one flat gold band. It holds the panel header and the recitation. |
| Accent | Kiswah gold. It means "act here": the main button, the current bead, a selected switch. |
| Progress | Seven counter beads on a cord |
| Latin font | Nunito, weights 500 and 800 |
| Arabic font | Amiri 400, at 30px. Amiri draws small, so this is more than 1.5x the body size. |

## What the first slices need

Pause C builds only these, for `walking-skeleton`, `tawaf-walk` and `tawaf-check`.

| Primitive | Used for |
| --- | --- |
| Button | Next, back, start, try again |
| Language switch | Malay or English |
| Progress | "Step 3 of 7", shown as seven counter beads |
| Step panel | The step title and its text |
| Arabic block | A recitation: Arabic, transliteration, meaning |
| Note | "Other schools differ here", opened on tap |
| Notice | "A qualified person has not yet reviewed this content" (O1). "The layout on the day may differ" (O6). |
| Answer option and result | The self-check in `tawaf-check` |
| Scene states | The 3D place loads. The device cannot draw 3D. |

## Not in the system

- **3D tokens.** The 3D scene is content, not interface. The `walking-skeleton` spec owes its budget: size, frame rate, the reduced-motion path, and the lazy load.
- **Game parts.** No points, streaks, badges or confetti.
- **A right-to-left layout.** Only Arabic runs read right to left.

## Glossary

- **Token** — a named design value, such as a colour or a size, that each screen reuses.
- **Primitive** — a basic building block of the interface, such as a button.
- **WCAG AA** — the common accessibility standard. Body text needs 4.5:1 contrast with its background.
- **Motion tier** — zuko's scale for how much the interface moves. Tier 2 allows planned transitions between steps.
- **Reduced motion** — a device setting for people who want less movement on screen.
- **Backdrop blur** — a frosted-glass effect. It is slow on old phones.
- **Kiswah** — the black cloth that covers the Kaabah. A band of gold writing runs around it.
- **Mataf** — the open marble floor around the Kaabah, where pilgrims do tawaf.
- **Counter beads** — a short string of seven beads that a pilgrim moves to count the circuits.
- **Lip** — a thick darker edge under a button, which makes it look raised and pressable.
- **Transliteration** — Arabic words written in Latin letters.
- **dir="rtl"** — the HTML mark that makes a piece of text read right to left.
