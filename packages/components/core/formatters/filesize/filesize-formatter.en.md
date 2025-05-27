**Filesize formatter** automatically converts values into kilobytes, megabytes, gigabytes, etc., taking localization into account. Rounding can also be customized.

<!-- example(filesize-formatter-overview) -->

### Integration

Add `KbqDataSizePipe` to the component’s `imports`. It works like a standard [Angular pipe](https://angular.dev/guide/templates/pipes):

```ts
import { KbqDataSizePipe } from '@koobiq/components/core';

@Component({
    imports: [KbqDataSizePipe],
    template: `
        <div>{{ 1024 | kbqDataSize }}</div>
    `
})
```

### Usage in Components

The formatter supports localization, choice of measurement system (SI/IEC), and rounding precision settings.

#### Local Configuration

You can set parameters directly in the template using pipe arguments:

```ts
@Component({
    imports: [KbqDataSizePipe],
    template: `
        <div>{{ 1536 | kbqDataSize : 1 : 'IEC' : 'en-US' }}</div><!-- 1.5 KB -->
    `
})
```

#### Global Configuration via DI

To define common formatting settings across the entire application or module, use a provider:

```ts
import { kbqFilesizeFormatterConfigurationProvider } from '@koobiq/components/core';

@NgModule({
    providers: [
        kbqFilesizeFormatterConfigurationProvider({
            defaultPrecision: 3,
            defaultUnitSystem: 'SI'
        })
    ]
})
```

### Number and Unit Formatting

- A **non-breaking space** (`&nbsp;`) is used between the number and the unit.
- By default, numbers are formatted using the **`KbqDecimalPipe`**.
- To format numbers specifically for tables, use the **`KbqTableNumberPipe`**.

To apply table-style number formatting with the `kbqTableNumber` pipe, override the `KbqDecimalPipe` by registering the appropriate provider in your component or module:

<!-- example(filesize-formatter-table-number) -->
