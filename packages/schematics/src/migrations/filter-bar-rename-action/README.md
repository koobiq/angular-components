# filter-bar-rename-action

Migration schematic invoked automatically by `ng update @koobiq/components@20`
(registered for `20.3.0-0`). Cleans up after the filter-bar "rename" rework.

## Background

The save/rename popover used to render a caption above its name field, sourced
from `filters.name` of the filter-bar locale configuration, while its header
said either "Сохранить как новый" or "Сохранить изменения". The header now
carries the caption itself ("Новое название"), so the separate field caption —
and its locale key — were removed.

The dropdown item that opens the rename popover was reworded from "Изменить" to
"Переименовать", and its action was narrowed to match the new name.

## Breaking change

**`filters.name` was removed from the filter-bar locale configuration.** The
configuration is typed, not partial, so a `KBQ_FILTER_BAR_CONFIGURATION`
provider that still passes the key fails to compile with an excess-property
error.

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

Two smaller changes come with it: `filters.saveAsNew` was reworded from an
action ("Сохранить как новый") to a field caption ("Новое название"), and
`KbqFilterSavePopover.popoverHeader` no longer depends on the mode — both
creating and renaming show that caption, since both ask for a name.

## What it does

The schematic walks every `.ts` and `.html` file in the project (skipping
`node_modules` and `dist`).

| Auto-fix                                                               | Where |
| ---------------------------------------------------------------------- | ----- |
| Removes the `name` property from a filter-bar `filters` locale literal | `.ts` |

Literals are found through the TypeScript AST and matched by **fingerprint**: an
object literal is treated as a `filters` section only when it carries at least
three of the section's other keys (`saveAsNewFilter`, `saveChanges`,
`saveAsNew`, `actionsTooltip`, …). No type resolution is involved — the
schematic's virtual tree has no `@koobiq` types to resolve against — so an
unrelated object that merely has a `name` property is never touched. The
property is deleted together with exactly one adjacent separator, so the literal
keeps its shape and nothing else in the file is reformatted.

A shorthand `name` (`{ name, saveChanges: … }`) is deliberately left alone:
deleting it would drop a reference to a variable the file still declares, which
is a different edit from removing a dead string. It is warned about instead.

## What it does _not_ do (warn-only)

| Pattern                                          | Manual migration                                                                             |
| ------------------------------------------------ | -------------------------------------------------------------------------------------------- |
| `filters.name` in `.ts`                          | A read (or a literal the fingerprint did not match) — drop it                                |
| `filters.name` / `localeData.name` in a template | Drop the binding, or bind your own string if the field still needs a visible caption         |
| `KbqSaveFilterStatuses.NewName`                  | Review the handler: persist the name only, or the rename keeps saving the pending pipe edits |
| `popoverHeader`                                  | No longer varies by mode; nothing reads `saveChanges` as a popover header any more           |

Warnings are checked against the **post-fix** content, so an auto-fixed literal
does not also report as needing manual work. In dry-run mode (`--fix false`)
they are reported against the original content instead.

`fix` defaults to `true`. `ng update` invokes migrations with no options at all,
so the rule applies that default itself rather than relying on the schema.

[Params](schema.ts)

Usage for Angular Cli:

```shell
ng g @koobiq/components:filter-bar-rename-action --project <your project>
```

Usage for Nx:

```shell
nx g @koobiq/components:filter-bar-rename-action --project <your project>
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
import { KBQ_FILTER_BAR_CONFIGURATION } from '@koobiq/components/filter-bar';

export const filterBarConfiguration = {
    provide: KBQ_FILTER_BAR_CONFIGURATION,
    useValue: {
        ...ruRULocaleData.filterBar,
        filters: {
            ...ruRULocaleData.filterBar.filters,
            saveChanges: 'Сохранить изменения',
            change: 'Изменить',
            name: 'Название',
            saveButton: 'Сохранить'
        }
    }
};
```

#### After

```ts
import { KBQ_FILTER_BAR_CONFIGURATION } from '@koobiq/components/filter-bar';

export const filterBarConfiguration = {
    provide: KBQ_FILTER_BAR_CONFIGURATION,
    useValue: {
        ...ruRULocaleData.filterBar,
        filters: {
            ...ruRULocaleData.filterBar.filters,
            saveChanges: 'Сохранить изменения',
            change: 'Изменить',
            saveButton: 'Сохранить'
        }
    }
};
```
