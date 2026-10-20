---
paths:
    - 'packages/schematics/**'
    - 'docs/guides/migration.*.mdx'
---

# Schematics

- `packages/schematics/src/ng-add` sets up a consumer project; `src/migrations/<name>/` holds the `ng update` migrations. Build with `build:schematics`, test with `unit:schematics`.
- A breaking change to a component ships with a migration and with a subsection in `docs/guides/migration.{en,ru}.mdx`, or at least a warning that points at the manual steps. `tools/docs-pages/migration/schematics-coverage.spec.ts` fails on an undocumented schematic and on a stale `UNDOCUMENTED` entry.
- A migration folder holds `index.ts`, `schema.json` and `README.md` (the README is copied to `dist`). Register the migration in both `src/collection.json` and `src/migrations.json`, with a version above the last published tag: `ng update` selects only versions above the installed one.
- Read `options.fix ?? true`: `ng update` passes no options, so the schema defaults never apply.
- Every `VERSIONS.*` that ng-add uses needs an entry in `packages/schematics/rollup.config.js`, or the literal placeholder ships as the version range.
