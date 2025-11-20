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
        <i kbq-icon="kbq-bolt-circle_16">...</i>
    `
    styles: `
        .custom-icon {
            <!-- cspell:ignore xmark -->
            @extend .kbq-xmark-circle_16;
        }
    `
})
export class MyComp {
    iconName = 'kbq-bolt-circle_16';
}
```

#### After

```ts
import { Component } from '@angular/core';

@Component({
    template: `
        <i kbq-icon="kbq-circle-bolt_16">...</i>
    `
    styles: `
        .custom-icon {
            <!-- cspell:ignore xmark -->
            @extend .kbq-circle-xmark_16;
        }
    `
})
export class MyComp {
    iconName = 'kbq-circle-bolt_16';
}
```
