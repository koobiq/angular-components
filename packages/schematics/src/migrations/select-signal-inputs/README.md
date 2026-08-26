# select-signal-inputs

Migration schematic invoked automatically by `ng update @koobiq/components@20`
(registered for `20.3.0-0`). Reports the `KbqSelect` members that became signal inputs or stopped
being public in the select review. It never writes to the tree.

## Background

The trigger-label surface moved to signal inputs, and the overlay plumbing was closed:

| Member                     | Before                             | After                              |
| -------------------------- | ---------------------------------- | ---------------------------------- |
| `hiddenItemsText`          | accessor pair                      | `InputSignal<string \| undefined>` |
| `hiddenItemsTextFormatter` | overridable method                 | input holding the function         |
| `overlayDir`               | public                             | `protected`                        |
| `triggerRect`              | public                             | `protected`                        |
| `onRemoveMatcherItem`      | `$event: any`                      | `$event: Event`                    |
| `selectEvents`             | exported from `core/select/events` | removed together with the module   |

The template surface is untouched — every input kept its alias, so `[hiddenItemsText]` and
`[hiddenItemsTextFormatter]` bind exactly as before. Only programmatic access changed.

`selectEvents` was one constant whose value equalled its own name, read by nothing.

## What it does _not_ do

Nothing is rewritten. A read of a signal input becomes a call, a write becomes a template binding,
and which of the two a call site wants cannot be derived from the expression.

| Pattern                        | Manual migration                                                             |
| ------------------------------ | ---------------------------------------------------------------------------- |
| `.hiddenItemsText = …`         | Bind `[hiddenItemsText]` — an `input()` has no `.set()`                      |
| `.hiddenItemsText`             | Read it as `hiddenItemsText()`; it reports `string \| undefined`             |
| `.hiddenItemsTextFormatter`    | `hiddenItemsTextFormatter()(template, count)`; an override becomes a binding |
| `.overlayDir` / `.triggerRect` | Protected; use the open/close API and the panel inputs                       |
| `selectEvents`                 | Delete the import                                                            |

## Notes with no call site to point at

- Multiple mode orders the selection by the panel. `sortValues()` was documented as sorting by panel
  order, but its default comparator was `a.value - b.value`: `NaN` on string values, which a sort
  treats as "equal" and so leaves the arrival order in place, and plain numeric order otherwise. The
  default is the option's index in the panel now, with an unrendered value — a `KbqVirtualOption`
  under virtual scroll, or `showPreselectedValues` — sorting last. It is visible in the emitted form
  value, the trigger tags, and the option highlighted on open. `[sortComparator]` still wins:
  `(a, b) => a.value - b.value` restores the old numeric order, `() => 0` the old arrival order.
- The locale subscription created in the constructor had no teardown, and a root-provided singleton
  held every created-then-destroyed select for the lifetime of the app. That is fixed.
- The select carries combobox/listbox/option ARIA now, and the tag-remove control is keyboard
  operable, so hand-rolled `role` or `aria-*` attributes on the host are duplicates.

## Running it manually

```
ng generate @koobiq/components:select-signal-inputs --project my-app
```
