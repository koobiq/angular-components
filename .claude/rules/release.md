---
paths:
    - 'packages/cli/**'
    - 'tools/prune-is-new-badges/**'
    - '.github/workflows/{publish,pr-notify}.yml'
---

# Release CLI

- Changelog generation outside `release:stage:commit` needs `package.json` bumped above the latest tag first, restored afterwards on the error path too: with the version equal to the tag, the commit range is empty and the changelog comes out blank without an error.
- Post to the Mattermost webhook with Node's `https.request`, not `fetch` or an HTTP library: the corporate WAF blocks undici's TLS fingerprint with a 403.
- `notify()` in `notify-release.ts` posts the release title plus the whole changelog section of the version, and nothing truncates it. Keep that body under about 16 KB — cut the notes or send a link to the GitHub release instead — because the WAF rejects larger bodies with the same 403 as a blocked client, and `notify()` only logs it, so the publish job stays green while the post never lands.
- When `docs:prune-is-new-badges` removes the last `isNew` from `structure.ts`, keep `expiresAt` referenced, or ESLint and `noUnusedLocals` reject the release commit.
