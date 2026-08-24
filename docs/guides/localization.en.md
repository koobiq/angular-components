## Localization

Koobiq components render some strings of their own — the filters menu of the filter bar, the tooltips of
the code block, the accessible names of every icon-only button, the placeholder of a datepicker, and so on.
All of them come from one place: `KbqLocaleService`.

Your own data is never translated. Option labels, filter values, table cells and everything else you pass
in stays exactly as you wrote it.

The library ships five locales: `en-US`, `es-LA`, `pt-BR`, `ru-RU` and `tk-TM`.

### Setting the locale

`KbqLocaleService` is `providedIn: 'root'`, but the components read it through the `KBQ_LOCALE_SERVICE`
token, which has no factory. Nothing is localized until you provide it:

```ts
import { kbqLocaleServiceProvider } from '@koobiq/components/core';

bootstrapApplication(AppComponent, {
    providers: [kbqLocaleServiceProvider()]
});
```

Without that provider every component falls back to its own built-in `ru-RU` defaults, and switching the
locale at runtime does nothing.

Use the helper rather than `{ provide: KBQ_LOCALE_SERVICE, useClass: KbqLocaleService }`: `useClass` builds a
**second** instance, independent of the `providedIn: 'root'` one, so a `setLocale()` called on the instance
`inject(KbqLocaleService)` hands out moves nothing that is rendered. `kbqLocaleServiceProvider()` provides the
service next to the token, and both references resolve to one instance.

There are three ways to control which locale is active:

- **`KBQ_DEFAULT_LOCALE_ID`** is the fallback, `ru-RU`. It is a plain exported constant, not an injection
  token — it cannot be provided, only read.
- **`KBQ_LOCALE_ID`**, written as `kbqLocaleIDProvider(id)`, fixes the locale once, when `KbqLocaleService` is
  constructed. It must sit in the **same `providers` array** as the service itself, because the service reads
  the token from the injector that created it.
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

`changes` (a `BehaviorSubject`), `id` and `current` still work and stay in sync. Prefer the signals in new
code: a signal read from a template registers on the reading view, so a runtime `setLocale()` reaches
`OnPush` children that an observable subscribed in the parent could not.

### Overriding the strings of one component

Every localized component exposes a configuration token and a matching provider. Only the keys you pass are
overridden — everything else keeps its default:

```ts
import { kbqCodeBlockLocaleConfigurationProvider } from '@koobiq/components/code-block';

providers: [kbqCodeBlockLocaleConfigurationProvider({ copyTooltip: 'Copy the snippet' })];
```

Because these providers are element-injector friendly, providing one on a component scopes the override to
that component's subtree.

Each helper ships from its own component's package. The exception is `kbqSelectLocaleConfigurationProvider`,
which ships from `@koobiq/components/core`: the `select` section is rendered by three packages that do not
depend on one another — `kbq-select`, `kbq-tree-select` and `kbq-tree-selection`.

An override is applied on top of whatever is active — the locale service when the application provides one,
the token's defaults otherwise. So the keys you pass stay pinned across a runtime `setLocale()`, while every
key you did not pass follows the locale. Override a whole section if you want it to stop following the
locale entirely; register your own locale (see below) if you want the override to switch along with the
others.

### Registering your own locale

`addLocale()` accepts partial data — every section, and every key within a section, is optional. Whatever
you leave out is completed from the shipped locale of the same id, or from `KBQ_DEFAULT_LOCALE_ID` when the
id is new. `getParams()` therefore always returns a complete section, whatever you registered:

```ts
localeService.addLocale('en-GB', {
    select: { selectAll: 'Select everything' },
    a11y: { close: 'Dismiss' }
});
```

The same shape can be provided up front through `KBQ_LOCALE_DATA`:

```ts
{ provide: KBQ_LOCALE_DATA, useValue: { 'en-GB': { select: { selectAll: 'Select everything' } } } }
```

`KbqLocaleData` is the full contract, so a misspelled section or key is a compile error rather than a
string that silently never appears.

### Reading a section yourself

```ts
const { selectAll } = localeService.getParams('select'); // KbqSelectLocaleConfiguration
const select = localeService.params('select'); // Signal<KbqSelectLocaleConfiguration>
```

The section name is checked against `KbqLocaleSection`, and the return type follows from it.

### Dates and numbers

Date adapters and the number pipes follow the same service, but they need their own providers.
`KbqLocaleServiceModule` — pulled in by the date adapter modules — provides it for you.

To scope a locale to a subtree that contains dates, provide the adapter and formatter in that same
`providers` array — `imports: [KbqLuxonDateModule]` puts them in the environment injector, where they
resolve the root locale service and render month names in the wrong language.
