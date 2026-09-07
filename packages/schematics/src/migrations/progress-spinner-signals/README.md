# progress-spinner-signals

Migration schematic invoked automatically by `ng update @koobiq/components@20` (registered for
`20.3.0-0`). Migrates `KbqProgressSpinner` consumers to its finished signal-based API and reports
the members the review closed.

## Background

`size` was the last accessor input on the spinner, and the reason the automated signal migration
skipped it: its setter did two things at once, storing the size and computing the SVG circle radius.

```ts
set size(value: ProgressSpinnerSize | string) {
    this._size = value;
    this.svgCircleRadius = value === 'big' ? '47%' : '42.5%';
}
```

The radius is a `computed` now and `size` is a plain `input()`. `id`, `value` and `mode` were
signals since 20.0.0, and no migration has ever covered them, so their reads are rewritten here too.

## What it rewrites

| Before          | After             |
| --------------- | ----------------- |
| `spinner.size`  | `spinner.size()`  |
| `spinner.id`    | `spinner.id()`    |
| `spinner.value` | `spinner.value()` |
| `spinner.mode`  | `spinner.mode()`  |

On receivers explicitly typed `KbqProgressSpinner`, on the `inject(KbqProgressSpinner)` and
`viewChild(KbqProgressSpinner)` forms a modern consumer writes, and through template reference
variables on `<kbq-progress-spinner>`, in external and inline templates. Already-migrated reads are
left alone, so the schematic is idempotent.

## What it cannot see

Receivers are found by explicit type annotation or by an `inject()` / `viewChild()` initializer. A
non-null assertion, parentheses and an aliased import are seen through; a type named in a position
that does not resolve to a single identifier — a union, an array, a cast, a return type — is reported
with its line number rather than rewritten, and so is `spinner['size']` or `const { size } = spinner`.

Templates report rather than rewrite when they cannot be parsed, and skip a reference whose name a
`@for` variable, an `@let` or another `#ref` also introduces. A reference is rewritten only inside the
embedded view that declares it, and only when it is bound to the spinner rather than to some other
directive through `exportAs`.

## What it does _not_ do

| Pattern                              | Manual migration                                                        |
| ------------------------------------ | ----------------------------------------------------------------------- |
| `spinner.size = …`                   | Bind `[size]` in the template — the input is read-only                  |
| `.percentage` / `.dashOffsetPercent` | Now `protected`; derive what you need from the `value` you already bind |
| `.svgCircleRadius`                   | Now `protected`; it is the SVG geometry, not a contract                 |
| `viewChild(KbqProgressSpinner)`      | The query is a signal too, so a read through it is a double call        |

## Notes with no call site to point at

- `size` is typed `ProgressSpinnerSize` (`'compact' | 'big'`) instead of accepting an arbitrary
  string, resolving a TODO that predates the review. Any other value used to fall through to the
  compact radius silently; it is a template type error now.
- `value` is a `numberAttribute` input with a `0` fallback. `value="40"` used to pass the string
  `"40"`, which the percentage arithmetic coerced by accident. Anything that is not a number reads as
  `0` rather than reaching the `stroke-dashoffset` percentage as `NaN`, which is not a length at all.

## Running it manually

```
ng generate @koobiq/components:progress-spinner-signals --project my-app
```

Pass `--fix=false` to see what it would change without writing.
