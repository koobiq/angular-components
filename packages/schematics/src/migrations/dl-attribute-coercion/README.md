# dl-attribute-coercion

Migration schematic invoked automatically by `ng update @koobiq/components@20` (registered for
`20.3.0-0`). Reports the `<kbq-dl>` attributes whose coercion changed. It never writes to the tree.

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

| Pattern                                           | Manual migration                                          |
| ------------------------------------------------- | --------------------------------------------------------- |
| `<kbq-dl wide>` / `<kbq-dl vertical>`             | Remove the attribute if it was meant to do nothing        |
| `<kbq-dl minWidth="700">` and the two `*MinWidth` | The value is a number now; a non-numeric one is undefined |

## Notes with no call site to point at

- `minWidth`, `dtMinWidth` and `ddMinWidth` report `number | undefined`, which is what an unbound
  description list always held.

## Running it manually

```
ng generate @koobiq/components:dl-attribute-coercion --project my-app
```
