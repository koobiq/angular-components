The `kbq-flag` component displays a small country flag. The flag itself (an SVG or an image) is
supplied via content projection, while the component only handles presentation: shape, size, shadow
and accessibility.

Flag images can be taken from the [country-flag-icons](https://www.npmjs.com/package/country-flag-icons) package:

- Full ISO 3166-1 coverage. Every country is identified by a two-letter code (RU, DE, FR).
- Flags are redrawn for small sizes: details are simplified so flags stay recognizable even at icon size.
- Actively maintained, MIT licensed.

<!-- example(flag-overview) -->

## Aspect ratio

By default flags use a 3:2 ratio. This is the primary format — use it in most scenarios: inline with
text, lists, selects.

Square flags (`shape="square"`) are for cases where 3:2 does not fit: avatar-like selectors, compact
circles, dense grids. Provide the square image variant (the `1x1` subpackage) for them. Most 1:1
versions are a center crop of the 3:2 flag; for flags that lose meaning when cropped, the package
ships dedicated square variants (e.g. EU and KR).

<!-- example(flag-square) -->

## Inset shadow: separating from the background

Flags get a thin inset shadow (an inset outline) along the edge. Without it a flag blends into the
background: lots of white blends with a light page, black or dark areas blend with a dark theme.

The shadow color adapts to the theme: dark in the light theme, lighter in the dark one. The shadow is
on by default (`shadow="inset"`); disable it with `shadow="none"`.

<!-- example(flag-shadow) -->

## A flag is not a language

A flag denotes a country or region, not a language. Do not use a flag to pick an interface language:
one language is spoken in several countries (Spanish is not only Spain), and one country may have
several languages.

<!-- example(flag-language) -->

## When the flag is missing

First check availability via `hasFlag(code)` and do not render nothing:

```ts
import { hasFlag } from 'country-flag-icons';

hasFlag('RU'); // true
hasFlag('ZZ'); // false
```

For an unknown or invalid code show a neutral placeholder — add the `kbq-flag_empty` class and do not
project an image.

<!-- example(flag-fallback) -->

If you need a non-country flag (organization, historical or disputed territory, federal subject), do
not add it to country-flag-icons — project your own image into the same `kbq-flag` so usage stays the
same. For supranational flags (other than the EU) create your own images in the project. To show a
flag at a large size, use original, detailed flags from a third-party package — in country-flag-icons
they are simplified for small sizes.

## Accessibility

A flag must always have a text alternative. If the flag carries meaning and has no adjacent text, pass
a caption via `label`: the component gets `role="img"` and an accessible name. If there is already
adjacent text (inline, option, block), the flag is decorative — mark it `decorative` so it is hidden
from screen readers and does not duplicate the caption.

<!-- example(flag-accessibility) -->

## Examples

### With shadow and volume

A gradient imitating folds is layered over the image; the flag is rounded and casts a shadow.

<!-- example(flag-stylized) -->

### Circular flag

Use `shape="circle"` together with a square (1:1) image.

<!-- example(flag-circle) -->

### Integer sizes

Choose a flag size whose dimensions are multiples of a pixel — otherwise the image edges will be
blurry.

<!-- example(flag-sizes) -->
