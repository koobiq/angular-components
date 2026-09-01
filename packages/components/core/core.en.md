**Core** is the public entry point to the shared APIs of the Koobiq component library. It brings together configuration, types, base elements, interaction rules, and utilities. Components rely on these capabilities, which are also available for custom components and wrappers.

The public TypeScript API is imported from `@koobiq/components/core`:

```ts
import { KBQ_WINDOW, kbqThemeProvider } from '@koobiq/components/core';
```

SCSS has separate entry points, such as `@koobiq/components/core/styles/visual`.

### Related pages

Some areas are described in detail on dedicated pages:

| Article                                            | Topic                                                                                                                                                                |
| -------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [Date formatter](/en/other/date-formatter)         | `DateFormatter`, date pipes, and time zone handling                                                                                                                  |
| [Design tokens](/en/main/design-tokens/colors)     | Global color and appearance variables                                                                                                                                |
| [Filesize formatter](/en/other/filesize-formatter) | `KbqDataSizePipe` and data-size units                                                                                                                                |
| [Forms](/en/other/forms)                           | `KbqForm` and `KbqFormElement` classes, `.kbq-form-vertical`, `.kbq-form-horizontal`, and `.kbq-form__row` selectors, and the `kbqForm` and `kbqFormElement` aliases |
| [Highlight](/en/components/highlight)              | `kbqHighlightBackground` and `mcHighlight` pipes for highlighting text matches                                                                                       |
| [Layout flex](/en/components/layout-flex)          | Classes and mixins for building flex layouts                                                                                                                         |
| [Localization](/en/main/localization)              | Locale registry, active locale, interface strings, and overrides                                                                                                     |
| [Number formatter](/en/other/number-formatter)     | Pipes for precision, rounding, and displaying numbers in tables                                                                                                      |
| [Smart search](/en/other/search-smart)             | Query normalization, search predicates, and match ranges for highlighting                                                                                            |
| [Theming](/en/main/theming)                        | `KbqThemeService`, appearance modes, named variants, and CSS variables                                                                                               |
| [Typography](/en/main/typography)                  | The library's typographic styles and classes                                                                                                                         |
| [Validation](/en/other/validation)                 | `ErrorStateMatcher` and the rules for transitioning a field to the error state                                                                                       |

The rest of the public API is described below.

### Configuration

Koobiq reads global configuration from Angular providers. Provider functions merge the supplied configuration with defaults and return a provider of the expected type.

#### Providers

| Provider                                             | Purpose                                                                                                                |
| ---------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| `kbqThemeProvider(config)`                           | Registers appearance variants; sets the initial mode, the initial variant by name through `theme`, and the storage key |
| `kbqLocaleServiceProvider()`                         | Connects the localization service                                                                                      |
| `kbqLocaleIDProvider(localeId)`                      | Sets the active locale                                                                                                 |
| `kbqLocaleConfigurationOverrideProvider(section, …)` | Overrides strings in one locale section                                                                                |
| `kbqA11yLocaleConfigurationProvider(config)`         | Overrides screen-reader text                                                                                           |
| `kbqSelectLocaleConfigurationProvider(config)`       | Overrides strings for dropdown lists                                                                                   |
| `kbqLocaleServiceLangAttrNameProvider(attrName)`     | Sets the locale attribute name. Defaults to `lang`                                                                     |
| `kbqDateTimezoneProvider(timezone)`                  | Sets the time zone used to display dates                                                                               |
| `kbqFilesizeFormatterConfigurationProvider(config)`  | Configures data-size units                                                                                             |
| `kbqErrorStateMatcherProvider(matcher)`              | Sets when form-field errors are shown                                                                                  |
| `kbqShadowDomOverlayProvider(host?)`                 | Moves the overlay container into a Shadow DOM root                                                                     |

Component localization does not work without `kbqLocaleServiceProvider()`.

`ErrorStateMatcher` is a class obtained through dependency injection. Configure its implementation and the timing of error display with `kbqErrorStateMatcherProvider(matcher)`.

#### Tokens

Tokens let you replace a setting or implementation through dependency injection.

| Token                                     | What it configures                                                                                                                         |
| ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `KBQ_WINDOW`                              | A reference to `window` that is safe for server-side rendering                                                                             |
| `KBQ_THEME_CONFIG`                        | `KbqThemeService` settings: `themes`, `mode`, `theme`, and `storageKey`                                                                    |
| `KBQ_THEME_STORE`                         | Appearance mode (`light`, `dark`, `auto`) and pinned variant. Built-in implementations: `KbqThemeLocalStorageStore`, `KbqThemeCookieStore` |
| `KBQ_LOCALE_SERVICE`                      | The `KbqLocaleService` instance. No factory is provided, so provide it explicitly                                                          |
| `KBQ_LOCALE_ID`                           | The active locale. Defaults to `ru-RU` (`KBQ_DEFAULT_LOCALE_ID`)                                                                           |
| `KBQ_LOCALE_DATA`                         | Available locales, including custom locales                                                                                                |
| `KBQ_LOCALE_CONFIGURATION_OVERRIDES`      | Partial overrides of locale sections                                                                                                       |
| `KBQ_A11Y_LOCALE_CONFIGURATION`           | Text read by screen readers                                                                                                                |
| `KBQ_SELECT_LOCALE_CONFIGURATION`         | Strings for dropdown lists                                                                                                                 |
| `KBQ_LOCALE_SERVICE_LANG_ATTR_NAME`       | The HTML attribute name for the locale. Defaults to `lang`                                                                                 |
| `KBQ_DATE_LOCALE`                         | A date locale separate from the interface locale                                                                                           |
| `KBQ_DATE_FORMATS`                        | Date parsing and display formats                                                                                                           |
| `KBQ_DATE_TIMEZONE`                       | The time zone. Defaults to `system`                                                                                                        |
| `KBQ_NUMBER_FORMATTER_OPTIONS`            | Number precision and grouping                                                                                                              |
| `KBQ_SIZE_UNITS_CONFIG`                   | Data-size units                                                                                                                            |
| `KBQ_CHECKABLE_CLICK_ACTION`              | How checkboxes and toggles react to clicks: `noop`, `check`, `check-indeterminate`                                                         |
| `KBQ_SELECT_SCROLL_STRATEGY`              | How an open dropdown list behaves while the page scrolls                                                                                   |
| `KBQ_SELECT_SEARCH_MIN_OPTIONS_THRESHOLD` | The option count at which search appears. Defaults to `10`                                                                                 |

When a formatter token is not provided, the defaults apply: `KBQ_NUMBER_FORMATTER_DEFAULT_OPTIONS` for numbers and `KBQ_SIZE_UNITS_DEFAULT_CONFIG` for data-size units.

### Choosing a theme

`KbqThemeService` follows the operating system's color scheme through `mode` and lets you pin one registered variant by name.

A pinned variant takes priority over `mode` until it is reset. Use this mode when an application requires a specific appearance rather than a light, dark, or system mode.

<!-- example(theme-static-selection) -->

### Token KBQ_WINDOW and server-side rendering

The token first reads `DOCUMENT.defaultView`. If that value is unavailable, it falls back to the global `window` for backward compatibility. If neither source is available, the token throws an error.

Use the injected object to access `innerWidth`, `getComputedStyle`, `matchMedia`, and other window properties:

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

### Overlay inside Shadow DOM

Angular CDK adds the overlay container to `document.body` by default. When an application runs inside Shadow DOM, modals, lists, tooltips, and toasts leave the shadow root. They also lose theme tokens declared on a `.kbq-light` or `.kbq-dark` ancestor.

`kbqShadowDomOverlayProvider` moves the overlay container into the shadow root:

```ts
import { bootstrapApplication } from '@angular/platform-browser';
import { kbqShadowDomOverlayProvider } from '@koobiq/components/core';

bootstrapApplication(AppComponent, {
    providers: [
        // The micro-frontend root element or any element inside its shadow tree.
        ...kbqShadowDomOverlayProvider(() => document.querySelector('my-mfe-root')!)
    ]
});
```

Limitations:

- without an argument, the provider searches for the shadow root from the application root component;
- the host element itself can resolve only an open shadow root;
- when the supplied element is already inside a closed shadow root, the provider gets that root through `getRootNode()`;
- when no shadow root is found, the container stays in `document.body`;
- the provider replaces the global `OverlayContainer`, so it cannot be combined with another implementation, such as `FullscreenOverlayContainer`;
- CDK structural styles move with the container, while the application must add Koobiq styles and theme tokens to the shadow root itself.

The full description, including a scenario with one shared container for all micro-frontends, is on the [Toast](/en/components/toast) page.

### Scroll shadows

The **Overflow Shadow** directives show the edges of a scrollable area. A shadow appears at a header or footer when hidden content remains in the corresponding direction.

```html
<div kbqOverflowShadowContainer #shadow="kbqOverflowShadowContainer" class="scrollable">
    <header [kbqOverflowShadowTop]="shadow">Header</header>

    <!-- content -->

    <footer [kbqOverflowShadowBottom]="shadow">Footer</footer>
</div>
```

| API                          | Purpose                                                  |
| ---------------------------- | -------------------------------------------------------- |
| `debounce`                   | Scroll handling delay in milliseconds. Defaults to `0`   |
| `shadow`                     | The `box-shadow` value in the active state               |
| `KBQ_OVERFLOW_SHADOW_SOURCE` | Event source and scrollable element for a custom wrapper |
| `checkOverflow()`            | Forces a state update                                    |

The default tokens are `--kbq-shadow-overflow-normal-bottom` and `--kbq-shadow-overflow-normal-top`.

The container tracks scrolling and element dimensions. If the content grows only through `scrollHeight`, the observer does not detect the change. Call `checkOverflow()` to update the state.

### Selecting all items

`getSelectAllState` and `toggleSelectAll` work through an adapter. The library does not prescribe how selected items are stored.

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

Details:

- `setSelected` is called for every selectable item, including items whose state did not change; the implementation must be idempotent;
- `toggleSelectAll` returns only the items that changed;
- `allowDeselect: true` allows a repeated call to clear the selection;
- unavailable items do not affect the master checkbox state;
- an empty set has the `unchecked` state;
- `KbqSelectAllEvent` describes the `onSelectAll` event;
- `shouldSelectSearchText` determines whether the shortcut selects search text instead of toggling options.

### Keyboard

#### Constants and predicates

**Core** exports numeric key constants: `ENTER`, `ESCAPE`, `TAB`, `UP_ARROW`, `HOME`, `NUMPAD_ZERO`, and others.

| Predicate                                    | What it checks                                                                   |
| -------------------------------------------- | -------------------------------------------------------------------------------- |
| `hasModifierKey(event, ...modifiers)`        | At least one of the listed modifiers is pressed; with no arguments, any modifier |
| `isControl(event)`                           | Whether a modifier key is pressed: `Shift`, `Ctrl`, `Alt`, or `Cmd`              |
| `isLetterKey`, `isNumberKey`, `isDigit`      | A letter or a digit from the main keyboard row                                   |
| `isNumpadKey`, `isFunctionKey`               | A numpad digit or a function key from `F1` to `F12`                              |
| `isVerticalMovement`, `isHorizontalMovement` | Vertical or horizontal movement                                                  |
| `isSelectAll(event)`, `isCopy(event)`        | The "select all" and "copy" shortcuts, including macOS behavior                  |
| `isInput(event)`                             | Whether the event came from an `input` or `textarea`                             |

#### List navigation

Keyboard managers control the active item:

- `ListKeyManager` — basic active-item management;
- `FocusKeyManager` — additionally moves focus to the active item;
- `ActiveDescendantKeyManager` — keeps focus on the container and marks the active item.

```ts
this.keyManager = new FocusKeyManager(this.items)
    .withVerticalOrientation()
    .withTypeAhead()
    .withHomeAndEnd()
    .withScrollSize(this.visibleRowsCount)
    .skipPredicate((item) => item.disabled);
```

Koobiq implementations extend the CDK classes with the same names:

- `withScrollSize()`, `setNextPageItemActive()`, and `setPreviousPageItemActive()` add page-wise movement;
- `previousActiveItemIndex` stores the previous active index for range selection with `Shift`.

### Validators

Validators are static methods that return a `ValidatorFn`.

#### PasswordValidators

| Method              | Error key      | Error payload     |
| ------------------- | -------------- | ----------------- |
| `minLength(min)`    | `minLength`    | `{ min, actual }` |
| `maxLength(max)`    | `maxLength`    | `{ max, actual }` |
| `minUppercase(min)` | `minUppercase` | `{ min, actual }` |
| `minLowercase(min)` | `minLowercase` | `{ min, actual }` |
| `minNumber(min)`    | `minNumber`    | `{ min, actual }` |
| `minSpecial(min)`   | `minSpecial`   | `{ min, actual }` |

`PasswordValidators` returns `null` for values that are not strings. Special characters are **!**, **@**, **#**, **$**, **%**, **^**, **&**, **\***. A usage example is on the [Form field](/en/components/form-field) page.

#### FileValidators

| Method                       | Error key               | Error payload          |
| ---------------------------- | ----------------------- | ---------------------- |
| `maxFileSize(maxSize)`       | `maxFileSize`           | `{ max, actual }`      |
| `isCorrectExtension(accept)` | `fileExtensionMismatch` | `{ expected, actual }` |

`accept` takes extensions (`.pdf`) and MIME types (`image/png`) — the same values as the `accept` attribute of `input[type=file]`; the `KbqFileTypeSpecifier` type describes them. Examples are on the [File upload](/en/components/file-upload) page.

`FileValidators` expects a `File` object or an object with a `file` property. For an empty value it returns `null`, then accesses the file properties directly.

### Shared types

These types describe common input values across components. Use them in custom wrappers to keep them compatible with the Koobiq API.

| Type                                             | Values                                                                                     |
| ------------------------------------------------ | ------------------------------------------------------------------------------------------ |
| `KbqDefaultSizes`                                | `compact`, `normal`, `big`                                                                 |
| `KbqComponentColors`                             | `theme`, `theme-fade`, `contrast`, `contrast-fade`, `error`, `warning`, `success`, `empty` |
| `ThemePalette`                                   | `primary`, `secondary`, `error`, `info`, `warning`, `success`                              |
| `KbqOrientation`                                 | `horizontal`, `vertical`                                                                   |
| `KbqFlexDirection`, `KbqFlexWrap`                | `row` / `column`, `nowrap` / `wrap`                                                        |
| `PopUpPlacements`, `PopUpTriggers`, `PopUpSizes` | Position, trigger, and size of pop-up elements                                             |
| `KbqMultipleInput`, `MultipleMode`               | Multiple-selection mode for lists and trees                                                |

`KbqColorDirective` converts the `color` value into a `kbq-<value>` class. For example, `color="error"` adds `kbq-error`, while `color="empty"` adds `kbq-empty`. These classes are created at runtime, so they may not appear as complete strings in the sources.

`resolveMultipleMode` converts accepted `multiple` values into a selection mode. An unrecognized value enables single selection and reports a message in development mode.

### Panel width

The `KbqPanelWidth`, `KbqPanelMinWidth`, and `KbqPanelMaxWidth` types describe panel-width rules.

| `panelWidth` value | Behavior                                                                                |
| ------------------ | --------------------------------------------------------------------------------------- |
| `null`, `''`       | The width follows the content but is not less than the trigger width or `panelMinWidth` |
| `'auto'`           | The width equals the trigger width but is not less than `panelMinWidth`                 |
| Number             | An explicit width in pixels                                                             |
| CSS string         | An explicit width, such as `fit-content` or `20rem`                                     |

`panelMinWidth` applies only to `null`, `''`, and `'auto'`. The default is `KBQ_PANEL_DEFAULT_MIN_WIDTH`, which is `200` pixels.

`KbqPanelMaxWidth` limits content-based growth. For `null`, the `--kbq-panel-size-width-max` token is used. The limit does not make the panel narrower than the trigger or override an explicit width.

### Utilities

| Utility                                                            | Purpose                                                   |
| ------------------------------------------------------------------ | --------------------------------------------------------- |
| `kbqDeepMerge(base, patch)`, `KbqDeepPartial<T>`                   | Recursively merges configurations                         |
| `kbqInjectNativeElement<T>()`                                      | Gets `nativeElement` from an injected `ElementRef`        |
| `isHtmlElement`, `isElement`, `isNull`, `isUndefined`, `isBoolean` | Checks and narrows types                                  |
| `getNodesWithoutComments(nodes)`                                   | Gets a list of nodes without comments                     |
| `escapeRegExp(value)`                                              | Escapes a string for use in a regular expression          |
| `isMac()`                                                          | Detects the platform for keyboard shortcut labels         |
| `KbqMeasureScrollbarService`                                       | Measures the system scrollbar width                       |
| `kbqInjectAutofilled()`                                            | A signal that the browser autofilled a field              |
| `KbqNormalizeWhitespace`                                           | Replaces a thin space with a regular space when copying   |
| `kbqRevealSelection`, `kbqSetSelectionRange`                       | Selects text and scrolls a field to the selected fragment |

`KbqMeasureScrollbarService` returns `0` during server-side rendering.

`KbqNormalizeWhitespace` applies to fields with formatted numbers. When copying, the directive replaces the thin spaces between digit groups with regular spaces. It is not enabled by default. See the [Input](/en/components/input) page for an example.

`kbqInjectAutofilled()` is called from a directive's injection context on an `input` or `textarea`.

### Testing

**Core** exports utilities used to test Koobiq components. They are also suitable for testing application code built on the library.

| Utility                                                                                  | Purpose                                           |
| ---------------------------------------------------------------------------------------- | ------------------------------------------------- |
| `dispatchFakeEvent`, `dispatchKeyboardEvent`, `dispatchMouseEvent`, `dispatchTouchEvent` | Creates and dispatches an event                   |
| `createFakeEvent`, `createKeyboardEvent`, `createMouseEvent`, `createTouchEvent`         | Creates an event without dispatching it           |
| `typeInElement(value, element)`                                                          | Enters text with the full sequence of events      |
| `patchElementFocus(element)`                                                             | Controls focus and blur in the test environment   |
| `MockNgZone`                                                                             | Tests work outside Angular                        |
| `wrappedErrorMessage(error)`                                                             | Creates a regular expression for an error message |

### Styles

Prebuilt CSS files are described on the [Installation](/en/main/installation) and [Theming](/en/main/theming) pages.

For SCSS builds, use the following mixins:

```scss
@use '@koobiq/components' as components;
@use '@koobiq/components/core/styles/visual';

// Shared styles: overlay, visually hidden text, and the progress indicator.
@include components.kbq-core();

// Theme, typography, and global styles for directive-based components.
@include components.koobiq-theme();

// Base page styles and breakpoint layouts.
@include visual.body-html();
@include visual.layouts-for-breakpoint();
```
