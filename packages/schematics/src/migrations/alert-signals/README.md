# alert-signals

Migration schematic invoked automatically by `ng update @koobiq/components`.
Migrates consumers of `KbqAlert` to its finished signal-based public API.

## Why

`KbqAlert` finished its migration to signals and tightened its public surface. Some breaking changes can be
auto-fixed, others require manual attention. Template _bindings_ (`[compact]`, `[alertStyle]`, `[alertColor]`)
keep working — only programmatic reads/writes and template-reference reads break.

| Member                                                                             | Before                     | After                                                   | Auto-fix       |
| ---------------------------------------------------------------------------------- | -------------------------- | ------------------------------------------------------- | -------------- |
| `compact`                                                                          | `boolean` input            | `InputSignalWithTransform` (`booleanAttribute`)         | ✅ read → call |
| `alertStyle`                                                                       | `KbqAlertStyles \| string` | `InputSignal<'default' \| 'colored'>`                   | ✅ read → call |
| `alertColor`                                                                       | `get`/`set` accessor       | read-only `InputSignalWithTransform`, **value changed** | ⚠️ warn        |
| `icon` / `iconItem` / `button` / `title` / `control` / `closeButton` / `isColored` | `public`                   | `protected`                                             | ⚠️ warn        |

## What it does (auto-fix)

The schematic walks every `.ts` and `.html` file in the project (skipping `node_modules` and `dist`) and, for
files that reference the alert:

- **TypeScript reads.** For a receiver whose static type is annotated `KbqAlert` (method/function params, class
  fields — including `@ViewChild(KbqAlert) x: KbqAlert` and constructor parameter-properties — and typed locals),
  a read of a value-safe signal member becomes a call:
    - `alert.compact` → `alert.compact()` (incl. optional chain `alert?.compact` → `alert.compact()`)
    - `alert.alertStyle` → `alert.alertStyle()`
- **Template reference reads.** For a `#ref` bound to `<kbq-alert>`, reads of `compact`/`alertStyle` through that
  ref are rewritten in the same template (external `.html` and inline `template:` strings): `ref.compact` →
  `ref.compact()`.

All rewrites are idempotent — running twice does not double the call. `compact`/`alertStyle` keep the same value,
so appending `()` is safe.

## What it does _not_ do (warn-only)

These changes can't be rewritten safely and are surfaced as warnings (in both `fix` and dry-run mode):

| Change                                                                                   | Manual migration                                                                                                                                                                                                                      |
| ---------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `alert.alertColor` read                                                                  | Now a read-only `InputSignal`: read as `alert.alertColor()`. **Value changed** — the getter used to return the CSS class `kbq-alert_<color>`, it now returns the raw color (`error`). Update any code that expected the class string. |
| `alert.alertColor = …` write                                                             | The input is read-only. Drive it with the `[alertColor]` binding (or a signal in your own component), not an assignment.                                                                                                              |
| `alert.icon` / `iconItem` / `button` / `title` / `control` / `closeButton` / `isColored` | Now `protected` — inaccessible from outside. Refactor to avoid reading component internals.                                                                                                                                           |
| `[alertColor]` / `[alertStyle]` with a custom string                                     | The inputs are narrowed to the enum literals (`'error' \| 'warning' \| 'success' \| 'info'`, `'default' \| 'colored'`). Replace typos/custom strings with a valid value.                                                              |
| `<kbq-alert compact>` (bare attribute)                                                   | Now applies the `booleanAttribute` transform, so the bare attribute really enables compact (it used to be a silent no-op). Verify this is intended.                                                                                   |
| Projected content wrapped in an element                                                  | Content queries are now `descendants: false`. Project `kbq-alert-title` / `-control` / `-close-button` / the icon as **direct children** of `<kbq-alert>`, not inside a wrapper.                                                      |
| `viewChild(KbqAlert)` / `contentChild(KbqAlert)`                                         | Returns the instance whose `compact`/`alertStyle` are signals — reads are a double call (`this.alert().compact()`). Verify manually.                                                                                                  |
| `KbqAlertModule`                                                                         | No longer re-exports `A11yModule` / `PlatformModule`. Import `@angular/cdk/a11y` / `@angular/cdk/platform` directly if you relied on them.                                                                                            |

## Running it manually

```
ng generate @koobiq/components:alert-signals --project my-app
```

Pass `--fix=false` to see what would change without writing files.

## Limitations

Receivers are matched by explicit `KbqAlert` type annotation only (no cross-package type inference), so
aliased/inferred receivers (`const a = this.alert; a.compact`) are left untouched. `alertColor` is intentionally
**not** auto-rewritten because its value semantics changed. After running, **always inspect the diff** and act on
the warnings before committing.
