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
