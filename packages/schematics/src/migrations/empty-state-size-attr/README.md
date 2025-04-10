### Empty State Size Attr schematics

This schematic provides migration for `KbqEmptyState` new `size` attribute. It includes:

-   Removal of `big` attribute usage
-   Replacement with `size` attribute

[Params](schema.ts)

Usage for Angular Cli:

```shell
ng g @koobiq/components:empty-state-size-attr --project <your project>
```

Usage for Nx:

```shell
nx g @koobiq/components:empty-state-size-attr --project <your project>
```

### Run locally

Build package

```shell
yarn run build:schematics
```

Run command (for example, `koobiq-docs project`)

```shell
ng g ./dist/components/schematics/collection.json:empty-state-size-attr --project koobiq-docs
```

### Result

#### Before

```ts
import { Component } from '@angular/core';

@Component({
    template: `
        <kbq-empty-state [big]="true">...</kbq-empty-state>
    `
})
export class MyComp {}
```

#### After

```ts
import { Component } from '@angular/core';

@Component({
    template: `
        <kbq-empty-state size="big">...</kbq-empty-state>
    `
})
export class MyComp {}
```
