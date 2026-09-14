# filter-bar-state-saving-default

Migration schematic invoked automatically by `ng update @koobiq/components@20`
(registered for `21.0.0-0`). Reports the consequences of `kbq-filter-bar` remembering which filter is
selected and the edits made to it, with `useStateSaving` defaulting to `true`. It never writes to the
tree.

## Background

The filter bar gained the same state saving the accordion, the tree, the tab group, the sidebar and the
content panel already have, applied through the `KbqStateSaving` host directive, and it is on by default.
With no `stateSavingKey` the key is derived from where the bar sits in the document — the chain of tag
names up to `<body>`, cut short by the first author-written `id`, which becomes the anchor.

One thing is different here. The components that shipped before it leave a controlled input alone: a
sidebar with a bound `opened` persists nothing at all. The filter bar restores over the value a
`[filter]` binding supplied at initialization, because `filter` is a `model()` — the restore writes
through it, `filterChange` fires, and the application loads data for the restored filter exactly as it
would for one the user had just picked. Only a change made after that wins.

## What is stored

The filter's `name`, whether it carried unsaved changes, and one entry per pipe: its `id` (or its `name`
when it has none) and its value. Nothing else. A pipe built from a template keeps that template's
`compareWith` and date bounds, and those do not survive being written to storage — so the rest of each
pipe is rebuilt from `filters` and `pipeTemplates` while restoring, and a pipe whose template is gone is
left out.

`KbqFilter` has no id, so a filter is identified by its `name`: renaming a saved filter loses what was
stored for it, and a name no longer in the list restores nothing. A list that arrives from a server is
waited for — the restore applies as soon as the named filter appears, and is abandoned as soon as
anything else changes the filter.

## What it reports

| Pattern                                      | Reported unless               |
| -------------------------------------------- | ----------------------------- |
| `<kbq-filter-bar>` / `[kbq-filter-bar]`      | `useStateSaving` is mentioned |
| `[filter]` / `[(filter)]` on the bar         | `useStateSaving` is mentioned |
| `<kbq-filters>` inside the bar               | `useStateSaving` is mentioned |
| `compareWith` in a consumer file             | always                        |
| `saveFilterState()` / `restoreFilterState()` | always                        |

The last one is a reassurance rather than a warning: those two are unchanged, and are unrelated to
`clearSavedState()` / `hasSavedState`.

## Running it manually

```bash
ng generate @koobiq/components:filter-bar-state-saving-default --project my-app
```

Omit `--project` to inspect the whole workspace.
