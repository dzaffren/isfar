# Commit the deletion of a preview alone

**Rule:** Delete the pause 2 preview with `git rm`, then commit it at once, before you stage other files.

`git rm` stages the deletion. In `/build sai-check`, the preview went with `git rm` before the commits, and the deletion rode into the first feature commit, `4ae39c5`, with the address code. Moving it out needs a history rewrite, which the user must ask for.
