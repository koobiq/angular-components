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
  including `@ViewChild(KbqFilterBar) x: KbqFilterBar` and constructor
  parameter-properties — and typed locals), a read of a signal member becomes a
  call and a `filter` write becomes `.set(...)`:
    - `filterBar.filter` → `filterBar.filter()` (incl. optional chain `filterBar.filter?.name` → `filterBar.filter()?.name`)
    - `filterBar.filter = next` → `filterBar.filter.set(next)`
    - `this.filterBar.isChanged` → `this.filterBar.isChanged()`
- **Template reference reads.** For a `#ref` bound to `<kbq-filter-bar>`, reads
  of signal members through that ref are rewritten in the same template
  (external `.html` and inline `template:` strings): `ref.isChanged` →
  `ref.isChanged()`.
- **Rename.** `KbqFilterBarRefresher` → `KbqFilterRefresher` (the old name is
  still re-exported as an alias, so this is optional cleanup).

All rewrites are idempotent — running twice does not double the call.

## What it does _not_ do (warn-only)

Some changes require code restructuring and are surfaced as warnings without
auto-fixing:

| Pattern                          | Manual migration                                                                                   |
| -------------------------------- | -------------------------------------------------------------------------------------------------- |
| `.changes` (KbqFilterBar)        | Deprecated no-op; read `filterBar.filter()` inside an `effect(...)`, or listen to `(filterChange)` |
| `.preparePopover()` (KbqFilters) | Removed; use `openSaveAsNewFilterPopover()` / `openChangeFilterNamePopover()`                      |
| `viewChild(KbqFilterBar)` query  | Returns the instance, so reads are a double call: `this.filterBar().filter()` — verify manually    |
| `KBQ_FILTER_BAR_PIPES`           | Now typed `Map<KbqPipeType, Type<KbqBasePipe>>`; wrap direct providers in `new Map([...])`         |

## Running it manually

```
ng generate @koobiq/components:filter-bar-signals --project my-app
```

Pass `--fix=false` to see what would change without writing files.

## Limitations

Receivers are matched by explicit `KbqFilterBar` type annotation only (no
cross-package type inference), so aliased/inferred receivers
(`const fb = this.filterBar; fb.filter`) are left untouched and covered by the
warnings above. After running, **always inspect the diff** before committing.
