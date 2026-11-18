# Contribution checklist

Go through this list before you mark a pull request **Ready for review**. Branches, commit messages, review and merge are covered in [CONTRIBUTING.md](../../CONTRIBUTING.md). For a large change, open an issue to discuss it first.

## Tests

- Unit tests (`*.spec.ts`, Vitest) cover the new behavior and the fixed bug.
- A visual change has a scenario in the component's `e2e.ts` and a screenshot test in `e2e.playwright-spec.ts`, with baselines updated in Docker as [Testing](./06-testing.md) describes.
- The examples are checked by hand in Chrome, Firefox and Safari on macOS and in Chrome, Firefox and Edge on Windows.

## Documentation

- A change to behavior or API is described on the component page in both languages: `<name>.en.mdx` and `<name>.ru.mdx`. `yarn run check-docs-pages` fails when their structure differs.
- A new feature has a live example in `packages/docs-examples/components/<name>/`.
- A breaking change ships with an `ng update` migration in `packages/schematics` and a step in the migration guide (`docs/guides/migration.{en,ru}.mdx`), or at least a warning there that points to the manual steps.
- A new numbered guide under `docs/guides/` (contributor documentation, like this one) is English only, with no `.ru` counterpart — unlike the MDX guide pages of the docs site.

## Public API

- After a public API change, build the package and run `yarn run approve-api`, then commit the updated golden files under `tools/public_api_guard/`.
- New public members have a JSDoc description and concrete types instead of `any`. CI counts undocumented members and `any` in the public types and fails when a count changes in either direction: record the new counts with `yarn run approve-api-docs` (after `yarn run docs:api-gen`) and `yarn run approve-public-api-any`.

## Code

- The component passes AXE checks and meets WCAG AA: focus management, color contrast, ARIA attributes.
- Code in `packages/components` uses `KBQ_WINDOW` and `DOCUMENT` instead of browser globals, so it renders on the server.
- A new component also needs its alias, API guard entry, dev app, e2e scenarios and docs navigation entry. The full list is in [AGENTS.md](../../AGENTS.md#component-structure-pattern).
