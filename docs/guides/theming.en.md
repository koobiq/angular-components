### What's new?

Using components is now simpler! We are moving toward full component isolation, making it easy to plug in and use components.

- You no longer need to import separate SCSS files to change component colors, sizes, and fonts.
- Almost all components define their styles using CSS variables that are already included in the component code. This makes styles more transparent and easier to understand.
- A few small components cannot load styles on their own, so those styles need to be included globally.
- We use global design-system CSS variables for colors, sizes, and fonts. This makes the code more readable and simplifies application theming — improving both code readability and the theming process significantly.

### How to use

1. [Install the Koobiq design system package](/main/installation).
2. Include the `css-tokens.css`, `css-tokens-light.css`, and `css-tokens-dark.css` files to use the global design-system values such as colors, sizes, and font settings.
3. [Include the prebuilt styles file](#including-the-prebuilt-styles-file) in your main styles file. This step is required for components and overlays (e.g. popups) to render correctly.
4. Add the `kbq-light` selector to the `<body>` element of your HTML document for the light theme, or `kbq-dark` for the dark theme.
5. Import a component and use it in your markup! 🚀

#### Including the prebuilt styles file

```sass
@use '@koobiq/components/prebuilt-themes/theme.css';
```

Here is what the `body` tag in `index.html` looks like after adding the required classes:

```html
<body class="kbq-app-background kbq-light">
    <app></app>
</body>
```

The `kbq-app-background` class applies the base theme styles to the application — background and text colors.

### Switching themes

To switch themes, simply change the corresponding selector to go from dark to light (or vice versa), for example from `kbq-dark` to `kbq-light`.
Color values will be automatically adapted to the selected theme.

Use [ThemeService](https://github.com/koobiq/angular-components/tree/main/packages/components/core/services/theme.service.ts) to switch themes. Example:

```ts
import { ThemeService } from '@koobiq/components/core';
import { Component } from '@angular/core';

@Component()
class AppComponent {
    constructor(private themeService: ThemeService) {
        /* the light theme will become active, and the class `kbq-light` will be added to the `body` tag */
        this.themeService.setTheme(0);
    }
}
```

#### Theme selectors

Available selectors for the dark and light themes:

| Theme | Selectors                                  |
| ----- | ------------------------------------------ |
| Dark  | .kbq-dark, .theme-dark, .kbq-theme-dark    |
| Light | .kbq-light, .theme-light, .kbq-theme-light |

We recommend using the selectors defined in `ThemeService` (`kbq-dark` for dark and `kbq-light` for light).

#### Switching based on the OS theme

This can be implemented using [window.matchMedia](https://developer.mozilla.org/en-US/docs/Web/API/Window/matchMedia).

To switch the theme based on the operating system setting, three steps are required:

- Define a media query to detect the user's preferred theme:

```javascript
colorAutomaticTheme = window.matchMedia('(prefers-color-scheme: light)');
```

- Add a theme object to the themes array that is passed to `ThemeService` during application initialization. In this object, the `className` property is set conditionally:

```javascript
{
    name: 'Match system',
    className: this.colorAutomaticTheme.matches ? Themes.Default : Themes.Dark,
    selected: false
},
```

- Subscribe to user theme updates and set the active theme whenever it changes:

```javascript
this.colorAutomaticTheme.addEventListener('change', this.setAutoTheme);
```

An example implementation of theme switching in the Koobiq documentation can be found [here.](https://github.com/koobiq/angular-components/blob/main/apps/docs/src/app/components/navbar/navbar.component.ts)

### Component customization

You can change colors, sizes, and fonts by overriding the component's CSS variables with the desired values. For example:

```css
.kbq-dark .kbq-alert {
    --kbq-alert-default-contrast-container-background: var(--kbq-foreground-contrast-secondary);
    --kbq-alert-default-contrast-container-title: var(--kbq-background-contrast-fade);
}
```

### Compatibility

Stable with `@koobiq/design-tokens@3.5.1`.

### Using CSS variables

If you are already using CSS variables from the `@koobiq/design-tokens` package, you need to remove the CSS variables for all components included in the design system.
They now have default values built in, so you no longer need them.

Files that need to be updated:

- css-tokens.css — component sizes
- css-tokens-light.css — component colors for the light theme
- css-tokens-dark.css — component colors for the dark theme
- css-tokens-font.css — font, its sizes, and parameters for the component. This file can be removed.

<details>
  <summary><span class="kbq-markdown__p">List of design system components with links to their CSS variables:</span></summary>
    <ul>
        <li><a href="https://github.com/koobiq/angular-components/tree/main/packages/components/accordion/accordion-tokens.scss">accordion</a></li>
        <li><a href="https://github.com/koobiq/angular-components/tree/main/packages/components/alert/alert-tokens.scss">alert</a></li>
        <li><a href="https://github.com/koobiq/angular-components/tree/main/packages/components/autocomplete/autocomplete-tokens.scss">autocomplete</a></li>
        <li><a href="https://github.com/koobiq/angular-components/tree/main/packages/components/badge/badge-tokens.scss">badge</a></li>
        <li><a href="https://github.com/koobiq/angular-components/tree/main/packages/components/button/button-tokens.scss">button</a></li>
        <li><a href="https://github.com/koobiq/angular-components/tree/main/packages/components/button-toggle/button-toggle-tokens.scss">button-toggle</a></li>
        <li><a href="https://github.com/koobiq/angular-components/tree/main/packages/components/checkbox/checkbox-tokens.scss">checkbox,pseudo-checkbox</a></li>
        <li><a href="https://github.com/koobiq/angular-components/tree/main/packages/components/code-block/code-block-tokens.scss">code-block</a></li>
        <li><a href="https://github.com/koobiq/angular-components/tree/main/packages/components/datepicker/datepicker-tokens.scss">datepicker</a></li>
        <li><a href="https://github.com/koobiq/angular-components/tree/main/packages/components/dl/dl-tokens.scss">description-list</a></li>
        <li><a href="https://github.com/koobiq/angular-components/tree/main/packages/components/divider/divider-tokens.scss">divider</a></li>
        <li><a href="https://github.com/koobiq/angular-components/tree/main/packages/components/dropdown/dropdown-tokens.scss">dropdown</a></li>
        <li><a href="https://github.com/koobiq/angular-components/tree/main/packages/components/empty-state/empty-state-tokens.scss">empty-state</a></li>
        <li><a href="https://github.com/koobiq/angular-components/tree/main/packages/components/file-upload/file-upload-tokens.scss">file-upload</a></li>
        <li><a href="https://github.com/koobiq/angular-components/tree/main/packages/components/form-field/form-field-tokens.scss">form-field</a></li>
        <li><a href="https://github.com/koobiq/angular-components/tree/main/packages/components/form-field/hint-tokens.scss">hint</a></li>
        <li><a href="https://github.com/koobiq/angular-components/tree/main/packages/components/icon/icon-tokens.scss">icon</a></li>
        <li><a href="https://github.com/koobiq/angular-components/tree/main/packages/components/icon/icon-button-tokens.scss">icon-button</a></li>
        <li><a href="https://github.com/koobiq/angular-components/tree/main/packages/components/icon/icon-item-tokens.scss">icon-item</a></li>
        <li><a href="https://github.com/koobiq/angular-components/tree/main/packages/components/input/input-tokens.scss">input</a></li>
        <li><a href="https://github.com/koobiq/angular-components/tree/main/packages/components/link/link-tokens.scss">link</a></li>
        <li><a href="https://github.com/koobiq/angular-components/tree/main/packages/components/list/list-tokens.scss">list</a></li>
        <li><a href="https://github.com/koobiq/angular-components/tree/main/packages/components/loader-overlay/loader-overlay-tokens.scss">loader-overlay</a></li>
        <li><a href="https://github.com/koobiq/angular-components/tree/main/packages/components/modal/modal-tokens.scss">modal</a></li>
        <li><a href="https://github.com/koobiq/angular-components/tree/main/packages/components/markdown/markdown-tokens.scss">markdown</a></li>
        <li><a href="https://github.com/koobiq/angular-components/tree/main/packages/components/navbar/navbar-tokens.scss">navbar</a></li>
        <li><a href="https://github.com/koobiq/angular-components/tree/main/packages/components/popover/popover-tokens.scss">popover</a></li>
        <li><a href="https://github.com/koobiq/angular-components/tree/main/packages/components/progress-bar/progress-bar-tokens.scss">progress-bar</a></li>
        <li><a href="https://github.com/koobiq/angular-components/tree/main/packages/components/progress-spinner/progress-spinner-tokens.scss">progress-spinner</a></li>
        <li><a href="https://github.com/koobiq/angular-components/tree/main/packages/components/radio/radio-tokens.scss">radio</a></li>
        <li><a href="https://github.com/koobiq/angular-components/tree/main/packages/components/risk-level/risk-level-tokens.scss">risk-level</a></li>
        <li><a href="https://github.com/koobiq/angular-components/tree/main/packages/components/select/select-tokens.scss">select</a></li>
        <li><a href="https://github.com/koobiq/angular-components/tree/main/packages/components/sidepanel/sidepanel-tokens.scss">sidepanel</a></li>
        <li><a href="https://github.com/koobiq/angular-components/tree/main/packages/components/scrollbar/scrollbar-tokens.scss">scrollbar-component</a></li>
        <li><a href="https://github.com/koobiq/angular-components/tree/main/packages/components/core/styles/theming/scrollbar-tokens.scss">scrollbar</a></li>
        <li><a href="https://github.com/koobiq/angular-components/tree/main/packages/components/core/forms/forms-tokens.scss">forms</a></li>
        <li><a href="https://github.com/koobiq/angular-components/tree/main/packages/components/core/option/option-tokens.scss">option</a></li>
        <li><a href="https://github.com/koobiq/angular-components/tree/main/packages/components/splitter/splitter-tokens.scss">splitter</a></li>
        <li><a href="https://github.com/koobiq/angular-components/tree/main/packages/components/tags/tag-tokens.scss">tag</a></li>
        <li><a href="https://github.com/koobiq/angular-components/tree/main/packages/components/tags/tag-input-tokens.scss">tag-input</a></li>
        <li><a href="https://github.com/koobiq/angular-components/tree/main/packages/components/table/table-tokens.scss">table</a></li>
        <li><a href="https://github.com/koobiq/angular-components/tree/main/packages/components/textarea/textarea-tokens.scss">textarea</a></li>
        <li><a href="https://github.com/koobiq/angular-components/tree/main/packages/components/timezone/timezone-option-tokens.scss">timezone</a></li>
        <li><a href="https://github.com/koobiq/angular-components/tree/main/packages/components/toast/toast-tokens.scss">toast</a></li>
        <li><a href="https://github.com/koobiq/angular-components/tree/main/packages/components/toggle/toggle-tokens.scss">toggle</a></li>
        <li><a href="https://github.com/koobiq/angular-components/tree/main/packages/components/tooltip/tooltip-tokens.scss">tooltip</a></li>
        <li><a href="https://github.com/koobiq/angular-components/tree/main/packages/components/tree/tree-tokens.scss">tree</a></li>
        <li><a href="https://github.com/koobiq/angular-components/tree/main/packages/components/tree-select/tree-select-tokens.scss">tree-select</a></li>
    </ul>
</details>

### Token value sources

**Design system tokens** are a set of values that define the visual style of our components.
They are stored in the [@koobiq/design-tokens](https://github.com/koobiq/design-tokens) package and allow us to easily manage and maintain consistent styles across all components.

**Component CSS variables** are a set of values used in component styles. They are derived from design tokens and live in the `@koobiq/components` repository.
This makes it easy to use tokens in component styles and speeds up development, including design reviews.

<div class="kbq-callout kbq-callout_warning">
<div class="kbq-callout__header">Note</div>
<div class="kbq-callout__content kbq-docs-element-last-child-margin-bottom-0">

Component tokens in the `@koobiq/design-tokens` package are no longer being updated.

</div>
</div>

### Roadmap

- We will update our component CSS variables and replace them with direct references to global design-system CSS variables where applicable.
- Component tokens will be removed from the `@koobiq/design-tokens` package in version 4.0.0.
- We will create a page displaying all global design-system tokens with their visual representations.
- Component tokens in CSS variable format will be stored in the Angular components repository `@koobiq/components`.
