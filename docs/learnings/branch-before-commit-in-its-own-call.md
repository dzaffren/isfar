# Branch in one call, commit in the next

**Rule:** Run `git switch -c` alone, and commit in a later Bash call.

The zuko hook `block-dangerous.sh` reads the branch before the command runs. In `/spec ihram-check`, `git switch -c feat/ihram-check && git commit` was blocked as a commit on `main`, because the branch did not exist yet when the hook looked. The same two commands passed in two calls.
