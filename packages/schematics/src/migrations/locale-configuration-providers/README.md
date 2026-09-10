# locale-configuration-providers

Migration schematic invoked automatically by `ng update @koobiq/components@21`
(registered for `21.0.0-0`). Moves `KBQ_<X>_CONFIGURATION` value providers to the
`kbq<X>LocaleConfigurationProvider()` helpers.

## Background

Eight readers resolved their localized strings themselves:

```ts
this.configuration =
    this.externalConfiguration ?? this.localeService?.getParams('navbar') ?? KBQ_NAVBAR_DEFAULT_LOCALE_CONFIGURATION;
```

A value provided for `KBQ_<X>_CONFIGURATION` therefore won **outright** over
`KBQ_LOCALE_SERVICE`. They now read the shared
`kbqInjectLocaleConfiguration(section, token)` helper, in which:

- the token supplies the **defaults only** — it gained a `factory`, so it always
  has a value and never reaches the component as `null`;
- the active locale wins over those defaults;
- consumer overrides are merged on top, from a separate multi token that
  `kbq<X>LocaleConfigurationProvider()` writes to.

## Behaviour change

**`{ provide: KBQ_<X>_CONFIGURATION, useValue: … }` silently stops taking effect**
in any application that provides `KBQ_LOCALE_SERVICE`: it still compiles, still
injects, and is simply outranked by the locale. The replacement helper registers
a real override.

The override is also a deep partial now: the strings you do not pass keep
following the active locale instead of falling back to the Russian defaults.

## Affected tokens

| Token                                          | Replacement                                          | Module                                   |
| ---------------------------------------------- | ---------------------------------------------------- | ---------------------------------------- |
| `KBQ_NAVBAR_LOCALE_CONFIGURATION`              | `kbqNavbarLocaleConfigurationProvider()`             | `@koobiq/components/navbar`              |
| `KBQ_NOTIFICATION_CENTER_LOCALE_CONFIGURATION` | `kbqNotificationCenterLocaleConfigurationProvider()` | `@koobiq/components/notification-center` |
| `KBQ_APP_SWITCHER_LOCALE_CONFIGURATION`        | `kbqAppSwitcherLocaleConfigurationProvider()`        | `@koobiq/components/app-switcher`        |
| `KBQ_SEARCH_EXPANDABLE_LOCALE_CONFIGURATION`   | `kbqSearchExpandableLocaleConfigurationProvider()`   | `@koobiq/components/search-expandable`   |
| `KBQ_DATEPICKER_LOCALE_CONFIGURATION`          | `kbqDatepickerLocaleConfigurationProvider()`         | `@koobiq/components/datepicker`          |
| `KBQ_FILTER_BAR_LOCALE_CONFIGURATION`          | `kbqFilterBarLocaleConfigurationProvider()`          | `@koobiq/components/filter-bar`          |
| `KBQ_SIZE_UNITS_LOCALE_CONFIGURATION`          | `kbqSizeUnitsLocaleConfigurationProvider()`          | `@koobiq/components/core`                |

`KBQ_FILE_UPLOAD_CONFIGURATION` is **reported, not rewritten**. Its replacement,
`kbqFileUploadLocaleConfigurationProvider()` from `@koobiq/components/file-upload`,
takes the whole `fileUpload` section — keyed by `single` and `multiple` — while the
old token carried one flavour flat, and only the author knows which arm a given
value belonged to. The per-instance `[localeConfig]` input is unaffected and still
wins over everything.

## What it does

The schematic walks every `.ts` and `.html` file in the project (skipping
`node_modules` and `dist`).

| Auto-fix                                                                               | Where |
| -------------------------------------------------------------------------------------- | ----- |
| Rewrites `{ provide: <TOKEN>, useValue: <expr> }` array elements to `<helper>(<expr>)` | `.ts` |
| Adds `<helper>` to an existing import clause of the module, or inserts a new import    | `.ts` |
| Removes `<TOKEN>` from its import clause once nothing else in the file refers to it    | `.ts` |

Provider entries are found through the TypeScript AST, so property order does not
matter and `{ 'provide': …, 'useValue': … }` with string keys is recognised too.
`<expr>` is copied verbatim — an identifier, an object literal, a call, anything.

The helper joins an existing clause of the module **before** the token is removed,
so the import keeps its place in the file even when the token was the only symbol
in the clause it lived in.

## What it does _not_ do (warn-only)

| Pattern                                                        | Manual migration                                                                                                                                                  |
| -------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `{ provide: <TOKEN>, useFactory / useClass / useExisting: … }` | The helper takes the configuration by value — resolve the factory/class/alias yourself and pass the result                                                        |
| A provider object that is not an array element                 | `export const P = { provide: <TOKEN>, useValue: … };` is not an element of anything, and the helper returns a `Provider`, not an object literal                   |
| Any `<TOKEN>` reference left after the rewrite pass            | An `inject()` call, a re-export, or a provider shape the helper could not take over — providing the token now changes the defaults only                           |
| `.externalConfiguration`                                       | The member was removed. Read `localeConfiguration()`, which already merges the token defaults, the active locale and every override                               |
| `.configuration = …`                                           | The member is `localeConfiguration` now, and read-only. Register the strings with the matching `kbq<Component>LocaleConfigurationProvider()`                      |
| `.configuration` (read)                                        | Renamed to `localeConfiguration` and a signal: read `localeConfiguration().someString`. `KbqTimezoneSelect` calls its own section `timezoneLocaleConfiguration()` |
| `.localeData` (read)                                           | The alias was removed from app-switcher, notification-center, search-expandable and the filter-bar parts. Read `localeConfiguration()` and the slice you need     |
| `KBQ_FILE_UPLOAD_CONFIGURATION`                                | The token is no longer read. Register the labels with `kbqFileUploadLocaleConfigurationProvider({ single: …, multiple: … })`                                      |
| `.externalConfig`                                              | The member was removed from `KbqDataSizePipe`. Overrides go through `kbqSizeUnitsLocaleConfigurationProvider()`                                                   |
| `.configuration` (read)                                        | The member was removed from the file upload components. Read `resolvedLocaleConfig()`, which already merges every source                                          |

A provider reported by one of the two specific messages is not reported again by
the generic leftover-token one. The `.configuration = …` pattern is common enough
outside Koobiq that it is only reported in files that mention one of the affected
components.

Warnings are checked against the **post-fix** content, so an auto-fixed usage
does not also report as needing manual work. In dry-run mode (`--fix false`) they
are reported against the original content instead.

`fix` defaults to `true`. `ng update` invokes migrations with no options at all,
so the rule applies that default itself rather than relying on the schema.

[Params](schema.ts)

Usage for Angular Cli:

```shell
ng g @koobiq/components:locale-configuration-providers --project <your project>
```

Usage for Nx:

```shell
nx g @koobiq/components:locale-configuration-providers --project <your project>
```

### Run locally

Build package

```shell
yarn run build:schematics
```

Run command (for example, for `koobiq-docs` project)

```shell
ng g ./dist/components/schematics/collection.json:locale-configuration-providers --project koobiq-docs
```

### Result

#### Before

```ts
import { Component } from '@angular/core';
import { KBQ_FILTER_BAR_LOCALE_CONFIGURATION, KbqFilterBarModule } from '@koobiq/components/filter-bar';

@Component({
    selector: 'my-page',
    imports: [KbqFilterBarModule],
    providers: [{ provide: KBQ_FILTER_BAR_LOCALE_CONFIGURATION, useValue: myFilterBarStrings }],
    template: `
        <kbq-filter-bar />
    `
})
export class MyPage {}
```

#### After

```ts
import { Component } from '@angular/core';
import { KbqFilterBarModule, kbqFilterBarLocaleConfigurationProvider } from '@koobiq/components/filter-bar';

@Component({
    selector: 'my-page',
    imports: [KbqFilterBarModule],
    providers: [kbqFilterBarLocaleConfigurationProvider(myFilterBarStrings)],
    template: `
        <kbq-filter-bar />
    `
})
export class MyPage {}
```
