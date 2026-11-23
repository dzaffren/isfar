# Stop any local preview server before an e2e run

**Rule:** Before `pnpm e2e` here, make sure nothing listens on port 4173.

Outside CI, `playwright.config.ts` reuses a server that already runs on port 4173 (`reuseExistingServer: !process.env.CI`). The run then skips `pnpm build`, so the tests check the old build, not the code under change.

In `/review walking-skeleton`, a preview server from a manual check stayed alive. The fix for the lost 3D context looked broken until that server stopped. Check with `ss -ltnp | grep 4173`.
