### Loader Overlay Size Attr schematics

This schematic provides migration for `KbqLoaderOverlay` new `size` attribute. It includes:

-   Removal of `compact` attribute usage
-   Replacement with `size` attribute

[Params](schema.ts)

Usage for Angular Cli:

```shell
ng g @koobiq/components:loader-overlay-size-attr --project <your project>
```

Usage for Nx:

```shell
nx g @koobiq/components:loader-overlay-size-attr --project <your project>
```

### Run locally

Build package

```shell
yarn run build:schematics
```

Run command (for example, for `koobiq-docs` project)

```shell
ng g ./dist/components/schematics/collection.json:loader-overlay-size-attr --project koobiq-docs
```

### Result

#### Before

```ts
import { Component } from '@angular/core';

@Component({
    template: `
        <kbq-loader-overlay [compact]="true">...</kbq-loader-overlay>
    `
})
export class MyComp {}
```

#### After

```ts
import { Component } from '@angular/core';

@Component({
    template: `
        <kbq-loader-overlay size="compact">...</kbq-loader-overlay>
    `
})
export class MyComp {}
```
