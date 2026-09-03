# tooltip-pointer-events-and-types

Migration schematic invoked automatically by `ng update @koobiq/components@20`
(registered for `20.3.0-0`). Reports the one tooltip change that reaches consumers with no code to
point at, plus the narrowed types that surface as compile errors. It never writes to the tree.

## Background

`ignoreTooltipPointerEvents` used to default to `true`, which made every tooltip pane transparent to
the pointer. That fails WCAG 1.4.13 _hoverable_: a hint that takes a while to read cannot be reached,
and a user reading at high magnification, whose pointer often ends up over the pane, loses it. The
default is now `false`.

The flip is silent. Markup that never mentioned the input compiles unchanged and behaves
differently — the pane now captures clicks meant for whatever it floats over. That is why this
migration reports the _absence_ of the input rather than its presence: a file that renders
`kbqTooltip` and never writes `ignoreTooltipPointerEvents` is exactly the file whose behaviour
changed.

Already opted out, so nothing to do for them: the built-in overflow hints (`kbq-title`,
`kbqEllipsisCenter`, the option and timezone hints) and any tooltip whose `kbqTrigger` is `manual` or
`none` — hovering such a pane neither opens nor closes it, so there is nothing hoverable to protect.

## What it does _not_ do

Nothing is rewritten. The markup whose behaviour changed is the markup that says nothing about the
input, and there is no way to tell from a template whether a given tooltip floats over a click
target.

| Pattern                                           | Manual migration                                                               |
| ------------------------------------------------- | ------------------------------------------------------------------------------ |
| `kbqTooltip` with no `ignoreTooltipPointerEvents` | Add `[ignoreTooltipPointerEvents]="true"` where a pane overlays a click target |
| `.scheduler`                                      | Removed; schedule on a scheduler you own                                       |
| `getMouseLeaveListener(delay)`                    | Drop the argument — the listener reads the trigger's own `leaveDelay`          |
| `placementChange`                                 | Handler takes `KbqPopUpPlacementValues`, not `string`                          |
| `.content` / `.header` / `.context` / `.modifier` | `unknown` and the real enum replaced `any`; a value read out needs a cast      |

## Notes with no call site to point at

- The pane carries `role="tooltip"` and the trigger points `aria-describedby` at it. A host that
  added either by hand can drop it.
- Escape closes a hover tooltip on a non-focusable element, which previously only worked while the
  trigger itself had focus.
- `KbqTooltipTrigger` can be imported standalone — `KBQ_TOOLTIP_SCROLL_STRATEGY` has a factory
  default, so the NgModule is no longer load-bearing.

## Running it manually

```
ng generate @koobiq/components:tooltip-pointer-events-and-types --project my-app
```
