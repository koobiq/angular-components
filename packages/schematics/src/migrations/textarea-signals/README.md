# textarea-signals

Migration schematic invoked automatically by `ng update @koobiq/components@21` (registered for
`21.0.0-0`). Migrates `KbqTextarea` consumers to its signal-based inputs.

## Background

`KbqTextarea` implements `KbqFormFieldControl`, which declares `value`, `id`, `placeholder`,
`required`, `disabled`, `focused`, `empty` and `errorState` as plain members. Those stay plain
accessors — the interface is the contract the form field reads them through. What moved are the four
inputs the textarea owns.

`canGrow` was the odd one:

```ts
get canGrow(): boolean {
    return !this.maxRowLimitReached && this._canGrow;
}
```

It reported `false` once the textarea hit `maxRows`, even though the consumer had asked for growth.
The folded value is an internal `growing` computed now, and `canGrow()` reports what was bound. At the
row limit the element keeps its own scrollbar rather than gaining a native resize handle:
`kbq-textarea_max-row-limit-reached` sets `resize: unset`, which follows `kbq-textarea-resizable` in
the stylesheet and wins on source order.

## What it rewrites

| Before                        | After                           |
| ----------------------------- | ------------------------------- |
| `textarea.maxRows`            | `textarea.maxRows()`            |
| `textarea.maxRowLimitReached` | `textarea.maxRowLimitReached()` |

On receivers explicitly typed `KbqTextarea`. Already-migrated reads are left alone, so the schematic
is idempotent. There is no template pass: `kbqTextarea` is an attribute on a native `<textarea>`, so
a reference variable is not tied to an element name the schematic can match.

## What it does _not_ do

| Pattern                                                 | Manual migration                                                      |
| ------------------------------------------------------- | --------------------------------------------------------------------- |
| `.canGrow`                                              | `canGrow()`, and expect what was bound — not `false` at the row limit |
| `.freeRowsHeight`                                       | `freeRowsHeight()`, and expect `undefined` when unbound               |
| `.canGrow = …` / `.maxRows = …` / `.freeRowsHeight = …` | Bind them; the inputs are read-only                                   |
| `viewChild(KbqTextarea)`                                | The query returns the instance, so a read is a double call            |

## Notes with no call site to point at

- **`maxRows` and `freeRowsHeight` report `number | undefined`.** Both were declared non-nullable
  while an unbound `maxRows` held `undefined`, and `maxRowLimitReached` compared against it —
  `rowsCount > undefined` is false, which is why unlimited growth worked at all. `freeRowsHeight`
  differs: `ngOnInit` used to assign the measured line height into the input, so an unbound read came
  back with a number. It stays `undefined` now, which is why the migration reports those reads rather
  than rewriting them.
- **`freeRowsHeight` no longer writes itself.** It defaulted to the measured line height by assigning
  its own input in `ngOnInit`; the fallback is a computed now, so binding it later actually takes
  effect instead of being overwritten on the next init.
- **The `kbq-textarea_max-row-limit-reached` class follows the row count directly.** It is derived
  from a signal written inside `runOutsideAngular`, so the class used to wait for an unrelated change
  detection pass to appear.
- **Generated ids come from the CDK `_IdGenerator`** instead of a module-level counter. The shape is
  unchanged for a default `APP_ID` - the CDK omits the app id when it is `ng` - and the per-prefix
  counter still starts at 0, so a real app keeps getting `kbq-textarea-0`.

## Running it manually

```
ng generate @koobiq/components:textarea-signals --project my-app
```

Pass `--fix=false` to see what it would change without writing.
