# app-switcher-signals

Migration schematic invoked automatically by `ng update @koobiq/components`.
Migrates consumers of `KbqAppSwitcherTrigger` to its `model()`-based API and reports the members the
app-switcher review removed.

## Why

`selectedApp` and `selectedSite` moved from a plain `@Input()` (plus a matching `output()`) to `model()`, and
several members that never did anything were dropped. Template _bindings_ keep working — `[selectedApp]`,
`[(selectedSite)]` and `(selectedAppChange)` are unchanged — so only programmatic access and reads through a
`#ref="kbqAppSwitcher"` template reference variable break.

| Member                               | Before                       | After                                         | Auto-fix                         |
| ------------------------------------ | ---------------------------- | --------------------------------------------- | -------------------------------- |
| `selectedApp`                        | `@Input()` property          | `ModelSignal<KbqAppSwitcherApp \| undefined>` | ✅ read → call, write → `.set()` |
| `selectedAppChange`                  | `output()`                   | implicit output of the `selectedApp` model    | ✅ `.subscribe` renamed          |
| `selectedSite`                       | `get`/`set` accessor input   | `ModelSignal`, **value changed**              | ⚠️ warn                          |
| `selectedSiteChange`                 | `output()`                   | implicit output, **value changed**            | ⚠️ warn                          |
| `header` / `footer`                  | properties                   | removed                                       | ⚠️ warn                          |
| `isTrapFocus` / `updateTrapFocus()`  | `KbqAppSwitcherComponent`    | removed                                       | ⚠️ warn                          |
| `getIcon()`                          | `KbqAppSwitcherDropdownApp`  | removed                                       | ⚠️ warn                          |
| `collapsed`, `app`, `site`, `toggle` | properties / optional inputs | model / `input.required`                      | ⚠️ warn                          |

## What it does (auto-fix)

The schematic walks every `.ts` and `.html` file in the project (skipping `node_modules` and `dist`) and, for
files that reference the app-switcher:

- **TypeScript access.** For a receiver whose static type is annotated `KbqAppSwitcherTrigger` (method/function
  params, class fields — including `@ViewChild(KbqAppSwitcherTrigger) x: KbqAppSwitcherTrigger` and constructor
  parameter-properties — and typed locals):
    - `trigger.selectedApp` → `trigger.selectedApp()` (incl. optional chain `trigger?.selectedApp`)
    - `trigger.selectedApp = app` → `trigger.selectedApp.set(app)`
    - `trigger.selectedAppChange.subscribe(fn)` → `trigger.selectedApp.subscribe(fn)` — `ModelSignal` implements
      `OutputRef`, so the callback signature is identical
- **Template reference reads.** For a `#ref="kbqAppSwitcher"` (or `ref-x="kbqAppSwitcher"`), reads of
  `selectedApp` through that ref are rewritten in the same template (external `.html` and inline `template:`
  strings): `switcher.selectedApp` → `switcher.selectedApp()`.

All rewrites are idempotent — an access already followed by `()`, `.set`, `.update`, `.asReadonly` or
`.subscribe` is left alone, so running twice does not double the call.

Note that `selectedApp()` is typed `KbqAppSwitcherApp | undefined`. Where the old property was read as
non-nullable (`trigger.selectedApp.name` → `trigger.selectedApp().name`), the compiler will now ask for a `!` or
a `?.` — that narrowing is yours to place.

## What it does _not_ do (warn-only)

| Change                                               | Manual migration                                                                                                                                                                                                                                                                          |
| ---------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `trigger.selectedSite` read                          | **Value changed.** The old getter returned the site with its applications already grouped; the model returns the value that was passed in. Use `trigger.selectedSite()` for the raw site, `trigger.parsedSelectedSite()` for the grouped one.                                             |
| `trigger.selectedSite = site` write                  | `trigger.selectedSite.set(site)`.                                                                                                                                                                                                                                                         |
| `trigger.selectedSiteChange`                         | Now the implicit output of the model: `trigger.selectedSite.subscribe(…)`. It emits the raw site, not the grouped one.                                                                                                                                                                    |
| `trigger.selectedAppChange.emit(app)`                | No longer an emitter — `trigger.selectedApp.set(app)`.                                                                                                                                                                                                                                    |
| `trigger.header` / `trigger.footer`                  | Removed. The popup never rendered either, so the value was pushed into the overlay and dropped — delete the usage.                                                                                                                                                                        |
| `popup.isTrapFocus` / `popup.updateTrapFocus(…)`     | Removed from `KbqAppSwitcherComponent`. The template never bound `[cdkTrapFocus]`, so neither did anything.                                                                                                                                                                               |
| `row.getIcon(icon)`                                  | Removed from `KbqAppSwitcherDropdownApp`. Inline markup is sanitized by `KbqAppSwitcherIconSanitizer` and rendered by the component itself.                                                                                                                                               |
| `KbqAppSwitcherListItem.collapsed`                   | Now a `model()`: read `collapsed()`, write `collapsed.set(v)`.                                                                                                                                                                                                                            |
| `app` / `site` inputs of the internal row components | Now `input.required` signals and must be bound.                                                                                                                                                                                                                                           |
| Inline `icon` SVG markup                             | Sanitized against a strict SVG allow-list before rendering: `<script>`, `<style>`, `<foreignObject>`, HTML elements, every `on*` handler and any external reference are removed, and markup that changes shape when re-parsed is dropped entirely (the row then falls back to `iconSrc`). |

## Behaviour changes with no call site to migrate

Printed once per run:

- `KbqAppSwitcherModule` no longer provides `FocusTrapFactory` / `FOCUS_TRAP_INERT_STRATEGY`. The app-switcher
  never rendered a focus trap, and those providers are injector-wide: they disabled the CDK inert strategy for
  every other focus trap in the same scope. Provide them explicitly where they are actually needed.
- `defaultGroupBy` identifies a synthetic group by its type name instead of an empty `id`.
- The popup hides itself when it scrolls out of an ancestor marked `kbq-hide-nested-popup`. The guard that used
  to suppress this never passed, so the behaviour is effectively new.

## Running it manually

```
ng generate @koobiq/components:app-switcher-signals --project my-app
```

Pass `--fix=false` to see what would change without writing files.

## Limitations

Receivers are matched by explicit `KbqAppSwitcherTrigger` type annotation only (no cross-package type
inference), so aliased or inferred receivers (`const t = this.trigger; t.selectedApp`) are left untouched.
`selectedSite` is intentionally **not** auto-rewritten because its value semantics changed. After running,
**always inspect the diff** and act on the warnings before committing.
