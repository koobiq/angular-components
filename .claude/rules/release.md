---
paths:
    - 'packages/cli/**'
    - 'tools/prune-is-new-badges/**'
    - '.github/workflows/{publish,pr-notify}.yml'
---

# Release CLI

- Changelog generation outside `release:stage:commit` needs `package.json` bumped above the latest tag first, restored afterwards on the error path too: with the version equal to the tag, the commit range is empty and the changelog comes out blank without an error.
- Keep release webhook payloads under about 16 KB — the title and a link to the release, not the full changelog: the WAF rejects larger bodies with the same 403 as a blocked client, and `notify()` only logs it.
- When `docs:prune-is-new-badges` removes the last `isNew` from `structure.ts`, keep `expiresAt` referenced, or ESLint and `noUnusedLocals` reject the release commit.
