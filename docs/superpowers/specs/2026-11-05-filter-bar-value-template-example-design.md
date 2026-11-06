# filter-bar-value-template example — design

## Intent

The example `filter-bar-multi-tree-select-value-template` must demonstrate `valueTemplate` in every pipe
type that supports it, with all pipes searchable. After that the example gets a generic name and a new
description. Motivation: the caption example became uniform, so the custom-template example should show
the full feature, not just `multi-tree-select`.

## Decisions (agreed with the user)

- **One template per family**: a flat template for `select` + `multiselect`, a tree template for
  `tree-select` + `multi-tree-select`. No shared template across families.
- **Align the `tree-select` value-template context with `multi-tree-select`**: pass
  `{ $implicit: this, option: getSourceNode(node), search: searchControl.value }` instead of
  `{ $implicit, option: node }`. Without this the tree template loses icons/count (flat node has no
  custom fields) and highlighting (no `search`). Safe: `valueTemplate` for `tree-select` is introduced
  by this same PR and is not released yet.
- **All four pipes in the example have `search: true`.** With a `valueTemplate`, search matches only
  `name` (existing library behavior, already documented).
- Example renamed to **`filter-bar-value-template`**, mdx section renamed to «Custom option content» /
  «Кастомное содержимое опций», description rewritten for all four pipe types.

## Changes

1. **Library** (`pipe-tree-select.html`, `pipe-tree-select.ts` if typing needs it): value-template
   context becomes `{ $implicit: this, option: getSourceNode(node), search: searchControl.value }`,
   reusing `KbqMultiTreeSelectValueTemplateContext`. Unit test update in `pipe-tree-select.spec.ts`:
   the custom template now receives the source node (custom fields) and `search`.
2. **Example** (`packages/docs-examples/components/filter-bar/filter-bar-value-template/`): four pipes —
   `Select`, `Multi select`, `Tree`, `Multi tree`; all with `search: true` and a family template.
   Flat template: name + icon/count, no highlight (flat context has no `search`). Tree template: the
   existing rich node (icon/color/name with `kbqHighlightBackground: search`/count). Same agent-state
   domain for both families.
3. **Rename plumbing**: folder, class `FilterBarValueTemplateExample`, selector, `@title`,
   `docs-examples/components/filter-bar/index.ts`, generated `loader/index.ts` + `example-module.ts`
   (via `build:docs-examples`), selector in `components-dev/filter-bar/module.ts`.
4. **Docs** (`filter-bar.en.mdx`, `filter-bar.ru.mdx`): section title, `<Example id>`, description
   (four types, per-family contexts, name-only search with `valueTemplate`, highlighting is the
   template's job in tree pipes via `search`).

## Verification

- `pipe-tree-select.spec.ts` + the other three pipe specs green; `unit:components`.
- `build:docs-examples`, `build:components`, `check-api` (context is not in the public typings of the
  pipe class — confirm no golden diff), `check-spec-types`.
- ESLint/Prettier on changed files; `docs:generate-llms` if `check-llms` flags the mdx rename.
- Manual check on the dev server: search + highlight work in all four pipes of the example.

## Left to the builder

- Exact flat data set (derived from the agent-state domain) and the flat template's styling.
- Final wording of the new mdx description.
