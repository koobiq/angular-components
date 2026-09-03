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
already signals in 20.2.0 and are untouched.

## What it rewrites

| Before         | After            |
| -------------- | ---------------- |
| `spinner.size` | `spinner.size()` |

Both on receivers explicitly typed `KbqProgressSpinner` and through template reference variables on
`<kbq-progress-spinner>`, in external and inline templates. Already-migrated reads are left alone,
so the schematic is idempotent.

## What it does _not_ do

| Pattern                              | Manual migration                                                               |
| ------------------------------------ | ------------------------------------------------------------------------------ |
| `spinner.size = …`                   | Bind `[size]` in the template — the input is read-only                         |
| `.percentage` / `.dashOffsetPercent` | Now `protected`; derive what you need from the `value` you already bind        |
| `.svgCircleRadius`                   | Now `protected`; it is the SVG geometry, not a contract                        |
| `viewChild(KbqProgressSpinner)`      | The query returns the instance, so a read is a double call: `spinner().size()` |

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
