# Decisions

Append-only. A changed decision is a new entry that supersedes the old one; only an
old entry's Status line ever changes.

## D1 · 2026-11-21 · Umrah first, hajj in its own shape

Why: umrah is four steps in or near one mosque, and hajj reuses its tawaf and sa'i.
Rejected: Hajj first (more places and more days before anything ships), Both together
(the largest first version, and the slice list passes six).
Source: specs/virtual-hajj/shape.md
Status: active

## D2 · 2026-11-21 · Lead the pilgrim step by step through a 3D place

Why: success is that a first-timer can say where each step happens and what to do
there. A led walk shows the place and the order together.
Rejected: Free walk in 3D (the person must find the place of each step alone),
360-degree photos (fixed spots, no path between the steps), Map and pictures (no
look-around).
Source: specs/virtual-hajj/shape.md
Status: active

## D3 · 2026-11-21 · Design direction: kiswah and marble

Why: the first three looks were flat and could be any app. This one takes its materials
from the pilgrimage: kiswah black with one flat gold band, mataf marble, ihram cloth, and
seven counter beads for progress.
Rejected: Colour chapters (flat, no texture, could be any app), Loud and flat (flat, no
texture, could be any app), Soft daylight (the closest of the first three, but flat and
generic), Cloth and beads (the same materials without the kiswah; the user chose the
kiswah anchor).
Source: docs/design/system-brief.md
Status: active

## D4 · 2026-11-21 · Vite, React and TypeScript, with three.js for 3D

Why: this pairing has the most 3D examples, so the skeleton carries the least unknown.
The site is static files, and it needs no server framework.
Rejected: Svelte (a smaller download, but fewer 3D examples to copy from), No UI
framework (step state gets hard to manage by the self-check slice), Astro (one more
tool, and the step state still lives in a script).
Source: specs/walking-skeleton.md
Status: active

## D5 · 2026-11-21 · No database; the step text lives in repo files

Why: the site keeps nothing about the person (shape O5), so the only data is the step
text in two languages. Files in the repo need no server and no account.
Rejected: Headless CMS (an account and a second home for the content, for one author
who uses git), Hosted Postgres (a server path that no umrah slice needs).
Source: specs/walking-skeleton.md
Status: active

## D6 · 2026-11-21 · Host on Cloudflare Pages, at its free pages.dev address

Why: each visit downloads a 3D model, and the Cloudflare Pages limits page lists no
bandwidth limit on the free plan. Each branch gets a preview address. GitHub Actions
uploads the built files to the project "isfar".
Rejected: Workers static assets (Cloudflare's main platform now, but a deploy path with
more unknowns for the skeleton), GitHub Pages (no preview address for a branch, and a soft cap of 100 GB a
month), Vercel (the hobby tier caps bandwidth and bars commercial use), Netlify (the
free tier has a usage cap), A custom domain now (a purchase and DNS setup inside the
skeleton).
Source: specs/walking-skeleton.md
Status: active

## D7 · 2026-11-21 · GitHub Actions on a public repo; a red run never deploys

Why: Actions minutes are free for a public repo, and a browser test with 3D uses a few
minutes for each push. The live address only gets a build whose browser test passed.
Rejected: A private repo (2,000 free minutes a month), Cloudflare's own build only (it
cannot run a browser test), Deploy on each push (a broken page can go live).
Source: specs/walking-skeleton.md
Status: active

## D8 · 2026-11-21 · Vitest for unit tests, Playwright for browser tests, at four sizes

Why: headless Chromium on the dev machine loses 3D drawing, and headless Firefox draws.
Playwright drives both, so one test runs in Firefox there and in Chromium in CI. The
sizes are 360x800, 960x540, 1280x720 and 1920x1080.
Rejected: Cypress (weaker Firefox support), Playwright only (the self-check slice has
scoring logic that wants unit tests), Two sizes (an older 1280x720 classroom projector
goes untested).
Source: specs/walking-skeleton.md
Status: active

## D9 · 2026-11-21 · pnpm is the package manager

Why: pnpm 9.15.9 is on the dev machine. It installs faster than npm and keeps a
stricter dependency tree.
Rejected: npm (slower installs), Bun (not installed, and one more unknown in the
skeleton).
Source: specs/walking-skeleton.md
Status: active

## D10 · 2026-11-21 · The 3D place is a simple stylised model, made for this project

Why: a chunky Kaabah with its gold band on the marble mataf fits the kiswah and marble
direction (D3). It has no licence question, and we control its size.
Rejected: A free model from a model library (a licence check, an accuracy check, and
likely too heavy for an old phone), A detailed model built or commissioned now (days of
work or money before the skeleton ships).
Source: specs/walking-skeleton.md
Status: active

## D11 · 2026-11-21 · The skeleton proves 3D at phone speed, on a slowed desktop Chrome

Why: no old Android is at hand. The bar is the 3D place within 5 seconds and 30 frames
a second, with the CPU slowed 4 times and the "Fast 4G" network profile. A script on
the dev machine drives real Chrome against the live site, because CI draws 3D in
software. A hand check in DevTools is the fallback. A real old phone stays untested,
and that is an accepted risk.
Rejected: /poc first (the skeleton is the same test, with code that we keep), By hand
only (the check is not repeatable by command), A real old
Android (none at hand), 10 seconds and 20 frames (rough movement, and later slices draw
more), 3 seconds and 60 frames (a mid-range phone probably fails it), "Slow 4G" or a CPU
slowed 6 times (stricter than a mid-range phone on 4G in Malaysia).
Source: specs/walking-skeleton.md
Status: active

## D12 · 2026-11-21 · Language: the device language, else Malay; stored on the device

Why: one address serves both languages, and the next visit opens in the person's own
language. The browser stores the language code only, and the site sends nothing about
the person to a server (shape O5).
Rejected: /ms and /en in the address (a second address for each page; the user chose
one), Not held (a reload loses the choice), Always Malay (a device set to English
should open in English), A choice screen (one more tap before the place shows).
Source: specs/walking-skeleton.md
Status: active

## D13 · 2026-11-21 · When 3D cannot show: the step text, a still picture, a short message

Why: the person still reads the step and still sees the place. A failed download also
gets a "Try again" button.
Rejected: Text and message with no picture (the person gets no view of the place), A
full-page "not supported" message (the person reads no step text).
Source: specs/walking-skeleton.md
Status: active

## D14 · 2026-11-21 · The site stays hidden from search engines until full-umrah

Why: the first deploys hold placeholder text that no qualified person has reviewed
(shape O1). full-umrah is the first slice with one whole umrah.
Rejected: Public and listed (search engines list the placeholder text), Behind a login
(the CI test needs a way through the login), tawaf-walk lists it (the review must then
happen for tawaf alone), A new launch slice (a sixth slice in the shape for one mark).
Source: specs/walking-skeleton.md
Status: active

## D15 · 2026-11-21 · The site name is Isfar

Why: "isfar" is the Arabic for dawn growing bright, the moment a person can see the
place. It shares a root with "safar", travel. One name serves both languages. An
Arabic reader has not checked the meaning yet.
Rejected: Virtual Hajj and Haji Maya (the user wanted a name with an image behind it),
Direct names such as Manasik and Labbaik (the user wanted a likeness, not the name of
a rite), Langkah, Sabil, Yakin and Asa (earlier drafts that the user passed over).
Source: specs/walking-skeleton.md
Status: active

## D16 · 2026-11-21 · The 3D download stays under 500 KB compressed

Why: the ceiling covers three.js plus the model, and it leaves room for the fuller
model of tawaf-walk. A fixed number shows growth before the 5 second bar breaks.
Rejected: 300 KB (little room for the fuller model), No ceiling (a slow growth in size
goes unseen until the 5 second bar breaks).
Source: specs/walking-skeleton.md
Status: active

## D17 · 2026-11-21 · A projector reads by browser zoom; the wide layout holds from 800 px

Why: the body text is 18px, which is small from the back of a classroom. At 200% zoom a
1920x1080 projector is 960x540, and the scene stays beside the step panel. 960x540 is
a test size.
Rejected: Larger text in the design system (a laptop user close to the screen gets it
too), Leave it (the room cannot read the step).
Source: specs/walking-skeleton.md
Status: active
## D18 · 2026-11-23 · three.js directly, with no React wrapper

Why: the skeleton has one fixed view. One component owns a canvas and calls three.js,
which is the smallest download under the 500 KB ceiling (D16).
Rejected: React Three Fiber (a library and download size that one fixed view does not
need yet).
Source: specs/walking-skeleton.md
Status: active

## D19 · 2026-11-23 · The model is a .glb file from a Blender script in the repo

Why: the site loads the Kaabah as it will load the fuller mosque, so the skeleton
proves the model file, its loader and its size. The script makes the file again on any
machine with Blender, and the file is committed.
Rejected: Shapes in three.js code (tawaf-walk then meets the model file path for the
first time), A file modelled by hand (the skeleton waits for it).
Source: specs/walking-skeleton.md
Status: active

## D20 · 2026-11-23 · "Try again" reloads the page

Why: a reload works in each browser, and the language is stored, so the person loses
nothing. tawaf-walk must keep the current step across a reload, or replace this.
Rejected: Fetch again in place (nobody has proved that each browser fetches a failed
code file again without a reload), /poc (a spike for a path that the reload avoids).
Source: specs/walking-skeleton.md
Status: active

## D21 · 2026-11-23 · The font files ship inside the site

Why: no request goes to Google, so the site sends nothing about the person to a third
party (shape O5), and a phone on 4G opens one less connection.
Rejected: Google Fonts (each visit makes a request to Google, which sees the visitor's
address).
Source: specs/walking-skeleton.md
Status: active
