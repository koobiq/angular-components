# divider-signals-and-aria

Migration schematic invoked automatically by `ng update @koobiq/components`.
Reports what the divider review changed for a consumer: the two inputs that became signals, the
separator semantics the component now renders itself, and the stylesheet workarounds the sizing change
makes unnecessary. It never writes to the tree.

It reads `.ts`, `.html`, `.scss` and `.css`. In TypeScript it resolves the receiver's declared type
before reporting anything, so only a member access on something annotated `KbqDivider` counts —
`vertical` and `paddings` are ordinary property names, and a file that renders a divider is very likely
to contain unrelated ones. Declarations of other types are tracked too, so an inner one shadowing a
divider receiver is seen to shadow it. The trade is that the type has to be written down: a receiver
whose type is only inferred is not recognised.

## Background

| Member / behaviour  | Before                          | After                                         |
| ------------------- | ------------------------------- | --------------------------------------------- |
| `vertical`          | accessor pair                   | `InputSignalWithTransform<boolean, unknown>`  |
| `paddings`          | accessor pair                   | `InputSignalWithTransform<boolean, unknown>`  |
| `decorative`        | —                               | new input, renders `role="presentation"`      |
| separator semantics | none                            | `role="separator"` + `aria-orientation`       |
| vertical sizing     | `height: 100%`                  | spans its line, or a height token             |
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
| `height` on a divider selector       | Drop it, or move it to `--kbq-divider-size-vertical-height`           |
| `!important` on a divider margin     | Drop the `!important`; your own selector already outranks the rule    |

A comparison (`d.vertical === true`) is reported as a read, not a write. It keeps compiling after the
migration and quietly compares against the signal itself, so it is the case most worth looking at.

## Notes with no call site to point at

- A horizontal divider in a flex column that sets `align-items` used to collapse to its empty content
  and now spans the column.
- One token drives both the height and the alignment of a vertical divider, so the two cannot disagree:
  giving it a length hands the alignment back to the row, which is what a fixed-size item should follow.
  A raw `height` of your own does not do that - the divider's defaults sit at one class of specificity,
  so your `height` wins and leaves `align-self: stretch` behind it.
- A vertical divider outside a flex or grid line needs `--kbq-divider-size-vertical-height`. The token
  is declared on `.kbq-divider`, so the override has to reach the element itself. Note that a table
  cell used to be one of the places `height: 100%` did resolve, so a divider there needs the token now.

## Running it manually

```
ng generate @koobiq/components:divider-signals-and-aria --project my-app
```
