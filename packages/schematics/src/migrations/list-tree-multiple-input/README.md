# list-tree-multiple-input

Migration schematic invoked automatically by `ng update @koobiq/components@20` (registered for `20.3.0-0`).

## Background

`multiple` on `kbq-list-selection` and `kbq-tree-selection` used to be a static host attribute read once in
the constructor:

```ts
const multiple = inject(new HostAttributeToken('multiple'), { optional: true });

if (multiple === MultipleMode.CHECKBOX || multiple === MultipleMode.KEYBOARD) {
    this.multipleMode = multiple;
} else if (multiple !== null) {
    this.multipleMode = MultipleMode.CHECKBOX; // every other value
}
```

So the attribute could not be bound, the mode was frozen for the lifetime of the component, and **every**
value other than `checkbox` and `keyboard` fell through to multiple selection with checkboxes —
`multiple="false"` meant _multiple_.

It is now a real input with a closed set of values, resolved by `resolveMultipleMode` in
`@koobiq/components/core`, and the mode can be changed at any time.

## Behaviour change

| value                                                  | before       | after            |
| ------------------------------------------------------ | ------------ | ---------------- |
| `multiple="checkbox"`, `multiple="keyboard"`           | that mode    | unchanged        |
| `multiple`, `multiple=""`, `multiple="true"`           | checkbox     | unchanged        |
| no attribute                                           | single       | unchanged        |
| `multiple="false"`, `multiple="single"`, anything else | **checkbox** | single selection |

Single selection is the default, so the way to ask for it is to leave the attribute off entirely.
`multiple="single"` is not an accepted spelling.

## What it does

| case                                                           | rewrite                     | preserves behaviour?      |
| -------------------------------------------------------------- | --------------------------- | ------------------------- |
| `multiple="false"`, `multiple="single"`                        | attribute removed           | **no** — reported as such |
| any other unrecognized value (`"multiple"`, `"yes"`, `"1"`, …) | → `multiple="checkbox"`     | yes                       |
| `[multiple]="'yes'"` (quoted literal)                          | → `[multiple]="'checkbox'"` | yes                       |

Both external `.html` files and inline `@Component({ template })` literals are covered. The two spellings
that are deleted are the ones whose author meant single selection but got multiple; every rewrite is logged
with the value it replaced, and the deletions are called out as a behaviour change so they can be reviewed
in the diff.

## What it does _not_ do (warn-only)

| case                                              | why                                                                                                                            |
| ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `[multiple]="expr"`                               | a runtime expression cannot be resolved at migration time                                                                      |
| `[multiple]="true \| false \| null \| undefined"` | unambiguous under the new API and impossible before it, so it is left alone silently                                           |
| `multipleMode = …`                                | now an accessor: it rebuilds the `SelectionModel`, and inside a `kbq-tree-select` it throws, because the select owns the model |
| `selectionModel.changed.subscribe(…)`             | a mode change replaces the model instance, stranding the subscription; use the `(selectionChange)` output                      |

[Params](schema.ts)

Usage for Angular Cli:

```shell
ng g @koobiq/components:list-tree-multiple-input --project <your project>
```

Usage for Nx:

```shell
nx g @koobiq/components:list-tree-multiple-input --project <your project>
```

### Run locally

Build package

```shell
yarn run build:schematics
```

Run command (for example, for `koobiq-docs` project)

```shell
ng g ./dist/components/schematics/collection.json:list-tree-multiple-input --project koobiq-docs
```

### Result

#### Before

```html
<kbq-list-selection multiple="false">…</kbq-list-selection>
<kbq-list-selection multiple="single">…</kbq-list-selection>
<kbq-tree-selection multiple="multiple">…</kbq-tree-selection>
```

#### After

```html
<kbq-list-selection>…</kbq-list-selection>
<kbq-list-selection>…</kbq-list-selection>
<kbq-tree-selection multiple="checkbox">…</kbq-tree-selection>
```
