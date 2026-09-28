A Style Dictionary based build tool that reads design token sources from `@koobiq/design-tokens` and outputs TypeScript `const` exports consumed by the docs app.

## Directory structure

| File            | Purpose                                                                                  |
| --------------- | ---------------------------------------------------------------------------------------- |
| `index.js`      | Entry point — registers custom SD extensions and runs the build                          |
| `check.js`      | CI guard — rebuilds into a temporary directory and diffs it against the committed output |
| `sdConfig.js`   | SD platform config — token sources, output destinations, and per-category filters        |
| `config.js`     | Shared path constants and auto-generated file header                                     |
| `transforms.js` | Custom transforms and the `kbq/css-extended` transform group                             |
| `formats.js`    | Custom formatters that produce TypeScript output per token category                      |
| `templates.js`  | Token-mapping helpers used by the formatters                                             |
| `utils.js`      | Shared utilities (capitalize, grouping, section sorting)                                 |

## Custom transforms

A custom transform handles theme-aware token naming: for all token categories except palette and semantic, the `light-` or `dark-` prefix is stripped from token names. This means a token resolves to a single neutral name regardless of which theme context it comes from.

All transforms are composed into the `kbq/css-extended` transform group, which extends the standard SD transforms with the koobiq-specific ones from `@koobiq/tokens-builder`.

## Custom formats

Each token category (typography, colors, palette/semantic, sizes, shadows) has a dedicated formatter. Notable project-specific logic:

- **Color grouping** — tokens are grouped by type, with nested grouping by interactive state where applicable. Sections without a header are sorted to appear first.
- **Palette/semantic deduplication** — tokens that share the same reference are collapsed so each unique value appears only once.
- **Typography sorting** — typography tokens are deduplicated by type (one entry per style), then sorted in descending order by font-size value so the largest sizes appear first.

## Usage

Run after any changes to `@koobiq/design-tokens` to regenerate the docs data:

```bash
node ./tools/tokens/docs/index.js
```

Or use the predefined script:

```bash
yarn run build:tokens:data
```

The output is committed, and no docs build regenerates it, so the Linters workflow runs

```bash
yarn run check-tokens-data
```

on every pull request. It builds into `dist/tokens-docs-check/` and compares the result with the
committed files byte for byte — the generated directory is in `.prettierignore`, so the bytes are
comparable as written. When it fails, run `build:tokens:data` and commit the result; the fresh
output is left in `dist/tokens-docs-check/` for comparison.

The check is on content rather than on the version of `@koobiq/design-tokens`: the data also goes
stale when the formatters change, when a local build of the tokens is linked in, or when the same
version resolves differently.
