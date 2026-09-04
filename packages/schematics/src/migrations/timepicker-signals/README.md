# timepicker-signals

Migration schematic invoked automatically by `ng update @koobiq/components@20` (registered for
`20.3.0-0`). Migrates `KbqTimepicker` consumers to its signal-based inputs.

## Background

`KbqTimepicker` implements `KbqFormFieldControl`, which declares `value`, `id`, `placeholder`,
`required`, `disabled`, `focused`, `empty` and `errorState` as plain members. Those stay plain
accessors. The four inputs the timepicker owns moved.

`min` and `max` parsed in their setters and reported the parsed result:

```ts
set min(value: D | null) {
    this._min = this.getValidDateOrNull(this.dateAdapter.deserialize(value));
    this.validatorOnChange();
}
```

So an unparseable bound value read back as `null`. They report what was bound now; the parsed values
stay internal and still drive the validators, re-running them from an effect.

`kbqValidationTooltip` was a setter-only input that subscribed to `incorrectInput` and never
unsubscribed — re-binding it stacked another subscription, and the last one outlived the directive.

## What it rewrites

| Before              | After                 |
| ------------------- | --------------------- |
| `timepicker.format` | `timepicker.format()` |

On receivers explicitly typed `KbqTimepicker`. Already-migrated reads are left alone, so the
schematic is idempotent. There is no template pass: `kbqTimepicker` is an attribute on a native
`<input>`.

## What it does _not_ do

| Pattern                                 | Manual migration                                                         |
| --------------------------------------- | ------------------------------------------------------------------------ |
| `.min` / `.max`                         | `min()` / `max()`, and expect the bound value rather than the parsed one |
| `.format = …` / `.min = …` / `.max = …` | Bind them; the inputs are read-only                                      |
| `.kbqValidationTooltip = …`             | Bind `[kbqValidationTooltip]`                                            |
| `viewChild(KbqTimepicker)`              | The query returns the instance, so a read is a double call               |

## Notes with no call site to point at

- **`kbqValidationTooltip` unsubscribes.** The setter subscribed to `incorrectInput` every time it
  ran and never unsubscribed. It is an effect with a teardown now.
- **A locale change reformats the rendered time even when the placeholder was set by the consumer.**
  The effect used to return early on a consumer-provided placeholder, which skipped the reformat with
  it; the two are separate concerns now.
- **Generated ids changed shape**, from `kbq-timepicker-1` to `kbq-timepicker-a1`.

## Running it manually

```
ng generate @koobiq/components:timepicker-signals --project my-app
```

Pass `--fix=false` to see what it would change without writing.
