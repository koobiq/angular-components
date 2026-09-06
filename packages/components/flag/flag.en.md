The `kbq-flag` component shows a country flag. It doesn't contain images — it decorates the content passed to it: it controls the shape and shadow, and provides accessibility. So the flag looks the same in the product regardless of the image source.

To work with `kbq-flag`, we recommend the [country-flag-icons](https://www.npmjs.com/package/country-flag-icons) package:

```bash
npm install country-flag-icons
```

Package features:

- **Full ISO 3166-1 coverage**. Every country is identified by a two-letter code (RU, DE, FR).
- **Flags are redrawn for small sizes**. Most sets take detailed SVGs from Wikimedia Commons, and at interface sizes (16—24 px) the small coats of arms, inscriptions and emblems on them become illegible. In country-flag-icons the details are simplified, so flags stay recognizable even at icon size.
- Actively maintained, MIT licensed.

## Shape

### Rectangle

This is the primary format — use it in most scenarios: inline with text, lists, selects. Flags with a different ratio (e.g. 4:3) are supported by overriding the `--kbq-flag-aspect-ratio` CSS variable.

<!-- example(flag-aspect-ratio) -->

### Square

For the square shape, take images from the package's `1x1/` directory. Don't crop the rectangular flag yourself — a simple center crop can remove meaningful elements of the coat of arms or flag. The package already provides 1:1 versions for every country, and some flags — for example EU and KR — are redrawn from scratch so they don't lose meaning in this format.

<!-- example(flag-square) -->

### Circle

Use an image with a 1:1 aspect ratio.

<!-- example(flag-circle) -->

## Inset shadow: separating from the background

Flags get a thin inset shadow (an inset outline) along the edge. Without it a flag blends into the background:

- lots of white: the flag blends into the light page background.
- some flags contain black or dark colors: they blend into the background in the dark theme.

That is why the shadow color depends on the theme: in the light theme the shadow is dark, in the dark theme it lightens.

<!-- example(flag-overview) -->

## A flag is not a language

A flag denotes a country or region, not a language. Do not use a flag to pick an interface language: one language is spoken in several countries (Spanish is not only Spain), and one country may have several languages.

<!-- example(flag-language) -->

## If the package doesn't have the flag you need

First check availability via `hasFlag(code)` and do not render an empty gap:

```ts
import { hasFlag } from 'country-flag-icons';

hasFlag('RU'); // true
hasFlag('ZZ'); // false
```

Then it depends on the situation.

**Unknown or invalid code.** Show a neutral placeholder (a gray rectangle, square, circle or a globe icon). Empty space is acceptable only if it does not break the layout.

<!-- example(flag-fallback) -->

**You need a non-country flag** (organization, historical or disputed territory, federal subject). The package is a third-party product limited to the ISO 3166-1 standard: such flags don't belong there. Add them to your project's internal set so that the way `kbq-flag` is used doesn't change.

**Supranational flags.** The EU flag is available as a separate 1:1 version; for the rest (ASEAN, UN, etc.) create your own images in the project.

**It is a real country, but the flag really is missing.** This is unlikely — the ISO 3166-1 standard is fully covered — but first update the package version. If the flag is outdated or missing, open an issue or PR in the package repository, and temporarily use your own image in your project.

**You need to show the flag at a large size.** In the package the flags are redrawn and simplified for small sizes. To show them at a large size, use a third-party package with the original detail — most such sources don't simplify it.

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

The component supports styling via CSS. For example, you can add rounding, a shadow, and a gradient imitating folds.

<!-- example(flag-stylized) -->

### Integer sizes

Choose a flag size whose dimensions are multiples of a pixel — otherwise the image edges will be blurry.

<!-- example(flag-sizes) -->
