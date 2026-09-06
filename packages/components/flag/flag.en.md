The `kbq-flag` component shows a country flag. It doesn't contain images — it decorates the content passed to it: it controls the shape and shadow, and provides accessibility. So the flag looks the same in the product regardless of the image source.

To work with `kbq-flag`, we recommend the [country-flag-icons](https://www.npmjs.com/package/country-flag-icons) package:

```bash
npm install country-flag-icons
```

Package features:

- **Full ISO 3166-1 coverage**. Every country is identified by a two-letter code (RU, DE, FR).
- **Flags are redrawn for small sizes**. Most sets take detailed SVGs from Wikimedia Commons, and at interface sizes (16—24 px) the small coats of arms, inscriptions and emblems on them become illegible. In country-flag-icons the details are simplified, so flags stay recognizable even at icon size.
- Actively maintained, MIT licensed.

## Passing the flag

`kbq-flag` renders the markup you give it, and there are three ways to hand it over.

**A projected `<img>`.** The safest form — nothing is bypassed, and the browser crops the image itself.

```html
<kbq-flag decorative><img src="…/DE.svg" alt="" /></kbq-flag>
```

**A projected inline `<svg>`** written in the template. Angular compiles the SVG namespace directly, so nothing is stripped and nothing has to be bypassed.

```html
<kbq-flag decorative>
    <svg viewBox="0 0 5 3">…</svg>
</kbq-flag>
```

**The `svg` input**, for flags that arrive as a string — this is what `country-flag-icons` exports.

```ts
import { inject } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { DE } from 'country-flag-icons/string/3x2';

protected readonly flag = inject(DomSanitizer).bypassSecurityTrustHtml(DE);
```

```html
<kbq-flag decorative [svg]="flag" />
```

The bypass is not optional here: `<svg>` is not on Angular's sanitizer allowlist, so a plain string is stripped down to nothing and the flag disappears. Which is why the rule around it matters.

**Only pass `bypassSecurityTrustHtml` markup that is known at build time** — a constant imported from a flag package or from your own set. Markup that arrives over the network must never be bypassed: validate the country code, then look the flag up in the local set (see "If the package doesn't have the flag you need"). Bypassing a value that a request can influence turns the flag into a stored-XSS sink.

Do not bind `[innerHTML]` on `<kbq-flag>` itself. The host element is where projected content lands, so that write replaces it — use the `svg` input, which renders into a slot of its own.

## Shape

### Rectangle

This is the primary format — use it in most scenarios: inline with text, lists, selects. Flags with a different ratio (e.g. 4:3) are supported by overriding the `--kbq-flag-aspect-ratio` CSS variable. The variable is declared at zero specificity, so a plain class rule is enough to override it — no `!important`, no extra selectors.

<!-- example(flag-custom-ratio) -->

Whatever ratio the box is given, the flag is cropped to it — the same way for a projected `<img>` and for an inline `<svg>`. Pick a source close to the target ratio so the crop stays small.

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

A flag with no `label` is hidden from screen readers by default, so the forbidden case is never announced as a nameless graphic. That is a fail-safe, not a substitute for the markup above: the default also hides a name that comes from the flag image itself (an `alt` attribute or an SVG `<title>`), so repeat that name in `label` when the flag carries meaning.

## Examples

### With shadow and volume

The component supports styling via CSS. For example, you can add rounding, a shadow, and a gradient imitating folds.

<!-- example(flag-stylized) -->

### Integer sizes

Choose a flag size whose dimensions are multiples of a pixel — otherwise the image edges will be blurry.

<!-- example(flag-sizes) -->
