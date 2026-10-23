---
paths:
    - 'packages/docs-examples/example-module.ts'
    - 'packages/docs-examples/loader/index.ts'
    - 'tools/public_api_guard/**'
    - 'tools/check-public-api-any/baseline.json'
    - 'tools/check-api-docs/baseline.json'
    - 'apps/docs/src/llms.txt'
    - 'apps/docs/src/sitemap.xml'
    - 'apps/docs/src/prerender-routes.txt'
    - 'apps/docs/src/app/seo-descriptions.ts'
    - 'apps/docs/src/assets/versions.json'
    - 'apps/docs/src/app/components/design-tokens-viewers/data/*.ts'
    - 'apps/docs/src/app/structure.ts'
---

# Committed generated files

- Never hand-edit: `packages/docs-examples/example-module.ts`, `packages/docs-examples/loader/index.ts`, `tools/public_api_guard/**`, `tools/check-public-api-any/baseline.json`, `tools/check-api-docs/baseline.json`, `apps/docs/src/llms.txt`, `apps/docs/src/sitemap.xml`, `apps/docs/src/prerender-routes.txt`, `apps/docs/src/app/seo-descriptions.ts`, `apps/docs/src/assets/versions.json`, `apps/docs/src/app/components/design-tokens-viewers/data/*.ts`.
- The docs metadata files are kept current in the branch that changes their source, because CI compares them: after a route is added, removed or renamed in `structure.ts`, run `yarn run docs:generate-sitemap`, `yarn run docs:generate-prerender-routes` and `yarn run docs:generate-llms` and commit the result (`apps/docs/src/app/page-paths.spec.ts` checks the first two, `check-llms` the last). `llms.txt` also quotes the first sentence of every overview and opens with `docs/llms/rules.md`, so `docs:generate-llms` reruns after either changes; `seo-descriptions.ts` follows the first paragraph of every overview, `unit:tools` checks it, and `yarn run docs:generate-seo-descriptions` regenerates it. The release CLI reruns the first three through `release:extract-docs-meta` after bumping the version; `versions.json` is left to the release.
- On a rebase conflict, regenerate instead of merging by hand: `approve-api` for `*.api.md` (rebuild the package first; the import alias flips file-wide, so a hand merge never matches), `build:docs-examples-module` for `example-module.ts` and `loader/index.ts` together (fixing only the first leaves the loader without the new case, which fails only at runtime), `docs:generate-llms` for `llms.txt`.
- Resolve a conflict in `tools/check-public-api-any/baseline.json` per entry point: take main's count for the others and yours for your own. The ratchet fails in both directions.
- `tools/public_api_guard/**/*.api.md` are the only CRLF files in the repository. A script that touches one keeps the CRLF endings: `sed -i` strips them and turns a one-line change into a whole-file diff.
