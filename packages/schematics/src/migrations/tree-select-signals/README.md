# tree-select-signals

Migration schematic invoked automatically by `ng update @koobiq/components@20`
(registered for `20.3.0-0`). Reports the `KbqTreeSelect` members that became signal-backed, protected
or disappeared in the tree-select review. It never writes to the tree.

## Background

The review typed the surface and dropped the members that only existed to feed the template:

| Member                                                                                          | Before            | After                       |
| ----------------------------------------------------------------------------------------------- | ----------------- | --------------------------- |
| `valueChange`                                                                                   | declared output   | removed                     |
| `getPanelClasses()`, `getPanelTheme()`, `isRtl()`, `transformOrigin`                            | public            | removed                     |
| `hiddenItemsText`, `hiddenItemsTextFormatter`                                                   | accessor / method | signal inputs               |
| `hiddenItems`, `colorForState`                                                                  | plain members     | `WritableSignal` / `Signal` |
| `options`, `tags`, `overlayDir`, `triggerRect`, `panelDoneAnimatingStream`, `changeDetectorRef` | public            | `protected`                 |
| `KbqTreeSelectChange`                                                                           | `value: any`      | generic, typed `value`      |

`valueChange` deserves a note. It was declared and documented as the other half of a two-way binding
on a `value` input that does not exist, and nothing ever emitted it — so `(valueChange)` never fired.
Removing it changes nothing at runtime: Angular treats an unmatched `(x)` as a DOM event listener,
which stays just as silent. Listen to `(selectionChange)`.

## What it does _not_ do

Nothing is rewritten. A read of a signal member becomes a call, a write becomes a template binding,
and a removed member has no replacement expression at all.

| Pattern                                                                     | Manual migration                                                      |
| --------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| `valueChange`                                                               | Listen to `(selectionChange)`                                         |
| `.getPanelClasses()` / `.getPanelTheme()` / `.isRtl()` / `.transformOrigin` | Bind `[panelClass]` if the panel needs styling                        |
| `.hiddenItemsText = …` and friends                                          | Bind the input — a signal member takes no assignment                  |
| `.hiddenItemsText` and friends                                              | Read them as calls                                                    |
| `.options` / `.tags` / `.overlayDir` / …                                    | Protected; use the open/close API, the inputs and `(selectionChange)` |

## Notes with no call site to point at

- `KbqTreeSelectChange` is generic and its `value` is no longer `any`. A handler that relied on the
  implicit widening needs the type argument.
- The embedded tree is set up through `KbqTreeSelection.initializeForEmbedding()` instead of a
  second manual `ngAfterContentInit()`. The old path left duplicate subscriptions on query lists that
  are never re-created, so every options change was handled several times — on the search-filtering
  hot path.
- The dead `{ provide: KbqTree, useExisting: KbqTreeSelect }` provider is gone. `KbqTreeSelect` never
  satisfied `KbqTree` structurally, so anything injecting `KbqTree` from inside a tree-select was
  getting an object that only looked right.
- The component renders a host `id` and carries combobox ARIA, so the form field label's `[attr.for]`
  resolves instead of dangling.

## Running it manually

```
ng generate @koobiq/components:tree-select-signals --project my-app
```
