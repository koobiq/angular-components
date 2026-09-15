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
stay internal and still drive the validators, re-run from `ngOnChanges` when either input changes -
synchronously with the binding, the way the setters did.

`kbqValidationTooltip` was a setter-only input that subscribed to `incorrectInput` every time it ran, so
re-binding it stacked another subscription.

## What it rewrites

| Before                      | After                         |
| --------------------------- | ----------------------------- |
| `timepicker.format`         | `timepicker.format()`         |
| `this.timepicker()?.format` | `this.timepicker()?.format()` |
| `{{ tp.format }}` in a view | `{{ tp.format() }}`           |

On receivers typed `KbqTimepicker` - by annotation, including an aliased import, or by `inject()`,
`viewChild()` and `contentChild()` - and through `!`, parentheses and `as`. Each name is resolved in its
own scope, so a nested binding that shadows the receiver, `this` inside a `function` that rebinds it, and
a parameter that only exists in a type position are left alone. Already-migrated reads are left alone too,
so the schematic is idempotent.

The template pass follows reference variables bound through the directive's `exportAs`,
`#tp="kbqTimepicker"`, in external and inline templates. A bare `#tp` on the native `<input>` is the
element itself, so it is not touched.

## What it does _not_ do

| Pattern                                                | Manual migration                                                                      |
| ------------------------------------------------------ | ------------------------------------------------------------------------------------- |
| `.min` / `.max`                                        | `min()` / `max()` - a read without the call is always truthy; expect the bound value  |
| Any write, incl. `??=`, `+=`, `++`, `delete`           | Bind `[format]`, `[min]`, `[max]` or `[kbqValidationTooltip]`; every form is reported |
| `query.format` on an uncalled `viewChild()`            | Read it as `query()?.format()`                                                        |
| `KbqTimepicker` named in a union, array or `QueryList` | Reported with its line; resolve the receiver by hand                                  |

A `@ViewChild(KbqTimepicker)` field holds the instance itself, so its reads are rewritten with a single
`()` and no double call is suggested.

## Notes with no call site to point at

- **A re-bound `kbqValidationTooltip` no longer stacks subscriptions.** After several re-binds one rejected
  keystroke used to open every tooltip ever bound. It is an effect with a teardown now, which also gives an
  unbound tooltip its own trigger and delay back.
- **A locale change reformats the rendered time even when the placeholder was set by the consumer.**
  The effect used to return early on a consumer-provided placeholder, which skipped the reformat with
  it; the two are separate concerns now.
- **Generated ids come from the CDK `_IdGenerator`** instead of a module-level counter. The shape is
  unchanged for a default `APP_ID`: the CDK omits the app id when it is `ng`, and the counter still starts
  at 0, so a real app keeps getting `kbq-timepicker-0`. Only an app that sets `APP_ID` explicitly sees it
  in the id, right before the counter and with no separator.

## Running it manually

```
ng generate @koobiq/components:timepicker-signals --project my-app
```

Pass `--fix=false` to see what it would change without writing.
