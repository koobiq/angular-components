# dl-attribute-coercion

Migration schematic invoked automatically by `ng update @koobiq/components@21` (registered for
`21.0.0-0`). Reports the `<kbq-dl>` attributes and bindings whose coercion changed. It never writes to
the tree.

## Background

`KbqDlComponent` was already fully signal-based, so the review had nothing to migrate. What it found
were the five inputs that never got a coercion transform, next to siblings that had one:

```ts
readonly verticalBreakpoint = input(400, { transform: numberAttribute });
readonly minWidth = input<number | undefined>();          // no transform
readonly wide = input(false);                              // no transform
```

So `<kbq-dl wide>` passed the empty string — falsy — and the attribute did nothing, while
`<kbq-dl resizable>` right next to it worked.

`vertical` is tri-state: `null` means "decide from `verticalBreakpoint`". `booleanAttribute` would
have folded that into `false`, so it uses a transform that preserves `null`.

## What it does _not_ do

Nothing is rewritten. Whether markup relied on a valueless `wide` being ignored is a decision the
call site owns, and so is what a non-numeric width was meant to say.

| Pattern                                      | Manual migration                                                       |
| -------------------------------------------- | ---------------------------------------------------------------------- |
| `<kbq-dl wide>` / `<kbq-dl wide="">`         | Remove it if the markup was relying on it being ignored                |
| `<kbq-dl vertical>` / `<kbq-dl vertical="">` | Rewrite as `[vertical]="false"` — see below                            |
| `wide="false"` / `vertical="false"`          | Meant true, means false now — drop the attribute to keep it true       |
| `<kbq-dl dtMinWidth>` and the other widths   | A value that is not a finite number reports `undefined`, not `0`       |
| `[wide]` / `[vertical]` / `[dtMinWidth]` …   | The bound value goes through the transform — check what it resolves to |

`<kbq-dl vertical>` is the one that looks inert and is not. The untransformed input held `''`, which
is not `null`, so the breakpoint branch never ran and the list stayed pinned horizontal. Deleting the
attribute hands that decision back to `verticalBreakpoint`; `[vertical]="false"` preserves the
behavior.

A numeric literal is not reported: `Math.max` applies `ToNumber` to its arguments, so
`<kbq-dl dtMinWidth="120">` produced `120` on either side of the change.

## Notes with no call site to point at

- `minWidth`, `dtMinWidth` and `ddMinWidth` report `number | undefined`, which is what an unbound
  description list always held. A value that is not a finite number reads as `undefined` rather than
  as `NaN`, so `?? fallback` at a call site fires.

## Running it manually

```
ng generate @koobiq/components:dl-attribute-coercion --project my-app
```
