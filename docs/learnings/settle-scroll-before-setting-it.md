# Wait for the page to stop scrolling before a test sets its own scroll

**Learned:** 2026-11-24 · **From:** /build tawaf-check

The test for the line why passed half the time with the scroll code removed. A smooth scroll from the last tap, and the focus move of the new question, still ran after the test set its scroll. They moved the line clear of the bar for the test.

Wrong: set `scrollTop` straight after the action that started a scroll. Right: poll the scroll positions until two reads match, then set the scroll, and check that the start state really hides the thing under test.
