# flag-inner-html

Migration schematic invoked automatically by `ng update @koobiq/components@20`
(registered for `21.0.0-0`). Moves `[innerHTML]` bindings off the `<kbq-flag>` host element onto the
`svg` input the flag review added, and reports the behavior changes that have no call site to point
at.

## Background

`KbqFlag` renders `<ng-content />`, so the host element is where projected nodes land. A parent
binding `[innerHTML]` on `<kbq-flag>` compiles to a write of `hostElement.innerHTML` during the
parent's update pass — the same element. The two only coexisted because the component's own view
contributed no DOM: with nothing projected there was nothing for the write to destroy, which is why
every published example got away with it.

The review gave the string form a slot of its own:

```html
<!-- before -->
<kbq-flag decorative [innerHTML]="flag" />

<!-- after -->
<kbq-flag decorative [svg]="flag" />
```

The `svg` input renders into a `<span>` inside the component's view, so projected content and string
content no longer compete for the host element. The value is unchanged — Angular's sanitizer still
strips an `<svg>` that has not been bypassed, so a flag coming from a package as a string still has to go through
`DomSanitizer.bypassSecurityTrustHtml`, and only ever for markup known at build time.

## What it rewrites

`[innerHTML]` → `[svg]`, inside `<kbq-flag …>` opening tags only, in `.ts` and `.html` files that
reference the flag. A binding on any other element — including one on a wrapper projected _into_ a
flag — is left alone, because there the write targets an element the component does not own.

## Notes with no call site to point at

- **A flag with no `label` is now `aria-hidden`.** The unlabelled, non-decorative flag reached the
  accessibility tree as a nameless graphic, which the guide already called out as the one case that
  must not happen. Give a meaningful flag a `label` — including one whose only name came from the
  projected image (`alt`, an SVG `<title>`), which the default now hides.
- **An inline `<svg>` is cropped instead of letterboxed.** `object-fit: cover` is inert on an inline
  `<svg>` — it is not a replaced element — so a source whose ratio differed from the shape rendered
  with transparent bands; `square` and `circle` were the visible cases. The same flag passed as an
  `<img>` always cropped, and the two now match.
- **`--kbq-flag-empty-background` resolves to an opaque neutral** instead of the translucent disabled
  state, so the `empty` placeholder no longer takes on the hue of the surface behind it.
- **The flag tokens are declared at zero specificity.** An override that used to lose to `.kbq-flag`
  on source order now wins, so a redundant `!important` or an extra selector can be dropped.

## Running it on its own

```bash
ng g @koobiq/components:flag-inner-html --project <your project>
```
