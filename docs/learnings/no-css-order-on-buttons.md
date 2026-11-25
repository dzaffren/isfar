# Move buttons in the page, not with CSS order

**Learned:** 2026-11-25 · **From:** /review ihram

On a phone, `order: 1` moved the rite switch to row 2, under BM and EN. The switch stayed first in the page, so Tab went down to row 2 and then back up to row 1. The browser tests passed, because they click buttons and never press Tab.

Wrong: use CSS `order` or `row-reverse` to move a button group. Right: put the groups in the page in the order they show on screen at every width. When two widths need different orders, change one layout. The ihram walk test now checks that each top bar button follows the one before it.
