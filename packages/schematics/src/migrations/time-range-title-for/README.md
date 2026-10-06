# time-range-title-for

Migration schematic invoked automatically by `ng update @koobiq/components@21`
(registered for `21.0.0-0`). Removes `title.for` from time-range locale
configurations.

## Background

The title of `kbq-time-range` used to prepend `title.for` ("за" / "for") to the
selected period: "за последний час". The period now stands alone ("последний
час" / "Last hour"), and the duration templates of each locale carry whatever
word the period needs, so the key was removed.

## Breaking change

**`title.for` was removed from `KbqTimeRangeLocaleConfiguration`.** A literal
typed against the configuration — a `kbqTimeRangeLocaleConfigurationProvider()`
argument, for one — fails to compile on the key with an excess-property error;
an untyped one silently loses the override.

## Behaviour change

**The title shows the period alone.** A custom title template receives the
period without a prefix in `formattedDate`. A word you prefixed through
`title.for` belongs in your `durationTemplate.title` overrides now.

## What it does

The schematic walks every `.ts` and `.html` file in the project (skipping
`node_modules` and `dist`).

| Auto-fix                                                              | Where |
| --------------------------------------------------------------------- | ----- |
| Removes `for` from the `title` section of a time-range locale literal | `.ts` |

A `title` literal is treated as the time-range one when it belongs to a
`timeRange` section, to a `kbqTimeRangeLocaleConfigurationProvider()` argument,
or to a literal that also carries `editor` or `durationTemplate`. No type
resolution is involved — the schematic's virtual tree has no `@koobiq` types to
resolve against — so an unrelated `title: { for: … }` is never touched. The
property is deleted together with exactly one adjacent separator, so the literal
keeps its shape and nothing else in the file is reformatted.

## What it does _not_ do (warn-only)

| Pattern                                                   | Manual migration                                        |
| --------------------------------------------------------- | ------------------------------------------------------- |
| A read of `title.for`                                     | Drop it — the title shows the period alone              |
| A `for` key left in a `title` literal or template binding | Remove it, or ignore the report for an unrelated object |

Warnings are checked against the **post-fix** content, so an auto-fixed literal
does not also report as needing manual work. In dry-run mode (`--fix false`)
they are reported against the original content instead.

`fix` defaults to `true`. `ng update` invokes migrations with no options at all,
so the rule applies that default itself rather than relying on the schema.

[Params](schema.ts)

Usage for Angular Cli:

```shell
ng g @koobiq/components:time-range-title-for --project "<your project>"
```

Usage for Nx:

```shell
nx g @koobiq/components:time-range-title-for --project "<your project>"
```

### Run locally

Build package

```shell
yarn run build:schematics
```

Run command (for example, for `koobiq-docs` project)

```shell
ng g ./dist/components/schematics/collection.json:time-range-title-for --project koobiq-docs
```

### Result

#### Before

```ts
import { kbqTimeRangeLocaleConfigurationProvider } from '@koobiq/components/time-range';

export const timeRangeConfiguration = kbqTimeRangeLocaleConfigurationProvider({
    title: {
        for: 'за',
        placeholder: 'Период'
    }
});
```

#### After

```ts
import { kbqTimeRangeLocaleConfigurationProvider } from '@koobiq/components/time-range';

export const timeRangeConfiguration = kbqTimeRangeLocaleConfigurationProvider({
    title: {
        placeholder: 'Период'
    }
});
```
