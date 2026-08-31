The `core` module is a foundational part of the **Koobiq** design system.  
It provides essential utilities, services, and components used across other modules in the system.

Everything public is imported from a single entry point — `core` has no sub-paths:

```ts
import { KBQ_WINDOW, kbqThemeProvider } from '@koobiq/components/core';
```

### Module map

A large part of `core` is covered by dedicated documentation pages — the links are below.

| Topic                                                                   | Page                                               |
| ----------------------------------------------------------------------- | -------------------------------------------------- |
| `KbqThemeService`, themes, CSS variables                                | [Theming](/en/main/theming)                        |
| `KbqLocaleService`, locales, string overrides                           | [Localization](/en/main/localization)              |
| `createSearchPredicate`, `tokenizeSearchQuery`, `findSearchMatchRanges` | [Smart search](/en/other/search-smart)             |
| `DateFormatter`, date pipes, time zone                                  | [Date formatter](/en/other/date-formatter)         |
| `KbqDecimalPipe`, `KbqRoundDecimalPipe`, `KbqTableNumberPipe`           | [Number formatter](/en/other/number-formatter)     |
| `KbqDataSizePipe`, data size units                                      | [Filesize formatter](/en/other/filesize-formatter) |
| Form layout: `kbq-form`, `kbq-form-row`                                 | [Forms](/en/other/forms)                           |
| `ErrorStateMatcher` — when errors are shown                             | [Validation](/en/other/validation)                 |
| Match highlighting: `kbqHighlight`                                      | [Highlight](/en/components/highlight)              |
| Typography                                                              | [Typography](/en/main/typography)                  |
| Flex layout                                                             | [Layout flex](/en/components/layout-flex)          |
| Global appearance variables                                             | [Design tokens](/en/main/design-tokens/colors)     |

Everything else is described on this page.

### Global configuration

The library is configured through application providers. Almost every setting has two ways to declare it: a token and a provider function. Prefer the provider function — it fills in the defaults for everything you did not pass and takes the provider shape off your hands.

#### Providers

| Provider                                             | What it does                                                       |
| ---------------------------------------------------- | ------------------------------------------------------------------ |
| `kbqThemeProvider(config)`                           | Registers themes, sets the initial mode and the storage key        |
| `kbqLocaleServiceProvider()`                         | Enables localization. Without it localization does not work        |
| `kbqLocaleIDProvider(localeId)`                      | Sets the active locale                                             |
| `kbqLocaleConfigurationOverrideProvider(section, …)` | Overrides the strings of one locale section                        |
| `kbqA11yLocaleConfigurationProvider(config)`         | Overrides screen reader texts                                      |
| `kbqSelectLocaleConfigurationProvider(config)`       | Overrides select panel strings                                     |
| `kbqLocaleServiceLangAttrNameProvider(attrName)`     | Changes the attribute the locale is written to (`lang` by default) |
| `kbqDateTimezoneProvider(timezone)`                  | Sets the time zone dates are rendered in                           |
| `kbqFilesizeFormatterConfigurationProvider(config)`  | Configures data size units                                         |
| `kbqErrorStateMatcherProvider(matcher)`              | Sets when form field errors become visible                         |
| `kbqShadowDomOverlayProvider(host?)`                 | Moves the overlay container into a shadow root                     |

#### Tokens

Each area is described in full on the pages from the map above.

| Token                                     | What it configures                                                                                     |
| ----------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| `KBQ_WINDOW`                              | A reference to `window` that is safe under server-side rendering                                       |
| `KBQ_THEME_CONFIG`                        | `KbqThemeService` settings: `themes`, `mode`, `theme`, `storageKey`                                    |
| `KBQ_THEME_STORE`                         | Where the theme selection is persisted. Ready-made: `KbqThemeLocalStorageStore`, `KbqThemeCookieStore` |
| `KBQ_LOCALE_SERVICE`                      | The `KbqLocaleService` instance. It has no factory — you must provide it                               |
| `KBQ_LOCALE_ID`                           | The active locale. Defaults to `ru-RU` (`KBQ_DEFAULT_LOCALE_ID`)                                       |
| `KBQ_LOCALE_DATA`                         | The registry of available locales, custom ones included                                                |
| `KBQ_LOCALE_CONFIGURATION_OVERRIDES`      | Partial overrides of locale sections                                                                   |
| `KBQ_A11Y_LOCALE_CONFIGURATION`           | Screen reader texts                                                                                    |
| `KBQ_SELECT_LOCALE_CONFIGURATION`         | Select panel strings                                                                                   |
| `KBQ_LOCALE_SERVICE_LANG_ATTR_NAME`       | The HTML attribute name for the locale. Defaults to `lang`                                             |
| `KBQ_DATE_LOCALE`                         | The date locale, separate from the interface locale                                                    |
| `KBQ_DATE_FORMATS`                        | Date parsing and display formats                                                                       |
| `KBQ_DATE_TIMEZONE`                       | The time zone. Defaults to `system`                                                                    |
| `KBQ_NUMBER_FORMATTER_OPTIONS`            | Number precision and grouping                                                                          |
| `KBQ_SIZE_UNITS_CONFIG`                   | Data size units                                                                                        |
| `ErrorStateMatcher`                       | When form field errors become visible                                                                  |
| `KBQ_CHECKABLE_CLICK_ACTION`              | How checkboxes and toggles react to a click: `noop`, `check`, `check-indeterminate`                    |
| `KBQ_SELECT_SCROLL_STRATEGY`              | How an open select behaves while the page scrolls                                                      |
| `KBQ_SELECT_SEARCH_MIN_OPTIONS_THRESHOLD` | The option count at which search appears. Defaults to `10`                                             |

When a formatter token is not provided, the defaults apply: `KBQ_NUMBER_FORMATTER_DEFAULT_OPTIONS` for numbers and `KBQ_SIZE_UNITS_DEFAULT_CONFIG` for size units.

### Pinning a theme by name

Besides following the OS color scheme via `mode`, `KbqThemeService` lets you pin one theme out of the registered `themes()` by name — no light/dark polarity involved, the pin simply overrides `mode` resolution until cleared. Useful for a "select exact theme" picker, as opposed to a light/dark/auto switch.

<!-- example(theme-static-selection) -->

### The KBQ_WINDOW token and server-side rendering

There is no global `window` during server-side rendering, so touching it crashes on the server. Use the `KBQ_WINDOW` token instead — it resolves through `DOCUMENT` rather than the global variable.

```ts
import { inject } from '@angular/core';
import { KBQ_WINDOW } from '@koobiq/components/core';

class Example {
    private readonly window = inject(KBQ_WINDOW);

    get isNarrow(): boolean {
        return this.window.innerWidth < 768;
    }
}
```

The same applies to `getComputedStyle`, `matchMedia` and other window members — take them from the injected object. When no window is available, the token throws instead of silently resolving to `undefined`.

### Overlays inside Shadow DOM

CDK appends its overlay container to `document.body` by default. When the application is mounted inside a shadow root — the common case for micro-frontends isolating their styles — every overlay (modals, dropdowns, tooltips, toasts) escapes the shadow tree into the light DOM and loses the theme tokens declared on the `.kbq-light` / `.kbq-dark` ancestor.

`kbqShadowDomOverlayProvider` relocates the overlay container into the shadow root:

```ts
import { bootstrapApplication } from '@angular/platform-browser';
import { kbqShadowDomOverlayProvider } from '@koobiq/components/core';

bootstrapApplication(AppComponent, {
    providers: [
        // The micro-frontend root element, or any element inside its shadow tree.
        ...kbqShadowDomOverlayProvider(() => document.querySelector('my-mfe-root')!)
    ]
});
```

Things to know:

- called without an argument, it resolves the shadow root from the application root component element;
- only an **open** shadow root works: a closed one exposes neither `Element.shadowRoot` nor a `ShadowRoot` from `getRootNode()`;
- when no shadow root is found, the container stays on `document.body`, so the provider is safe to add unconditionally;
- the provider replaces the global `OverlayContainer`, so it cannot be combined with another custom one — `FullscreenOverlayContainer`, for example;
- the provider relocates the container and delivers CDK's structural styles; delivering the Koobiq theme tokens and component styles into the shadow root is up to the application.

The full write-up, including a single shared container across micro-frontends, is on the [Toast](/en/components/toast) page.

### Scroll shadows

A set of directives that shows a shadow on a header or footer once the content is scrolled. The container sits on the scrollable element, and the indicators are linked to it through a template reference.

```html
<div kbqOverflowShadowContainer #shadow="kbqOverflowShadowContainer" class="scrollable">
    <header [kbqOverflowShadowTop]="shadow">Header</header>

    <!-- content -->

    <footer [kbqOverflowShadowBottom]="shadow">Footer</footer>
</div>
```

- `debounce` — scroll handling delay in milliseconds, `0` by default.
- `shadow` — the `box-shadow` value while the shadow is active. Defaults to the `--kbq-shadow-overflow-normal-bottom` and `--kbq-shadow-overflow-normal-top` tokens.
- `KBQ_OVERFLOW_SHADOW_SOURCE` — the token a custom scroll wrapper provides to hand the container its event source and scroll element. That is how `KbqScrollbar` works.
- Besides scrolling, the container observes the element's box size. Content that only grows `scrollHeight` without changing the box size is not picked up by the observer — `checkOverflow()` covers those cases.

### Selecting everything

The "select all" behavior behind `Ctrl`/`Cmd` + `A` lives in adapter-driven functions, so it can be reused in your own lists regardless of how selection is stored.

```ts
import { getSelectAllState, KbqSelectAllAdapter, toggleSelectAll } from '@koobiq/components/core';

const adapter: KbqSelectAllAdapter<Item> = {
    items: this.items,
    isSelectable: (item) => !item.disabled,
    isSelected: (item) => this.selection.isSelected(item),
    setSelected: (item, selected) => (selected ? this.selection.select(item) : this.selection.deselect(item))
};

const changed = toggleSelectAll(adapter, { allowDeselect: true });
const masterCheckboxState = getSelectAllState(adapter);
```

- `setSelected` must be idempotent: `toggleSelectAll` calls it for every selectable item, not just the ones whose state changes, and relies on the redundant calls being absorbed without events or side effects.
- `toggleSelectAll` returns only the items whose state actually flipped.
- `allowDeselect: true` makes a repeated toggle deselect everything once all selectable items are selected. By default the toggle only ever selects.
- Items that cannot be selected are ignored: they never pin the master checkbox to `indeterminate`. An empty selectable set reads as `unchecked`.
- `KbqSelectAllEvent` is the event the library's components emit from `onSelectAll`.
- `shouldSelectSearchText` decides whether the shortcut should select the text of a search field instead of toggling options.

### Working with the keyboard

#### Constants and predicates

`core` exports numeric key constants (`ENTER`, `ESCAPE`, `TAB`, `UP_ARROW`, `HOME`, `NUMPAD_ZERO` and others) along with predicates on top of them, so handlers don't have to unpack `keyCode` themselves.

| Predicate                                    | What it checks                                                                 |
| -------------------------------------------- | ------------------------------------------------------------------------------ |
| `hasModifierKey(event, ...modifiers)`        | At least one of the listed modifiers is held; with no arguments — any modifier |
| `isControl(event)`                           | A modifier key is pressed: `Shift`, `Ctrl`, `Alt`, `Cmd`                       |
| `isLetterKey`, `isNumberKey`, `isDigit`      | A letter, a digit from the main row                                            |
| `isNumpadKey`, `isFunctionKey`               | A numpad digit, a function key `F1`–`F12`                                      |
| `isVerticalMovement`, `isHorizontalMovement` | Vertical and horizontal movement                                               |
| `isSelectAll(event)`, `isCopy(event)`        | The "select all" and "copy" shortcuts, macOS included                          |
| `isInput(event)`                             | The event came from an `input` or a `textarea`                                 |

#### List navigation

`ListKeyManager` and its subclasses provide roving navigation for your own list-like components:

- `ListKeyManager` — active item management;
- `FocusKeyManager` — additionally moves focus to the active item;
- `ActiveDescendantKeyManager` — keeps focus on the container and marks the active item instead.

```ts
this.keyManager = new FocusKeyManager(this.items)
    .withVerticalOrientation()
    .withTypeAhead()
    .withHomeAndEnd()
    .withScrollSize(this.visibleRowsCount)
    .skipPredicate((item) => item.disabled);
```

Compared to CDK's classes of the same name, these add page-wise movement (`withScrollSize()`, `setNextPageItemActive()`, `setPreviousPageItemActive()`) and `previousActiveItemIndex`, which range selection with `Shift` is built on.

### Validators

Sets of static methods returning a `ValidatorFn`. Only values of the expected type are checked: for anything else the validator returns `null` and stays out of the way of the other checks.

#### PasswordValidators

| Method              | Error key      | Error payload     |
| ------------------- | -------------- | ----------------- |
| `minLength(min)`    | `minLength`    | `{ min, actual }` |
| `maxLength(max)`    | `maxLength`    | `{ max, actual }` |
| `minUppercase(min)` | `minUppercase` | `{ min, actual }` |
| `minLowercase(min)` | `minLowercase` | `{ min, actual }` |
| `minNumber(min)`    | `minNumber`    | `{ min, actual }` |
| `minSpecial(min)`   | `minSpecial`   | `{ min, actual }` |

Special characters are `!`, `@`, `#`, `$`, `%`, `^`, `&`, `*`. A usage example is on the [Form field](/en/components/form-field) page.

#### FileValidators

| Method                       | Error key               | Error payload          |
| ---------------------------- | ----------------------- | ---------------------- |
| `maxFileSize(maxSize)`       | `maxFileSize`           | `{ max, actual }`      |
| `isCorrectExtension(accept)` | `fileExtensionMismatch` | `{ expected, actual }` |

`accept` takes extensions (`.pdf`) and MIME types (`image/png`) — the same values as the `accept` attribute of `input[type=file]`; the `KbqFileTypeSpecifier` type describes them. Examples are on the [File upload](/en/components/file-upload) page.

### Shared types

The types the library's own component inputs are declared with. Use them in your wrappers to stay aligned with the design system.

| Type                                             | Values                                                                                     |
| ------------------------------------------------ | ------------------------------------------------------------------------------------------ |
| `KbqDefaultSizes`                                | `compact`, `normal`, `big`                                                                 |
| `KbqComponentColors`                             | `theme`, `theme-fade`, `contrast`, `contrast-fade`, `error`, `warning`, `success`, `empty` |
| `ThemePalette`                                   | `primary`, `secondary`, `error`, `info`, `warning`, `success`                              |
| `KbqOrientation`                                 | `horizontal`, `vertical`                                                                   |
| `KbqFlexDirection`, `KbqFlexWrap`                | `row` / `column`, `nowrap` / `wrap`                                                        |
| `PopUpPlacements`, `PopUpTriggers`, `PopUpSizes` | Placement, trigger and size of pop-up elements                                             |
| `KbqMultipleInput`, `MultipleMode`               | The multiple selection mode of lists and trees                                             |

The `color` input is not merely stored: `KbqColorDirective` puts a `kbq-<value>` class on the element — `color="error"` yields `kbq-error`, and the `empty` default yields `kbq-empty`. That is why those classes are not findable by a plain search through the sources.

The `multiple` input of lists and trees accepts more than a boolean — `resolveMultipleMode` maps every accepted spelling onto a mode. An unrecognized value falls back to single selection and is reported in development mode.

### Panel width

Overlay panels size themselves by one shared rule. The `KbqPanelWidth`, `KbqPanelMinWidth` and `KbqPanelMaxWidth` types describe its values.

| `panelWidth` value     | Behavior                                                                               |
| ---------------------- | -------------------------------------------------------------------------------------- |
| `null`, `''` (default) | The panel sizes to its content, but never narrower than the trigger or `panelMinWidth` |
| `'auto'`               | The panel matches the trigger width, but never narrower than `panelMinWidth`           |
| number                 | An explicit width in pixels. `panelMinWidth` is not applied                            |
| CSS string             | An explicit width, e.g. `fit-content` or `20rem`. `panelMinWidth` is not applied       |

The "never narrower than the trigger" rule belongs to the automatic policies only — an explicit width is taken at face value. `panelMinWidth` defaults to `KBQ_PANEL_DEFAULT_MIN_WIDTH`, that is `200`. `KbqPanelMaxWidth` caps how far a panel grows with its content; `null` falls back to the `--kbq-panel-size-width-max` token. The cap is soft: it never makes a panel narrower than its trigger and never overrides an explicit width.

### Utilities

| Utility                                                            | Purpose                                                                                                           |
| ------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------- |
| `kbqDeepMerge(base, patch)`, `KbqDeepPartial<T>`                   | Recursive config merging: a partial override does not drop the sibling sections                                   |
| `kbqInjectNativeElement<T>()`                                      | A short form of `inject(ElementRef).nativeElement`                                                                |
| `isHtmlElement`, `isElement`, `isNull`, `isUndefined`, `isBoolean` | Type-narrowing predicates                                                                                         |
| `getNodesWithoutComments(nodes)`                                   | Nodes without comments — for inspecting projected content, for instance                                           |
| `escapeRegExp(value)`                                              | Escaping user input before it goes into a regular expression                                                      |
| `isMac()`                                                          | Platform detection for keyboard shortcut labels                                                                   |
| `KbqMeasureScrollbarService`                                       | The system scrollbar width (`scrollBarWidth`); `0` under server-side rendering                                    |
| `kbqInjectAutofilled()`                                            | A signal telling whether the browser filled the field. Call it from a directive's injection context on an `input` |
| `KbqNormalizeWhitespace`                                           | The `kbqNormalizeWhitespace` directive: replaces thin spaces with regular ones on copy                            |
| `kbqRevealSelection`, `kbqSetSelectionRange`                       | Selecting text in a field and scrolling the field to the selection                                                |

`kbqNormalizeWhitespace` matters for fields with formatted numbers: their digit groups are separated by a thin space, and without the replacement the copied value does not paste cleanly into other applications. The directive is not enabled by default — it is added by hand, see [Input](/en/components/input).

### Testing utilities

`core` exports the helpers the library's own tests are written with. They are equally useful for testing application code built on Koobiq components.

| Utility                                                                                  | Purpose                                              |
| ---------------------------------------------------------------------------------------- | ---------------------------------------------------- |
| `dispatchFakeEvent`, `dispatchKeyboardEvent`, `dispatchMouseEvent`, `dispatchTouchEvent` | Create an event and dispatch it on a node            |
| `createFakeEvent`, `createKeyboardEvent`, `createMouseEvent`, `createTouchEvent`         | Create an event without dispatching it               |
| `typeInElement(value, element)`                                                          | Type into a field with the full sequence of events   |
| `patchElementFocus(element)`                                                             | Predictable focus and blur in a test environment     |
| `MockNgZone`                                                                             | A controllable zone for testing work outside Angular |
| `wrappedErrorMessage(error)`                                                             | A regular expression matching an error message       |

### Styles

The standard way to deliver styles is the prebuilt CSS, covered in [installation](/en/main/installation) and [theming](/en/main/theming). For applications that build their theme from SCSS, `core` provides the mixins:

```scss
@use '@koobiq/components' as components;
@use '@koobiq/components/core/styles/visual';

// Shared theme-independent styles: overlay, visually hidden text, the progress indicator.
@include components.kbq-core();

// Appearance: theme, typography, global styles of directive-based components.
@include components.koobiq-theme();

// Base page styles and the breakpoint layouts.
@include visual.body-html();
@include visual.layouts-for-breakpoint();
```
