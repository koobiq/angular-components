A Style Dictionary based build tool that reads design token sources from `@koobiq/design-tokens` and outputs TypeScript `const` exports consumed by the docs app.

## Directory structure

| File            | Purpose                                                                           |
| --------------- | --------------------------------------------------------------------------------- |
| `index.js`      | Entry point — registers custom SD extensions and runs the build                   |
| `sdConfig.js`   | SD platform config — token sources, output destinations, and per-category filters |
| `config.js`     | Shared path constants and auto-generated file header                              |
| `transforms.js` | Custom transforms and the `kbq/css-extended` transform group                      |
| `formats.js`    | Custom formatters that produce TypeScript output per token category               |
| `templates.js`  | Token-mapping helpers used by the formatters                                      |
| `utils.js`      | Shared utilities (capitalize, grouping, section sorting)                          |

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
