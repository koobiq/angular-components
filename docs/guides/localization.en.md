Koobiq components render some strings of their own — the filters menu of the filter bar, the tooltips of
the code block, the accessible names of every icon-only button, the placeholder of a datepicker, and so on.
All of them come from one place: `KbqLocaleService`.

The library ships five locales: `en-US`, `es-LA`, `pt-BR`, `ru-RU` and `tk-TM`.

The application's data is never translated. Option labels, filter values, table cells and everything else
the application passes in is rendered exactly as given.

Translating those strings is the application's own job: Koobiq neither requires nor ships a library for it.
When one of them has to contain a Koobiq component — a link, a button, a dropdown — embed it with
[dynamic-translation](/en/components/dynamic-translation).

### Setting the locale

`KbqLocaleService` is `providedIn: 'root'`, but the components read it through the `KBQ_LOCALE_SERVICE`
token, which has no factory. Nothing is localized until it is provided:

```ts
import { kbqLocaleServiceProvider } from '@koobiq/components/core';

bootstrapApplication(AppComponent, {
    providers: [kbqLocaleServiceProvider()]
});
```

Without that provider every component falls back to its own built-in `ru-RU` defaults, and switching the
locale at runtime does nothing.

Use `kbqLocaleServiceProvider()` rather than `{ provide: KBQ_LOCALE_SERVICE, useClass: KbqLocaleService }`:
`useClass` builds a **second** instance, independent of the `providedIn: 'root'` one, so a `setLocale()`
called on the instance that `inject(KbqLocaleService)` hands out moves nothing that is rendered. The helper
provides the service next to the token, and both references resolve to one instance.

There are three ways to control which locale is active:

- **`KBQ_DEFAULT_LOCALE_ID`** is the fallback, `ru-RU`. It is a plain exported constant, not an injection
  token — it cannot be provided, only read.
- **`KBQ_LOCALE_ID`**, set through `kbqLocaleIDProvider(id)`, fixes the locale once, when `KbqLocaleService`
  is constructed. It must sit in the **same `providers` array** as the service itself, because the service
  reads the token from the injector that created it.
- **`setLocale(id)`** changes the locale at runtime.

```ts
providers: [kbqLocaleIDProvider('en-US'), kbqLocaleServiceProvider()];
```

The same pair on a component's `providers` scopes the locale to that component's subtree, while the rest of
the application keeps the locale it was given.

Reading the active locale:

```ts
readonly localeService = kbqInjectLocaleService();

readonly currentLocale = this.localeService.localeId;   // Signal<KbqLocaleIdLike>
readonly localeData = this.localeService.data;          // Signal<KbqLocaleData>
readonly available = this.localeService.items;          // Signal<KbqLocaleItem[]>, for a locale picker
```

`kbqInjectLocaleService()` resolves `KBQ_LOCALE_SERVICE`, never the class. Pass `{ optional: true }` for code
that has to keep working in an application that provided no locale service.

`changes` is a `BehaviorSubject` of the active locale id, and it remains the way for code outside a template
to observe a locale change. The `id` and `current` getters, on the other hand, are deprecated in favour of
the `localeId` and `data` signals. A signal read from a template registers on the reading view, so a runtime
`setLocale()` reaches `OnPush` children that an observable subscribed in the parent could not.

### What a locale is made of

A locale is a set of sections, one per area of strings. The section is the unit of overriding: its name
appears in the locale data, in `getParams()` and in `[localeOverrides]` alike.

| Section              | What it translates                                                                 | Package               |
| -------------------- | ---------------------------------------------------------------------------------- | --------------------- |
| `a11y`               | accessible names of the icon-only buttons and regions the library renders itself   | `core`                |
| `select`             | the "select all" label and the counter of values that did not fit                  | `core`                |
| `popoverConfirm`     | the question and the button of the confirmation popover                            | `core`                |
| `formatters`         | separators and abbreviations of `kbqNumber`, `kbqTableNumber` and `kbqRoundNumber` | `core`                |
| `sizeUnits`          | the size units of `kbqDataSize`                                                    | `core`                |
| `input`              | the separators of the number input                                                 | `input`               |
| `datepicker`         | the placeholder and the format of the date field                                   | `datepicker`          |
| `timepicker`         | the placeholders of the time field                                                 | `timepicker`          |
| `timezone`           | the search placeholder of the timezone select                                      | `timezone`            |
| `timeRange`          | the title and the editor of the time range                                         | `time-range`          |
| `codeBlock`          | the tooltips and labels of the code block buttons                                  | `code-block`          |
| `fileUpload`         | the text of the single and multiple upload areas                                   | `file-upload`         |
| `filterBar`          | search, reset and the saved filters menu                                           | `filter-bar`          |
| `actionsPanel`       | the close tooltip of the actions panel                                             | `actions-panel`       |
| `clampedText`        | the expand and collapse labels of clamped text                                     | `clamped-text`        |
| `navbar`             | the tooltips of the vertical navbar toggle                                         | `navbar`              |
| `searchExpandable`   | the tooltip and the placeholder of the expandable search                           | `search-expandable`   |
| `appSwitcher`        | the search and the header of the app switcher                                      | `app-switcher`        |
| `notificationCenter` | the labels of the notification center                                              | `notification-center` |

The full contract of a section is its `Kbq<Section>LocaleConfiguration` type, where every key is documented.
Its token and its provider are named mechanically: `KBQ_<SECTION>_LOCALE_CONFIGURATION` and
`kbq<Section>LocaleConfigurationProvider()`.

### Overriding the strings of one component

A section provider overrides only the keys it is given — everything else keeps its default:

```ts
import { kbqCodeBlockLocaleConfigurationProvider } from '@koobiq/components/code-block';

providers: [kbqCodeBlockLocaleConfigurationProvider({ copyTooltip: 'Copy the snippet' })];
```

Because these providers are element-injector friendly, providing one on a component scopes the override to
that component's subtree.

<!-- example(code-block-with-custom-locale-configuration) -->

Each helper ships from its own component's package. The exception is `kbqSelectLocaleConfigurationProvider`,
which ships from `@koobiq/components/core`: the `select` section is rendered by four packages that do not
depend on one another — `kbq-select`, `kbq-tree-select`, `kbq-tree-selection` and `kbq-list-selection`.

An override is applied on top of whatever is active — the strings of the active locale when the application
provides a service, the token's defaults otherwise. So the keys it names stay pinned across a runtime
`setLocale()`, while every key it leaves out follows the locale. Override a whole section to stop it
following the locale entirely; register your own locale (see below) to make the override switch along with
the others.

### Overriding the strings of one instance

A provider can only be attached to an injector, so scoping one to a single component means owning a
component boundary. Every localized component also takes its strings as a template binding:

```html
<kbq-select [localeOverrides]="{ select: { selectAll: 'Select everything' } }" />
```

The value is keyed by locale section — the same shape `addLocale()` and `KBQ_LOCALE_DATA` accept — so one
binding can also cover the accessible names the component renders through its own children:

```html
<kbq-select
    [localeOverrides]="{
        select: { selectAll: 'Select everything' },
        a11y: { clear: 'Clear the selection' }
    }"
/>
```

<!-- example(select-locale-configuration) -->

To scope an override to a whole region rather than one component, put `KbqLocaleOverridesDirective` on any
element of the application. Everything rendered inside — including a panel that opens in the overlay
container — resolves against that element:

```ts
import { KbqLocaleOverridesDirective } from '@koobiq/components/core';
```

```html
<div [kbqLocaleOverrides]="{ a11y: { close: 'Dismiss' } }">
    <kbq-code-block [files]="files" />
    <kbq-filter-bar [filter]="filter" />
</div>
```

The two names are not interchangeable. `[localeOverrides]` is the input a Koobiq component declares;
`[kbqLocaleOverrides]` is the directive's own selector, for the application's elements. Writing the selector
on a component that already carries the directive matches it twice on one element, which Angular rejects
with `NG0309`.

Sources are applied from the most general to the most local:

1. the configuration token's defaults;
2. the active locale;
3. `kbq<Component>LocaleConfigurationProvider()`, outermost injector first;
4. `KbqLocaleOverridesDirective`, outermost element first;
5. the component's own `[localeOverrides]`.

Steps 3 to 5 only override the keys they mention. Step 2 is the exception: the active locale replaces the
token's defaults outright rather than merging over them, so a value provided for a configuration token is
dropped as soon as a locale service exists. Override the section instead of providing the token.

A pipe is not an element, so `kbqNumber`, `kbqRoundNumber` and `kbqDataSize` have no `[localeOverrides]` of
their own. A carrier on an ancestor does reach them: a pipe resolves its section from the same injector any
other reader would.

### Registering your own locale

`addLocale()` accepts partial data — every section, and every key within a section, is optional. Whatever is
left out is completed from the shipped locale of the same id, or from `KBQ_DEFAULT_LOCALE_ID` when the id is
new. `getParams()` therefore always returns a complete section, whatever was registered:

```ts
localeService.addLocale('en-GB', {
    select: { selectAll: 'Select everything' },
    a11y: { close: 'Dismiss' }
});
```

The parameter is typed as `KbqPartialLocaleData`, so a misspelled section or key is a compile error rather
than a string that silently never appears.

The same data can be provided up front through `KBQ_LOCALE_DATA`. The token is read once, by the
`KbqLocaleService` constructor, so its provider belongs in the same `providers` array as the service:

```ts
const localeData = {
    'en-GB': { select: { selectAll: 'Select everything' } }
} satisfies KbqLocaleDataInput;

providers: [{ provide: KBQ_LOCALE_DATA, useValue: localeData }, kbqLocaleServiceProvider()];
```

The `satisfies` is load-bearing: `useValue` is declared as `any`, and without it the same typo goes through
silently.

A locale added this way is registered, but it is not added to `items`, which is the list a locale picker
reads. Spell `items` out in full, shipped locales included, if the new locale has to be selectable.

### Reading a section yourself

```ts
const { selectAll } = localeService.getParams('select'); // KbqSelectLocaleConfiguration
const select = localeService.params('select'); // Signal<KbqSelectLocaleConfiguration>
```

The section name is checked against `KbqLocaleSection`, and the return type follows from it.

Both of those read the locale alone. A component that should honour the overrides above as well — the
provider helpers and `[localeOverrides]` — carries the directive and reads through it:

```ts
import { inject } from '@angular/core';
import { KBQ_SELECT_LOCALE_CONFIGURATION, KbqLocaleOverridesDirective } from '@koobiq/components/core';

@Component({
    selector: 'my-widget',
    hostDirectives: [
        { directive: KbqLocaleOverridesDirective, inputs: ['kbqLocaleOverrides: localeOverrides'] }
    ]
})
export class MyWidget {
    protected readonly localeConfiguration = inject(KbqLocaleOverridesDirective, { self: true }).read(
        'select',
        KBQ_SELECT_LOCALE_CONFIGURATION
    );
}
```

`{ self: true }` is required here: with `{ host: true }` Angular walks up to the enclosing component's host
element and returns **its** carrier, so the component reads someone else's overrides instead of its own. The
`hostDirectives` entry has to be spelled out in every component — extracted into a const it fails with
`NG1010` when used from another entry point.

Name the field `localeConfiguration` — the library-wide name for the resolved strings a component reads,
kept apart from `[localeOverrides]`, which writes a partial. A component that reads a second section
qualifies it, the way `a11yLocaleConfiguration` does.

`read()` returns a signal, so `setLocale()` reaches the template on its own, and it merges every source in
the order listed above. Reading through the carrier is what makes `[localeOverrides]` work on the component:
the two cannot come apart. Where there is no element to carry the directive — in a pipe, or in content
created programmatically — `kbqInjectLocaleConfiguration(section, token)` resolves the same sources from the
injector instead.

### Dates and numbers

Date adapters and the number pipes follow the same service, but they need their own providers.
`KbqLocaleServiceModule` — pulled in by the date adapter modules — provides it itself.

<!-- example(number-formatter-locale) -->

To scope a locale to a subtree that contains dates, provide the adapter and the formatter in the `providers`
of the same component as `kbqLocaleIDProvider`. Importing the module will not do: `imports: [KbqLuxonDateModule]`
puts the adapter in the environment injector, where it resolves the root locale service, and month names
stay in the language of the whole application rather than that of the subtree.
