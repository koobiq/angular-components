# divider-signals-and-aria

Migration schematic invoked automatically by `ng update @koobiq/components`.
Reports what the divider review changed for a consumer: the two inputs that became signals, and the
separator semantics the component now renders itself. It never writes to the tree.

It reads `.ts` and `.html`. In TypeScript it resolves the receiver's declared type before reporting
anything, so only a member access on something annotated `KbqDivider` counts — `vertical` and
`paddings` are ordinary property names, and a file that renders a divider is very likely to contain
unrelated ones. Declarations of other types are tracked too, so an inner one shadowing a divider
receiver is seen to shadow it. The trade is that the type has to be written down: a receiver whose
type is only inferred is not recognised.

## Background

| Member / behaviour  | Before        | After                                        |
| ------------------- | ------------- | -------------------------------------------- |
| `vertical`          | accessor pair | `InputSignalWithTransform<boolean, unknown>` |
| `paddings`          | accessor pair | `InputSignalWithTransform<boolean, unknown>` |
| `decorative`        | —             | new input, renders `role="presentation"`     |
| separator semantics | none          | `role="separator"` + `aria-orientation`      |

Both inputs kept their names, so `[vertical]` and `[paddings]` bindings are unchanged; only TypeScript
that reads or writes them through a component reference is affected.

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

A comparison (`d.vertical === true`) is reported as a read, not a write. It keeps compiling after the
migration and quietly compares against the signal itself, so it is the case most worth looking at.

## Running it manually

```
ng generate @koobiq/components:divider-signals-and-aria --project my-app
```
