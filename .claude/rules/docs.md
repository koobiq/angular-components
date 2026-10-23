---
paths:
    - '**/*.mdx'
    - 'docs/**'
    - 'apps/docs/**'
    - 'tools/{api-gen,docs-pages,llms}/**'
---

# Documentation site

## Pipeline

- Page content is MDX next to the code: `<name>.{en,ru}.mdx` (overview), `examples.<name>.{en,ru}.mdx` (examples tab), `docs/guides/*.{en,ru}.mdx` and `docs/data-grid/**`. Every page exists in both languages — update both. `build:docs-content` compiles the pages with `tools/docs-pages` into Angular components under `dist/docs-pages`, which the app imports as `@koobiq/docs-pages` and `docsPageResolver` picks per route, so the pages are prerendered with their live examples. It also regenerates the SEO descriptions and runs `docs:api-gen` (`tools/api-gen`), which writes the public API of every entry point as typed data under `dist/docs-pages-api` (`@koobiq/docs-pages-api`) — per entry its signature as the source declares it and the members worth explaining, the JSDoc compiled to HTML — for the one component of the API tab, `DocsApiPage`, to render, and writes the manifest `check-api-docs` and `tools/llms` read to `dist/docs-content/api-manifest`.
- The same build runs `docs:generate-llms` (`tools/llms`), the documentation for agents, in English only — a model reads it just as well and answers in the language it is asked in: the Markdown of every structure item, every tab of it in one file with the full source of its examples and the API from the manifest, in `dist/docs-llms`, which the site serves next to the item's pages under every locale (`/en/components/button.md`, `/ru/components/button.md`: the same English text), each page linking its own by a relative `rel="alternate"`; `llms-full.txt`, all of it in one file; and the committed index `apps/docs/src/llms.txt`, which opens with the hand-written rules of `docs/llms/rules.md`. `check-llms` fails on a file an agent cannot read without the site: a leftover of MDX or HTML, a heading that skips a level, a link to a page the site does not have.
- `apps/docs/src/app/structure.ts` is the single source of the navigation (`hasApi`, `hasExamples`, `isNew` and `isUpdated` with an expiry date); the routes, the sitemap, the prerender route list and `llms.txt` are all derived from it. Every overview or examples tab that `structure.ts` routes to needs a page.
- After changing `structure.ts`, the first paragraph of an overview or `docs/llms/rules.md` — yours or one you rebased in — regenerate the committed metadata (`llms.txt`, `seo-descriptions.ts`, the sitemap, the prerender routes) as [generated-files.md](generated-files.md) says; CI compares every one of them.
- `docs/guides/*.{en,ru}.mdx` also feeds `@koobiq/mcp`, separately from the site: a guide has to be listed in `PUBLIC_GUIDES` (or explicitly `WITHHELD`, with a reason) in `packages/mcp/src/indexer/build-guides.ts`, then `yarn run build:mcp:data` regenerates `packages/mcp/data/guides.json` from it, which is committed. `yarn run check-mcp-data` is the gate that catches a guide added or renamed on disk without that regeneration — see `packages/mcp/README.md` for the rest of the MCP data pipeline. A public MCP guide can be `.md` instead of `.mdx` (`which-component-when` is one) to stay off the docs site on purpose: `tools/docs-pages/sources.ts` globs only `*.mdx`, while `build-guides.ts` matches either extension.

## Writing pages

- A live example is `<Example id="alert-overview" />`, with the key from `example-module.ts`. The build fails, with the position in the file, on what `tools/docs-pages/compile-page.ts` cannot turn into Angular: an unknown example, imports and `{expressions}`, HTML outside its short list of elements (write the rest in Markdown). MDX syntax applies: comments are `{/* */}`, `<br />` needs the slash, a literal `{` or `<` is escaped with a backslash. `docs:start:dev` rebuilds the pages on save.
- A component page covers what the reader must know or do — what the feature does, how to turn it off, its one trap, the example — not how it works inside. Document a shared mechanism once, on the page that owns it, and link to it. Trim both locales alike.
- The Examples tab shows only examples the Overview does not: never repeat the Overview's `<Example>` ids there, or the site shows them twice. Leave a stub page as a stub until there is a new example.
- After a substantive change to an item's page — a new section or example, new or changed behaviour; not a typo, a rewording, a regeneration or formatting — mark the item in `apps/docs/src/app/structure.ts` with `isUpdated: expiresAt('<ISO date 14 days ahead>')` as its last property, on its own line, without a trailing comma: the sidenav shows the "Updated" badge until that date, and `docs:prune-is-new-badges` removes the expired line at release staging by exactly that shape. Find the item by the `id` in the file name (`tag-autocomplete.en.mdx` → `DocsStructureItemId.TagAutocomplete`), not by the folder; one badge covers both locales and both tabs, a live `isNew` makes it redundant (the sidenav shows only "New"), and a live `isUpdated` gets its date moved rather than a second line.

## Building and checking

- The app resolves `@koobiq/*` from `dist/`. If bundling fails with "No matching export" in `dist/` while `apps/docs` has no TypeScript errors, `dist/` is stale: rebuild `build:components`, then `build:docs-examples`.
- `tsc` skips templates: check the docs app templates with `npx ngc -p apps/docs/tsconfig.app.json --noEmit`, and the examples with `yarn run build:docs-examples`, since a dev app build compiles a broken example cleanly.
