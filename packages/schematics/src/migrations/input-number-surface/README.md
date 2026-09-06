# input-number-surface

Migration schematic invoked automatically by `ng update @koobiq/components@20`
(registered for `20.3.0-0`). Reports the `KbqNumberInput` members that disappeared with the
`KbqFormFieldControl` surface it declared and never populated, the validator directives that gained a
`Kbq` prefix, and the two behaviors that changed without a call site to point at. It never writes to
the tree.

## Background

`KbqNumberInput` declared `implements KbqFormFieldControl<any>` and then assigned none of it. The
private `control` field behind `ngControl` had no writer anywhere in the file, so `ngControl` was
permanently `undefined`, and `id`, `placeholder`, `empty`, `required` and `errorState` were declared
only to satisfy the interface. Nothing broke, because the `KbqFormFieldControl` provider lives on the
sibling `KbqInput` — which matches the same host and supplies the real implementation — but the
members were public, so a consumer reading `numberInputRef.errorState` got `undefined` with no type
error.

| Member                                                              | Before                     | After                                    |
| ------------------------------------------------------------------- | -------------------------- | ---------------------------------------- |
| `ngControl`, `id`, `placeholder`, `empty`, `required`, `errorState` | public, always `undefined` | removed                                  |
| `MinValidator`, `MaxValidator`                                      | exported classes           | `KbqMinValidator`, `KbqMaxValidator`     |
| `MIN_VALIDATOR`, `MAX_VALIDATOR`                                    | exported providers         | `KBQ_MIN_VALIDATOR`, `KBQ_MAX_VALIDATOR` |

The unprefixed validator names are the exact names `@angular/forms` exports, so importing both in one
file shadows the framework's. The old names remain as deprecated aliases for one minor.

## Two behaviors that changed with no call site

`type="number"` on a `kbqNumberInput` is now reset to `type="text"` with a console warning. A native
number field runs the value sanitization algorithm on assignment and rejects everything the directive
renders once a group separator or a comma fraction separator is in it, so the field went blank while
the model still held the value; it also reports `selectionStart` as `null`, which disabled caret
preservation entirely.

`HTMLInputElement.prototype.valueAsNumber` is no longer redefined. The constructor used to call
`Object.defineProperty(Object.getPrototypeOf(this.nativeElement), 'valueAsNumber', …)` — that is the
prototype, not the element, so constructing one koobiq number input replaced the platform accessor for
every `<input>` in the application, permanently and with no teardown. A locale-aware numeric read is
now a member of the directive: `numberInput.valueAsNumber`.

## What it does _not_ do

Nothing is rewritten. A member that was always `undefined` has no replacement expression, and the
rename is safe to leave in place until the deprecated aliases are dropped.

| Pattern                                                          | Manual migration                                                   |
| ---------------------------------------------------------------- | ------------------------------------------------------------------ |
| `numberInput.errorState` / `.ngControl` / `.empty` / `.required` | Read them off the sibling `KbqInput` or off the `<kbq-form-field>` |
| `import { MinValidator } from '@koobiq/components/input'`        | `import { KbqMinValidator } …`                                     |
| `<input kbqNumberInput type="number">`                           | Drop the attribute                                                 |
| `inputElement.valueAsNumber`                                     | `numberInput.valueAsNumber`, or read the form control              |
| `@use '.../input/input-theme'`                                   | `@use '.../input/input-typography'`                                |

## Also in the release, with nothing to migrate

- `min`, `max`, `step` and `bigStep` coerce their value, so a static attribute (`min="3"`) holds the
  number `3` rather than the string `"3"`, and `ngAcceptInputType_*` declarations let the static form
  compile under `strictTemplates`.
- The validators no longer `parseInt` their bound value, so `[min]="0.5"` validates against `0.5`
  instead of `0`, and a bound `[min]="0"` reaches the DOM instead of being dropped by a falsy check.
- Stepping runs in integer space against a decimal scale, so one arrow press on `1.005` with
  `step="0.001"` renders `1,006` rather than `1,0059999999999998`.
- `KbqNumberInput` carries spinbutton semantics: `role`, `aria-valuenow`, `aria-valuetext`,
  `aria-valuemin`, `aria-valuemax` and `inputmode`.
- `KbqInputPassword` mints its ids in its own `kbq-input-password-` namespace through the
  application-scoped `_IdGenerator`, so a page holding a text input and a password input no longer
  emits two elements with the same id and the form field's `<label for>` resolves to its own control.
- `startFormattingFrom` is read from the input as well as from the locale, instead of being declared
  and ignored.

## Usage

```bash
ng update @koobiq/components
```

Or standalone:

```bash
ng generate @koobiq/components:input-number-surface --project=my-app
```
