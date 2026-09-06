# icon-semantics-and-api

Migration schematic invoked automatically by `ng update @koobiq/components@20`
(registered for `21.0.0-0`). Reports the icon call sites the review reaches. It never writes to the
tree.

## Background

The review gave the three components the semantics they never had, and closed the members that only
recorded an internal decision.

| Change                                | Before                    | After                                         |
| ------------------------------------- | ------------------------- | --------------------------------------------- |
| `<i kbq-icon>`                        | in the accessibility tree | `aria-hidden="true"` by default               |
| `kbq-icon-button` on a non-`<button>` | focusable, no semantics   | `role="button"`, Enter/Space, `aria-disabled` |
| `KbqIconButton` / `KbqIconItem` DI    | no `KbqIcon` token        | provide `KbqIcon`                             |
| `KbqIcon.small`                       | published input           | removed                                       |
| `KbqIcon.name`                        | `'KbqIcon'` string        | `appliesMaxHeight` boolean                    |
| `KbqIconButton.tabindex`              | `any`                     | `number \| null`                              |
| `iconName`                            | `string`                  | `string \| undefined`                         |

`aria-hidden` deserves a note. An icon carries no text, and in nearly every place the library and its
consumers use one it repeats a label that is already in the button, the link or the row beside it —
so hidden is the right default and the eight hand-written `aria-hidden="true"` attributes in the tree
became redundant. An icon that is the only carrier of its meaning has to say so:

```html
<i kbq-icon="kbq-triangle-exclamation_16" role="img" aria-hidden="false" aria-label="Error"></i>
```

## What it does _not_ do

Nothing is rewritten. Whether an icon is decorative, what an icon button should be called, and
whether a widened content query still wants every match are all decisions the schematic cannot make.

| Pattern                         | Manual migration                                         |
| ------------------------------- | -------------------------------------------------------- |
| `small` on a plain `[kbq-icon]` | Drop it — nothing ever read it                           |
| `contentChild(KbqIcon)`         | Narrow the query if it only ever wanted a bare icon      |
| `(keydown…)` on an icon button  | `preventDefault()` to keep sole ownership of Enter/Space |
| `tabindex` on an icon button    | Pass a number (a numeric string is still transformed)    |
| `.name` on a `KbqIcon` subclass | Override the protected `appliesMaxHeight` instead        |

## Notes with no call site to point at

- The SVG resolution stream no longer terminates on the first name that does not resolve — which the
  documented font-icon default guarantees on the very first frame. A stale `<svg>` is removed on the
  fallback path and the inline `max-height` is cleared as well as set, so an element whose
  `[kbq-icon]` changes renders the icon it was asked for at the size it was asked for.
- `autoColor` is reactive: turning it on after init subscribes, turning it off resets `hasError`.
- The `--kbq-icon-*-color` tokens are no longer declared on `.kbq-icon`; they are consumed with their
  design token as the `var()` fallback, so a container can re-theme the icons inside it. A declaration
  on `.kbq-icon` sat on the element the value is used on and beat everything inherited. Reading one
  back with `getComputedStyle` now returns an empty string.
- `KbqIconRegistry` reports a missing `HttpClient` through an error notification instead of throwing
  at the call site, and looks sprite symbols up by id rather than through a `'#' + name` selector that
  a name starting with a digit made invalid.
- `kbqIconsDictProvider` maps names to URLs. Its `<`-prefixed inline branch is passed through
  Angular's HTML sanitizer, which drops `<svg>` wholesale; register inline icons through
  `KbqIconRegistry.addSvgIconLiteral()` with `bypassSecurityTrustHtml` instead.

## Running it manually

```
ng generate @koobiq/components:icon-semantics-and-api --project my-app
```
