# divider-signals-and-aria

Migration schematic invoked automatically by `ng update @koobiq/components@20`
(registered for `21.0.0-0`). Reports what the divider review changed for a consumer: the two inputs
that became signals, and the separator semantics the component now renders itself. It never writes to
the tree.

## Background

| Member / behaviour  | Before                          | After                                         |
| ------------------- | ------------------------------- | --------------------------------------------- |
| `vertical`          | accessor pair                   | `InputSignalWithTransform<boolean, unknown>`  |
| `paddings`          | accessor pair                   | `InputSignalWithTransform<boolean, unknown>`  |
| `decorative`        | —                               | new input, renders `role="presentation"`      |
| separator semantics | none                            | `role="separator"` + `aria-orientation`       |
| vertical sizing     | `height: 100%`                  | `align-self: stretch` + a height token        |
| `paddings` margins  | `.kbq-divider_…_paddings` chain | one class, orientation matched via `:where()` |

Both inputs kept their names, so `[vertical]` and `[paddings]` bindings are unchanged; only TypeScript
that reads or writes them through a component reference is affected.

`height: 100%` is the change with the widest reach. A percentage height resolves against a parent's
_definite_ height, and a flex row has none — so a vertical divider collapsed to nothing in exactly the
toolbars it exists for, and every in-repo caller had pinned a height locally to work around it. It
spans its flex or grid line now. Outside such a line — a table cell, a plain block — it takes no height
from the parent any more and needs `--kbq-divider-size-vertical-height`.

## What it does _not_ do

Nothing is rewritten. A read of a signal input becomes a call, a write becomes a template binding, and
whether a duplicated `role` should be deleted or replaced by `decorative` depends on what the divider
is for.

| Pattern                              | Manual migration                                                      |
| ------------------------------------ | --------------------------------------------------------------------- |
| `.vertical = …` / `.paddings = …`    | Bind `[vertical]` / `[paddings]` — a signal input takes no assignment |
| `.vertical` / `.paddings`            | Read them as calls                                                    |
| `<kbq-divider role="…">`             | Drop it; the component renders `role="separator"`                     |
| `<kbq-divider aria-orientation="…">` | Drop it; it follows `vertical`                                        |
| `<kbq-divider aria-hidden="true">`   | Still honoured; `decorative` says the same thing through the input    |

## Notes with no call site to point at

- A local `height` override on a vertical divider that only existed to survive `height: 100%` can go.
- A vertical divider outside a flex or grid line needs `--kbq-divider-size-vertical-height`. The token
  is declared on `.kbq-divider`, so the override has to reach the element itself.
- The `paddings` margins come from a single class now, with the orientation matched through `:where()`,
  which contributes no specificity — a consumer class of its own overrides them without `!important`.

## Running it manually

```
ng generate @koobiq/components:divider-signals-and-aria --project my-app
```
