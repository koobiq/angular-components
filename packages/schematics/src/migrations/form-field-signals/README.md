# form-field-signals

Migration schematic invoked automatically by `ng update @koobiq/components`.
Migrates consumers of the full `@koobiq/components/form-field` review: the signal-based `KbqFormField` /
`KbqHint` API, the new accessibility semantics of the cleaner and the password toggle, and the removal of the
deprecated `mixinColor`.

## Why

`KbqFormField` finished its migration to signal queries and `KbqHint` to signal inputs, so every programmatic
read of those members needs a call. The icon-only cleaner and password toggle became real buttons with a
localized accessible name, which means the component now owns the `aria-label` a consumer used to set by hand.
`KbqFormFieldControl` followed: the state of every control is a signal, and `stateChanges` is gone.
Template _bindings_ (`[fillTextOff]`, `[compact]`, …) keep working — only programmatic reads/writes
and template-reference reads break.

| Member                                                                                                        | Before                  | After                                    | Auto-fix                         |
| ------------------------------------------------------------------------------------------------------------- | ----------------------- | ---------------------------------------- | -------------------------------- |
| `KbqFormField.cleaner` / `passwordToggle`                                                                     | `T \| null`             | `Signal<T \| undefined>`                 | ✅ read → call                   |
| `KbqFormField.hint` / `prefix` / `suffix`                                                                     | `QueryList<T>`          | `Signal<readonly T[]>`                   | ✅ read → call                   |
| `KbqFormField.hasCleaner` / `hasHint` / `hasPasswordToggle` / `hasPrefix` / `hasStepper` / `hasSuffix`        | getter                  | `Signal<boolean>`                        | ✅ read → call                   |
| `KbqHint.fillTextOff` / `compact` (also on `KbqError`, `KbqReactivePasswordHint`)                             | `boolean` input         | `InputSignalWithTransform`               | ✅ read → call                   |
| `<kbq-cleaner [attr.aria-label]>`                                                                             | plain attribute binding | `[aria-label]` input                     | ✅ rewritten                     |
| `fiedset-theme` stylesheet                                                                                    | misspelled filename     | `fieldset-theme`                         | ✅ renamed                       |
| `mixinColor` / `CanColorCtor`                                                                                 | exported from `core`    | removed                                  | ⚠️ warn                          |
| `KbqA11yLocaleConfiguration`                                                                                  | 8 keys                  | +`clear`, `showPassword`, `hidePassword` | ⚠️ warn                          |
| `KbqFormFieldRef.control`                                                                                     | `any`                   | `Signal<KbqFormFieldControlRef>`         | ⚠️ warn                          |
| `value` / `id` / `placeholder` / `focused` / `empty` / `required` / `disabled` / `errorState` of the controls | property or getter      | `Signal`                                 | ✅ read → call, write → `.set()` |
| `KbqFormFieldControl.stateChanges`                                                                            | `Observable<void>`      | removed                                  | ⚠️ warn                          |

`control`, `stepper` and `connectionContainerRef` were already signals before this release and are deliberately
left alone — appending `()` to them would be a double call.

## What it does (auto-fix)

The schematic walks every `.ts`, `.html`, `.scss` and `.css` file in the project (skipping `node_modules` and
`dist`) and, for files that reference the form field:

- **TypeScript reads.** For a receiver whose static type is annotated `KbqFormField`, `KbqHint`, `KbqError` or
  `KbqReactivePasswordHint` (method/function params, class fields — including
  `@ContentChild(KbqFormField) x: KbqFormField` and constructor parameter-properties — and typed locals), a read
  of a migrated member becomes a call: `formField.hasHint` → `formField.hasHint()` (incl. optional chain
  `formField?.hint` → `formField?.hint()`).
- **Control state.** On a receiver typed `KbqSelect`, `KbqTreeSelect`, `KbqTimezoneSelect`, `KbqTagList`,
  `KbqTimepicker`, `KbqDatepickerInput`, `KbqInput`, `KbqInputPassword`, `KbqTextarea` or `KbqFormFieldControl`,
  a read of `value`, `id`, `placeholder`, `focused`, `empty`, `required`, `disabled` or `errorState` becomes a
  call. A write becomes `.set()` where the member stays writable — `disabled` on the selects, the tag list, the
  timepicker and the datepicker input, `value` on the native-element controls and the tag list.
- **Template reference reads.** For a `#ref` bound to `<kbq-form-field>`, `<kbq-hint>`, `<kbq-error>`,
  `<kbq-reactive-password-hint>`, `<kbq-select>`, `<kbq-tree-select>`, `<kbq-timezone-select>` or
  `<kbq-tag-list>`, reads through that ref are rewritten in the same template (external `.html` and inline
  `template:` strings).
- **Cleaner accessible name.** `<kbq-cleaner [attr.aria-label]="…">` → `<kbq-cleaner [aria-label]="…">`. The
  component now writes `aria-label` from a host binding, so an `attr.` binding is silently overwritten by the
  localized default.
- **Stylesheet import.** `fiedset-theme` → `fieldset-theme`.

All rewrites are idempotent — running twice does not double the call.

## What it does _not_ do (warn-only)

These changes can't be rewritten safely and are surfaced as warnings (in both `fix` and dry-run mode):

| Change                                                                    | Manual migration                                                                                                                                                           |
| ------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `formField.hint.changes` / `.first` / `.last` / `.toArray()` / `.get(i)`  | The content queries are signals over a readonly array. React with `computed()` / `effect()` instead of `.changes`, and index the array instead of the `QueryList` helpers. |
| `formField.cleaner === null`                                              | `cleaner` / `passwordToggle` now return `undefined` when absent. Use a truthiness check or `== null`.                                                                      |
| `hint.fillTextOff = …` / `hint.compact = …`                               | Read-only signal inputs now. Drive them with a template binding (`[fillTextOff]="…"`), not an assignment.                                                                  |
| `formField.cleaner = …` / `hint` / `prefix` / `suffix` / `passwordToggle` | Read-only signal content queries now. Project the content instead — code that assigned a query result (usually a test faking it) has to render the real component.         |
| `mixinColor(...)` / `CanColorCtor`                                        | Removed. Extend `KbqColorDirective`, which exposes the same `color` input and `colorClassName` getter.                                                                     |
| A custom `KbqA11yLocaleConfiguration`                                     | Add the three new keys — `clear`, `showPassword`, `hidePassword` — used for the accessible names of the cleaner and the password toggle.                                   |
| `inject(KBQ_FORM_FIELD_REF)` + `formField.control.<member>`               | `control` is typed now. The read was silently `undefined` and has to become `formField.control().<member>`.                                                                |
| `KbqTrim.trim(...)`                                                       | Typed `(value: unknown) => unknown`. Narrow or cast the result.                                                                                                            |
| `<kbq-error role="…">` / `<kbq-cleaner role="button">`                    | `kbq-error` renders `role="alert"` + `aria-atomic` and `kbq-cleaner` renders `role="button"` themselves. Drop the hand-rolled attributes.                                  |
| `implements KbqFormFieldControl`                                          | Expose the state as signals and drop `stateChanges`: the form field derives its state from the signals.                                                                    |
| `formField.control().stateChanges`                                        | Removed. Read the state signals in `computed()` / `effect()`, or turn one into a stream with `toObservable()`.                                                             |
| A write to a read-only control member (`select.placeholder = …`)          | Bind it in the template, or set the value through a form control.                                                                                                          |
| `KbqErrorStateTracker` / `CanUpdateErrorState`                            | The tracker takes no `stateChanges` subject; `errorState` is a `Signal<boolean>`; the interface no longer declares `errorStateMatcher`.                                    |
| `mixinErrorState(...)` / `CanUpdateErrorStateCtor`                        | Removed. Track the error state with `KbqErrorStateTracker`.                                                                                                                |
| `KbqTagTextControl` / `KbqIconErrorStateContext`                          | Their state members are signals; `KbqIconErrorStateContext.stateChanges` was removed.                                                                                      |

## Behaviour changes without a code fix

- The form field now writes `aria-describedby` on the control, referencing every rendered hint and — while the
  control is invalid — the error. Tests that assert on the control's attributes will see the new value.
- `KbqInput`, `KbqInputPassword` and `KbqSelect` render `aria-invalid`; `KbqSelect` also renders `aria-required`.
- `.kbq-form-field_no-borders` and `.kbq-form-field_in-overlay` no longer use `!important`: they override the
  `--kbq-form-field-*` tokens instead. A stylesheet that fought the old `!important` can be simplified.
- `KbqDatepicker` is no longer provided as a `KbqFormFieldControl`; the form field always finds the
  `kbqDatepicker` input, which now renders its `id` for the label.

## Running it manually

```
ng generate @koobiq/components:form-field-signals --project my-app
```

Pass `--fix=false` to see what would change without writing files.

## Limitations

Receivers are matched by explicit type annotation only (no cross-package type inference), so aliased/inferred
receivers (`const f = this.formField; f.hasHint`) are left untouched. After running, **always inspect the diff**
and act on the warnings before committing.
