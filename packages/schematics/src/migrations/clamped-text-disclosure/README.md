# clamped-text-disclosure

Migration schematic invoked automatically by `ng update @koobiq/components@20`
(registered for `21.0.0-0`). Reports the call sites the clamped-text review breaks. It never writes
to the tree.

## Background

The review moved the disclosure semantics onto the control that is actually operated, and returned
the trigger's styling to its owner:

| What                                                  | Before                                                | After                                     |
| ----------------------------------------------------- | ----------------------------------------------------- | ----------------------------------------- |
| `aria-expanded`                                       | on the `<kbq-clamped-text>` / `[kbqClampedList]` host | on the `[kbqClampedListTrigger]` element  |
| `role`, `tabindex`, `aria-controls`                   | nowhere, or hand-written per call site                | supplied by `KbqClampedListTrigger`       |
| `kbq-clamped-text__toggle` on the trigger             | applied to every trigger                              | applied only by the clamped-text template |
| `KbqClampedText.isCollapsed`                          | `input()` + `output()` pair                           | `model()`                                 |
| `isCollapsedChange`                                   | fired on measurement and echoed parent writes         | user intent only                          |
| `KbqClampedText.hasToggle`                            | `WritableSignal<boolean>`                             | `Signal<boolean>`                         |
| `KbqClampedText.text`, `KbqClampedText.textContainer` | public view queries                                   | `protected`                               |

Both containers are role-less wrappers, so `aria-expanded` on them conveyed nothing to assistive
technology and sat on an element the user cannot operate. The trigger — the element that takes the
click and the Enter/Space keys — carried no semantics at all, which is why the library's own
examples disagreed with each other about what to write on it.

`kbq-clamped-text__toggle` has one rule, in the clamped-text stylesheet, injected only once a
`KbqClampedText` exists. A `kbqClampedList` trigger therefore had spacing or not depending on
whether an unrelated component happened to be on the page, and both in-repo examples cancelled it
independently.

## What it does _not_ do

Nothing is rewritten. Where `aria-expanded` should be read from, what replaces a cancelled margin
and whether an `isCollapsedChange` handler wanted the mount-time value are all decisions.

| Pattern                                     | Manual migration                                                       |
| ------------------------------------------- | ---------------------------------------------------------------------- |
| `aria-expanded` on the container            | Read it off the `[kbqClampedListTrigger]` element                      |
| `.kbq-clamped-text__toggle` override        | Drop it; the list trigger has no spacing of its own now                |
| `role="button"` on the trigger              | Remove it — the directive supplies it, and an explicit role still wins |
| `(isCollapsedChange)` for the initial state | Read the state from `[(isCollapsed)]`; the output is user intent only  |
| `.hasToggle.set(…)`                         | Read-only; it is written by the measurement                            |
| `.text()` / `.textContainer()`              | Protected; query the element from your own template                    |

## Notes with no call site to point at

- Collapsing scrolls with `{ block: 'nearest', inline: 'nearest' }` instead of centering on both
  axes, so it no longer pans an ancestor horizontally. `[scrollOnCollapse]="false"` turns it off.
- Space and Enter on the trigger call `preventDefault()`. Space no longer scrolls the page while
  expanding, and a native `<button>` host no longer toggles twice from the synthetic click.
- `rows` takes a string attribute now, so `rows="3"` compiles under `strictTemplates`.
- `[debounceTime]` is re-read on every resize instead of once in `ngAfterViewInit`.
- Nothing renders before the first measurement: the toggle appears once the content is known to
  overflow, and the text stays clamped until then rather than flashing in full — including in
  server-rendered and prerendered output.

## Running it manually

```
ng generate @koobiq/components:clamped-text-disclosure --project my-app
```
