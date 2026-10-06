# filter-bar-rename-action

Migration schematic invoked automatically by `ng update @koobiq/components@21`
(registered for `21.0.0-0`). Cleans up after the filter-bar "rename" rework.

## Background

The save/rename popover used to render a caption above its name field, sourced
from `filters.name` of the filter-bar locale configuration, while its header
said either "Сохранить как новый" or "Сохранить изменения". The header now
carries the caption itself ("Новый фильтр" when saving a new filter, "Новое
название" when renaming), so the separate field caption — and its locale key —
were removed.

A taken name used to be reported twice: by `filters.error` under the name field
and by `filters.errorHint` in the alert above it. The message under the field —
and its locale key — were removed; the field is still marked invalid.

`filters.saveChanges` and `filters.saveAsNew` each did two jobs: the label of a
dropdown item and the header of the popover it opens. A field caption reads
wrong on a dropdown item, so each key was split into a `…Header` and a
`…Button` key.

The dropdown item that opens the rename popover was reworded from "Изменить" to
"Переименовать", and its action was narrowed to match the new name.

## Breaking change

**`filters.name` and `filters.error` were removed from the filter-bar locale
configuration.**

**`filters.saveChanges` and `filters.saveAsNew` were replaced** by
`saveChangesHeader` / `saveChangesButton` and `saveAsNewHeader` /
`saveAsNewButton`.

A literal typed against the configuration — a
`kbqFilterBarLocaleConfigurationProvider()` argument, for one — fails to
compile on a removed key with an excess-property error; an untyped one (a
`useValue`) silently loses the override.

## Behaviour change

**Renaming a filter no longer saves it.** `saveAsNew()` used to stamp
`saved: true` / `changed: false` onto the emitted payload in both modes, so
renaming a filter with unsaved pipe edits handed the host a payload that
declared those edits saved — and a host persisting `event.filter` wholesale
wrote them to storage. In rename mode both flags are now inherited from the
current filter, so a dirty filter stays dirty under its new name and its "save
changes" action (with its warning marker) survives the rename.

Hosts handling `KbqSaveFilterStatuses.NewName` should persist **the name only**.
The payload still carries the pipes currently shown in the bar — the component
cannot know which pipes were last persisted — so writing the whole payload back
reintroduces the old behaviour.

The default wording changed with it: the dropdown items read "Сохранить" and
"Сохранить как новый", and the alert reporting a taken name reads "Такой фильтр
уже есть".

## What it does

The schematic walks every `.ts` and `.html` file in the project (skipping
`node_modules` and `dist`).

| Auto-fix                                                                                       | Where |
| ---------------------------------------------------------------------------------------------- | ----- |
| Removes the `name` and `error` properties from a filter-bar `filters` locale literal           | `.ts` |
| Splits `saveChanges` / `saveAsNew` in such a literal into `…Header` and `…Button` (same value) | `.ts` |

Literals are found through the TypeScript AST and matched by **fingerprint**: an
object literal is treated as a `filters` section only when it carries at least
three of the section's other keys (`saveAsNewFilter`, `saveChanges`,
`saveAsNewHeader`, `actionsTooltip`, …; old and split keys both count). No type
resolution is involved — the schematic's virtual tree has no `@koobiq` types to
resolve against — so an unrelated object that merely has a `name`, `error`,
`saveChanges` or `saveAsNew` property is never touched. A deleted property goes
together with exactly one adjacent separator, so the literal keeps its shape and
nothing else in the file is reformatted.

A split key becomes both of its halves, each carrying the old value, so the
string keeps showing where it did. A half the literal already has is not
repeated, and a shorthand expands into two references to its variable.

A shorthand `name` or `error` (`{ name, saveChanges: … }`) is deliberately left
alone: deleting it would drop a reference to a variable the file still declares,
which is a different edit from removing a dead string. The literal is reported
instead, so the key does not go unnoticed.

The AST parse is gated on a cheap pre-check for a `name`, `error`,
`saveChanges` or `saveAsNew` member (`name:`, `'name':`, or the shorthand
between two separators) rather than on the bare word, which would match
`className`, `errorState` and most of a project.

## What it does _not_ do (warn-only)

| Pattern                                                                        | Manual migration                                                                             |
| ------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------- |
| `filters.name` in `.ts`                                                        | A read (or a literal the fingerprint did not match) — drop it                                |
| A shorthand `name` / `error` in a matched literal                              | Remove it by hand, together with the variable if nothing else reads it                       |
| `filters.name` / `localeData.name` in a template                               | Drop the binding, or bind your own string if the field still needs a visible caption         |
| A read or binding of `filters.error` / `localeData.error`                      | Drop it — the alert above the field reports a taken name alone                               |
| An `error` key left in a partial override or binding (`filters: { error: … }`) | Delete it                                                                                    |
| `KbqSaveFilterStatuses.NewName`                                                | Review the handler: persist the name only, or the rename keeps saving the pending pipe edits |
| A read of `filters.saveChanges` / `filters.saveAsNew`                          | Read `…Header` for the popover header or `…Button` for the dropdown item                     |
| A `saveChanges` / `saveAsNew` string left in a partial override or binding     | Replace it with `…Header` and/or `…Button`                                                   |

Warnings are checked against the **post-fix** content, so an auto-fixed literal
does not also report as needing manual work. In dry-run mode (`--fix false`)
they are reported against the original content instead.

`fix` defaults to `true`. `ng update` invokes migrations with no options at all,
so the rule applies that default itself rather than relying on the schema.

[Params](schema.ts)

Usage for Angular Cli:

```shell
ng g @koobiq/components:filter-bar-rename-action --project "<your project>"
```

Usage for Nx:

```shell
nx g @koobiq/components:filter-bar-rename-action --project "<your project>"
```

### Run locally

Build package

```shell
yarn run build:schematics
```

Run command (for example, for `koobiq-docs` project)

```shell
ng g ./dist/components/schematics/collection.json:filter-bar-rename-action --project koobiq-docs
```

### Result

#### Before

```ts
import { KBQ_FILTER_BAR_LOCALE_CONFIGURATION } from '@koobiq/components/filter-bar';

export const filterBarConfiguration = {
    provide: KBQ_FILTER_BAR_LOCALE_CONFIGURATION,
    useValue: {
        ...ruRULocaleData.filterBar,
        filters: {
            ...ruRULocaleData.filterBar.filters,
            saveChanges: 'Сохранить изменения',
            change: 'Изменить',
            name: 'Название',
            error: 'Поиск с таким названием уже существует',
            saveButton: 'Сохранить'
        }
    }
};
```

#### After

```ts
import { KBQ_FILTER_BAR_LOCALE_CONFIGURATION } from '@koobiq/components/filter-bar';

export const filterBarConfiguration = {
    provide: KBQ_FILTER_BAR_LOCALE_CONFIGURATION,
    useValue: {
        ...ruRULocaleData.filterBar,
        filters: {
            ...ruRULocaleData.filterBar.filters,
            saveChangesHeader: 'Сохранить изменения',
            saveChangesButton: 'Сохранить изменения',
            change: 'Изменить',
            saveButton: 'Сохранить'
        }
    }
};
```
