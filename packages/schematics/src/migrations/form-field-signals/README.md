# form-field-signals

Migration schematic invoked automatically by `ng update @koobiq/components`.
Migrates consumers of the full `@koobiq/components/form-field` review: the signal-based `KbqFormField` /
`KbqHint` API, the new accessibility semantics of the cleaner and the password toggle, and the removal of the
deprecated `mixinColor`.

## Why

`KbqFormField` finished its migration to signal queries and `KbqHint` to signal inputs, so every programmatic
read of those members needs a call. The icon-only cleaner and password toggle became real buttons with a
localized accessible name, which means the component now owns the `aria-label` a consumer used to set by hand.
Template _bindings_ (`[fillTextOff]`, `[compact]`, `[regex]`, …) keep working — only programmatic reads/writes
and template-reference reads break.

| Member                                                                                                                     | Before                    | After                                    | Auto-fix                         |
| -------------------------------------------------------------------------------------------------------------------------- | ------------------------- | ---------------------------------------- | -------------------------------- |
| `KbqFormField.cleaner` / `passwordToggle`                                                                                  | `T \| null`               | `Signal<T \| undefined>`                 | ✅ read → call                   |
| `KbqFormField.hint` / `passwordHints` / `prefix` / `suffix`                                                                | `QueryList<T>`            | `Signal<readonly T[]>`                   | ✅ read → call                   |
| `KbqFormField.hasCleaner` / `hasHint` / `hasPasswordHint` / `hasPasswordToggle` / `hasPrefix` / `hasStepper` / `hasSuffix` | getter                    | `Signal<boolean>`                        | ✅ read → call                   |
| `KbqHint.fillTextOff` / `compact` (also on `KbqError`, `KbqPasswordHint`, `KbqReactivePasswordHint`)                       | `boolean` input           | `InputSignalWithTransform`               | ✅ read → call                   |
| `KbqPasswordHint.regex`                                                                                                    | `RegExp \| null` property | `ModelSignal<RegExp \| null>`            | ✅ read → call, write → `.set()` |
| `<kbq-cleaner [attr.aria-label]>`                                                                                          | plain attribute binding   | `[aria-label]` input                     | ✅ rewritten                     |
| `fiedset-theme` stylesheet                                                                                                 | misspelled filename       | `fieldset-theme`                         | ✅ renamed                       |
| `mixinColor` / `CanColorCtor`                                                                                              | exported from `core`      | removed                                  | ⚠️ warn                          |
| `KbqPasswordHint.icon`                                                                                                     | `public`                  | `protected`                              | ⚠️ warn                          |
| `KbqA11yLocaleConfiguration`                                                                                               | 8 keys                    | +`clear`, `showPassword`, `hidePassword` | ⚠️ warn                          |
| `KbqFormFieldRef.control`                                                                                                  | `any`                     | `Signal<KbqFormFieldControlRef>`         | ⚠️ warn                          |

`control`, `stepper` and `connectionContainerRef` were already signals before this release and are deliberately
left alone — appending `()` to them would be a double call.

## What it does (auto-fix)

The schematic walks every `.ts`, `.html`, `.scss` and `.css` file in the project (skipping `node_modules` and
`dist`) and, for files that reference the form field:

- **TypeScript reads.** For a receiver whose static type is annotated `KbqFormField`, `KbqHint`, `KbqError`,
  `KbqPasswordHint` or `KbqReactivePasswordHint` (method/function params, class fields — including
  `@ContentChild(KbqFormField) x: KbqFormField` and constructor parameter-properties — and typed locals), a read
  of a migrated member becomes a call: `formField.hasHint` → `formField.hasHint()` (incl. optional chain
  `formField?.hint` → `formField?.hint()`).
- **Writes to `KbqPasswordHint.regex`.** `hint.regex = /x/` → `hint.regex.set(/x/)`, since `regex` is a `model()`.
- **Template reference reads.** For a `#ref` bound to `<kbq-form-field>`, `<kbq-hint>`, `<kbq-error>`,
  `<kbq-password-hint>` or `<kbq-reactive-password-hint>`, reads through that ref are rewritten in the same
  template (external `.html` and inline `template:` strings).
- **Cleaner accessible name.** `<kbq-cleaner [attr.aria-label]="…">` → `<kbq-cleaner [aria-label]="…">`. The
  component now writes `aria-label` from a host binding, so an `attr.` binding is silently overwritten by the
  localized default.
- **Stylesheet import.** `fiedset-theme` → `fieldset-theme`.

All rewrites are idempotent — running twice does not double the call.

## What it does _not_ do (warn-only)

These changes can't be rewritten safely and are surfaced as warnings (in both `fix` and dry-run mode):

| Change                                                                   | Manual migration                                                                                                                                                           |
| ------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `formField.hint.changes` / `.first` / `.last` / `.toArray()` / `.get(i)` | The content queries are signals over a readonly array. React with `computed()` / `effect()` instead of `.changes`, and index the array instead of the `QueryList` helpers. |
| `formField.cleaner === null`                                             | `cleaner` / `passwordToggle` now return `undefined` when absent. Use a truthiness check or `== null`.                                                                      |
| `hint.fillTextOff = …` / `formField.cleaner = …`                         | Read-only signals now. Drive them with a template binding (`[fillTextOff]="…"`), not an assignment.                                                                        |
| `passwordHint.icon`                                                      | Now `protected`. Derive the state from `checked` / `hasError` instead of reading the icon name.                                                                            |
| `mixinColor(...)` / `CanColorCtor`                                       | Removed. Extend `KbqColorDirective`, which exposes the same `color` input and `colorClassName` getter.                                                                     |
| A custom `KbqA11yLocaleConfiguration`                                    | Add the three new keys — `clear`, `showPassword`, `hidePassword` — used for the accessible names of the cleaner and the password toggle.                                   |
| `inject(KBQ_FORM_FIELD_REF)` + `formField.control.<member>`              | `control` is typed now. The read was silently `undefined` and has to become `formField.control().<member>`.                                                                |
| `regExpPasswordValidator[rule]`                                          | Typed `Partial<Record<PasswordRules, RegExp>>`, so indexing yields `RegExp \| undefined`. It never had entries for `Length` / `Custom`.                                    |
| `PasswordRules` / `KbqPasswordHint` / `hasPasswordStrengthError`         | Deprecated. Migrate to `KbqReactivePasswordHint`, which derives its state from the form control validators.                                                                |
| `KbqTrim.trim(...)`                                                      | Typed `(value: unknown) => unknown`. Narrow or cast the result.                                                                                                            |
| `<kbq-error role="…">` / `<kbq-cleaner role="button">`                   | `kbq-error` renders `role="alert"` + `aria-atomic` and `kbq-cleaner` renders `role="button"` themselves. Drop the hand-rolled attributes.                                  |

## Behaviour changes without a code fix

- The form field now writes `aria-describedby` on the control, referencing every rendered hint and — while the
  control is invalid — the error. Tests that assert on the control's attributes will see the new value.
- `KbqInput`, `KbqInputPassword` and `KbqSelect` render `aria-invalid`; `KbqSelect` also renders `aria-required`.
- The generated id of `KbqPasswordHint` changed prefix from `kbq-hint-N` to `kbq-password-hint-N`, so it no longer
  collides with `KbqHint`. Nothing should depend on a generated id, but selectors keyed on it will stop matching.
- `.kbq-form-field_no-borders` and `.kbq-form-field_in-overlay` no longer use `!important`: they override the
  `--kbq-form-field-*` tokens instead. A stylesheet that fought the old `!important` can be simplified.

## Running it manually

```
ng generate @koobiq/components:form-field-signals --project my-app
```

Pass `--fix=false` to see what would change without writing files.

## Limitations

Receivers are matched by explicit type annotation only (no cross-package type inference), so aliased/inferred
receivers (`const f = this.formField; f.hasHint`) are left untouched. After running, **always inspect the diff**
and act on the warnings before committing.
