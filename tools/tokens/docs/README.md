A Style Dictionary based build tool that reads design token sources from `@koobiq/design-tokens` and outputs TypeScript `const` exports consumed by the docs app.

## Directory structure

| File             | Purpose                                                                           |
| ---------------- | --------------------------------------------------------------------------------- |
| `index.mjs`      | Entry point — registers custom SD extensions and runs the build                   |
| `sdConfig.mjs`   | SD platform config — token sources, output destinations, and per-category filters |
| `config.mjs`     | Shared path constants and auto-generated file header                              |
| `transforms.mjs` | Custom transforms and the `kbq/css-extended` transform group                      |
| `formats.mjs`    | Custom formats that produce TypeScript output per token category                  |
| `templates.mjs`  | Token-mapping helpers used by the formats                                         |
| `utils.mjs`      | Shared utilities (capitalize, grouping, section sorting)                          |

ESM, because Style Dictionary 5 and `@koobiq/tokens-builder` 4 are ESM-only.

## Sources are DTCG

`@koobiq/design-tokens` v4 authors `web/properties/*.json5` in DTCG: values live under `$value`, and
typography presets are composite tokens whose sub-properties are addressed without that segment
(`{typography.title.lineHeight}`). Style Dictionary only resolves those through the builder's
`kbq/expand-typography` preprocessor, which `sdConfig.mjs` switches on. Without it the build throws
`Reference doesn't exist` and writes nothing — see the v3 → v4 guide in `@koobiq/design-tokens`.

Two consequences show up in the formats: a token's value is `$value` rather than `value`, and a
composite's sub-properties keep their camelCase DTCG keys, so typography is filtered on `fontSize`
rather than `font-size`.

## Custom transforms

`name/without-theme-segment` drops a `light` / `dark` segment the builder leaves behind. The
builder's `name/custom-kebab` only strips the theme when it is the token's category
(`light.background.bg`); shadows are authored the other way round (`shadow.light.card`), so the
theme sits in the middle and survives.

It decides from `token.path`, never from the flattened name, because two unrelated tokens read the
same once flattened — `plt.darkBlue.1` (`--kbq-plt-dark-blue-1`) and
`states.background.highlight-current`. A name-level match collapses every dark ramp onto its light
twin and mangles `highlight-current`; requiring a whole path segment touches neither.

All transforms are composed into the `kbq/css-extended` transform group, which mirrors `kbq/css`
from `@koobiq/tokens-builder`. `color/css` is deliberately absent — with DTCG types in the sources
its filter starts firing and rewrites `transparent` into `rgba(0, 0, 0, 0)` for no gain.

## Custom formats

Each token category (typography, colors, palette/semantic, sizes, shadows) has a dedicated format.
Notable project-specific logic:

- **Color grouping** — tokens are grouped by type, with nested grouping by interactive state where applicable. Sections without a header are sorted to appear first.
- **Palette/semantic deduplication** — tokens that share the same reference are collapsed so each unique value appears only once.
- **Typography sorting** — typography tokens are deduplicated by type (one entry per style), then sorted in descending order by font-size value so the largest sizes appear first.

## Usage

Run after any changes to `@koobiq/design-tokens` to regenerate the docs data:

```bash
yarn run build:tokens:data
```

`--preserve-symlinks` is in the script because `@koobiq/tokens-builder` may be linked in through a
`portal:` while v4 is unpublished. Without it the builder resolves its own copy of Style Dictionary
and registers every hook on a class this script never sees, which surfaces as
`transforms must be an array of registered value transforms`.
