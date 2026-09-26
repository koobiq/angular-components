<!-- covers: core, select, input, datepicker, timepicker, timezone, time-range, code-block, file-upload, filter-bar, actions-panel, clamped-text, navbar, search-expandable, app-switcher, notification-center -->

# Localization and server-side rendering

Contents: Locale service · Switching at runtime · Overriding strings · Section tokens and providers ·
Dates and numbers · Server-side rendering

## Locale service

- The library translates only the strings it renders itself (placeholders, accessible names of icon-only buttons,
  filter bar menus); application data and texts are never translated. Shipped locales: `en-US`, `es-LA`, `pt-BR`,
  `ru-RU`, `tk-TM` (`KbqLocaleId`). Default and fallback: `ru-RU` (`KBQ_DEFAULT_LOCALE_ID`, a constant, not a token).
- Components read strings through `KBQ_LOCALE_SERVICE`, which has no factory: without `kbqLocaleServiceProvider()`
  every component keeps its built-in `ru-RU` strings and `setLocale()` changes nothing.
- Provide the service once at the root, with the initial locale in the same `providers` array (the service reads
  `KBQ_LOCALE_ID` only from the injector that creates it):

```ts
export const appConfig: ApplicationConfig = {
    providers: [
        provideAnimations(),
        kbqLocaleIDProvider('en-US'),
        kbqLocaleServiceProvider(),
        importProvidersFrom(LuxonDateModule, KbqFormattersModule)
    ]
};
```

- Never write `{ provide: KBQ_LOCALE_SERVICE, useClass: KbqLocaleService }`: it builds a second instance, and
  `setLocale()` on the one `inject(KbqLocaleService)` returns moves nothing on screen.
- The same pair in a component's `providers` scopes a locale to its subtree. If the subtree shows dates, list
  `{ provide: DateAdapter, useClass: LuxonDateAdapter }` and `DateFormatter` in that array too: an imported adapter
  module lives in the environment injector and keeps the root locale.

## Switching at runtime

```ts
export class LocalePicker {
    private readonly localeService = kbqInjectLocaleService();

    protected readonly locales = this.localeService.items; // Signal<KbqLocaleItem[]>, { id, name } each
    protected readonly active = this.localeService.localeId; // Signal<KbqLocaleIdLike>

    protected select(id: KbqLocaleIdLike): void {
        this.localeService.setLocale(id);
    }
}
```

- `kbqInjectLocaleService()` resolves the token, not the class; pass `{ optional: true }` for code that must also run
  without a service. Read the `localeId` and `data` signals (they reach `OnPush` views); outside templates subscribe to
  `changes` (a `BehaviorSubject`). The `id` and `current` getters are deprecated.
- `setLocale()` also writes the id to the `lang` attribute of `<html>` (rename it with
  `kbqLocaleServiceLangAttrNameProvider()`); the initial locale is not written, so set `lang` in `index.html`.
- One section: `getParams('select')` (snapshot) or `params('select')` (signal), typed through `KbqLocaleSection`.
- Custom locale: `addLocale('en-GB', { select: { selectAll: 'Select everything' } })` registers and activates it; keys
  left out come from the shipped locale of that id, or from `ru-RU`. Up front, in the service's `providers` array:
  `{ provide: KBQ_LOCALE_DATA, useValue: data }` with `data satisfies KbqLocaleDataInput` (`useValue` is untyped).
  Neither adds the locale to `items`; to offer it in a picker, give `KBQ_LOCALE_DATA` a full `items` list, shipped ones
  included.

## Overriding strings

- Sources merge from general to local: token defaults; the active locale, which replaces them (a value provided for a
  section token is ignored once a locale service exists, so override the section instead); section providers,
  outermost injector first; `[kbqLocaleOverrides]` on ancestor elements, outermost first, reaching overlay panels
  opened inside; the component's own `[localeOverrides]`. The last three merge only the keys they name, and every
  other key keeps following `setLocale()`.

```ts
providers: [kbqCodeBlockLocaleConfigurationProvider({ copyTooltip: 'Copy the snippet' })];
```

```html
<kbq-select [localeOverrides]="{ select: { selectAll: 'Select everything' } }" />
<div [kbqLocaleOverrides]="{ a11y: { close: 'Dismiss' } }">...</div>
```

- Values are keyed by section, the shape `addLocale()` takes. `[localeOverrides]` is the input of Koobiq components;
  `[kbqLocaleOverrides]` (`KbqLocaleOverridesDirective`, core) is for your own elements: on a Koobiq component it
  matches the directive twice and fails with `NG0309`.
- `kbqNumber`, `kbqRoundNumber` and `kbqDataSize` are pipes without `[localeOverrides]`; an ancestor directive or a
  section provider reaches them.
- Strings in your own code: `kbqInjectLocaleConfiguration('select', KBQ_SELECT_LOCALE_CONFIGURATION)` returns a signal
  merged from these sources. To accept `[localeOverrides]`, a component declares `KbqLocaleOverridesDirective` in
  `hostDirectives` with inputs `['kbqLocaleOverrides: localeOverrides']` and reads
  `inject(KbqLocaleOverridesDirective, { self: true }).read(section, token)`.

## Section tokens and providers

Each provider takes a deep partial of the section and scopes to the injector it is listed in;
`kbqLocaleConfigurationOverrideProvider(section, partial)` does the same for any section. Import them from the entry
point in the second column: `core` is `@koobiq/components/core`, `code-block` is `@koobiq/components/code-block`.

| Section              | Entry point           | Token                                          | Provider                                           |
| -------------------- | --------------------- | ---------------------------------------------- | -------------------------------------------------- |
| `a11y`               | `core`                | `KBQ_A11Y_LOCALE_CONFIGURATION`                | `kbqA11yLocaleConfigurationProvider`               |
| `select`             | `core`                | `KBQ_SELECT_LOCALE_CONFIGURATION`              | `kbqSelectLocaleConfigurationProvider`             |
| `popoverConfirm`     | `core`                | `KBQ_POPOVER_CONFIRM_LOCALE_CONFIGURATION`     | `kbqPopoverConfirmLocaleConfigurationProvider`     |
| `formatters`         | `core`                | `KBQ_FORMATTERS_LOCALE_CONFIGURATION`          | `kbqFormattersLocaleConfigurationProvider`         |
| `sizeUnits`          | `core`                | `KBQ_SIZE_UNITS_LOCALE_CONFIGURATION`          | `kbqSizeUnitsLocaleConfigurationProvider`          |
| `input`              | `input`               | `KBQ_INPUT_LOCALE_CONFIGURATION`               | `kbqInputLocaleConfigurationProvider`              |
| `datepicker`         | `datepicker`          | `KBQ_DATEPICKER_LOCALE_CONFIGURATION`          | `kbqDatepickerLocaleConfigurationProvider`         |
| `timepicker`         | `timepicker`          | `KBQ_TIMEPICKER_LOCALE_CONFIGURATION`          | `kbqTimepickerLocaleConfigurationProvider`         |
| `timezone`           | `timezone`            | `KBQ_TIMEZONE_LOCALE_CONFIGURATION`            | `kbqTimezoneLocaleConfigurationProvider`           |
| `timeRange`          | `time-range`          | `KBQ_TIME_RANGE_LOCALE_CONFIGURATION`          | `kbqTimeRangeLocaleConfigurationProvider`          |
| `codeBlock`          | `code-block`          | `KBQ_CODE_BLOCK_LOCALE_CONFIGURATION`          | `kbqCodeBlockLocaleConfigurationProvider`          |
| `fileUpload`         | `file-upload`         | `KBQ_FILE_UPLOAD_LOCALE_CONFIGURATION`         | `kbqFileUploadLocaleConfigurationProvider`         |
| `filterBar`          | `filter-bar`          | `KBQ_FILTER_BAR_LOCALE_CONFIGURATION`          | `kbqFilterBarLocaleConfigurationProvider`          |
| `actionsPanel`       | `actions-panel`       | `KBQ_ACTIONS_PANEL_LOCALE_CONFIGURATION`       | `kbqActionsPanelLocaleConfigurationProvider`       |
| `clampedText`        | `clamped-text`        | `KBQ_CLAMPED_TEXT_LOCALE_CONFIGURATION`        | `kbqClampedTextLocaleConfigurationProvider`        |
| `navbar`             | `navbar`              | `KBQ_NAVBAR_LOCALE_CONFIGURATION`              | `kbqNavbarLocaleConfigurationProvider`             |
| `searchExpandable`   | `search-expandable`   | `KBQ_SEARCH_EXPANDABLE_LOCALE_CONFIGURATION`   | `kbqSearchExpandableLocaleConfigurationProvider`   |
| `appSwitcher`        | `app-switcher`        | `KBQ_APP_SWITCHER_LOCALE_CONFIGURATION`        | `kbqAppSwitcherLocaleConfigurationProvider`        |
| `notificationCenter` | `notification-center` | `KBQ_NOTIFICATION_CENTER_LOCALE_CONFIGURATION` | `kbqNotificationCenterLocaleConfigurationProvider` |

- `a11y` holds the accessible names of icon-only buttons and regions the library renders (`clear`, `showPassword`,
  `remove`, ...). `select` is shared by the select, tree select, list selection and tree selection. `input` holds the
  number input separators, `datepicker` the date placeholder and format, `formatters` the separators and abbreviations
  of the number pipes.

## Dates and numbers

- Date inputs, `DateFormatter` and the date pipes need a `DateAdapter`: `LuxonDateModule` from
  `@koobiq/angular-luxon-adapter/adapter` or `MomentDateModule` from `@koobiq/angular-moment-adapter/adapter`.
  `KbqFormattersModule` (core) provides `DateFormatter` and exports the pipes. Provide both at the root: root services
  such as `KbqNotificationCenterService` inject them, and a component's `imports` do not reach those.
- The adapter and `DateFormatter` follow the locale service (month names, formats); without a service they use
  `KBQ_DATE_LOCALE`, which defaults to Angular's `LOCALE_ID`.
- Use the `kbq*` date pipes (`kbqAbsoluteLongDate`, `kbqRelativeShortDate`, `kbqRangeLongDate`, `kbqDurationShort`):
  they re-render on a locale or time zone change. Unprefixed ones (`absoluteLongDate`) are pure and go stale. A missing
  or invalid date renders an empty string; `DateFormatter` methods throw instead.
- Time zone for pipes, `DateFormatter`, calendar and date inputs: `kbqDateTimezoneProvider('Europe/Moscow')` (IANA
  name, offset in minutes, `'+03:00'`, `'utc'`, or the default `'system'`, the host's zone). At runtime:
  `inject(KbqDateTimezoneService).setTimezone(zone)`. For a subtree, list it with the adapter and `DateFormatter`.
- Numbers: `kbqNumber` (running text; `ru-RU` groups from five digits), `kbqTableNumber` (always groups),
  `kbqRoundNumber` (`K`, `M`, `B`), `kbqDataSize`. They follow the active locale, or a locale id passed as the last
  argument.

## Server-side rendering

- Code that runs during render must not touch the globals `window`, `document`, `navigator`, `location`, `history`,
  `screen`, `localStorage`, `sessionStorage`, `matchMedia`, `getComputedStyle`, `requestAnimationFrame`,
  `requestIdleCallback`, `performance`, `crypto` or `caches`. Inject instead:

```ts
private readonly window = inject(KBQ_WINDOW); // from @koobiq/components/core
private readonly document = inject(DOCUMENT); // from @angular/common
```

- `KBQ_WINDOW` resolves `DOCUMENT.defaultView`, falls back to the global `window`, and throws when neither exists. On
  the server it is the server document's window, without `matchMedia`, `localStorage`, `requestAnimationFrame` or
  `innerWidth`: call those only when `isPlatformBrowser(inject(PLATFORM_ID))` is true, or in `afterNextRender()`.
- If code you do not own reaches such members during render, provide `KBQ_WINDOW` in the server config only, with a
  factory returning a stub (`document: inject(DOCUMENT)`, no-op `addEventListener`, a `matchMedia` that never matches).
- `mergeApplicationConfig` runs the shared config on the server too: guard browser-only initializers (the server does
  not implement `document.cookie`) and keep `provideAnimations()` there.
- Dates render in the host's zone, so server and browser disagree and every date changes on hydration. Resolve the
  zone on the server (cookie or user profile, else `'utc'`), provide it as `KBQ_DATE_TIMEZONE` and save it in
  `TransferState` under your `makeStateKey` key; the browser config reads it back:
  `{ provide: KBQ_DATE_TIMEZONE, useFactory: () => inject(TransferState).get(TIMEZONE_KEY, 'utc') }`.
- Theme: provide `KbqThemeCookieStore` through `KBQ_THEME_STORE`; it reads the saved theme from the request cookie, so
  the server renders it. State saving: the built-in web storage stores already guard SSR, a custom one extends
  `KbqWebStorageStateStore` and reads synchronously. `KbqMeasureScrollbarService` returns `0` on the server.

Details: `node_modules/@koobiq/components/agent-docs/guides/localization.md`,
`node_modules/@koobiq/components/agent-docs/other/date-formatter.md`,
`node_modules/@koobiq/components/agent-docs/components/core.md` (`KBQ_WINDOW`, providers and tokens).
