### Icons replacement schematics

This schematic provides migration for new icons naming attribute. It includes:

- Replacement of old names with new based on info in `data.ts`;

[Params](schema.ts)

Usage for Angular Cli:

```shell
ng g @koobiq/components:icons-replacement --project <your project>
```

Usage for Nx:

```shell
nx g @koobiq/components:icons-replacement --project <your project>
```

### Run locally

Build package

```shell
yarn run build:schematics
```

Run command (for example, for `koobiq-docs` project)

```shell
ng g ./dist/components/schematics/collection.json:icons-replacement --project koobiq-docs
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
