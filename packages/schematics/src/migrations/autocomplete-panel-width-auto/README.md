### Autocomplete Panel Width Auto schematics

This schematic migrates `KbqAutocomplete` templates away from the old meaning of `panelWidth="auto"`. It includes:

- Replacement of `panelWidth="auto"` with `panelWidth="fit-content"`

`panelWidth="auto"` used to be passed through to CSS verbatim, so the panel shrank to fit its content. It now
means "match the width of the host", which is what it already means on `kbq-select` and `kbq-tree-select`.
`fit-content` preserves the old behaviour.

The change is silent — `auto` still type-checks and still renders — so templates that are not migrated will
lay out differently without any error.

[Params](schema.ts)

Usage for Angular Cli:

```shell
ng g @koobiq/components:autocomplete-panel-width-auto --project <your project>
```

Usage for Nx:

```shell
nx g @koobiq/components:autocomplete-panel-width-auto --project <your project>
```

### Run locally

Build package

```shell
yarn run build:schematics
```

Run command (for example, for `koobiq-docs` project)

```shell
ng g ./dist/components/schematics/collection.json:autocomplete-panel-width-auto --project koobiq-docs
```

### Result

#### Before

```ts
import { Component } from '@angular/core';

@Component({
    template: `
        <kbq-autocomplete panelWidth="auto">...</kbq-autocomplete>
    `
})
export class MyComp {}
```

#### After

```ts
import { Component } from '@angular/core';

@Component({
    template: `
        <kbq-autocomplete panelWidth="fit-content">...</kbq-autocomplete>
    `
})
export class MyComp {}
```
