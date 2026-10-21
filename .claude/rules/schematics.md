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
- In the migration guide, a component review goes as `#### <Component>` inside the `### Component review (<version>)` step, whose heading is followed by the `{/* migration-component-subsections */}` marker that `tools/docs-pages/migration/migration-steps.ts` splits the step on; close the subsection with the schematic that handles it. A second `#### <Name>` heading in one language changes its slug; add `{/* migration-subsection-components(<name>) */}` under it in both languages, or `migration-steps.spec.ts` fails.
- Match receivers and elements by identifier, element name or explicit type annotation: the schematic test tree has no `@koobiq` types, and no migration uses a type checker.
- A spec fixture that starts with a BOM is compared with `tree.read(path).toString()`: `tree.readText(path)` strips the BOM that the real run keeps (`autocomplete-panel-width-auto/index.spec.ts`); everywhere else `readText` is fine.
- An import-removal regex ends in `['"];?[ \t]*\r?\n?`, so it does not swallow the blank line after the import.
- Every `VERSIONS.*` that ng-add uses needs an entry in `packages/schematics/rollup.config.js`, or the literal placeholder ships as the version range.
