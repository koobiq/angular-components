Use the [country-flag-icons](https://www.npmjs.com/package/country-flag-icons) package to show a small country flag in your product:

- **Full ISO 3166-1 coverage**. Every existing country is identified by a two-letter code (RU, DE, FR).
- **Flags are redrawn for small sizes**. Most sets take detailed SVGs from Wikimedia Commons, and at interface sizes (16—24 px) the small coats of arms, inscriptions and emblems on them become illegible. In country-flag-icons the details are simplified, so flags stay recognizable even at icon size.
- Actively maintained, MIT licensed.

## Aspect ratio

By default flags use a 3:2 ratio. This is the primary format — use it in most scenarios: inline with text, lists, selects.

<!-- example(flag-aspect-ratio) -->

Square flags live in a separate subpackage and are needed where the 3:2 format does not fit: avatar selectors, compact circles, dense grids.

Most 1:1 versions are a center crop of the 3:2 flag. For flags that lose meaning when cropped this way, the package ships dedicated square variants (e.g. EU and KR) — they are substituted automatically from the same subpackage.

<!-- example(flag-square) -->

## Inset shadow: separating from the background

Flags get a thin inset shadow (an inset outline) along the edge. Without it a flag blends into the background:

- lots of white: the flag blends into the light page background.
- some flags contain black or dark colors: they blend into the background in the dark theme.

That is why the shadow color depends on the theme: in the light theme the shadow is dark, in the dark theme it lightens or is removed. The shadow is implemented as an inset box-shadow on a pseudo-element over the flag, and its color comes from a CSS variable that switches together with the theme.

<!-- example(flag-overview) -->

## A flag is not a language

A flag denotes a country or region, not a language. Do not use a flag to pick an interface language: one language is spoken in several countries (Spanish is not only Spain), and one country may have several languages.

<!-- example(flag-language) -->

## When the flag is missing

First check availability via `hasFlag(code)` and do not render nothing:

```ts
import { hasFlag } from 'country-flag-icons';

hasFlag('RU'); // true
hasFlag('ZZ'); // false
```

Then it depends on the situation.

**Unknown or invalid code.** Show a neutral placeholder (a gray rectangle, square, circle or a globe icon). Empty space is acceptable only if it does not break the layout.

<!-- example(flag-fallback) -->

**You need a non-country flag** (organization, historical or disputed territory, federal subject). Do not add it to the country-flag-icons package. Add it to your internal set so that the way it is used does not change.

**Supranational flags.** The EU flag is available as a separate 1:1 version; for the rest (ASEAN, UN, etc.) create your own images in the project.

**It is a real country, but the flag really is missing.** This is unlikely — the ISO 3166-1 standard is fully covered — but first update the package version. If the flag is outdated or missing, open an issue or PR in the package repository, and temporarily use your own image in your project.

**You need to show the flag at a large size.** In the package the flags are redrawn and simplified for small sizes. To show them at a large size you need flags in their original detail — use a third-party package. In most sources flags are provided without redrawing.

## Accessibility

If the flag carries meaning (for example, it is the only indicator of the selected country), pass a text caption:

```html
<kbq-flag label="Germany"><img src="…/DE.svg" alt="" /></kbq-flag>
```

If there is already adjacent text (inline, option, block), the flag is decorative — mark it `decorative` so it is hidden from screen readers and does not duplicate the caption.

```html
<kbq-flag decorative><img src="…/DE.svg" alt="" /></kbq-flag>
Germany
```

In short: a flag must always have a text alternative — either visible text next to it (then the flag is `decorative`), or a `label` caption for the screen reader (when there is no visible text). Only the third case is not allowed — when there is neither.

## Examples

### With shadow and volume

A gradient imitating folds is layered over the image; the flag is rounded and casts a shadow.

<!-- example(flag-stylized) -->

### Circular flag

Use the 1:1 aspect ratio version.

<!-- example(flag-circle) -->

### Integer sizes

Choose a flag size whose dimensions are multiples of a pixel — otherwise the image edges will be blurry.

<!-- example(flag-sizes) -->
