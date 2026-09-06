# progress-bar-percentage-and-aria

Migration schematic invoked automatically by `ng update @koobiq/components@20`
(registered for `21.0.0-0`). Reports the progress-bar review changes a consumer has to act on. It
never writes to the tree.

## Background

The review closed the one member that only ever existed to feed the template, and gave the bar the
progress semantics it had none of.

| Member / markup                                                  | Before          | After                                           |
| ---------------------------------------------------------------- | --------------- | ----------------------------------------------- |
| `percentage`                                                     | public getter   | `protected` computed                            |
| `aria-label` on `<kbq-progress-bar>`                             | plain attribute | input, aliased `aria-label`                     |
| `role`, `aria-valuenow`, `aria-valuemin`, `aria-valuemax`        | absent          | rendered by the host                            |
| `id` on `[kbq-progress-bar-text]` / `[kbq-progress-bar-caption]` | absent          | rendered, generated when not bound              |
| `id` on the inner track                                          | host's own `id` | removed — one element per bar carries that `id` |

`percentage` deserves a note. It was a getter over the clamped `value`, re-evaluated on every change
detection pass, and the only thing that read it was the component's own template. The clamp is still
observable: it is the width of the fill, and it is `aria-valuenow` on the host.

## What it does _not_ do

Nothing is rewritten. `percentage` has no drop-in replacement expression, and which of two competing
`aria-*` attributes survives on a host element is a decision the call site owns.

| Pattern                                               | Manual migration                                             |
| ----------------------------------------------------- | ------------------------------------------------------------ |
| `.percentage`                                         | Clamp at the call site, or read `aria-valuenow` off the host |
| `role` / `aria-value*` / `aria-labelledby` on the bar | Drop it — the component renders its own                      |
| `[attr.aria-label]` on the bar                        | Bind `[aria-label]`; the host writes that attribute itself   |

## Notes with no call site to point at

- Under `prefers-reduced-motion: reduce` an indeterminate bar used to render as a full, finished
  determinate bar: the fill was sized only inside the keyframes, so `animation: none` left it at
  `width: auto` over a track it completely covered. It is a quarter-width fill with an opacity pulse
  now, and the determinate `width` transition is suppressed under the same preference.
- The indeterminate animation interpolates `transform` only. It used to animate `width` as well,
  which forced layout on every frame of an infinite loop and made the `translateX()` percentages
  resolve against a width that was itself changing.
- `[color]` covers `theme` (the default), `contrast`, `contrast-fade` and `error`. Every other value
  used to leave both the track and the fill transparent, because the theme mixin was scoped to
  `.kbq-theme` alone; an unsupported — or falsy — value falls back to the default palette now.
- The a11y locale gained a `progressBar` key, used as the accessible name of a bar that carries
  neither an `aria-label` nor a projected `[kbq-progress-bar-text]`.

## Running it manually

```
ng generate @koobiq/components:progress-bar-percentage-and-aria --project my-app
```
