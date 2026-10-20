---
paths:
    - 'package.json'
    - 'yarn.lock'
    - '.yarnrc.yml'
    - '.yarn/patches/**'
    - '.github/dependabot.yml'
    - 'packages/*/package.json'
    - '**/tsconfig*.json'
    - 'tools/validate-licenses/**'
    - 'tools/check-peer-deps/**'
---

# Dependencies and tooling

- `@angular/build` is installed through a yarn `patch:` from `.yarn/patches/` that ports angular/angular-cli@6d9b360e5: without it a one-shot build never disposes its esbuild contexts and `ng build` never exits. The patch is cut for one version and Dependabot ignores the package, so bump it by hand with the rest of `@angular/*`, re-cut the patch for the new version (`yarn patch @angular/build`, then `yarn patch-commit -s`) and update the tooling table in `docs/guides/angular-21-breaking-changes.{en,ru}.md`. Drop the patch and its entry in `.github/dependabot.yml` once the 21.x line ships the fix; 21.2.27 does not, 22.1.0 does.
- `@playwright/test` is pinned exactly because a patch release can change the bundled Chromium and invalidate every baseline — upgrade it on its own branch and refresh the baselines in the same PR.
- Published packages depend only on `tslib` at runtime; everything else is a peer dependency. `check-peer-deps` and `check-npm-resolution` guard the ranges because Yarn tolerates peer conflicts that npm rejects for consumers. Keep the `@koobiq/*` peer floors at the minimum tested version instead of syncing them to the root devDependency.
- After changing tooling, test globals, tsconfigs or dependencies, also run `build:cli` and `build:schematics`: CI builds every package, and the CLI build type-checks its specs too.
- `validate:license` checks devDependencies as well, so a test-only package can fail CI. Accept a new license by adding its SPDX id to `licensesWhitelist` with a comment on its scope; `ignoredPackages` pins exact versions and is for packages with wrong metadata.
