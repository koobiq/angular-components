# filter-bar-signals

Migration schematic invoked automatically by `ng update @koobiq/components@20`.
Migrates consumers of `KbqFilterBar` to its signal-based public API.

## Why

`KbqFilterBar` moved several members from accessors/getters to signals. Reading
them programmatically now requires a call, and assigning `filter` now goes
through `.set(...)`. Template _bindings_ (`[filter]`, `[(filter)]`,
`[pipeTemplates]`) keep working — only reads break.

| Member                                                                      | Before   | After             |
| --------------------------------------------------------------------------- | -------- | ----------------- |
| `filter`                                                                    | accessor | `ModelSignal`     |
| `pipeTemplates`                                                             | accessor | `InputSignal`     |
| `isChanged` / `isDisabled` / `isReadOnly` / `isSaved` / `isSavedAndChanged` | getter   | `Signal<boolean>` |

## What it does

The schematic walks every `.ts` and `.html` file in the project (skipping
`node_modules` and `dist`) and, for files that reference the filter bar:

- **TypeScript reads/writes.** For a receiver whose static type is annotated
  `KbqFilterBar` / `KbqFilterBarHost` (method/function params, class fields —
  including `@ViewChild(KbqFilterBar) x: KbqFilterBar`, constructor
  parameter-properties and `inject(KbqFilterBar)` — and typed locals), a read of
  a signal member becomes a call and a plain `filter = …` write becomes
  `.set(...)`:
    - `filterBar.filter` → `filterBar.filter()` (incl. optional chain `filterBar.filter?.name` → `filterBar.filter()?.name`)
    - `filterBar.filter = next` → `filterBar.filter.set(next)`
    - `this.filterBar.isChanged` → `this.filterBar.isChanged()`
- **Template references.** For a bare `#ref` on `<kbq-filter-bar>`, reads
  of signal members through that ref are rewritten in the same template
  (external `.html` and inline `template:` strings): `ref.isChanged` →
  `ref.isChanged()`, and in an event binding `ref.filter = saved` →
  `ref.filter.set(saved)`. `KbqFilterBar` has no `exportAs`, so a ref with a
  value (`#ref="ngModel"`) names another directive and is left alone, and so
  is a property chain that only ends in the ref's name
  (`page.filterBar.filter`). Only the expressions of the view that declares
  the ref are looked at — prose, comments and plain attributes are not — and a
  ref whose name a `@for`, `let-`, `*ngFor` or `@let` variable or another
  `#ref` shares is left alone.
- **Rename.** `KbqFilterBarRefresher` → `KbqFilterRefresher` (the old name
  stayed an alias until 21.0.0).

All rewrites are idempotent — running twice does not double the call.

## What it does _not_ do (warn-only)

Some changes require code restructuring and are surfaced as warnings without
auto-fixing:

| Pattern                          | Manual migration                                                                                                 |
| -------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| `.changes` (KbqFilterBar)        | Deprecated no-op; read `filterBar.filter()` inside an `effect(...)`, or listen to `(filterChange)`               |
| `.preparePopover()` (KbqFilters) | Removed; use `openSaveAsNewFilterPopover()` / `openChangeFilterNamePopover()`                                    |
| `viewChild(KbqFilterBar)` query  | Returns the instance, so reads are a double call: `this.filterBar().filter()` — verify manually                  |
| `KBQ_FILTER_BAR_PIPES`           | Now typed `Map<KbqPipeType, Type<KbqBasePipe>>`; wrap direct providers in `new Map([...])`                       |
| `filterBar.pipeTemplates = …`    | Read-only input, also when written through a template ref; bind `[pipeTemplates]` instead                        |
| `filterBar.filter ??= …`         | Only a plain `=` becomes `.set()`, in code or through a template ref; write the rest with `.set()` / `.update()` |

## Running it manually

```
ng generate @koobiq/components:filter-bar-signals --project my-app
```

Pass `--fix=false` to see what would change without writing files.

## Limitations

Receivers are matched by an explicit `KbqFilterBar` type annotation or an
`inject()` initializer (no type inference), so inferred receivers
(`const fb = this.filterBar; fb.filter`) are left untouched and covered by the
warnings above. A nested declaration that reuses the receiver's name, and
`this.<field>` inside a `function` that rebinds `this`, are left alone too. After running, **always inspect the diff** before committing.
