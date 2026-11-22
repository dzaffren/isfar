# Make the first commit of an empty repo on the feature branch

**Learned:** 2026-11-23 · **From:** /build walking-skeleton

The zuko hook `block-dangerous.sh` blocks each commit on `main`, also the first commit of an empty repo. It checks the branch before the command runs, so a rename and a commit in one command still fail.

Wrong: plan a docs commit straight to `main`. Right: rename the unborn branch to `feat/{slice}` in one command, commit in the next, and push the first commit as `main` at /ship.
