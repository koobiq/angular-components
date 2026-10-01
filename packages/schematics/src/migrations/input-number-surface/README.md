# input-number-surface

Migration schematic invoked automatically by `ng update @koobiq/components@20`
(registered for `21.0.0-0`). Rewrites reads of the four `KbqNumberInput` members that became signals,
and reports everything else: the members that disappeared with the `KbqFormFieldControl` surface the
directive declared and never populated, the validator directives that gained a `Kbq` prefix, and the
behaviors that changed without a call site to point at.

## `min`, `max`, `step` and `bigStep` are `input()` signals

A read becomes a call. The value is unchanged, so this part is auto-fixed:

```ts
// before
const span = numberInput.max - numberInput.min;
// after
const span = numberInput.max() - numberInput.min();
```

The rewrite is scoped, not textual. `min`, `max` and `step` are among the most common property names
there are, so a bare `\.min\b` match would rewrite a plain object literal's bounds. Only two receivers
qualify:

- an identifier this file **annotates** as `KbqNumberInput` — a parameter, a field, a local, or a
  `viewChild(KbqNumberInput)` initializer. There is no cross-package type resolution, so a receiver
  whose type is only inferred is left alone.
- a template reference bound through the directive's `exportAs`: `#ref="kbqNumberInput"` or the
  `kbqNumericalInput` alias. Both external and inline templates.

Template **bindings** are untouched — `[min]="lower"`, `min="3"` and `big-step="2"` all still work, and
`big-step` is now as reactive as `[bigStep]` rather than being read once at construction.

A programmatic **write** (`numberInput.min = 0`) is reported, not rewritten: an `input()` is read-only
and has no `.set()`, so the binding has to take over. The rewrite is idempotent — an already-migrated
`min()` is left alone, so running it twice is safe.

## `KbqInputPassword` mints its ids in its own namespace

It shared the `kbq-input-` counter with `KbqInput`, so any page holding both controls emitted two
elements with the same id, and the form field's `<label for>` resolved to whichever came first. A
password field now renders `id="kbq-input-password-7"` where it used to render `id="kbq-input-7"`.

Reported, not rewritten: a hand-written reference to a generated id is a symptom, and the fix is
usually to stop depending on the generated value rather than to renumber it.

## `valueChange` and `disabledChange` are Subjects

Both were `EventEmitter`. Subscribing is unchanged; a call to `.emit()` becomes `.next()`. Reported
rather than rewritten: those two names are far too common to match blind.

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

## What it does _not_ rewrite

A member that was always `undefined` has no replacement expression, and the validator rename is safe to
leave in place until the deprecated aliases are dropped.

| Pattern                                                          | Manual migration                                                   |
| ---------------------------------------------------------------- | ------------------------------------------------------------------ |
| `numberInput.errorState` / `.ngControl` / `.empty` / `.required` | Read them off the sibling `KbqInput` or off the `<kbq-form-field>` |
| `numberInput.min = 0`                                            | Bind `[min]="0"` — an `input()` has no `.set()`                    |
| `numberInput.valueChange.emit(v)`                                | `numberInput.valueChange.next(v)`                                  |
| `import { MinValidator } from '@koobiq/components/input'`        | `import { KbqMinValidator } …`                                     |
| `<input kbqNumberInput type="number">`                           | Drop the attribute                                                 |
| `inputElement.valueAsNumber`                                     | `numberInput.valueAsNumber`, or read the form control              |
| `#kbq-input-7` on a password field                               | Stop keying on a generated id, or use `kbq-input-password-7`       |

A receiver whose `KbqNumberInput` type is inferred rather than written down is also out of reach, as
are the forms no structural match can see — an index read (`refs['input'].min`) and destructuring
(`const { min } = numberInput`). Nothing about those is reported, so check them by hand.

## Also in the release, with nothing to migrate

- The numeric inputs coerce their value, so a static attribute (`min="3"`) holds the number `3` rather
  than the string `"3"`. The `ngAcceptInputType_*` declarations that used to carry that are gone: a
  signal input types what it accepts through its transform's parameter.
- The validators no longer `parseInt` their bound value, so `[min]="0.5"` validates against `0.5`
  instead of `0`, and a bound `[min]="0"` reaches the DOM instead of being dropped by a falsy check.
- Stepping runs in integer space against a decimal scale, so one arrow press on `1.005` with
  `step="0.001"` renders `1,006` rather than `1,0059999999999998`.
- `KbqNumberInput` carries spinbutton semantics: `role`, `aria-valuenow`, `aria-valuetext`,
  `aria-valuemin`, `aria-valuemax` and `inputmode`.
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
